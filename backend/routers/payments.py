from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from fastapi import status as http_status
from firebase_admin import firestore
from datetime import datetime, timezone
from typing import List
import mercadopago
import json
import logging

from core.firebase import db
from core.config import MERCADOPAGO_ACCESS_TOKEN, FRONTEND_URL, BACKEND_URL
from dependencies.auth import verify_firebase_token, verify_admin
from models.payments import (
    Payment, CreatePaymentRequest, ConfirmPaymentRequest,
    UpdateOrderStatusRequest, UpdateOrderNotesRequest, UpdateTrackingRequest
)
from models.partner import SupporterCommission
from utils.serialization import serialize_datetime, deserialize_datetime
from utils.qrcode import generate_qr_code
from services.admin_services import create_admin_log, get_memorial_for_order
from services.commission_service import (
    supporter_service_validate, commission_service_calculate, DISCOUNT_PERCENTAGE
)
from services.notification_service import create_admin_notification_with_priority
from services.email_service import (
    send_payment_notification_email, send_order_status_email, send_supporter_sale_email
)

router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

mp_sdk = mercadopago.SDK(MERCADOPAGO_ACCESS_TOKEN)

PAID_STATUSES = {"approved", "paid", "in_production", "produced", "shipped", "entregue"}
PHYSICAL_PLAN_TYPES = {"plaque", "complete", "qrcode_plaque"}


async def _process_approved_payment(
    payment_ref,
    payment_data: dict,
    background_tasks: BackgroundTasks,
    source: str = "unknown"
) -> bool:
    current_status = payment_data.get("status", "")
    if current_status in PAID_STATUSES:
        logger.info(f"[{source}] Pagamento {payment_data.get('id')} já processado. Ignorando.")
        return False

    memorial_id = payment_data["memorial_id"]
    plan_type   = payment_data["plan_type"]

    memorial_doc = db.collection("memorials").document(memorial_id).get()
    if not memorial_doc.exists:
        logger.error(f"[{source}] Memorial {memorial_id} não encontrado.")
        return False

    memorial_data = memorial_doc.to_dict()
    memorial_slug = memorial_data.get("slug") or memorial_id
    memorial_url  = f"{FRONTEND_URL}/memorial/{memorial_slug}"
    qr_code_data  = generate_qr_code(memorial_url)

    db.collection("memorials").document(memorial_id).update({
        "status": "published", "plan_type": plan_type,
        "qr_code_url": qr_code_data,
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    payment_ref.update({
        "status": "approved",
        "updated_at": datetime.now(timezone.utc).isoformat()
    })

    updated_payment = payment_ref.get().to_dict()
    memorial_data   = db.collection("memorials").document(memorial_id).get().to_dict()

    if updated_payment and memorial_data:
        person_name = memorial_data.get("person_data", {}).get("full_name", "N/A")
        amount      = updated_payment.get("amount", 0)
        plan_names  = {'digital': 'Digital', 'plaque': 'Placa QR', 'qrcode_plaque': 'Placa QR', 'complete': 'Completo'}
        plan_label  = plan_names.get(plan_type, plan_type)
        background_tasks.add_task(send_payment_notification_email, updated_payment, memorial_data)
        background_tasks.add_task(
            create_admin_notification_with_priority,
            "payment_approved", "Pagamento Aprovado",
            f"Pedido #{payment_data.get('id','')[:8]} — {person_name} ({plan_label}) — R$ {amount:.2f}",
            "order", payment_data.get("id"),
            {"plan_type": plan_type, "amount": amount, "person_name": person_name, "user_email": updated_payment.get("user_email")}
        )

    logger.info(f"[{source}] Pagamento {payment_data.get('id')} processado com sucesso.")
    return True


def _set_commission_available_on_deliver(order_id: str):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        return
    order_data = doc.to_dict()
    if order_data.get("commission_status") == "pending":
        order_ref.update({
            "commission_status": "available",
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        comm_docs = list(
            db.collection("supporter_commissions")
            .where(filter=firestore.FieldFilter("order_id", "==", order_id))
            .where(filter=firestore.FieldFilter("commission_status", "==", "pending"))
            .stream()
        )
        for cd in comm_docs:
            cd.reference.update({
                "commission_status": "available",
                "available_at": datetime.now(timezone.utc).isoformat()
            })


def _cancel_commission(order_id: str):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        return
    order_data = doc.to_dict()
    current_status = order_data.get("commission_status")
    if current_status in ("pending", "available"):
        order_ref.update({
            "commission_status": "canceled", "commission_amount": 0,
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        comm_docs = list(
            db.collection("supporter_commissions")
            .where(filter=firestore.FieldFilter("order_id", "==", order_id))
            .stream()
        )
        for cd in comm_docs:
            cd.reference.update({
                "commission_status": "canceled", "commission_amount": 0,
                "canceled_at": datetime.now(timezone.utc).isoformat()
            })
    elif current_status == "paid":
        db.collection("commission_adjustments").add({
            "order_id": order_id,
            "note": "Pedido cancelado após comissão paga — ajuste manual necessário",
            "created_at": datetime.now(timezone.utc).isoformat()
        })


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/payments/create-checkout")
async def create_checkout(
    payment_req: CreatePaymentRequest,
    background_tasks: BackgroundTasks,
    token_data: dict = Depends(verify_firebase_token)
):
    memorial_doc = db.collection("memorials").document(payment_req.memorial_id).get()
    if not memorial_doc.exists:
        raise HTTPException(status_code=404, detail="Memorial not found")
    memorial = memorial_doc.to_dict()

    if not MERCADOPAGO_ACCESS_TOKEN:
        raise HTTPException(status_code=500, detail="Mercado Pago não configurado")

    is_physical_plan = payment_req.plan_type in PHYSICAL_PLAN_TYPES
    if is_physical_plan:
        if not payment_req.delivery_address:
            raise HTTPException(status_code=422, detail="Endereço de entrega obrigatório para planos físicos.")
        addr = payment_req.delivery_address
        missing = [f for f, v in [
            ("nome do destinatário", addr.recipient_name), ("telefone", addr.phone),
            ("CEP", addr.zip_code), ("rua", addr.street), ("número", addr.number),
            ("bairro", addr.neighborhood), ("cidade", addr.city), ("estado", addr.state),
        ] if not v]
        if missing:
            raise HTTPException(status_code=422, detail=f"Endereço incompleto. Campos faltando: {', '.join(missing)}.")

    supporter_data    = None
    calc              = None
    original_amount   = payment_req.transaction_amount
    final_amount      = original_amount
    discount_amount   = 0.0
    commission_amount = 0.0
    commission_rate   = 0.0
    commission_status = None
    supporter_id      = None
    supporter_code    = None

    if payment_req.supporter_code:
        raw_code = payment_req.supporter_code.strip().upper()
        supporter_data = supporter_service_validate(raw_code)
        if not supporter_data:
            raise HTTPException(status_code=400, detail="Código de affiliate inválido ou inativo.")
        commission_rate   = supporter_data.get("commission_rate", 0.10)
        calc              = commission_service_calculate(original_amount, commission_rate)
        final_amount      = calc["final_amount"]
        discount_amount   = calc["discount_amount"]
        commission_amount = calc["commission_amount"]
        commission_status = "pending"
        supporter_id      = supporter_data.get("id")
        supporter_code    = raw_code

    payment = Payment(
        memorial_id=payment_req.memorial_id,
        user_id=token_data["uid"],
        user_email=payment_req.payer_email,
        plan_type=payment_req.plan_type,
        amount=final_amount,
        status="pending"
    )
    payment_dict = payment.model_dump()
    payment_dict.update({
        "original_amount": original_amount, "discount_amount": discount_amount,
        "final_amount": final_amount, "supporter_id": supporter_id,
        "supporter_code": supporter_code, "commission_rate": commission_rate,
        "commission_amount": commission_amount, "commission_status": commission_status,
        "delivery_address_snapshot": (
            payment_req.delivery_address.model_dump()
            if is_physical_plan and payment_req.delivery_address else None
        ),
    })
    payment_dict = serialize_datetime(payment_dict)

    try:
        preference_payload = {
            "items": [{"title": payment_req.description, "quantity": 1, "unit_price": float(final_amount), "currency_id": "BRL"}],
            "payer": {"email": payment_req.payer_email},
            "back_urls": {
                "success": f"{FRONTEND_URL}/payment/success?payment_id={payment.id}",
                "failure": f"{FRONTEND_URL}/payment/failure?payment_id={payment.id}",
                "pending": f"{FRONTEND_URL}/payment/pending?payment_id={payment.id}",
            },
            "auto_return": "approved",
            "external_reference": payment.id,
            "statement_descriptor": "Remember QrCode",
            "notification_url": f"{BACKEND_URL}/api/webhooks/mercadopago"
        }
        result = mp_sdk.preference().create(preference_payload)

        if result["status"] == 201:
            mp_preference = result["response"]
            preference_id = mp_preference.get("id")
            init_point    = mp_preference.get("init_point")
            if not init_point:
                raise HTTPException(status_code=500, detail="Mercado Pago não retornou URL de checkout")

            payment_dict["mercadopago_payment_id"] = preference_id
            db.collection("payments").document(payment.id).set(payment_dict)

            person_name = memorial.get("person_data", {}).get("full_name", "N/A")
            plan_names  = {'digital': 'Digital', 'plaque': 'Placa QR', 'qrcode_plaque': 'Placa QR', 'complete': 'Completo'}
            plan_label  = plan_names.get(payment_req.plan_type, payment_req.plan_type)
            background_tasks.add_task(
                create_admin_notification_with_priority, "new_order", "Novo Pedido Criado",
                f"Pedido #{payment.id[:8]} — {person_name} ({plan_label}) — R$ {final_amount:.2f}",
                "order", payment.id,
                {"plan_type": payment_req.plan_type, "amount": final_amount, "person_name": person_name, "user_email": payment_req.payer_email}
            )

            if supporter_data and commission_amount > 0:
                comm = SupporterCommission(
                    order_id=payment.id, partner_id=supporter_id,
                    partner_name=supporter_data.get("name", ""),
                    supporter_code=supporter_code, commission_amount=commission_amount,
                    commission_status="pending",
                )
                db.collection("supporter_commissions").document(comm.id).set(serialize_datetime(comm.model_dump()))
                background_tasks.add_task(send_supporter_sale_email, supporter_data, payment_dict, calc)

            return {
                "success": True, "payment_id": payment.id,
                "preference_id": preference_id, "checkout_url": init_point,
                "message": "Checkout criado com sucesso",
                "discount_applied": discount_amount > 0,
                "discount_amount": discount_amount, "final_amount": final_amount,
            }

        elif result["status"] == 400:
            err    = result.get("response", {})
            causes = err.get("cause", [])
            msg    = causes[0].get("description", err.get("message", "Erro")) if causes else err.get("message", "Erro")
            raise HTTPException(status_code=400, detail=f"Mercado Pago: {msg}")
        else:
            raise HTTPException(status_code=500, detail=f"Erro ao criar checkout (status {result.get('status')})")

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"❌ {type(e).__name__}: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@router.get("/payments/my", response_model=List[Payment])
async def get_my_payments(token_data: dict = Depends(verify_firebase_token)):
    docs = db.collection("payments").where(
        filter=firestore.FieldFilter("user_id", "==", token_data["uid"])
    ).stream()
    payments = []
    for doc in docs:
        payments.append(deserialize_datetime(doc.to_dict(), ["created_at", "updated_at"]))
    return payments


@router.post("/payments/confirm")
async def confirm_payment(
    body: ConfirmPaymentRequest,
    background_tasks: BackgroundTasks,
    token_data: dict = Depends(verify_firebase_token)
):
    payment_ref = db.collection("payments").document(body.payment_id)
    payment_doc = payment_ref.get()
    if not payment_doc.exists:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    payment_data = payment_doc.to_dict()
    if payment_data.get("user_id") != token_data["uid"]:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Sem permissão")
 
    mp_status = None
 
    if body.mp_payment_id:
        try:
            result = mp_sdk.payment().get(body.mp_payment_id)
            if result["status"] == 200:
                mp_status = result["response"].get("status")
            else:
                logger.warning(f"MP retornou status HTTP {result['status']} para payment {body.mp_payment_id}")
        except Exception as e:
            logger.warning(f"Não foi possível verificar MP: {e}.")
 
    if mp_status is None:
        logger.warning(f"Confirmação do pagamento {body.payment_id} adiada — aguardando webhook do MP.")
        return {
            "status": "pending",
            "memorial_published": False,
            "message": "Não foi possível confirmar o pagamento agora. Aguarde — você receberá um e-mail assim que confirmado."
        }
 
    if mp_status != "approved":
        payment_ref.update({
            "status": mp_status,
            "mercadopago_payment_id": body.mp_payment_id or payment_data.get("mercadopago_payment_id"),
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        return {"status": mp_status, "memorial_published": False}
 
    payment_ref.update({
        "mercadopago_payment_id": body.mp_payment_id or payment_data.get("mercadopago_payment_id"),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    payment_data = payment_ref.get().to_dict()
    processed = await _process_approved_payment(payment_ref, payment_data, background_tasks, source="confirm_payment")
    return {"status": "approved", "memorial_published": processed}
 

@router.post("/payments/{payment_id}/request-cancel")
async def request_cancel_payment(
    payment_id: str,
    background_tasks: BackgroundTasks,
    token_data: dict = Depends(verify_firebase_token)
):
    import asyncio, resend
    from core.config import SENDER_EMAIL

    payment_ref  = db.collection("payments").document(payment_id)
    doc          = payment_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    payment_data = doc.to_dict()
    if payment_data.get("user_id") != token_data["uid"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
    if payment_data.get("status") in ["cancelled", "entregue", "shipped"]:
        raise HTTPException(status_code=400, detail="Este pedido não pode ser cancelado")
    if payment_data.get("cancel_requested"):
        raise HTTPException(status_code=400, detail="Cancelamento já solicitado")

    created_at = payment_data.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    if (datetime.now(timezone.utc) - created_at).total_seconds() / 86400 > 7:
        raise HTTPException(status_code=400, detail="Prazo de cancelamento encerrado (7 dias)")

    now = datetime.now(timezone.utc)
    payment_ref.update({"cancel_requested": True, "cancel_requested_at": now.isoformat(), "updated_at": now.isoformat()})

    memorial_data = get_memorial_for_order(payment_data)
    person_name   = memorial_data.get("person_data", {}).get("full_name", "N/A")
    amount        = payment_data.get("amount", 0)

    from models.admin import AdminNotification
    notif = AdminNotification(
        type="cancellation_request", title="Solicitação de Cancelamento",
        message=f"Cliente {payment_data.get('user_email')} solicitou cancelamento do pedido #{payment_id[:8]} — {person_name}",
        entity_type="order", entity_id=payment_id, priority=1,
    )
    notif_dict = serialize_datetime(notif.model_dump())
    notif_dict["details"] = {"user_email": payment_data.get("user_email"), "plan_type": payment_data.get("plan_type"), "amount": amount, "person_name": person_name}
    db.collection("admin_notifications").document(notif.id).set(notif_dict)

    responsible    = memorial_data.get("responsible", {})
    customer_name  = responsible.get("name", "Cliente")
    html = f"""<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
    <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#f59e0b;">Solicitação de cancelamento recebida</h2>
        <p>Olá, <strong>{customer_name}</strong>!</p>
        <p>Recebemos sua solicitação de cancelamento do pedido <strong>#{payment_id[:8]}</strong>.</p>
        <p>Nossa equipe irá analisar e processar em breve. O reembolso será em até <strong>7 dias úteis</strong>.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
        <p style="font-size:12px;color:#888;text-align:center;">© {datetime.now().year} Remember QRCode</p>
    </body></html>"""
    params = {"from": SENDER_EMAIL, "to": [payment_data.get("user_email")], "subject": "Solicitação de cancelamento recebida — Remember QRCode", "html": html}
    background_tasks.add_task(asyncio.to_thread, resend.Emails.send, params)
    return {"message": "Solicitação de cancelamento enviada com sucesso"}


@router.post("/webhooks/mercadopago")
async def handle_mercadopago_webhook(request: Request, background_tasks: BackgroundTasks):
    try:
        body         = await request.body()
        webhook_data = json.loads(body.decode('utf-8'))
        logger.info(f"Webhook received: {webhook_data}")

        topic = webhook_data.get("type") or webhook_data.get("topic", "")

        # ── Pagamento direto ──
        if topic == "payment":
            payment_id = webhook_data.get("data", {}).get("id")
            if payment_id:
                await _handle_mp_payment(payment_id, background_tasks)

        # ── Merchant order (agrupa pagamentos Pix, boleto, etc) ──
        elif topic == "merchant_order":
            order_id = webhook_data.get("data", {}).get("id")
            if order_id:
                try:
                    order_info = mp_sdk.merchant_order().get(order_id)
                    if order_info["status"] == 200:
                        order = order_info["response"]
                        # Só processa se o valor pago cobriu o total
                        paid_amount = sum(
                            p.get("transaction_amount", 0)
                            for p in order.get("payments", [])
                            if p.get("status") == "approved"
                        )
                        if paid_amount >= order.get("total_amount", 0):
                            for p in order.get("payments", []):
                                if p.get("status") == "approved":
                                    await _handle_mp_payment(str(p["id"]), background_tasks)
                except Exception as e:
                    logger.error(f"Erro merchant_order webhook: {e}")

        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}


async def _handle_mp_payment(payment_id: str, background_tasks: BackgroundTasks):
    """Busca pagamento no MP e processa se aprovado."""
    try:
        payment_info = mp_sdk.payment().get(payment_id)
        if payment_info["status"] == 200:
            mp_payment   = payment_info["response"]
            external_ref = mp_payment.get("external_reference")
            new_status   = mp_payment.get("status")
            if external_ref:
                payment_ref = db.collection("payments").document(external_ref)
                payment_doc = payment_ref.get()
                if payment_doc.exists:
                    payment_data = payment_doc.to_dict()
                    if new_status == "approved":
                        await _process_approved_payment(
                            payment_ref, payment_data, background_tasks, source="webhook"
                        )
                    else:
                        payment_ref.update({
                            "status": new_status,
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        })
    except Exception as e:
        logger.error(f"Erro _handle_mp_payment({payment_id}): {e}")

@router.get("/payments/{payment_id}/status")
async def get_payment_status(
    payment_id: str,
    token_data: dict = Depends(verify_firebase_token)
):
    doc = db.collection("payments").document(payment_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    data = doc.to_dict()
    if data.get("user_id") != token_data["uid"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
    return {"status": data.get("status"), "payment_id": payment_id}

# ── Admin order endpoints ─────────────────────────────────────────────────────

@router.get("/admin/orders")
async def get_all_orders(
    user: dict = Depends(verify_admin),
    status: str = None,
    archived: bool = False,
    cancel_requested: bool = None,
):
    docs   = list(db.collection("payments").stream())
    orders = []
    for doc in docs:
        order_data = doc.to_dict()
        if not archived and order_data.get("archived", False):
            continue
        if archived and not order_data.get("archived", False):
            continue
        if status and order_data.get("status") != status:
            continue
        if cancel_requested is not None and order_data.get("cancel_requested", False) != cancel_requested:
            continue
        orders.append(deserialize_datetime(order_data, ["created_at", "updated_at"]))
    orders.sort(
        key=lambda x: x.get("created_at") if isinstance(x.get("created_at"), datetime) else datetime.min.replace(tzinfo=timezone.utc),
        reverse=True
    )
    return orders


@router.get("/admin/orders/{order_id}")
async def get_order_details(order_id: str, user: dict = Depends(verify_admin)):
    doc = db.collection("payments").document(order_id).get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_data = deserialize_datetime(doc.to_dict(), ["created_at", "updated_at"])
    memorial_id = order_data.get("memorial_id")
    if memorial_id:
        memorial_doc = db.collection("memorials").document(memorial_id).get()
        if memorial_doc.exists:
            order_data["memorial"] = memorial_doc.to_dict()
    return order_data


@router.put("/admin/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status_update: UpdateOrderStatusRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_data     = doc.to_dict()
    old_status     = order_data.get("status", "unknown")
    new_status     = status_update.status
    status_history = order_data.get("status_history", [])
    status_history.append({"from_status": old_status, "to_status": new_status, "changed_by": user.get("email"), "changed_at": datetime.now(timezone.utc).isoformat()})
    update_fields  = {"status": new_status, "status_history": status_history, "updated_at": datetime.now(timezone.utc).isoformat()}
    if new_status == "entregue":
        update_fields["delivered_at"] = datetime.now(timezone.utc).isoformat()
        _set_commission_available_on_deliver(order_id)
    order_ref.update(update_fields)
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "update_status", "order", order_id, {"old_status": old_status, "new_status": new_status})
    return {"message": "Status atualizado com sucesso", "new_status": new_status}


@router.put("/admin/orders/{order_id}/cancel")
async def cancel_order(order_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_data     = doc.to_dict()
    old_status     = order_data.get("status")
    status_history = order_data.get("status_history", [])
    status_history.append({"from_status": old_status, "to_status": "cancelled", "changed_by": user.get("email"), "changed_at": datetime.now(timezone.utc).isoformat()})
    order_ref.update({"status": "cancelled", "status_history": status_history, "cancelled_at": datetime.now(timezone.utc).isoformat(), "cancelled_by": user.get("email"), "updated_at": datetime.now(timezone.utc).isoformat()})
    _cancel_commission(order_id)
    memorial_id = order_data.get("memorial_id")
    if memorial_id:
        try:
            mem_ref = db.collection("memorials").document(memorial_id)
            if mem_ref.get().exists:
                mem_ref.update({"status": "cancelled", "active": False, "cancelled_at": datetime.now(timezone.utc).isoformat(), "cancelled_by_order": order_id, "updated_at": datetime.now(timezone.utc).isoformat()})
        except Exception as e:
            logger.error(f"Erro ao arquivar memorial {memorial_id}: {str(e)}")
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "cancel_order", "order", order_id, {"old_status": old_status})
    memorial_data = get_memorial_for_order(order_data)
    background_tasks.add_task(send_order_status_email, order_data, memorial_data, "cancelled")
    return {"message": "Pedido cancelado com sucesso"}


@router.put("/admin/orders/{order_id}/archive")
async def archive_order(order_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_status = doc.to_dict().get("status", "")
    if order_status not in ["entregue", "cancelled"]:
        raise HTTPException(status_code=400, detail=f"Apenas pedidos 'entregue' ou 'cancelled' podem ser arquivados.")
    order_ref.update({"archived": True, "archived_at": datetime.now(timezone.utc).isoformat(), "archived_by": user.get("email"), "updated_at": datetime.now(timezone.utc).isoformat()})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "archive_order", "order", order_id, {"status": order_status})
    return {"message": "Pedido arquivado com sucesso"}


@router.put("/admin/orders/{order_id}/unarchive")
async def unarchive_order(order_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    order_ref = db.collection("payments").document(order_id)
    if not order_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_ref.update({"archived": False, "unarchived_at": datetime.now(timezone.utc).isoformat(), "unarchived_by": user.get("email"), "updated_at": datetime.now(timezone.utc).isoformat()})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "unarchive_order", "order", order_id, {})
    return {"message": "Pedido desarquivado com sucesso"}


@router.put("/admin/orders/{order_id}/notes")
async def update_order_notes(order_id: str, notes_data: UpdateOrderNotesRequest, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    order_ref = db.collection("payments").document(order_id)
    if not order_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_ref.update({"admin_notes": notes_data.notes, "admin_notes_updated_at": datetime.now(timezone.utc).isoformat(), "admin_notes_updated_by": user.get("email"), "updated_at": datetime.now(timezone.utc).isoformat()})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "update_notes", "order", order_id, {"notes_preview": notes_data.notes[:100]})
    return {"message": "Notas atualizadas com sucesso"}


@router.put("/admin/orders/{order_id}/tracking")
async def update_tracking(order_id: str, tracking_data: UpdateTrackingRequest, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_data     = doc.to_dict()
    status_history = order_data.get("status_history", [])
    status_history.append({"from_status": order_data.get("status"), "to_status": "shipped", "changed_by": user.get("email"), "changed_at": datetime.now(timezone.utc).isoformat(), "tracking_code": tracking_data.tracking_code, "delivery_type": tracking_data.delivery_type})
    order_ref.update({"tracking_code": tracking_data.tracking_code, "delivery_type": tracking_data.delivery_type, "status": "shipped", "status_history": status_history, "shipped_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "add_tracking", "order", order_id, {"tracking_code": tracking_data.tracking_code})
    memorial_data = get_memorial_for_order(order_data)
    background_tasks.add_task(send_order_status_email, order_data, memorial_data, "shipped", tracking_data.tracking_code, tracking_data.delivery_type)
    return {"message": "Código de rastreio adicionado", "tracking_code": tracking_data.tracking_code}


@router.post("/admin/orders/{order_id}/resend-email")
async def resend_confirmation_email(order_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    doc = db.collection("payments").document(order_id).get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_data   = doc.to_dict()
    order_status = order_data.get("status", "")
    if order_status not in {"approved", "paid", "in_production", "produced", "shipped", "entregue", "cancelled"}:
        raise HTTPException(status_code=400, detail=f"Não é possível reenviar email para status '{order_status}'")
    memorial_data  = get_memorial_for_order(order_data)
    status_to_send = "paid" if order_status == "approved" else order_status
    background_tasks.add_task(send_order_status_email, order_data, memorial_data, status_to_send, order_data.get("tracking_code"), order_data.get("delivery_type", "correios"))
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "resend_email", "order", order_id, {"status": status_to_send, "customer_email": order_data.get("user_email")})
    return {"message": f"Email reenviado para {order_data.get('user_email')}", "status_template": status_to_send}


@router.delete("/admin/orders/{order_id}")
async def delete_order(order_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_data = doc.to_dict()
    await create_admin_log(user.get("uid"), user.get("email"), "delete_order", "order", order_id, {"status": order_data.get("status"), "amount": order_data.get("amount"), "user_email": order_data.get("user_email"), "plan_type": order_data.get("plan_type"), "memorial_id": order_data.get("memorial_id")})
    order_ref.delete()
    return {"message": "Pedido excluído com sucesso"}


@router.get("/admin/production-queue")
async def get_production_queue(user: dict = Depends(verify_admin)):
    PHYSICAL_TYPES = {"plaque", "complete", "qrcode_plaque"}
    DIGITAL_TYPES  = {"digital"}
    VALID_STATUSES = {"approved", "paid", "in_production", "produced", "shipped", "entregue"}
    docs  = db.collection("payments").stream()
    queue = []
    for doc in docs:
        order_data   = doc.to_dict()
        plan_type    = order_data.get("plan_type", "")
        order_status = order_data.get("status", "")
        if plan_type not in PHYSICAL_TYPES and plan_type not in DIGITAL_TYPES:
            continue
        if order_status not in VALID_STATUSES:
            continue
        if order_data.get("archived", False):
            continue
        order_data  = deserialize_datetime(order_data, ["created_at", "updated_at"])
        memorial_id = order_data.get("memorial_id")
        if memorial_id:
            memorial_doc = db.collection("memorials").document(memorial_id).get()
            if memorial_doc.exists:
                memorial_data = memorial_doc.to_dict()
                person_data   = memorial_data.get("person_data", {})
                order_data["person_name"]   = person_data.get("full_name", "N/A")
                order_data["memorial_slug"] = memorial_data.get("slug")
                order_data["person_photo"]  = person_data.get("photo_url")
                order_data["birth_date"]    = person_data.get("birth_date")
                order_data["death_date"]    = person_data.get("death_date")
        order_data["is_physical"] = plan_type in PHYSICAL_TYPES
        queue.append(order_data)
    queue.sort(key=lambda x: x.get("created_at", ""), reverse=False)
    return queue


@router.put("/admin/production/{order_id}/start")
async def start_production(order_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_data     = doc.to_dict()
    status_history = order_data.get("status_history", [])
    status_history.append({"from_status": order_data.get("status"), "to_status": "in_production", "changed_by": user.get("email"), "changed_at": datetime.now(timezone.utc).isoformat()})
    order_ref.update({"status": "in_production", "production_started_at": datetime.now(timezone.utc).isoformat(), "status_history": status_history, "updated_at": datetime.now(timezone.utc).isoformat()})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "start_production", "order", order_id, {})
    memorial_data = get_memorial_for_order(order_data)
    background_tasks.add_task(send_order_status_email, order_data, memorial_data, "in_production")
    return {"message": "Produção iniciada"}


@router.put("/admin/production/{order_id}/complete")
async def complete_production(order_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_data     = doc.to_dict()
    status_history = order_data.get("status_history", [])
    status_history.append({"from_status": order_data.get("status"), "to_status": "produced", "changed_by": user.get("email"), "changed_at": datetime.now(timezone.utc).isoformat()})
    order_ref.update({"status": "produced", "production_completed_at": datetime.now(timezone.utc).isoformat(), "status_history": status_history, "updated_at": datetime.now(timezone.utc).isoformat()})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "complete_production", "order", order_id, {})
    memorial_data = get_memorial_for_order(order_data)
    background_tasks.add_task(send_order_status_email, order_data, memorial_data, "produced")
    return {"message": "Produção concluída"}
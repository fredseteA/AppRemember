from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi import status as http_status
from firebase_admin import firestore, auth
from datetime import datetime, timezone, timedelta
from collections import defaultdict
from typing import Optional
import uuid

from core.firebase import db
from dependencies.auth import verify_firebase_token, verify_admin
from models.admin import (
    AdminNotification, UpdateMemorialAdminRequest,
    ProductCostConfig, UpdateProductCostRequest,
    CreateaffiliateUserRequest
)
from models.partner import (
    CreatePartnerWithAccessRequest, UpdatePartnerRequest,
    MarkCommissionPaidRequest
)
from utils.serialization import serialize_datetime, deserialize_datetime
from services.admin_services import create_admin_log, generate_partner_code
from services.notification_service import NOTIFICATION_PRIORITY
from services.cost_service import (
    get_product_cost_config, calculate_cost_total,
    calculate_gateway_fee, calculate_profit_no_affiliate,
    calculate_profit_with_affiliate
)
from services.email_service import send_payment_notification_email

router = APIRouter(prefix="/api")

PAID_STATUSES = {"approved", "paid", "in_production", "produced", "shipped", "entregue"}


# ── Stats / Dashboard ─────────────────────────────────────────────────────────

@router.get("/admin/stats")
async def get_admin_stats(user: dict = Depends(verify_admin)):
    memorials_docs = list(db.collection("memorials").stream())
    payments_docs  = list(db.collection("payments").stream())
    total_plaques  = sum(1 for doc in payments_docs if doc.to_dict().get("plan_type") in ["plaque", "complete", "qrcode_plaque"])
    return {"total_memorials": len(memorials_docs), "total_orders": len(payments_docs), "total_plaques": total_plaques}


@router.get("/admin/dashboard")
async def get_admin_dashboard(user: dict = Depends(verify_admin)):
    now           = datetime.now(timezone.utc)
    current_month = now.month
    current_year  = now.year

    payments  = [doc.to_dict() for doc in db.collection("payments").stream()]
    total_memorials = len(list(db.collection("memorials").stream()))
    total_partners  = len(list(db.collection("partners").where(filter=firestore.FieldFilter("status", "==", "active")).stream()))

    total_revenue = monthly_revenue = 0.0
    total_orders  = monthly_orders  = 0
    total_plaques = monthly_plaques = 0
    cancelled_orders = cancelled_revenue = monthly_cancelled = pending_cancellation_requests = 0
    sales_by_month = defaultdict(lambda: {"revenue": 0.0, "orders": 0})
    sales_by_type  = {"digital": 0, "plaque": 0, "complete": 0}
    revenue_by_type = {"digital": 0.0, "plaque": 0.0, "complete": 0.0}

    for payment in payments:
        p_status   = payment.get("status", "")
        amount     = payment.get("amount", 0)
        plan_type  = payment.get("plan_type", "digital")
        created_at = payment.get("created_at")
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            except:
                created_at = now

        if payment.get("cancel_requested") and p_status != "cancelled":
            pending_cancellation_requests += 1

        if p_status == "cancelled":
            cancelled_orders  += 1
            cancelled_revenue += payment.get("original_amount", amount)
            if created_at.month == current_month and created_at.year == current_year:
                monthly_cancelled += 1
            continue

        if p_status not in PAID_STATUSES:
            continue

        total_revenue += amount
        total_orders  += 1
        if created_at.month == current_month and created_at.year == current_year:
            monthly_revenue += amount
            monthly_orders  += 1
        if plan_type in ["plaque", "complete", "qrcode_plaque"]:
            total_plaques += 1
            if created_at.month == current_month and created_at.year == current_year:
                monthly_plaques += 1
        month_key = f"{created_at.year}-{created_at.month:02d}"
        sales_by_month[month_key]["revenue"] += amount
        sales_by_month[month_key]["orders"]  += 1
        type_key = plan_type if plan_type in sales_by_type else "digital"
        sales_by_type[type_key]   += 1
        revenue_by_type[type_key] += amount

    total_all   = total_orders + cancelled_orders
    cancel_rate = round((cancelled_orders / total_all * 100) if total_all > 0 else 0.0, 1)

    pending_commissions = sum(
        doc.to_dict().get("amount", 0)
        for doc in db.collection("commission_payments").where(filter=firestore.FieldFilter("status", "==", "pending")).stream()
    )

    chart_data = []
    for i in range(5, -1, -1):
        target_date = now - timedelta(days=30 * i)
        month_key   = f"{target_date.year}-{target_date.month:02d}"
        data        = sales_by_month.get(month_key, {"revenue": 0, "orders": 0})
        chart_data.append({"month": target_date.strftime("%b"), "revenue": data["revenue"], "orders": data["orders"]})

    type_chart_data = [
        {"name": "Digital",  "value": sales_by_type["digital"],  "revenue": revenue_by_type["digital"]},
        {"name": "Placa QR", "value": sales_by_type["plaque"],   "revenue": revenue_by_type["plaque"]},
        {"name": "Completo", "value": sales_by_type["complete"], "revenue": revenue_by_type["complete"]},
    ]

    return {
        "total_revenue": total_revenue, "monthly_revenue": monthly_revenue,
        "avg_ticket": total_revenue / total_orders if total_orders > 0 else 0,
        "monthly_avg_ticket": monthly_revenue / monthly_orders if monthly_orders > 0 else 0,
        "total_orders": total_orders, "monthly_orders": monthly_orders,
        "total_memorials": total_memorials, "total_plaques": total_plaques,
        "monthly_plaques": monthly_plaques, "total_partners": total_partners,
        "pending_commissions": pending_commissions,
        "cancelled_orders": cancelled_orders, "monthly_cancelled_orders": monthly_cancelled,
        "cancelled_revenue": round(cancelled_revenue, 2), "cancel_rate": cancel_rate,
        "pending_cancellation_requests": pending_cancellation_requests,
        "sales_chart": chart_data, "type_chart": type_chart_data,
    }


# ── Settings / Costs ──────────────────────────────────────────────────────────

@router.get("/admin/settings/costs")
async def get_cost_settings(user: dict = Depends(verify_admin)):
    cfg = get_product_cost_config()
    return {
        "config":             cfg.model_dump(),
        "custo_total":        round(calculate_cost_total(cfg), 2),
        "lucro_sem_afiliado": calculate_profit_no_affiliate(cfg),
        "lucro_com_afiliado": calculate_profit_with_affiliate(cfg),
    }


@router.put("/admin/settings/costs")
async def update_cost_settings(updates: UpdateProductCostRequest, user: dict = Depends(verify_admin)):
    cfg      = get_product_cost_config()
    cfg_dict = cfg.model_dump()
    cfg_dict.update({k: v for k, v in updates.model_dump().items() if v is not None})
    cfg_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    db.collection("settings").document("product_costs").set(cfg_dict)
    new_cfg = ProductCostConfig(**cfg_dict)
    return {
        "message":            "Configurações salvas com sucesso!",
        "config":             new_cfg.model_dump(),
        "custo_total":        round(calculate_cost_total(new_cfg), 2),
        "lucro_sem_afiliado": calculate_profit_no_affiliate(new_cfg),
        "lucro_com_afiliado": calculate_profit_with_affiliate(new_cfg),
    }


# ── Memorials ─────────────────────────────────────────────────────────────────

@router.get("/admin/memorials")
async def get_all_memorials(user: dict = Depends(verify_admin)):
    docs = db.collection("memorials").order_by("created_at", direction=firestore.Query.DESCENDING).stream()
    return [deserialize_datetime(doc.to_dict(), ["created_at", "updated_at"]) for doc in docs]


# ── Partners ──────────────────────────────────────────────────────────────────

@router.get("/admin/partners")
async def get_all_partners(user: dict = Depends(verify_admin)):
    docs   = list(db.collection("partners").order_by("created_at", direction=firestore.Query.DESCENDING).stream())
    now    = datetime.now(timezone.utc)
    result = []
    for doc in docs:
        p          = deserialize_datetime(doc.to_dict(), ["created_at", "updated_at"])
        partner_id = p.get("id")
        comm_docs  = list(db.collection("supporter_commissions").where(filter=firestore.FieldFilter("partner_id", "==", partner_id)).stream())
        pending = available = paid = 0.0
        sales_this_month = 0
        for cd in comm_docs:
            c   = cd.to_dict()
            amt = c.get("commission_amount", 0) or 0
            s   = c.get("commission_status", "")
            if s == "pending":   pending   += amt
            if s == "available": available += amt
            if s == "paid":      paid      += amt
            created = c.get("created_at")
            if isinstance(created, str):
                try: created = datetime.fromisoformat(created.replace('Z', '+00:00'))
                except: pass
            if isinstance(created, datetime):
                if created.tzinfo is None: created = created.replace(tzinfo=timezone.utc)
                if created.month == now.month and created.year == now.year:
                    sales_this_month += 1
        p["commission_pending"]   = round(pending, 2)
        p["commission_available"] = round(available, 2)
        p["commission_paid"]      = round(paid, 2)
        p["total_sales_month"]    = sales_this_month
        result.append(p)
    return result


@router.post("/admin/partners")
async def create_partner(
    partner_req: CreatePartnerWithAccessRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    import re
    code = partner_req.supporter_code.strip().upper()
    if not re.match(r'^[A-Z0-9_\-]{3,20}$', code):
        raise HTTPException(status_code=400, detail="Código inválido.")
    if list(db.collection("partners").where(filter=firestore.FieldFilter("supporter_code", "==", code)).limit(1).stream()):
        raise HTTPException(status_code=400, detail=f"Código '{code}' já está em uso.")
    try:
        firebase_user = auth.create_user(email=partner_req.email, password=partner_req.password, display_name=partner_req.name)
    except auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="Este email já está cadastrado.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar usuário: {str(e)}")
    uid        = firebase_user.uid
    now        = datetime.now(timezone.utc).isoformat()
    partner_id = str(uuid.uuid4())
    db.collection("users").document(uid).set({"firebase_uid": uid, "email": partner_req.email, "name": partner_req.name, "role": "affiliate", "phone": partner_req.phone, "created_at": now, "updated_at": now})
    partner_dict = {"id": partner_id, "name": partner_req.name, "email": partner_req.email, "phone": partner_req.phone, "supporter_code": code, "code": code, "firebase_uid": uid, "commission_rate": partner_req.commission_rate, "monthly_goal": partner_req.monthly_goal, "status": "active", "commission_pending": 0.0, "commission_available": 0.0, "commission_paid": 0.0, "total_sales_month": 0, "total_revenue_month": 0.0, "total_revenue_all_time": 0.0, "created_at": now, "updated_at": now}
    db.collection("partners").document(partner_id).set(partner_dict)
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "create_partner_with_access", "partner", partner_id, {"name": partner_req.name, "code": code, "email": partner_req.email})
    return partner_dict


@router.get("/admin/partners/{partner_id}")
async def get_partner(partner_id: str, user: dict = Depends(verify_admin)):
    doc = db.collection("partners").document(partner_id).get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Parceiro não encontrado")
    return deserialize_datetime(doc.to_dict(), ["created_at", "updated_at"])


@router.put("/admin/partners/{partner_id}")
async def update_partner(partner_id: str, updates: UpdatePartnerRequest, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    partner_ref = db.collection("partners").document(partner_id)
    if not partner_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Parceiro não encontrado")
    if updates.firebase_uid:
        for doc in db.collection("partners").where(filter=firestore.FieldFilter("firebase_uid", "==", updates.firebase_uid.strip())).limit(1).stream():
            if doc.id != partner_id:
                raise HTTPException(status_code=400, detail="Este Firebase UID já está vinculado a outro parceiro.")
    updates_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    updates_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    partner_ref.update(updates_dict)
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "update_partner", "partner", partner_id, updates_dict)
    return {"message": "Parceiro atualizado com sucesso"}


@router.get("/admin/partners/{partner_id}/sales")
async def get_partner_sales(
    partner_id: str,
    user: dict = Depends(verify_admin),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    doc = db.collection("partners").document(partner_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Parceiro não encontrado")
    partner_data   = doc.to_dict()
    supporter_code = partner_data.get("supporter_code") or partner_data.get("code")
    payments_docs  = list(db.collection("payments").where(filter=firestore.FieldFilter("supporter_code", "==", supporter_code)).stream())
    start = end = None
    if start_date:
        try:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if start.tzinfo is None: start = start.replace(tzinfo=timezone.utc)
        except: pass
    if end_date:
        try:
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            if end.tzinfo is None: end = end.replace(tzinfo=timezone.utc)
        except: pass
    sales = []
    for pd in payments_docs:
        p       = deserialize_datetime(pd.to_dict(), ["created_at", "updated_at"])
        created = p.get("created_at")
        if isinstance(created, datetime):
            if created.tzinfo is None: created = created.replace(tzinfo=timezone.utc)
            if start and created < start: continue
            if end   and created > end:   continue
        sales.append(p)
    return {"sales": sales, "partner": partner_data}


# ── Commissions ───────────────────────────────────────────────────────────────

@router.get("/admin/commissions/available")
async def get_available_commissions(user: dict = Depends(verify_admin)):
    docs = list(db.collection("supporter_commissions").where(filter=firestore.FieldFilter("commission_status", "==", "available")).stream())
    return [deserialize_datetime(d.to_dict(), ["created_at"]) for d in docs]


@router.put("/admin/commissions/{commission_id}/pay")
async def pay_commission(commission_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    comm_ref = db.collection("supporter_commissions").document(commission_id)
    doc      = comm_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Comissão não encontrada")
    comm_data = doc.to_dict()
    if comm_data.get("commission_status") != "available":
        raise HTTPException(status_code=400, detail="Comissão não está disponível para pagamento")
    now = datetime.now(timezone.utc).isoformat()
    comm_ref.update({"commission_status": "paid", "paid_at": now, "paid_by": user.get("email")})
    order_id = comm_data.get("order_id")
    if order_id:
        db.collection("payments").document(order_id).update({"commission_status": "paid", "commission_paid_at": now, "updated_at": now})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "pay_commission", "commission", commission_id, {"amount": comm_data.get("commission_amount"), "partner": comm_data.get("partner_name")})
    return {"message": "Comissão marcada como paga", "amount": comm_data.get("commission_amount")}


@router.post("/admin/partners/{partner_id}/commissions/pay")
async def mark_commissions_paid(partner_id: str, body: MarkCommissionPaidRequest, background_tasks: BackgroundTasks, admin: dict = Depends(verify_admin)):
    import re
    if not re.match(r"^\d{4}-\d{2}$", body.period):
        raise HTTPException(status_code=400, detail="Formato de período inválido. Use YYYY-MM")
    if not db.collection("partners").document(partner_id).get().exists:
        raise HTTPException(status_code=404, detail="Parceiro não encontrado")
    comm_docs = list(db.collection("supporter_commissions").where(filter=firestore.FieldFilter("partner_id", "==", partner_id)).where(filter=firestore.FieldFilter("commission_status", "==", "available")).stream())
    now     = datetime.now(timezone.utc)
    updated = []
    total_paid = 0.0
    for cd in comm_docs:
        c       = cd.to_dict()
        created = c.get("created_at")
        if isinstance(created, str):
            try: created = datetime.fromisoformat(created)
            except: continue
        if created and f"{created.year}-{str(created.month).zfill(2)}" != body.period:
            continue
        cd.reference.update({"commission_status": "paid", "paid_at": now.isoformat(), "payment_method": body.payment_method, "payment_notes": body.payment_notes, "paid_by_admin_uid": admin.get("uid"), "updated_at": now.isoformat()})
        total_paid += c.get("commission_amount", 0)
        updated.append(cd.id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Nenhuma comissão disponível para o período {body.period}")
    background_tasks.add_task(create_admin_log, admin.get("uid"), admin.get("email"), "mark_commissions_paid", "partner", partner_id, {"period": body.period, "count": len(updated), "total_paid": total_paid})
    return {"message": f"{len(updated)} comissão(ões) marcada(s) como paga(s)", "period": body.period, "count": len(updated), "total_paid": total_paid}


# ── affiliate user creation ─────────────────────────────────────────────────────

@router.post("/admin/affiliate/create-user")
async def create_affiliate_user(body: CreateaffiliateUserRequest, background_tasks: BackgroundTasks, admin: dict = Depends(verify_admin)):
    try:
        firebase_user = auth.create_user(email=body.email, password=body.password, display_name=body.name)
    except auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="Este email já está cadastrado no Firebase.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar usuário: {str(e)}")
    uid = firebase_user.uid
    now = datetime.now(timezone.utc).isoformat()
    db.collection("users").document(uid).set({"firebase_uid": uid, "email": body.email, "name": body.name, "role": "affiliate", "phone": None, "created_at": now, "updated_at": now})
    if body.partner_id:
        partner_ref = db.collection("partners").document(body.partner_id)
        if not partner_ref.get().exists:
            raise HTTPException(status_code=404, detail="Parceiro não encontrado.")
        partner_ref.update({"firebase_uid": uid, "updated_at": now})
    background_tasks.add_task(create_admin_log, admin.get("uid"), admin.get("email"), "create_affiliate_user", "user", uid, {"email": body.email, "partner_id": body.partner_id})
    return {"message": "Usuário affiliate criado com sucesso.", "uid": uid, "email": body.email, "role": "affiliate"}


# ── Notifications ─────────────────────────────────────────────────────────────

@router.get("/admin/notifications")
async def get_admin_notifications(user: dict = Depends(verify_admin)):
    docs          = db.collection("admin_notifications").limit(100).stream()
    notifications = []
    for doc in docs:
        notif_data = deserialize_datetime(doc.to_dict(), ["created_at"])
        if "priority" not in notif_data:
            notif_data["priority"] = NOTIFICATION_PRIORITY.get(notif_data.get("type", ""), 3)
        notifications.append(notif_data)
    notifications.sort(key=lambda n: (n.get("priority", 3), -(n["created_at"].timestamp() if isinstance(n.get("created_at"), datetime) else 0)))
    return notifications


@router.get("/admin/notifications/unread-count")
async def get_unread_count(user: dict = Depends(verify_admin)):
    docs = list(db.collection("admin_notifications").where(filter=firestore.FieldFilter("read", "==", False)).stream())
    return {"count": len(docs)}


@router.put("/admin/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user: dict = Depends(verify_admin)):
    notif_ref = db.collection("admin_notifications").document(notification_id)
    if not notif_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Notificação não encontrada")
    notif_ref.update({"read": True})
    return {"message": "Notificação marcada como lida"}


@router.put("/admin/notifications/read-all")
async def mark_all_notifications_read(user: dict = Depends(verify_admin)):
    for doc in db.collection("admin_notifications").where(filter=firestore.FieldFilter("read", "==", False)).stream():
        doc.reference.update({"read": True})
    return {"message": "Todas as notificações marcadas como lidas"}


@router.delete("/admin/notifications/{notification_id}")
async def delete_notification(notification_id: str, user: dict = Depends(verify_admin)):
    notif_ref = db.collection("admin_notifications").document(notification_id)
    if not notif_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Notificação não encontrada")
    notif_ref.delete()
    return {"message": "Notificação excluída"}


@router.delete("/admin/notifications/clear-read")
async def clear_read_notifications(user: dict = Depends(verify_admin)):
    docs  = list(db.collection("admin_notifications").where(filter=firestore.FieldFilter("read", "==", True)).stream())
    count = 0
    for doc in docs:
        doc.reference.delete()
        count += 1
    return {"message": f"{count} notificações lidas foram excluídas", "deleted_count": count}


# ── Logs ──────────────────────────────────────────────────────────────────────

@router.get("/admin/logs")
async def get_admin_logs(user: dict = Depends(verify_admin), limit: int = 100, entity_type: Optional[str] = None):
    logs_ref = db.collection("admin_logs").order_by("created_at", direction=firestore.Query.DESCENDING)
    if entity_type:
        logs_ref = logs_ref.where(filter=firestore.FieldFilter("entity_type", "==", entity_type))
    return [deserialize_datetime(doc.to_dict(), ["created_at"]) for doc in logs_ref.limit(limit).stream()]


# ── Finance ───────────────────────────────────────────────────────────────────

@router.get("/admin/finance/summary")
async def get_finance_summary(user: dict = Depends(verify_admin), start_date: Optional[str] = None, end_date: Optional[str] = None):
    payments_docs = list(db.collection("payments").stream())
    start = end   = None
    if start_date:
        try:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if start.tzinfo is None: start = start.replace(tzinfo=timezone.utc)
        except: pass
    if end_date:
        try:
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            if end.tzinfo is None: end = end.replace(tzinfo=timezone.utc)
        except: pass

    total_revenue = 0.0
    total_orders  = 0
    revenue_by_type  = defaultdict(float)
    orders_by_type   = defaultdict(int)
    revenue_by_month = defaultdict(float)
    filtered_payments = []

    for doc in payments_docs:
        payment = doc.to_dict()
        if payment.get("status") not in PAID_STATUSES:
            continue
        created_at = payment.get("created_at")
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                if created_at.tzinfo is None: created_at = created_at.replace(tzinfo=timezone.utc)
            except: continue
        if start and created_at < start: continue
        if end   and created_at > end:   continue
        amount    = payment.get("amount", 0)
        plan_type = payment.get("plan_type", "digital")
        total_revenue += amount
        total_orders  += 1
        revenue_by_type[plan_type] += amount
        orders_by_type[plan_type]  += 1
        revenue_by_month[f"{created_at.year}-{created_at.month:02d}"] += amount
        filtered_payments.append({"id": payment.get("id"), "amount": amount, "original_amount": payment.get("original_amount", amount), "discount_amount": payment.get("discount_amount", 0.0), "final_amount": payment.get("final_amount", amount), "plan_type": plan_type, "user_email": payment.get("user_email"), "supporter_code": payment.get("supporter_code"), "commission_amount": payment.get("commission_amount", 0.0), "commission_status": payment.get("commission_status"), "created_at": created_at.isoformat(), "status": payment.get("status")})

    pending_commissions = available_commissions = total_commissions_paid = total_with_code = 0.0
    for d in db.collection("supporter_commissions").stream():
        c   = d.to_dict()
        amt = c.get("commission_amount", 0) or 0
        s   = c.get("commission_status", "")
        if s == "pending":   pending_commissions   += amt
        if s == "available": available_commissions += amt
        if s == "paid":      total_commissions_paid += amt
        if s != "canceled":  total_with_code += 1

    cfg = get_product_cost_config()
    total_estimated_profit = sum(
        p.get("final_amount", p.get("amount", 0)) - calculate_cost_total(cfg) - cfg.frete_medio - calculate_gateway_fee(p.get("final_amount", p.get("amount", 0)), cfg) - (p.get("commission_amount") or 0)
        for p in filtered_payments
    )

    return {
        "total_revenue": total_revenue, "total_orders": total_orders,
        "avg_ticket": total_revenue / total_orders if total_orders > 0 else 0,
        "revenue_by_type": dict(revenue_by_type), "orders_by_type": dict(orders_by_type),
        "revenue_by_month": dict(revenue_by_month),
        "pending_commissions": round(pending_commissions, 2),
        "available_commissions": round(available_commissions, 2),
        "total_commissions_paid": round(total_commissions_paid, 2),
        "sales_with_code_pct": round((total_with_code / total_orders * 100) if total_orders > 0 else 0.0, 1),
        "estimated_profit": round(total_estimated_profit, 2),
        "lucro_por_venda_sem_afiliado": calculate_profit_no_affiliate(cfg),
        "lucro_por_venda_com_afiliado": calculate_profit_with_affiliate(cfg),
        "custo_produto_total": round(calculate_cost_total(cfg), 2),
        "payments": filtered_payments[:100],
    }


@router.get("/admin/finance/export")
async def export_finance_data(user: dict = Depends(verify_admin), start_date: Optional[str] = None, end_date: Optional[str] = None):
    summary = await get_finance_summary(user, start_date, end_date)
    return {
        "summary": {k: summary[k] for k in ["total_revenue", "total_orders", "avg_ticket", "pending_commissions", "available_commissions", "total_commissions_paid", "estimated_profit"]},
        "by_type":      [{"type": k, "revenue": v, "orders": summary["orders_by_type"].get(k, 0)} for k, v in summary["revenue_by_type"].items()],
        "by_month":     [{"month": k, "revenue": v} for k, v in sorted(summary["revenue_by_month"].items())],
        "transactions": summary["payments"],
    }


# ── Test email ────────────────────────────────────────────────────────────────

@router.post("/admin/test-email")
async def test_email_notification(user: dict = Depends(verify_admin)):
    test_payment  = {"id": "test-payment-123", "user_email": "teste@exemplo.com", "plan_type": "plaque", "amount": 149.90, "status": "approved", "updated_at": datetime.now(timezone.utc).isoformat()}
    test_memorial = {"id": "test-memorial-456", "person_data": {"full_name": "Maria da Silva (TESTE)"}, "responsible": {"name": "João da Silva (TESTE)", "email": "joao@teste.com", "phone": "(22) 99999-9999"}}
    result = await send_payment_notification_email(test_payment, test_memorial)
    if result:
        return {"status": "success", "message": f"E-mail de teste enviado"}
    raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Falha ao enviar e-mail de teste")
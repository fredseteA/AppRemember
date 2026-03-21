from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from datetime import datetime, timezone

from core.firebase import db
from dependencies.auth import verify_affiliate
from models.review import Review
from utils.serialization import deserialize_datetime

router = APIRouter(prefix="/api")


@router.get("/supporters/validate/{code}")
async def validate_supporter_code(code: str):
    from services.commission_service import supporter_service_validate, DISCOUNT_PERCENTAGE
    supporter = supporter_service_validate(code)
    if not supporter:
        raise HTTPException(status_code=404, detail="Código inválido ou inativo.")
    return {"valid": True, "supporter_name": supporter.get("name"), "discount_percentage": DISCOUNT_PERCENTAGE}


@router.get("/affiliate/me")
async def get_affiliate_me(token_data: dict = Depends(verify_affiliate)):
    uid  = token_data["uid"]
    docs = list(db.collection("partners").where(
        filter=firestore.FieldFilter("firebase_uid", "==", uid)
    ).limit(1).stream())
    if not docs:
        raise HTTPException(status_code=404, detail="Nenhum parceiro vinculado a este usuário")
    partner_data = docs[0].to_dict()
    partner_data["id"] = docs[0].id
    partner_data.pop("firebase_uid", None)
    return deserialize_datetime(partner_data, ["created_at", "updated_at"])


@router.get("/affiliate/sales")
async def get_affiliate_sales(token_data: dict = Depends(verify_affiliate)):
    uid  = token_data["uid"]
    docs = list(db.collection("partners").where(
        filter=firestore.FieldFilter("firebase_uid", "==", uid)
    ).limit(1).stream())
    if not docs:
        raise HTTPException(status_code=404, detail="Parceiro não encontrado")
    partner_data   = docs[0].to_dict()
    partner_id     = docs[0].id
    supporter_code = partner_data.get("supporter_code") or partner_data.get("code")
    if not supporter_code:
        raise HTTPException(status_code=400, detail="Parceiro sem código configurado")

    payments_docs = list(db.collection("payments").where(
        filter=firestore.FieldFilter("supporter_code", "==", supporter_code)
    ).stream())

    sales = []
    for pd in payments_docs:
        p = pd.to_dict()
        p["id"] = pd.id
        if p.get("partner_id") and p.get("partner_id") != partner_id:
            continue
        p = deserialize_datetime(p, ["created_at", "updated_at"])
        p.pop("user_id", None)
        p.pop("mercadopago_payment_id", None)
        p.pop("mercadopago_preference_id", None)
        p.pop("delivery_address_snapshot", None)
        p.pop("payer_document", None)
        if p.get("user_email"):
            parts = p["user_email"].split("@")
            if len(parts) == 2:
                p["user_email"] = parts[0][:3] + "***@" + parts[1]
        sales.append(p)

    sales.sort(
        key=lambda x: x.get("created_at") if isinstance(x.get("created_at"), datetime) else datetime.min.replace(tzinfo=timezone.utc),
        reverse=True
    )
    return {"sales": sales, "total": len(sales), "partner_id": partner_id}


@router.get("/affiliate/commissions")
async def get_affiliate_commissions(token_data: dict = Depends(verify_affiliate)):
    uid  = token_data["uid"]
    docs = list(db.collection("partners").where(
        filter=firestore.FieldFilter("firebase_uid", "==", uid)
    ).limit(1).stream())
    if not docs:
        raise HTTPException(status_code=404, detail="Parceiro não encontrado")
    partner_id = docs[0].id

    comm_docs = list(db.collection("supporter_commissions").where(
        filter=firestore.FieldFilter("partner_id", "==", partner_id)
    ).stream())

    commissions = []
    for cd in comm_docs:
        c = cd.to_dict()
        c["id"] = cd.id
        if c.get("partner_id") != partner_id:
            continue
        c = deserialize_datetime(c, ["created_at", "paid_at", "updated_at"])
        c.pop("admin_notes", None)
        c.pop("pix_key", None)
        c.pop("bank_data", None)
        commissions.append(c)

    commissions.sort(
        key=lambda x: x.get("created_at") if isinstance(x.get("created_at"), datetime) else datetime.min.replace(tzinfo=timezone.utc),
        reverse=True
    )

    totals = {
        "pending":   sum(c.get("commission_amount", 0) for c in commissions if c.get("commission_status") == "pending"),
        "available": sum(c.get("commission_amount", 0) for c in commissions if c.get("commission_status") == "available"),
        "paid":      sum(c.get("commission_amount", 0) for c in commissions if c.get("commission_status") == "paid"),
    }
    return {"commissions": commissions, "totals": totals}
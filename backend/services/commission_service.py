from firebase_admin import firestore
from core.firebase import db

DISCOUNT_PERCENTAGE = 5.0


def supporter_service_validate(code: str):
    if not code:
        return None
    code = code.strip().upper()
    docs = list(
        db.collection("partners")
        .where(filter=firestore.FieldFilter("supporter_code", "==", code))
        .where(filter=firestore.FieldFilter("status", "==", "active"))
        .limit(1)
        .stream()
    )
    return docs[0].to_dict() if docs else None


def commission_service_calculate(original_amount: float, commission_rate: float) -> dict:
    discount_amount   = round(original_amount * (DISCOUNT_PERCENTAGE / 100), 2)
    final_amount      = round(original_amount - discount_amount, 2)
    commission_amount = round(final_amount * commission_rate, 2)
    return {
        "original_amount":    original_amount,
        "discount_amount":    discount_amount,
        "final_amount":       final_amount,
        "commission_rate":    commission_rate,
        "commission_amount":  commission_amount,
        "discount_percentage": DISCOUNT_PERCENTAGE,
    }
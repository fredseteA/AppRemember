from datetime import datetime, timezone
from models.admin import AdminLog
from core.firebase import db
from utils.serialization import serialize_datetime
import uuid


async def create_admin_log(
    admin_uid: str,
    admin_email: str,
    action: str,
    entity_type: str,
    entity_id: str,
    details: dict = {}
):
    log = AdminLog(
        admin_uid=admin_uid,
        admin_email=admin_email,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details
    )
    log_dict = log.model_dump()
    log_dict = serialize_datetime(log_dict)
    db.collection("admin_logs").document(log.id).set(log_dict)
    return log


def generate_partner_code(name: str) -> str:
    from utils.slug import slugify
    import uuid
    base_code = slugify(name)[:8].upper().replace('-', '')
    suffix = str(uuid.uuid4())[:4].upper()
    return f"{base_code}{suffix}"


def get_memorial_for_order(order_data: dict) -> dict:
    memorial_id = order_data.get("memorial_id")
    if memorial_id:
        mem_doc = db.collection("memorials").document(memorial_id).get()
        if mem_doc.exists:
            return mem_doc.to_dict()
    return {}
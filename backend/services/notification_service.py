from datetime import datetime, timezone
from models.admin import AdminNotification
from core.firebase import db
from utils.serialization import serialize_datetime

NOTIFICATION_PRIORITY = {
    "cancellation_request": 1,
    "payment_approved":     2,
    "new_order":            2,
    "order_status_change":  3,
    "new_review":           3,
    "system":               4,
}


async def create_admin_notification_with_priority(
    type: str,
    title: str,
    message: str,
    entity_type: str = None,
    entity_id: str = None,
    details: dict = None
):
    priority = NOTIFICATION_PRIORITY.get(type, 3)
    notification = AdminNotification(
        type=type,
        title=title,
        message=message,
        entity_type=entity_type,
        entity_id=entity_id,
        priority=priority,
    )
    notif_dict = notification.model_dump()
    if details:
        notif_dict["details"] = details
    notif_dict = serialize_datetime(notif_dict)
    db.collection("admin_notifications").document(notification.id).set(notif_dict)
    return notification


async def create_admin_notification(
    type: str,
    title: str,
    message: str,
    entity_type: str = None,
    entity_id: str = None
):
    return await create_admin_notification_with_priority(
        type, title, message, entity_type, entity_id
    )
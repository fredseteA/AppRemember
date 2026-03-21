from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, Literal
from datetime import datetime, timezone
import uuid


ORDER_STATUS_VALUES = Literal[
    "pending", "approved", "paid",
    "in_production", "produced",
    "shipped", "entregue",
    "cancelled", "cancel_requested"
]


class DeliveryAddress(BaseModel):
    recipient_name: str
    phone: str
    zip_code: str
    street: str
    number: str
    complement: Optional[str] = None
    neighborhood: str
    city: str
    state: str


class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    memorial_id: str
    user_id: str
    user_email: EmailStr
    plan_type: str
    amount: float
    status: str = "pending"
    mercadopago_payment_id: Optional[str] = None
    payment_method: Optional[str] = None
    delivery_address_snapshot: Optional[DeliveryAddress] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CreatePaymentRequest(BaseModel):
    memorial_id: str
    plan_type: str
    transaction_amount: float
    description: str
    payer_email: EmailStr
    payment_method_id: str = "pix"
    supporter_code: Optional[str] = None
    delivery_address: Optional[DeliveryAddress] = None


class ConfirmPaymentRequest(BaseModel):
    payment_id: str
    mp_payment_id: Optional[str] = None


class UpdateOrderStatusRequest(BaseModel):
    status: ORDER_STATUS_VALUES


class UpdateOrderNotesRequest(BaseModel):
    notes: str


class UpdateTrackingRequest(BaseModel):
    tracking_code: str
    delivery_type: str = "correios"
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid


class Partner(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    email: EmailStr
    phone: Optional[str] = None
    commission_rate: float = 0.10
    total_sales_month: int = 0
    total_sales_all_time: int = 0
    total_revenue_month: float = 0.0
    total_revenue_all_time: float = 0.0
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SupporterCommission(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    partner_id: str
    partner_name: str
    supporter_code: str
    commission_amount: float
    commission_status: str = "pending"
    paid_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CreatePartnerRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    supporter_code: str
    commission_rate: float = 0.10
    firebase_uid: Optional[str] = None


class CreatePartnerWithAccessRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    supporter_code: str
    commission_rate: float = 0.10
    monthly_goal: int = 10


class UpdatePartnerRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    commission_rate: Optional[float] = None
    status: Optional[str] = None
    firebase_uid: Optional[str] = None
    monthly_goal: Optional[int] = None


class MarkCommissionPaidRequest(BaseModel):
    period: str
    payment_method: Optional[str] = "pix"
    payment_notes: Optional[str] = None


class CommissionPayment(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    partner_id: str
    partner_name: str
    amount: float
    period_month: int
    period_year: int
    sales_count: int
    status: str = "pending"
    paid_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")

    firebase_uid: str
    email: EmailStr
    name: str
    phone: Optional[str] = None
    cpf: Optional[str] = None
    birth_date: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    photo_url: Optional[str] = None
    delivery_address: Optional[dict] = None
    role: str = "user"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    cpf: Optional[str] = None
    birth_date: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    photo_url: Optional[str] = None
    role: Optional[str] = None


class UpdateRoleRequest(BaseModel):
    role: str


class AdminLog(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    admin_uid: str
    admin_email: str
    action: str
    entity_type: str
    entity_id: str
    details: dict = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AdminNotification(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    title: str
    message: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    priority: int = 3
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UpdateMemorialAdminRequest(BaseModel):
    featured: Optional[bool] = None
    active: Optional[bool] = None
    admin_notes: Optional[str] = None


class CreateaffiliateUserRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    partner_id: Optional[str] = None


class ProductCostConfig(BaseModel):
    preco_produto: float = 149.0
    custo_placa: float = 15.0
    custo_caixa: float = 4.0
    custo_palha: float = 1.5
    custo_papel_seda: float = 0.5
    custo_fitilho: float = 0.5
    frete_medio: float = 20.0
    taxa_percentual_gateway: float = 0.0499
    taxa_fixa_gateway: float = 0.40
    desconto_percentual_afiliado: float = 0.05
    comissao_percentual_afiliado: float = 0.10
    updated_at: Optional[str] = None


class UpdateProductCostRequest(BaseModel):
    preco_produto: Optional[float] = None
    custo_placa: Optional[float] = None
    custo_caixa: Optional[float] = None
    custo_palha: Optional[float] = None
    custo_papel_seda: Optional[float] = None
    custo_fitilho: Optional[float] = None
    frete_medio: Optional[float] = None
    taxa_percentual_gateway: Optional[float] = None
    taxa_fixa_gateway: Optional[float] = None
    desconto_percentual_afiliado: Optional[float] = None
    comissao_percentual_afiliado: Optional[float] = None
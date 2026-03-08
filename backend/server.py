from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, BackgroundTasks, Request, WebSocket
from fastapi import status as http_status  # ✅ FIX 1: import de status sem conflito
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List, Any, Literal
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path
import re
import unicodedata
import os
import logging
import uuid
import qrcode
import io
import base64
import mercadopago
import json
import asyncio
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ========== FIREBASE FIRESTORE SETUP ==========
import firebase_admin
from firebase_admin import credentials, firestore, auth

FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS_PATH")

if not firebase_admin._apps:
    _firebase_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
    _firebase_path = os.getenv("FIREBASE_CREDENTIALS_PATH")

    if _firebase_json:
        cred = credentials.Certificate(json.loads(_firebase_json))
    elif _firebase_path:
        cred = credentials.Certificate(_firebase_path)
    else:
        raise RuntimeError("Firebase credentials não configuradas.")

    firebase_admin.initialize_app(cred)

# Cliente Firestore síncrono
db = firestore.client()

app = FastAPI(title="Remember QrCode API")

from starlette.types import ASGIApp, Receive, Scope, Send

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

mp_access_token = os.getenv('MERCADOPAGO_ACCESS_TOKEN')
mp_sdk = mercadopago.SDK(mp_access_token)

# Configuração do Resend para envio de e-mails
resend.api_key = os.getenv('RESEND_API_KEY')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'rememberqrcode@gmail.com')
SENDER_EMAIL = os.getenv('SENDER_EMAIL', 'onboarding@resend.dev')


# ========== CONSTANTES DE STATUS ==========

ORDER_STATUS_VALUES = Literal[
    "pending", "approved", "paid",
    "in_production", "produced",
    "shipped", "entregue",
    "cancelled", "cancel_requested"
]

# Status que representam pedidos efetivamente pagos (usados no dashboard e financeiro)
PAID_STATUSES = {"approved", "paid", "in_production", "produced", "shipped", "entregue"}

# Planos que exigem entrega física
PHYSICAL_PLAN_TYPES = {"plaque", "complete", "qrcode_plaque"}


# ========== PYDANTIC MODELS ==========

class PersonData(BaseModel):
    full_name: str
    relationship: str
    birth_city: str
    birth_state: str
    death_city: str
    death_state: str
    birth_date: Optional[str] = None
    death_date: Optional[str] = None
    photo_url: Optional[str] = None
    public_memorial: bool = False

class MemorialContent(BaseModel):
    main_phrase: str
    biography: str
    gallery_urls: List[str] = []
    audio_url: Optional[str] = None

class ResponsibleData(BaseModel):
    name: str
    phone: str
    email: EmailStr

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

class Memorial(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    person_data: PersonData
    content: MemorialContent
    responsible: ResponsibleData
    status: str = "draft"
    plan_type: Optional[str] = None
    qr_code_url: Optional[str] = None
    slug: Optional[str] = None
    # [A-3.5] display_name para facilitar visualização no Firestore Console
    display_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CreateMemorialRequest(BaseModel):
    person_data: PersonData
    content: MemorialContent
    responsible: ResponsibleData

class UpdateMemorialRequest(BaseModel):
    person_data: Optional[PersonData] = None
    content: Optional[MemorialContent] = None
    responsible: Optional[ResponsibleData] = None
    status: Optional[str] = None
    plan_type: Optional[str] = None
    qr_code_url: Optional[str] = None

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

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_email: EmailStr
    user_photo_url: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None
    approved: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CreateReviewRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None

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

#status validado com Literal — Pydantic rejeita strings inválidas automaticamente
class UpdateOrderStatusRequest(BaseModel):
    status: ORDER_STATUS_VALUES

#Notas internas do admin em pedidos
class UpdateOrderNotesRequest(BaseModel):
    notes: str

class CreatePartnerRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    supporter_code: str
    commission_rate: float = 0.10
    firebase_uid: Optional[str] = None

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


# ========== NEW ADMIN MODELS ==========

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

class UpdatePartnerRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    commission_rate: Optional[float] = None
    status: Optional[str] = None
    firebase_uid: Optional[str] = None
    monthly_goal: Optional[int] = None

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
    # ✅ CORREÇÃO PROBLEMA 2: campo priority adicionado ao model
    priority: int = 3  # 1=crítico, 2=alto, 3=normal, 4=baixo
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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

class UpdateTrackingRequest(BaseModel):
    tracking_code: str
    delivery_type: str = "correios"

class RespondReviewRequest(BaseModel):
    response: str

class UpdateMemorialAdminRequest(BaseModel):
    featured: Optional[bool] = None
    active: Optional[bool] = None
    admin_notes: Optional[str] = None

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
    delivery_address: Optional[DeliveryAddress] = None
    role: str = "user"  # "user" | "admin" | "apoiador"
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
    role: str  # "user" | "admin" | "apoiador"

class MarkCommissionPaidRequest(BaseModel):
    period: str          # "2025-03" (ano-mês)
    payment_method: Optional[str] = "pix"
    payment_notes: Optional[str] = None

class CreateApoiadorUserRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    partner_id: Optional[str] = None

class CreatePartnerWithAccessRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    supporter_code: str
    commission_rate: float = 0.10
    monthly_goal: int = 10

# ========== FIREBASE AUTH VERIFICATION ==========

async def verify_firebase_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    if request.method == "OPTIONS":
        return None

    if credentials is None:
        raise HTTPException(
            status_code=http_status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token"
        )

    try:
        decoded = auth.verify_id_token(credentials.credentials)
        return {
            "uid": decoded["uid"],
            "email": decoded.get("email"),
            "email_verified": decoded.get("email_verified", False),
            "admin": decoded.get("admin", False),
        }

    except Exception as e:
        logger.error(f"Firebase token verification failed: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )

async def verify_admin(token_data: dict = Depends(verify_firebase_token)):
    """Admin verificado tanto pelo custom claim quanto pelo Firestore role."""
    if token_data is None:
        raise HTTPException(status_code=http_status.HTTP_401_UNAUTHORIZED, detail="Não autenticado")

    if not token_data.get("admin"):
        
        uid = token_data.get("uid")
        if uid:
            user_doc = db.collection("users").document(uid).get()
            if user_doc.exists:
                role = user_doc.to_dict().get("role", "user")
                if role == "admin":
                    return {**token_data, "role": "admin"}
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Área restrita a administradores."
        )

    return {**token_data, "role": "admin"}

async def verify_apoiador(token_data: dict = Depends(verify_firebase_token)):
    """
    Permite acesso APENAS a usuários com role 'apoiador' ou 'admin'.
    Retorna token_data enriquecido com role e partner_uid para filtros.
    """
    if token_data is None:
        raise HTTPException(
            status_code=http_status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )

    uid = token_data.get("uid")
    if not uid:
        raise HTTPException(
            status_code=http_status.HTTP_401_UNAUTHORIZED,
            detail="UID não encontrado no token"
        )

    user_doc = db.collection("users").document(uid).get()
    if not user_doc.exists:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )

    user_data = user_doc.to_dict()
    role = user_data.get("role", "user")

    if role not in ("apoiador", "admin"):
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Área restrita a apoiadores."
        )

    return {**token_data, "role": role, "user_data": user_data}

# ========== UTILITY FUNCTIONS ==========

def generate_qr_code(memorial_url: str) -> str:
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(memorial_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

def slugify(text: str) -> str:
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text).strip('-')
    return text

def generate_unique_slug(full_name: str) -> str:
    base_slug = slugify(full_name)
    slug = base_slug
    counter = 2
    while True:
        existing = db.collection("memorials").where(
            filter=firestore.FieldFilter("slug", "==", slug)
        ).limit(1).stream()
        if not list(existing):
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1

def serialize_datetime(data: Any) -> Any:
    if isinstance(data, datetime):
        return data.isoformat()
    elif isinstance(data, dict):
        return {key: serialize_datetime(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [serialize_datetime(item) for item in data]
    return data

def deserialize_datetime(data: dict, datetime_fields: List[str]) -> dict:
    if not data:
        return data
    result = data.copy()
    for field in datetime_fields:
        if field in result and isinstance(result[field], str):
            try:
                result[field] = datetime.fromisoformat(result[field].replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                pass
    return result

DISCOUNT_PERCENTAGE = 5.0

def supporter_service_validate(code: str) -> Optional[dict]:
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

# Mapa de prioridades por tipo de notificação
NOTIFICATION_PRIORITY = {
    "cancellation_request": 1,   # crítico — aparece primeiro
    "payment_approved":     2,   # alto
    "new_order":            2,   # alto
    "order_status_change":  3,   # normal
    "new_review":           3,   # normal
    "system":               4,   # baixo
}

async def create_admin_notification_with_priority(
    type: str,
    title: str,
    message: str,
    entity_type: str = None,
    entity_id: str = None,
    details: dict = None
):
    """Cria notificação com prioridade automática baseada no tipo."""
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

async def send_supporter_sale_email(partner_data: dict, payment_data: dict, calc: dict):
    try:
        order_id = payment_data.get("id", "")[:8]
        html = f"""
        <!DOCTYPE html><html><head><meta charset="UTF-8"></head>
        <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#3b82f6;">🎉 Nova venda com seu código!</h2>
            <p>Olá, <strong>{partner_data.get('name')}</strong>!</p>
            <p>Uma venda foi realizada usando seu código <strong>{partner_data.get('supporter_code')}</strong>.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                <tr>
                    <td style="padding:10px;background:#f8f9fa;font-weight:bold;border-bottom:1px solid #ddd;">Pedido</td>
                    <td style="padding:10px;background:#fff;border-bottom:1px solid #ddd;">#{order_id}</td>
                </tr>
                <tr>
                    <td style="padding:10px;background:#f8f9fa;font-weight:bold;border-bottom:1px solid #ddd;">Valor Original</td>
                    <td style="padding:10px;background:#fff;border-bottom:1px solid #ddd;">R$ {calc['original_amount']:.2f}</td>
                </tr>
                <tr>
                    <td style="padding:10px;background:#f8f9fa;font-weight:bold;border-bottom:1px solid #ddd;">Desconto Aplicado</td>
                    <td style="padding:10px;background:#fff;border-bottom:1px solid #ddd;color:#16a34a;">- R$ {calc['discount_amount']:.2f} ({int(DISCOUNT_PERCENTAGE)}%)</td>
                </tr>
                <tr>
                    <td style="padding:10px;background:#f8f9fa;font-weight:bold;border-bottom:1px solid #ddd;">Valor Final</td>
                    <td style="padding:10px;background:#fff;border-bottom:1px solid #ddd;font-weight:bold;">R$ {calc['final_amount']:.2f}</td>
                </tr>
                <tr>
                    <td style="padding:10px;background:#f8f9fa;font-weight:bold;">Sua Comissão</td>
                    <td style="padding:10px;background:#fff;color:#f59e0b;font-size:18px;font-weight:bold;">R$ {calc['commission_amount']:.2f}</td>
                </tr>
            </table>
            <div style="background:#fef9c3;border:1px solid #fbbf24;border-radius:8px;padding:12px;margin:16px 0;">
                <p style="margin:0;color:#92400e;font-size:14px;">
                    ⏳ <strong>Status:</strong> Pendente — a comissão fica disponível após a entrega do pedido.
                </p>
            </div>
            <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
            <p style="font-size:12px;color:#888;text-align:center;">
                © {datetime.now().year} Remember QRCode
            </p>
        </body></html>
        """
        params = {
            "from": SENDER_EMAIL,
            "to": [partner_data.get("email")],
            "subject": "Nova venda com seu código 🎉 — Remember QRCode",
            "html": html
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"✅ Email de venda enviado ao apoiador {partner_data.get('email')}. ID: {result.get('id')}")
    except Exception as e:
        logger.error(f"❌ Erro ao enviar email ao apoiador: {str(e)}")


# ========== ADMIN HELPERS ==========

async def create_admin_log(admin_uid: str, admin_email: str, action: str, entity_type: str, entity_id: str, details: dict = {}):
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

async def create_admin_notification(type: str, title: str, message: str, entity_type: str = None, entity_id: str = None):
    return await create_admin_notification_with_priority(type, title, message, entity_type, entity_id)

def generate_partner_code(name: str) -> str:
    base_code = slugify(name)[:8].upper().replace('-', '')
    suffix = str(uuid.uuid4())[:4].upper()
    return f"{base_code}{suffix}"

async def send_admin_notification_email(subject: str, html_content: str):
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [ADMIN_EMAIL],
            "subject": subject,
            "html": html_content
        }
        email_result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"✅ E-mail enviado para {ADMIN_EMAIL}. ID: {email_result.get('id')}")
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao enviar e-mail: {str(e)}")
        return False


# ========== EMAIL NOTIFICATIONS ==========

async def send_payment_notification_email(payment_data: dict, memorial_data: dict):
    try:
        plan_type = payment_data.get('plan_type', '')
        is_plaque_order = plan_type in ['plaque', 'complete', 'qrcode_plaque']

        responsible = memorial_data.get('responsible', {})
        person_data = memorial_data.get('person_data', {})

        amount = payment_data.get('amount', 0)
        formatted_amount = f"R$ {amount:.2f}".replace('.', ',')

        payment_date = payment_data.get('updated_at') or payment_data.get('created_at')
        if isinstance(payment_date, str):
            try:
                payment_date = datetime.fromisoformat(payment_date.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                payment_date = datetime.now(timezone.utc)
        formatted_date = payment_date.strftime('%d/%m/%Y às %H:%M')

        plan_names = {
            'digital': 'Plano Digital',
            'plaque': 'Plano Placa QR Code',
            'qrcode_plaque': 'Plano Placa QR Code',
            'complete': 'Plano Completo com Placa'
        }
        plan_name = plan_names.get(plan_type, plan_type)

        plaque_alert = ""
        if is_plaque_order:
            plaque_alert = """
            <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center; margin-bottom: 20px; border-radius: 8px;">
                <h2 style="margin: 0; font-size: 24px; font-weight: bold;">🏷️ SOLICITAÇÃO DE PLACA QRCODE</h2>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Este pedido inclui uma placa física que precisa ser produzida e enviada!</p>
            </div>
            """

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            {plaque_alert}
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h1 style="color: #5B8FB9; margin-top: 0;">💳 Novo Pagamento Aprovado</h1>
                <p style="font-size: 16px; margin-bottom: 0;">Um novo pagamento foi confirmado na plataforma Remember QRCode.</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; border-bottom: 1px solid #ddd; font-weight: bold; width: 40%;">👤 Nome do Comprador</td>
                    <td style="padding: 12px; background-color: #fff; border-bottom: 1px solid #ddd;">{responsible.get('name', 'Não informado')}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; border-bottom: 1px solid #ddd; font-weight: bold;">📧 E-mail do Comprador</td>
                    <td style="padding: 12px; background-color: #fff; border-bottom: 1px solid #ddd;">{payment_data.get('user_email', responsible.get('email', 'Não informado'))}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; border-bottom: 1px solid #ddd; font-weight: bold;">📱 Telefone</td>
                    <td style="padding: 12px; background-color: #fff; border-bottom: 1px solid #ddd;">{responsible.get('phone', 'Não informado')}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; border-bottom: 1px solid #ddd; font-weight: bold;">🕊️ Pessoa Homenageada</td>
                    <td style="padding: 12px; background-color: #fff; border-bottom: 1px solid #ddd;">{person_data.get('full_name', 'Não informado')}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; border-bottom: 1px solid #ddd; font-weight: bold;">🆔 ID do Memorial</td>
                    <td style="padding: 12px; background-color: #fff; border-bottom: 1px solid #ddd;"><code style="background-color: #f0f0f0; padding: 2px 6px; border-radius: 4px;">{memorial_data.get('id', 'N/A')}</code></td>
                </tr>
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; border-bottom: 1px solid #ddd; font-weight: bold;">📦 Plano Adquirido</td>
                    <td style="padding: 12px; background-color: #fff; border-bottom: 1px solid #ddd;"><strong style="color: {'#dc2626' if is_plaque_order else '#5B8FB9'};">{plan_name}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; border-bottom: 1px solid #ddd; font-weight: bold;">💰 Valor Pago</td>
                    <td style="padding: 12px; background-color: #fff; border-bottom: 1px solid #ddd;"><strong style="color: #16a34a; font-size: 18px;">{formatted_amount}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; border-bottom: 1px solid #ddd; font-weight: bold;">📅 Data do Pagamento</td>
                    <td style="padding: 12px; background-color: #fff; border-bottom: 1px solid #ddd;">{formatted_date}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; font-weight: bold;">🔗 ID do Pagamento</td>
                    <td style="padding: 12px; background-color: #fff;"><code style="background-color: #f0f0f0; padding: 2px 6px; border-radius: 4px;">{payment_data.get('id', 'N/A')}</code></td>
                </tr>
            </table>
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
                <p style="margin: 0; color: #166534;">✅ <strong>Status:</strong> Pagamento aprovado e memorial publicado com sucesso!</p>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">
                Este é um e-mail automático enviado pela plataforma Remember QRCode.<br>
                © {datetime.now().year} Remember QRCode - Transformando lembranças em homenagens.
            </p>
        </body>
        </html>
        """

        subject = "🏷️ SOLICITAÇÃO DE PLACA QRCODE - Novo Pagamento Aprovado" if is_plaque_order else "💳 Novo Pagamento Aprovado - Remember QRCode"

        params = {
            "from": SENDER_EMAIL,
            "to": [ADMIN_EMAIL],
            "subject": subject,
            "html": html_content
        }

        email_result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"✅ E-mail de notificação enviado para {ADMIN_EMAIL}. ID: {email_result.get('id')}")
        return True

    except Exception as e:
        logger.error(f"❌ Erro ao enviar e-mail de notificação: {str(e)}")
        return False

async def send_order_status_email(
    order_data: dict,
    memorial_data: dict,
    new_status: str,
    tracking_code: str = None,
    delivery_type: str = "correios"
):
    try:
        responsible = memorial_data.get('responsible', {}) if memorial_data else {}
        person_data = memorial_data.get('person_data', {}) if memorial_data else {}

        customer_email = order_data.get('user_email') or responsible.get('email')
        if not customer_email:
            logger.warning(f"⚠️ Email do cliente não encontrado para pedido {order_data.get('id')}")
            return False

        customer_name = responsible.get('name', 'Cliente')
        person_name = person_data.get('full_name', 'seu ente querido')
        order_id = order_data.get('id', '')[:8]
        amount = order_data.get('amount', 0)
        formatted_amount = f"R$ {amount:.2f}".replace('.', ',')

        subjects = {
            'paid': '✅ Compra confirmada — Remember QRCode',
            'in_production': '🔧 Produção iniciada — Remember QRCode',
            'produced': '📦 Produto finalizado — Remember QRCode',
            'shipped_correios': '🚚 Pedido enviado — Remember QRCode',
            'shipped_local': '🛵 Saiu para entrega — Remember QRCode',
            'cancelled': '❌ Pedido cancelado — Remember QRCode',
        }

        status_key = new_status
        if new_status == 'shipped':
            status_key = f'shipped_{delivery_type}'

        bodies = {
            'paid': f"""
                <h2 style="color:#16a34a;">✅ Compra confirmada!</h2>
                <p>Olá, <strong>{customer_name}</strong>!</p>
                <p>Sua compra do memorial de <strong>{person_name}</strong> foi confirmada com sucesso.</p>
                <p><strong>Valor:</strong> {formatted_amount} &nbsp;|&nbsp; <strong>Pedido:</strong> #{order_id}</p>
                <hr/>
                <p>Em até <strong>24 horas</strong> iniciaremos a produção da sua placa.</p>
                <p>Você receberá um email assim que a produção começar.</p>
            """,
            'in_production': f"""
                <h2 style="color:#8b5cf6;">🔧 Produção iniciada!</h2>
                <p>Olá, <strong>{customer_name}</strong>!</p>
                <p>A produção da placa do memorial de <strong>{person_name}</strong> foi iniciada.</p>
                <p><strong>Pedido:</strong> #{order_id}</p>
                <hr/>
                <p>O prazo estimado é de <strong>2 a 3 dias úteis</strong>.</p>
                <p>Você será avisado quando o produto estiver pronto para envio.</p>
            """,
            'produced': f"""
                <h2 style="color:#3b82f6;">📦 Produto finalizado!</h2>
                <p>Olá, <strong>{customer_name}</strong>!</p>
                <p>A placa do memorial de <strong>{person_name}</strong> foi produzida e está pronta.</p>
                <p><strong>Pedido:</strong> #{order_id}</p>
                <hr/>
                <p>Seu pedido será despachado em breve.</p>
                <p>Você receberá o código de rastreio assim que for enviado.</p>
            """,
            'shipped_correios': f"""
                <h2 style="color:#f59e0b;">🚚 Pedido enviado!</h2>
                <p>Olá, <strong>{customer_name}</strong>!</p>
                <p>A placa do memorial de <strong>{person_name}</strong> foi enviada pelos Correios.</p>
                <p><strong>Pedido:</strong> #{order_id}</p>
                <hr/>
                <p><strong>Código de rastreio:</strong></p>
                <p style="font-size:20px;font-family:monospace;background:#f0f0f0;padding:12px;border-radius:6px;letter-spacing:2px;">
                    {tracking_code}
                </p>
                <p>Rastreie seu pedido em: <a href="https://rastreamento.correios.com.br">correios.com.br</a></p>
            """,
            'shipped_local': f"""
                <h2 style="color:#f59e0b;">🛵 Saiu para entrega!</h2>
                <p>Olá, <strong>{customer_name}</strong>!</p>
                <p>A placa do memorial de <strong>{person_name}</strong> saiu para <strong>entrega local</strong>.</p>
                <p><strong>Pedido:</strong> #{order_id}</p>
                <hr/>
                <p>Nosso entregador está a caminho. Fique atento!</p>
            """,
            'cancelled': f"""
                <h2 style="color:#ef4444;">❌ Pedido cancelado</h2>
                <p>Olá, <strong>{customer_name}</strong>!</p>
                <p>Seu pedido <strong>#{order_id}</strong> foi cancelado.</p>
                <hr/>
                <p>O reembolso será processado em até <strong>7 dias úteis</strong>.</p>
                <p>Em caso de dúvidas, entre em contato conosco pelo WhatsApp.</p>
            """,
        }

        if status_key not in subjects:
            logger.warning(f"⚠️ Status '{status_key}' não tem template de email configurado.")
            return False

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
            {bodies[status_key]}
            <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
            <p style="font-size:12px;color:#888;text-align:center;">
                © {datetime.now().year} Remember QRCode — Transformando lembranças em homenagens.
            </p>
        </body>
        </html>
        """

        params = {
            "from": SENDER_EMAIL,
            "to": [customer_email],
            "subject": subjects[status_key],
            "html": html_content
        }

        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"✅ Email de status '{status_key}' enviado para {customer_email}. ID: {result.get('id')}")
        return True

    except Exception as e:
        logger.error(f"❌ Erro ao enviar email de status '{new_status}': {str(e)}")
        return False

def get_memorial_for_order(order_data: dict) -> dict:
    memorial_id = order_data.get("memorial_id")
    if memorial_id:
        mem_doc = db.collection("memorials").document(memorial_id).get()
        if mem_doc.exists:
            return mem_doc.to_dict()
    return {}

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
        logger.info(f"✅ Comissão do pedido {order_id} marcada como 'available'")

def _cancel_commission(order_id: str):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        return
    order_data = doc.to_dict()
    current_status = order_data.get("commission_status")

    if current_status in ("pending", "available"):
        order_ref.update({
            "commission_status": "canceled",
            "commission_amount": 0,
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        comm_docs = list(
            db.collection("supporter_commissions")
            .where(filter=firestore.FieldFilter("order_id", "==", order_id))
            .stream()
        )
        for cd in comm_docs:
            cd.reference.update({
                "commission_status": "canceled",
                "commission_amount": 0,
                "canceled_at": datetime.now(timezone.utc).isoformat()
            })
        logger.info(f"✅ Comissão do pedido {order_id} cancelada")

    elif current_status == "paid":
        db.collection("commission_adjustments").add({
            "order_id": order_id,
            "note": "Pedido cancelado após comissão paga — ajuste manual necessário",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.warning(f"⚠️ Pedido {order_id} cancelado mas comissão já estava 'paid'. Ajuste manual registrado.")

async def _process_approved_payment(
    payment_ref,
    payment_data: dict,
    background_tasks: BackgroundTasks,
    source: str = "unknown"
) -> bool:
    """
    Processa aprovação de pagamento de forma idempotente.
    Retorna True se processou, False se já estava processado.
    """
    current_status = payment_data.get("status", "")

    # Guard de idempotência: status em PAID_STATUSES significa que já foi processado
    if current_status in PAID_STATUSES:
        logger.info(f"[{source}] Pagamento {payment_data.get('id')} já processado (status={current_status}). Ignorando.")
        return False

    memorial_id = payment_data["memorial_id"]
    plan_type = payment_data["plan_type"]
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')

    memorial_doc = db.collection("memorials").document(memorial_id).get()
    if not memorial_doc.exists:
        logger.error(f"[{source}] Memorial {memorial_id} não encontrado para pagamento {payment_data.get('id')}")
        return False

    memorial_doc_data = memorial_doc.to_dict()
    memorial_slug = memorial_doc_data.get("slug") or memorial_id
    memorial_url = f"{frontend_url}/memorial/{memorial_slug}"
    qr_code_data = generate_qr_code(memorial_url)

    db.collection("memorials").document(memorial_id).update({
        "status": "published",
        "plan_type": plan_type,
        "qr_code_url": qr_code_data,
        "updated_at": datetime.now(timezone.utc).isoformat()
    })

    payment_ref.update({
        "status": "approved",
        "updated_at": datetime.now(timezone.utc).isoformat()
    })

    updated_payment = payment_ref.get().to_dict()
    memorial_data = db.collection("memorials").document(memorial_id).get().to_dict()

    if updated_payment and memorial_data:
        person_name = memorial_data.get("person_data", {}).get("full_name", "N/A")
        amount = updated_payment.get("amount", 0)
        plan_names = {'digital': 'Digital', 'plaque': 'Placa QR', 'qrcode_plaque': 'Placa QR', 'complete': 'Completo'}
        plan_label = plan_names.get(plan_type, plan_type)
        background_tasks.add_task(send_payment_notification_email, updated_payment, memorial_data)
        background_tasks.add_task(
            create_admin_notification_with_priority,
            "payment_approved", "Pagamento Aprovado",
            f"Pedido #{payment_data.get('id','')[:8]} aprovado — {person_name} ({plan_label}) — R$ {amount:.2f}",
            "order", payment_data.get("id"),
            {"plan_type": plan_type, "amount": amount, "person_name": person_name, "user_email": updated_payment.get("user_email")}
        )

    logger.info(f"[{source}] Pagamento {payment_data.get('id')} processado com sucesso.")
    return True


# ========== AUTH ENDPOINTS ==========

@api_router.post("/auth/register")
async def register_user(user: User):
    user_ref = db.collection("users").document(user.firebase_uid)
    doc = user_ref.get()
    if doc.exists:
        return doc.to_dict()
    user_dict = user.model_dump()
    user_dict = serialize_datetime(user_dict)
    user_ref.set(user_dict)
    return user_dict


@api_router.get("/auth/me")
async def get_current_user(token_data: dict = Depends(verify_firebase_token)):
    user_ref = db.collection("users").document(token_data["uid"])
    doc = user_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="User not found")
    return doc.to_dict()


@api_router.put("/auth/me")
async def update_current_user(
    update_data: UpdateUserRequest,
    token_data: dict = Depends(verify_firebase_token)
):
    user_ref = db.collection("users").document(token_data["uid"])
    doc = user_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="User not found")
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
        user_ref.update(update_dict)
    return user_ref.get().to_dict()


@api_router.get("/auth/me/address")
async def get_my_address(token_data: dict = Depends(verify_firebase_token)):
    user_ref = db.collection("users").document(token_data["uid"])
    doc = user_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="User not found")
    user_data = doc.to_dict()
    address = user_data.get("delivery_address")
    return {"has_address": address is not None, "address": address}


@api_router.put("/auth/me/address")
async def update_my_address(
    address: DeliveryAddress,
    token_data: dict = Depends(verify_firebase_token)
):
    user_ref = db.collection("users").document(token_data["uid"])
    doc = user_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="User not found")
    address_dict = address.model_dump()
    user_ref.update({
        "delivery_address": address_dict,
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    return {"message": "Endereço salvo com sucesso", "address": address_dict}


@api_router.put("/admin/users/{uid}/role")
async def update_user_role(
    uid: str,
    body: UpdateRoleRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    valid_roles = {"user", "admin", "apoiador"}
    if body.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Role inválido. Use: {valid_roles}")
    user_ref = db.collection("users").document(uid)
    if not user_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    user_ref.update({
        "role": body.role,
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    background_tasks.add_task(
        create_admin_log, user.get("uid"), user.get("email"),
        "update_user_role", "user", uid, {"new_role": body.role}
    )
    return {"message": f"Role atualizado para '{body.role}'", "uid": uid}




# ========== MEMORIAL ENDPOINTS ==========

@api_router.post("/memorials", response_model=Memorial)
async def create_memorial(memorial_request: CreateMemorialRequest, token_data: dict = Depends(verify_firebase_token)):
    memorial = Memorial(
        user_id=token_data["uid"],
        person_data=memorial_request.person_data,
        content=memorial_request.content,
        responsible=memorial_request.responsible
    )
    slug = generate_unique_slug(memorial_request.person_data.full_name)
    memorial.slug = slug
    # [A-3.5] display_name para facilitar visualização no Firestore Console
    full_name = memorial_request.person_data.full_name
    relationship = memorial_request.person_data.relationship
    year = datetime.now(timezone.utc).year
    memorial.display_name = f"{full_name} — {relationship} — {year}"
    memorial_dict = memorial.model_dump()
    memorial_dict = serialize_datetime(memorial_dict)
    db.collection("memorials").document(memorial.id).set(memorial_dict)
    return memorial


@api_router.get("/memorials/my", response_model=List[Memorial])
async def get_my_memorials(token_data: dict = Depends(verify_firebase_token)):
    memorials_ref = db.collection("memorials").where(
        filter=firestore.FieldFilter("user_id", "==", token_data["uid"])
    )
    docs = memorials_ref.stream()
    memorials = []
    for doc in docs:
        memorial_data = doc.to_dict()
        memorial_data = deserialize_datetime(memorial_data, ["created_at", "updated_at"])
        memorials.append(memorial_data)
    return memorials


@api_router.get("/memorials/explore", response_model=List[Memorial])
async def explore_memorials():
    memorials_ref = db.collection("memorials").where(
        filter=firestore.FieldFilter("status", "==", "published")
    )
    docs = memorials_ref.stream()
    memorials = []
    for doc in docs:
        memorial_data = doc.to_dict()
        person_data = memorial_data.get("person_data", {})
        if not person_data.get("public_memorial", False):
            continue
        memorial_data = deserialize_datetime(memorial_data, ["created_at", "updated_at"])
        memorials.append(memorial_data)
    return memorials


@api_router.get("/memorials/by-slug/{slug}", response_model=Memorial)
async def get_memorial_by_slug(slug: str):
    docs = db.collection("memorials").where(
        filter=firestore.FieldFilter("slug", "==", slug)
    ).limit(1).stream()
    results = list(docs)
    if not results:
        raise HTTPException(status_code=404, detail="Memorial not found")
    memorial_data = results[0].to_dict()
    memorial_data = deserialize_datetime(memorial_data, ["created_at", "updated_at"])
    return memorial_data


@api_router.get("/memorials/{memorial_id}", response_model=Memorial)
async def get_memorial(memorial_id: str):
    # Tenta primeiro por ID direto
    doc = db.collection("memorials").document(memorial_id).get()

    # Se não encontrou por ID, tenta por slug
    if not doc.exists:
        slug_query = db.collection("memorials") \
            .where(filter=firestore.FieldFilter("slug", "==", memorial_id)) \
            .limit(1) \
            .stream()
        docs = list(slug_query)
        if not docs:
            raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial not found")
        doc = docs[0]

    memorial_data = doc.to_dict()
    memorial_data = deserialize_datetime(memorial_data, ["created_at", "updated_at"])
    return memorial_data

@api_router.put("/memorials/{memorial_id}")
async def update_memorial(
    memorial_id: str,
    updates: UpdateMemorialRequest,
    token_data: dict = Depends(verify_firebase_token)
):
    memorial_ref = db.collection("memorials").document(memorial_id)
    doc = memorial_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial not found")
    memorial_data = doc.to_dict()
    if memorial_data["user_id"] != token_data["uid"]:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Not authorized")
    updates_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    updates_dict = serialize_datetime(updates_dict)
    updates_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    memorial_ref.update(updates_dict)
    return {"message": "Memorial updated successfully"}


# ========== PAYMENT ENDPOINTS ==========

@api_router.post("/payments/create-checkout")
async def create_checkout(
    payment_req: CreatePaymentRequest,
    background_tasks: BackgroundTasks,
    token_data: dict = Depends(verify_firebase_token)
):
    logger.info("=== INICIANDO CRIAÇÃO DE CHECKOUT ===")

    memorial_doc = db.collection("memorials").document(payment_req.memorial_id).get()
    if not memorial_doc.exists:
        raise HTTPException(status_code=404, detail="Memorial not found")

    memorial = memorial_doc.to_dict()

    if not mp_access_token:
        raise HTTPException(status_code=500, detail="Mercado Pago não configurado")

    # Validação de endereço para planos físicos
    is_physical_plan = payment_req.plan_type in PHYSICAL_PLAN_TYPES
    if is_physical_plan:
        if not payment_req.delivery_address:
            raise HTTPException(
                status_code=422,
                detail="Endereço de entrega obrigatório para planos físicos."
            )
        addr = payment_req.delivery_address
        missing = [f for f, v in [
            ("nome do destinatário", addr.recipient_name),
            ("telefone", addr.phone),
            ("CEP", addr.zip_code),
            ("rua", addr.street),
            ("número", addr.number),
            ("bairro", addr.neighborhood),
            ("cidade", addr.city),
            ("estado", addr.state),
        ] if not v]
        if missing:
            raise HTTPException(
                status_code=422,
                detail=f"Endereço incompleto. Campos faltando: {', '.join(missing)}."
            )

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
            raise HTTPException(status_code=400, detail="Código de apoiador inválido ou inativo.")

        commission_rate = supporter_data.get("commission_rate", 0.10)
        calc = commission_service_calculate(original_amount, commission_rate)

        final_amount      = calc["final_amount"]
        discount_amount   = calc["discount_amount"]
        commission_amount = calc["commission_amount"]
        commission_status = "pending"
        supporter_id      = supporter_data.get("id")
        supporter_code    = raw_code

        logger.info(f"Código apoiador '{raw_code}' válido. Desconto: R${discount_amount} | Comissão: R${commission_amount}")

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
        "original_amount":    original_amount,
        "discount_amount":    discount_amount,
        "final_amount":       final_amount,
        "supporter_id":       supporter_id,
        "supporter_code":     supporter_code,
        "commission_rate":    commission_rate,
        "commission_amount":  commission_amount,
        "commission_status":  commission_status,
        # Snapshot imutável do endereço no momento da compra
        "delivery_address_snapshot": (
            payment_req.delivery_address.model_dump()
            if is_physical_plan and payment_req.delivery_address
            else None
        ),
    })
    payment_dict = serialize_datetime(payment_dict)

    try:
        backend_url  = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')

        preference_payload = {
            "items": [{
                "title": payment_req.description,
                "quantity": 1,
                "unit_price": float(final_amount),
                "currency_id": "BRL"
            }],
            "payer": {"email": payment_req.payer_email},
            "back_urls": {
                "success": f"{frontend_url}/payment/success?payment_id={payment.id}",
                "failure": f"{frontend_url}/payment/failure?payment_id={payment.id}",
                "pending": f"{frontend_url}/payment/pending?payment_id={payment.id}",
            },
            "auto_return": "approved",
            "external_reference": payment.id,
            "statement_descriptor": "Remember QrCode",
            "notification_url": f"{backend_url}/api/webhooks/mercadopago"
        }

        result = mp_sdk.preference().create(preference_payload)

        if result["status"] == 201:
            mp_preference  = result["response"]
            preference_id  = mp_preference.get("id")
            init_point     = mp_preference.get("init_point")
            if not init_point:
                raise HTTPException(status_code=500, detail="Mercado Pago não retornou URL de checkout")

            payment_dict["mercadopago_payment_id"] = preference_id
            db.collection("payments").document(payment.id).set(payment_dict)

            # ✅ CORREÇÃO PROBLEMA 2: notificação de novo pedido criada aqui
            person_name = memorial.get("person_data", {}).get("full_name", "N/A")
            plan_names = {
                'digital': 'Digital', 'plaque': 'Placa QR',
                'qrcode_plaque': 'Placa QR', 'complete': 'Completo'
            }
            plan_label = plan_names.get(payment_req.plan_type, payment_req.plan_type)
            background_tasks.add_task(
                create_admin_notification_with_priority,
                "new_order",
                "Novo Pedido Criado",
                f"Pedido #{payment.id[:8]} — {person_name} ({plan_label}) — R$ {final_amount:.2f}",
                "order",
                payment.id,
                {
                    "plan_type": payment_req.plan_type,
                    "amount": final_amount,
                    "person_name": person_name,
                    "user_email": payment_req.payer_email,
                }
            )

            if supporter_data and commission_amount > 0:
                comm = SupporterCommission(
                    order_id=payment.id,
                    partner_id=supporter_id,
                    partner_name=supporter_data.get("name", ""),
                    supporter_code=supporter_code,
                    commission_amount=commission_amount,
                    commission_status="pending",
                )
                comm_dict = comm.model_dump()
                comm_dict = serialize_datetime(comm_dict)
                db.collection("supporter_commissions").document(comm.id).set(comm_dict)
                background_tasks.add_task(send_supporter_sale_email, supporter_data, payment_dict, calc)

            return {
                "success": True,
                "payment_id": payment.id,
                "preference_id": preference_id,
                "checkout_url": init_point,
                "message": "Checkout criado com sucesso",
                "discount_applied": discount_amount > 0,
                "discount_amount": discount_amount,
                "final_amount": final_amount,
            }

        elif result["status"] == 400:
            err = result.get("response", {})
            causes = err.get("cause", [])
            msg = causes[0].get("description", err.get("message", "Erro ao criar preference")) if causes else err.get("message", "Erro")
            raise HTTPException(status_code=400, detail=f"Mercado Pago: {msg}")

        else:
            raise HTTPException(status_code=500, detail=f"Erro ao criar checkout (status {result.get('status')})")

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"❌ {type(e).__name__}: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@api_router.get("/payments/my", response_model=List[Payment])
async def get_my_payments(token_data: dict = Depends(verify_firebase_token)):
    payments_ref = db.collection("payments").where(
        filter=firestore.FieldFilter("user_id", "==", token_data["uid"])
    )
    docs = payments_ref.stream()
    payments = []
    for doc in docs:
        payment_data = doc.to_dict()
        payment_data = deserialize_datetime(payment_data, ["created_at", "updated_at"])
        payments.append(payment_data)
    return payments


@api_router.post("/payments/confirm")
async def confirm_payment(
    body: ConfirmPaymentRequest,
    background_tasks: BackgroundTasks,
    # [A-1.6] Exige autenticação — apenas o dono do pedido pode confirmar
    token_data: dict = Depends(verify_firebase_token)
):
    payment_ref = db.collection("payments").document(body.payment_id)
    payment_doc = payment_ref.get()
    if not payment_doc.exists:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")

    payment_data = payment_doc.to_dict()

    # [A-1.6] Verifica ownership — usuário autenticado deve ser dono do pedido
    if payment_data.get("user_id") != token_data["uid"]:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Sem permissão para confirmar este pagamento")

    mp_status = "approved"

    if body.mp_payment_id:
        try:
            result = mp_sdk.payment().get(body.mp_payment_id)
            if result["status"] == 200:
                mp_status = result["response"].get("status", "approved")
        except Exception as e:
            logger.warning(f"Não foi possível verificar MP: {e}.")

    if mp_status != "approved":
        payment_ref.update({
            "status": mp_status,
            "mercadopago_payment_id": body.mp_payment_id or payment_data.get("mercadopago_payment_id"),
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        return {"status": mp_status, "memorial_published": False}

    # Salvar mp_payment_id antes de processar
    payment_ref.update({
        "mercadopago_payment_id": body.mp_payment_id or payment_data.get("mercadopago_payment_id"),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    payment_data = payment_ref.get().to_dict()

    # [A-1.5] Função central com idempotência — não reprocessa se já aprovado
    processed = await _process_approved_payment(payment_ref, payment_data, background_tasks, source="confirm_payment")
    return {"status": "approved", "memorial_published": processed}


@api_router.post("/payments/{payment_id}/request-cancel")
async def request_cancel_payment(
    payment_id: str,
    background_tasks: BackgroundTasks,
    token_data: dict = Depends(verify_firebase_token)
):
    payment_ref = db.collection("payments").document(payment_id)
    doc = payment_ref.get()

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

    now = datetime.now(timezone.utc)
    diff_days = (now - created_at).total_seconds() / 86400
    if diff_days > 7:
        raise HTTPException(status_code=400, detail="Prazo de cancelamento encerrado (7 dias)")

    payment_ref.update({
        "cancel_requested": True,
        "cancel_requested_at": now.isoformat(),
        "updated_at": now.isoformat()
    })

    memorial_id = payment_data.get("memorial_id")
    memorial_data = {}
    if memorial_id:
        mem_doc = db.collection("memorials").document(memorial_id).get()
        if mem_doc.exists:
            memorial_data = mem_doc.to_dict()

    person_name = memorial_data.get("person_data", {}).get("full_name", "N/A")
    amount = payment_data.get("amount", 0)

    # ✅ CORREÇÃO PROBLEMA 2: notificação de cancelamento com prioridade máxima (1)
    notif = AdminNotification(
        type="cancellation_request",
        title="Solicitação de Cancelamento",
        message=f"Cliente {payment_data.get('user_email')} solicitou cancelamento do pedido #{payment_id[:8]} — {person_name}",
        entity_type="order",
        entity_id=payment_id,
        priority=1,  # crítico
    )
    notif_dict = notif.model_dump()
    notif_dict["details"] = {
        "user_email": payment_data.get("user_email"),
        "plan_type": payment_data.get("plan_type"),
        "amount": amount,
        "person_name": person_name
    }
    notif_dict = serialize_datetime(notif_dict)
    db.collection("admin_notifications").document(notif.id).set(notif_dict)

    responsible = memorial_data.get("responsible", {})
    customer_name = responsible.get("name", "Cliente")
    order_id_short = payment_id[:8]
    html = f"""
    <!DOCTYPE html><html><head><meta charset="UTF-8"></head>
    <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#f59e0b;">Solicitacao de cancelamento recebida</h2>
        <p>Ola, <strong>{customer_name}</strong>!</p>
        <p>Recebemos sua solicitacao de cancelamento do pedido <strong>#{order_id_short}</strong>.</p>
        <hr/>
        <p>Nossa equipe ira analisar e processar o cancelamento em breve.</p>
        <p>Apos a confirmacao, o reembolso sera realizado em ate <strong>7 dias uteis</strong>.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
        <p style="font-size:12px;color:#888;text-align:center;">
            © {datetime.now().year} Remember QRCode
        </p>
    </body></html>
    """
    params = {
        "from": SENDER_EMAIL,
        "to": [payment_data.get("user_email")],
        "subject": "Solicitacao de cancelamento recebida — Remember QRCode",
        "html": html
    }
    background_tasks.add_task(asyncio.to_thread, resend.Emails.send, params)

    return {"message": "Solicitacao de cancelamento enviada com sucesso"}


@api_router.post("/webhooks/mercadopago")
async def handle_mercadopago_webhook(request: Request, background_tasks: BackgroundTasks):
    try:
        body = await request.body()
        webhook_data = json.loads(body.decode('utf-8'))
        logger.info(f"Webhook received: {webhook_data}")

        if webhook_data.get("type") == "payment":
            payment_id = webhook_data.get("data", {}).get("id")
            if payment_id:
                try:
                    payment_info = mp_sdk.payment().get(payment_id)
                    if payment_info["status"] == 200:
                        mp_payment = payment_info["response"]
                        external_ref = mp_payment.get("external_reference")
                        new_status = mp_payment.get("status")

                        if external_ref:
                            payment_ref = db.collection("payments").document(external_ref)
                            payment_doc = payment_ref.get()
                            if payment_doc.exists:
                                payment_data = payment_doc.to_dict()

                                if new_status == "approved":
                                    # [A-1.5] Usa função central com idempotência
                                    await _process_approved_payment(
                                        payment_ref, payment_data, background_tasks, source="webhook"
                                    )
                                else:
                                    # Para outros status (rejected, cancelled, etc.) — apenas atualiza
                                    payment_ref.update({
                                        "status": new_status,
                                        "updated_at": datetime.now(timezone.utc).isoformat()
                                    })

                except Exception as e:
                    logger.error(f"Error processing payment webhook: {str(e)}")

        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}


# ========== ADMIN ENDPOINTS ==========

@api_router.get("/admin/stats")
async def get_admin_stats(user: dict = Depends(verify_admin)):
    memorials_docs = list(db.collection("memorials").stream())
    payments_docs = list(db.collection("payments").stream())
    total_plaques = sum(1 for doc in payments_docs if doc.to_dict().get("plan_type") in ["plaque", "complete", "qrcode_plaque"])
    return {"total_memorials": len(memorials_docs), "total_orders": len(payments_docs), "total_plaques": total_plaques}


@api_router.get("/admin/dashboard")
async def get_admin_dashboard(user: dict = Depends(verify_admin)):
    from datetime import timedelta
    from collections import defaultdict

    now = datetime.now(timezone.utc)
    current_month = now.month
    current_year = now.year

    payments_docs = list(db.collection("payments").stream())
    payments = [doc.to_dict() for doc in payments_docs]
    memorials_docs = list(db.collection("memorials").stream())
    total_memorials = len(memorials_docs)

    partners_docs = list(db.collection("partners").where(filter=firestore.FieldFilter("status", "==", "active")).stream())
    total_partners = len(partners_docs)

    total_revenue = 0.0
    monthly_revenue = 0.0
    total_orders = 0
    monthly_orders = 0
    total_plaques = 0
    monthly_plaques = 0
    cancelled_orders = 0
    cancelled_revenue = 0.0
    monthly_cancelled = 0
    pending_cancellation_requests = 0
    sales_by_month = defaultdict(lambda: {"revenue": 0.0, "orders": 0})
    sales_by_type = {"digital": 0, "plaque": 0, "complete": 0}
    revenue_by_type = {"digital": 0.0, "plaque": 0.0, "complete": 0.0}

    for payment in payments:
        p_status = payment.get("status", "")
        amount = payment.get("amount", 0)
        plan_type = payment.get("plan_type", "digital")
        created_at = payment.get("created_at")
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            except:
                created_at = now

        if payment.get("cancel_requested") and p_status != "cancelled":
            pending_cancellation_requests += 1

        if p_status == "cancelled":
            cancelled_orders += 1
            cancelled_revenue += payment.get("original_amount", amount)
            if created_at.month == current_month and created_at.year == current_year:
                monthly_cancelled += 1
            continue

        if p_status not in PAID_STATUSES:
            continue

        total_revenue += amount
        total_orders += 1
        if created_at.month == current_month and created_at.year == current_year:
            monthly_revenue += amount
            monthly_orders += 1
        if plan_type in ["plaque", "complete", "qrcode_plaque"]:
            total_plaques += 1
            if created_at.month == current_month and created_at.year == current_year:
                monthly_plaques += 1
        month_key = f"{created_at.year}-{created_at.month:02d}"
        sales_by_month[month_key]["revenue"] += amount
        sales_by_month[month_key]["orders"] += 1
        type_key = plan_type if plan_type in sales_by_type else "digital"
        sales_by_type[type_key] += 1
        revenue_by_type[type_key] += amount

    avg_ticket = total_revenue / total_orders if total_orders > 0 else 0
    monthly_avg_ticket = monthly_revenue / monthly_orders if monthly_orders > 0 else 0

    total_all = total_orders + cancelled_orders
    cancel_rate = round((cancelled_orders / total_all * 100) if total_all > 0 else 0.0, 1)

    pending_commissions = 0.0
    comm_docs = list(db.collection("commission_payments").where(filter=firestore.FieldFilter("status", "==", "pending")).stream())
    for doc in comm_docs:
        pending_commissions += doc.to_dict().get("amount", 0)

    chart_data = []
    for i in range(5, -1, -1):
        target_date = now - timedelta(days=30 * i)
        month_key = f"{target_date.year}-{target_date.month:02d}"
        month_name = target_date.strftime("%b")
        data = sales_by_month.get(month_key, {"revenue": 0, "orders": 0})
        chart_data.append({"month": month_name, "revenue": data["revenue"], "orders": data["orders"]})

    type_chart_data = [
        {"name": "Digital",   "value": sales_by_type["digital"],  "revenue": revenue_by_type["digital"]},
        {"name": "Placa QR",  "value": sales_by_type["plaque"],   "revenue": revenue_by_type["plaque"]},
        {"name": "Completo",  "value": sales_by_type["complete"], "revenue": revenue_by_type["complete"]}
    ]

    return {
        "total_revenue": total_revenue, "monthly_revenue": monthly_revenue,
        "avg_ticket": avg_ticket, "monthly_avg_ticket": monthly_avg_ticket,
        "total_orders": total_orders, "monthly_orders": monthly_orders,
        "total_memorials": total_memorials, "total_plaques": total_plaques,
        "monthly_plaques": monthly_plaques, "total_partners": total_partners,
        "pending_commissions": pending_commissions,
        "cancelled_orders": cancelled_orders,
        "monthly_cancelled_orders": monthly_cancelled,
        "cancelled_revenue": round(cancelled_revenue, 2),
        "cancel_rate": cancel_rate,
        "pending_cancellation_requests": pending_cancellation_requests,
        "sales_chart": chart_data, "type_chart": type_chart_data
    }


@api_router.post("/admin/test-email")
async def test_email_notification(user: dict = Depends(verify_admin)):
    try:
        test_payment = {"id": "test-payment-123", "user_email": "teste@exemplo.com", "plan_type": "plaque", "amount": 119.90, "status": "approved", "updated_at": datetime.now(timezone.utc).isoformat()}
        test_memorial = {"id": "test-memorial-456", "person_data": {"full_name": "Maria da Silva (TESTE)"}, "responsible": {"name": "João da Silva (TESTE)", "email": "joao@teste.com", "phone": "(22) 99999-9999"}}
        result = await send_payment_notification_email(test_payment, test_memorial)
        if result:
            return {"status": "success", "message": f"E-mail de teste enviado para {ADMIN_EMAIL}"}
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Falha ao enviar e-mail de teste")
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao enviar e-mail: {str(e)}")


@api_router.get("/admin/orders")
async def get_all_orders(
    user: dict = Depends(verify_admin),
    status: Optional[str] = None,
    archived: bool = False,
    cancel_requested: Optional[bool] = None,
):
    docs = list(db.collection("payments").stream())
    orders = []
    for doc in docs:
        order_data = doc.to_dict()

        is_archived = order_data.get("archived", False)
        if not archived and is_archived:
            continue
        if archived and not is_archived:
            continue

        if status and order_data.get("status") != status:
            continue

        if cancel_requested is not None:
            if order_data.get("cancel_requested", False) != cancel_requested:
                continue

        order_data = deserialize_datetime(order_data, ["created_at", "updated_at"])
        orders.append(order_data)

    orders.sort(
        key=lambda x: x.get("created_at") if isinstance(x.get("created_at"), datetime)
        else datetime.min.replace(tzinfo=timezone.utc),
        reverse=True
    )
    return orders


@api_router.get("/admin/orders/{order_id}")
async def get_order_details(order_id: str, user: dict = Depends(verify_admin)):
    doc = db.collection("payments").document(order_id).get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_data = doc.to_dict()
    order_data = deserialize_datetime(order_data, ["created_at", "updated_at"])
    memorial_id = order_data.get("memorial_id")
    if memorial_id:
        memorial_doc = db.collection("memorials").document(memorial_id).get()
        if memorial_doc.exists:
            order_data["memorial"] = memorial_doc.to_dict()
    return order_data


@api_router.get("/admin/memorials")
async def get_all_memorials(user: dict = Depends(verify_admin)):
    memorials_ref = db.collection("memorials").order_by("created_at", direction=firestore.Query.DESCENDING)
    docs = memorials_ref.stream()
    memorials = []
    for doc in docs:
        memorial_data = doc.to_dict()
        memorial_data = deserialize_datetime(memorial_data, ["created_at", "updated_at"])
        memorials.append(memorial_data)
    return memorials


@api_router.put("/admin/orders/{order_id}/status")
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

    order_data = doc.to_dict()
    old_status = order_data.get("status", "unknown")
    new_status = status_update.status

    status_history = order_data.get("status_history", [])
    status_history.append({
        "from_status": old_status,
        "to_status": new_status,
        "changed_by": user.get("email"),
        "changed_at": datetime.now(timezone.utc).isoformat()
    })

    update_fields = {
        "status": new_status,
        "status_history": status_history,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    # ── Etapa 2: timestamp de entrega ────────────────────────────────────────
    if new_status == "entregue":
        update_fields["delivered_at"] = datetime.now(timezone.utc).isoformat()
        _set_commission_available_on_deliver(order_id)

    order_ref.update(update_fields)

    background_tasks.add_task(
        create_admin_log,
        user.get("uid"), user.get("email"),
        "update_status", "order", order_id,
        {"old_status": old_status, "new_status": new_status}
    )

    return {"message": "Status atualizado com sucesso", "new_status": new_status}


@api_router.put("/admin/orders/{order_id}/cancel")
async def cancel_order(
    order_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")

    order_data = doc.to_dict()
    old_status = order_data.get("status")
    status_history = order_data.get("status_history", [])
    status_history.append({
        "from_status": old_status,
        "to_status": "cancelled",
        "changed_by": user.get("email"),
        "changed_at": datetime.now(timezone.utc).isoformat()
    })

    order_ref.update({
        "status": "cancelled",
        "status_history": status_history,
        "cancelled_at": datetime.now(timezone.utc).isoformat(),
        "cancelled_by": user.get("email"),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })

    _cancel_commission(order_id)

    memorial_id = order_data.get("memorial_id")
    if memorial_id:
        try:
            mem_ref = db.collection("memorials").document(memorial_id)
            if mem_ref.get().exists:
                mem_ref.update({
                    "status": "cancelled",
                    "active": False,
                    "cancelled_at": datetime.now(timezone.utc).isoformat(),
                    "cancelled_by_order": order_id,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                })
        except Exception as e:
            logger.error(f"Erro ao arquivar memorial {memorial_id}: {str(e)}")

    background_tasks.add_task(
        create_admin_log,
        user.get("uid"), user.get("email"),
        "cancel_order", "order", order_id,
        {"old_status": old_status}
    )

    memorial_data = get_memorial_for_order(order_data)
    background_tasks.add_task(send_order_status_email, order_data, memorial_data, "cancelled")

    return {"message": "Pedido cancelado com sucesso"}


@api_router.put("/admin/orders/{order_id}/archive")
async def archive_order(
    order_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")

    order_data = doc.to_dict()
    order_status = order_data.get("status", "")

    if order_status not in ["entregue", "cancelled"]:
        raise HTTPException(
            status_code=400,
            detail=f"Apenas pedidos 'entregue' ou 'cancelled' podem ser arquivados. Status atual: {order_status}"
        )

    order_ref.update({
        "archived": True,
        "archived_at": datetime.now(timezone.utc).isoformat(),
        "archived_by": user.get("email"),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })

    background_tasks.add_task(
        create_admin_log, user.get("uid"), user.get("email"),
        "archive_order", "order", order_id, {"status": order_status}
    )

    return {"message": "Pedido arquivado com sucesso"}


@api_router.put("/admin/orders/{order_id}/unarchive")
async def unarchive_order(
    order_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    order_ref = db.collection("payments").document(order_id)
    if not order_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_ref.update({
        "archived": False,
        "unarchived_at": datetime.now(timezone.utc).isoformat(),
        "unarchived_by": user.get("email"),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    background_tasks.add_task(
        create_admin_log, user.get("uid"), user.get("email"),
        "unarchive_order", "order", order_id, {}
    )
    return {"message": "Pedido desarquivado com sucesso"}


@api_router.put("/admin/orders/{order_id}/notes")
async def update_order_notes(
    order_id: str,
    notes_data: UpdateOrderNotesRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    order_ref = db.collection("payments").document(order_id)
    if not order_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_ref.update({
        "admin_notes": notes_data.notes,
        "admin_notes_updated_at": datetime.now(timezone.utc).isoformat(),
        "admin_notes_updated_by": user.get("email"),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    background_tasks.add_task(
        create_admin_log, user.get("uid"), user.get("email"),
        "update_notes", "order", order_id,
        {"notes_preview": notes_data.notes[:100]}
    )
    return {"message": "Notas atualizadas com sucesso"}


@api_router.put("/admin/orders/{order_id}/tracking")
async def update_tracking(
    order_id: str,
    tracking_data: UpdateTrackingRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")

    order_data = doc.to_dict()
    status_history = order_data.get("status_history", [])
    status_history.append({
        "from_status": order_data.get("status"),
        "to_status": "shipped",
        "changed_by": user.get("email"),
        "changed_at": datetime.now(timezone.utc).isoformat(),
        "tracking_code": tracking_data.tracking_code,
        "delivery_type": tracking_data.delivery_type
    })

    order_ref.update({
        "tracking_code": tracking_data.tracking_code,
        "delivery_type": tracking_data.delivery_type,
        "status": "shipped",
        "status_history": status_history,
        "shipped_at": datetime.now(timezone.utc).isoformat(),  # já existia
        "updated_at": datetime.now(timezone.utc).isoformat()
    })

    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "add_tracking", "order", order_id, {"tracking_code": tracking_data.tracking_code, "delivery_type": tracking_data.delivery_type})

    memorial_data = get_memorial_for_order(order_data)
    background_tasks.add_task(
        send_order_status_email,
        order_data,
        memorial_data,
        "shipped",
        tracking_data.tracking_code,
        tracking_data.delivery_type
    )

    return {"message": "Código de rastreio adicionado", "tracking_code": tracking_data.tracking_code}


# ========== PRODUCTION QUEUE ==========

@api_router.get("/admin/production-queue")
async def get_production_queue(user: dict = Depends(verify_admin)):
    PHYSICAL_TYPES = {"plaque", "complete", "qrcode_plaque"}
    DIGITAL_TYPES  = {"digital"}
    VALID_STATUSES = {"approved", "paid", "in_production", "produced", "shipped", "entregue"}

    payments_ref = db.collection("payments")
    docs = payments_ref.stream()
    queue = []

    for doc in docs:
        order_data = doc.to_dict()
        plan_type = order_data.get("plan_type", "")
        order_status = order_data.get("status", "")

        if plan_type not in PHYSICAL_TYPES and plan_type not in DIGITAL_TYPES:
            continue

        if order_status not in VALID_STATUSES:
            continue

        if order_data.get("archived", False):
            continue

        order_data = deserialize_datetime(order_data, ["created_at", "updated_at"])

        memorial_id = order_data.get("memorial_id")
        if memorial_id:
            memorial_doc = db.collection("memorials").document(memorial_id).get()
            if memorial_doc.exists:
                memorial_data = memorial_doc.to_dict()
                person_data = memorial_data.get("person_data", {})
                order_data["person_name"]   = person_data.get("full_name", "N/A")
                order_data["memorial_slug"] = memorial_data.get("slug")
                # ── Etapa 2: campos extras para preview ──────────────────
                order_data["person_photo"]  = person_data.get("photo_url")
                order_data["birth_date"]    = person_data.get("birth_date")
                order_data["death_date"]    = person_data.get("death_date")

        order_data["is_physical"] = plan_type in PHYSICAL_TYPES

        queue.append(order_data)

    queue.sort(key=lambda x: x.get("created_at", ""), reverse=False)
    return queue


@api_router.put("/admin/production/{order_id}/start")
async def start_production(order_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")

    order_data = doc.to_dict()
    status_history = order_data.get("status_history", [])
    status_history.append({"from_status": order_data.get("status"), "to_status": "in_production", "changed_by": user.get("email"), "changed_at": datetime.now(timezone.utc).isoformat()})

    order_ref.update({
        "status": "in_production",
        "production_started_at": datetime.now(timezone.utc).isoformat(),
        "status_history": status_history,
        "updated_at": datetime.now(timezone.utc).isoformat()
    })

    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "start_production", "order", order_id, {})

    memorial_data = get_memorial_for_order(order_data)
    background_tasks.add_task(send_order_status_email, order_data, memorial_data, "in_production")

    return {"message": "Produção iniciada"}


@api_router.put("/admin/production/{order_id}/complete")
async def complete_production(order_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")

    order_data = doc.to_dict()
    status_history = order_data.get("status_history", [])
    status_history.append({"from_status": order_data.get("status"), "to_status": "produced", "changed_by": user.get("email"), "changed_at": datetime.now(timezone.utc).isoformat()})

    order_ref.update({
        "status": "produced",
        "production_completed_at": datetime.now(timezone.utc).isoformat(),
        "status_history": status_history,
        "updated_at": datetime.now(timezone.utc).isoformat()
    })

    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "complete_production", "order", order_id, {})

    memorial_data = get_memorial_for_order(order_data)
    background_tasks.add_task(send_order_status_email, order_data, memorial_data, "produced")

    return {"message": "Produção concluída"}


@api_router.delete("/admin/orders/{order_id}")
async def delete_order(
    order_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")

    order_data = doc.to_dict()

    await create_admin_log(
        user.get("uid"), user.get("email"),
        "delete_order", "order", order_id,
        {
            "status": order_data.get("status"),
            "amount": order_data.get("amount"),
            "user_email": order_data.get("user_email"),
            "plan_type": order_data.get("plan_type"),
            "memorial_id": order_data.get("memorial_id"),
        }
    )

    order_ref.delete()
    return {"message": "Pedido excluído com sucesso"}

# ========== PARTNERS ENDPOINTS ==========

@api_router.get("/supporters/validate/{code}")
async def validate_supporter_code(code: str):
    supporter = supporter_service_validate(code)
    if not supporter:
        raise HTTPException(status_code=404, detail="Código inválido ou inativo.")
    return {
        "valid": True,
        "supporter_name": supporter.get("name"),
        "discount_percentage": DISCOUNT_PERCENTAGE,
    }


@api_router.get("/admin/partners")
async def get_all_partners(user: dict = Depends(verify_admin)):
    partners_ref = db.collection("partners").order_by("created_at", direction=firestore.Query.DESCENDING)
    docs = list(partners_ref.stream())
    result = []
    now = datetime.now(timezone.utc)

    for doc in docs:
        p = doc.to_dict()
        p = deserialize_datetime(p, ["created_at", "updated_at"])
        partner_id = p.get("id")

        comm_docs = list(
            db.collection("supporter_commissions")
            .where(filter=firestore.FieldFilter("partner_id", "==", partner_id))
            .stream()
        )
        pending = available = paid = 0.0
        sales_this_month = 0

        for cd in comm_docs:
            c = cd.to_dict()
            amt = c.get("commission_amount", 0) or 0
            s = c.get("commission_status", "")
            if s == "pending":   pending   += amt
            if s == "available": available += amt
            if s == "paid":      paid      += amt
            created = c.get("created_at")
            if isinstance(created, str):
                try:
                    created = datetime.fromisoformat(created.replace('Z', '+00:00'))
                except: pass
            if isinstance(created, datetime):
                if created.tzinfo is None:
                    created = created.replace(tzinfo=timezone.utc)
                if created.month == now.month and created.year == now.year:
                    sales_this_month += 1

        p["commission_pending"]   = round(pending, 2)
        p["commission_available"] = round(available, 2)
        p["commission_paid"]      = round(paid, 2)
        p["total_sales_month"]    = sales_this_month
        result.append(p)

    return result


@api_router.post("/admin/partners")
async def create_partner(
    partner_req: CreatePartnerWithAccessRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    import re as _re
    code = partner_req.supporter_code.strip().upper()

    if not _re.match(r'^[A-Z0-9_\-]{3,20}$', code):
        raise HTTPException(status_code=400, detail="Código inválido.")

    # Verifica código duplicado
    existing_code = list(
        db.collection("partners")
        .where(filter=firestore.FieldFilter("supporter_code", "==", code))
        .limit(1).stream()
    )
    if existing_code:
        raise HTTPException(status_code=400, detail=f"Código '{code}' já está em uso.")

    # Cria usuário no Firebase Auth
    try:
        firebase_user = auth.create_user(
            email=partner_req.email,
            password=partner_req.password,
            display_name=partner_req.name,
        )
    except auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="Este email já está cadastrado.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar usuário: {str(e)}")

    uid = firebase_user.uid
    now = datetime.now(timezone.utc).isoformat()
    partner_id = str(uuid.uuid4())

    # Cria documento users com role apoiador
    db.collection("users").document(uid).set({
        "firebase_uid": uid,
        "email": partner_req.email,
        "name": partner_req.name,
        "role": "apoiador",
        "phone": partner_req.phone,
        "created_at": now,
        "updated_at": now,
    })

    # Cria documento partners vinculado
    partner_dict = {
        "id": partner_id,
        "name": partner_req.name,
        "email": partner_req.email,
        "phone": partner_req.phone,
        "supporter_code": code,
        "code": code,
        "firebase_uid": uid,
        "commission_rate": partner_req.commission_rate,
        "monthly_goal": partner_req.monthly_goal,
        "status": "active",
        "commission_pending": 0.0,
        "commission_available": 0.0,
        "commission_paid": 0.0,
        "total_sales_month": 0,
        "total_revenue_month": 0.0,
        "total_revenue_all_time": 0.0,
        "created_at": now,
        "updated_at": now,
    }
    db.collection("partners").document(partner_id).set(partner_dict)

    background_tasks.add_task(
        create_admin_log, user.get("uid"), user.get("email"),
        "create_partner_with_access", "partner", partner_id,
        {"name": partner_req.name, "code": code, "email": partner_req.email}
    )

    return partner_dict

@api_router.get("/admin/partners/{partner_id}")
async def get_partner(partner_id: str, user: dict = Depends(verify_admin)):
    doc = db.collection("partners").document(partner_id).get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Parceiro não encontrado")
    partner_data = doc.to_dict()
    partner_data = deserialize_datetime(partner_data, ["created_at", "updated_at"])
    return partner_data


@api_router.put("/admin/partners/{partner_id}")
async def update_partner(
    partner_id: str,
    updates: UpdatePartnerRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    partner_ref = db.collection("partners").document(partner_id)
    if not partner_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Parceiro não encontrado")
    
    if updates.firebase_uid:
        uid_existing = list(
            db.collection("partners")
            .where(filter=firestore.FieldFilter("firebase_uid", "==", updates.firebase_uid.strip()))
            .limit(1).stream()
        )
        for doc in uid_existing:
            if doc.id != partner_id:
                raise HTTPException(status_code=400, detail="Este Firebase UID já está vinculado a outro parceiro.")
    
    updates_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    updates_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    partner_ref.update(updates_dict)
    background_tasks.add_task(
        create_admin_log, user.get("uid"), user.get("email"),
        "update_partner", "partner", partner_id, updates_dict
    )
    return {"message": "Parceiro atualizado com sucesso"}


@api_router.get("/admin/partners/{partner_id}/sales")
async def get_partner_sales(
    partner_id: str,
    user: dict = Depends(verify_admin),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    doc = db.collection("partners").document(partner_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Parceiro não encontrado")

    partner_data = doc.to_dict()
    supporter_code = partner_data.get("supporter_code") or partner_data.get("code")

    payments_docs = list(
        db.collection("payments")
        .where(filter=firestore.FieldFilter("supporter_code", "==", supporter_code))
        .stream()
    )

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
        p = pd.to_dict()
        p = deserialize_datetime(p, ["created_at", "updated_at"])
        created = p.get("created_at")
        if isinstance(created, datetime):
            if created.tzinfo is None:
                created = created.replace(tzinfo=timezone.utc)
            if start and created < start: continue
            if end   and created > end:   continue
        sales.append(p)

    return {"sales": sales, "partner": partner_data}


@api_router.get("/admin/commissions/available")
async def get_available_commissions(user: dict = Depends(verify_admin)):
    docs = list(
        db.collection("supporter_commissions")
        .where(filter=firestore.FieldFilter("commission_status", "==", "available"))
        .stream()
    )
    result = []
    for d in docs:
        c = d.to_dict()
        c = deserialize_datetime(c, ["created_at"])
        result.append(c)
    return result


@api_router.put("/admin/commissions/{commission_id}/pay")
async def pay_commission(
    commission_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    comm_ref = db.collection("supporter_commissions").document(commission_id)
    doc = comm_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Comissão não encontrada")

    comm_data = doc.to_dict()
    if comm_data.get("commission_status") != "available":
        raise HTTPException(status_code=400, detail="Comissão não está disponível para pagamento")

    now = datetime.now(timezone.utc).isoformat()
    comm_ref.update({
        "commission_status": "paid",
        "paid_at": now,
        "paid_by": user.get("email"),
    })

    order_id = comm_data.get("order_id")
    if order_id:
        db.collection("payments").document(order_id).update({
            "commission_status": "paid",
            "commission_paid_at": now,
            "updated_at": now,
        })

    background_tasks.add_task(
        create_admin_log, user.get("uid"), user.get("email"),
        "pay_commission", "commission", commission_id,
        {"amount": comm_data.get("commission_amount"), "partner": comm_data.get("partner_name")}
    )
    return {"message": "Comissão marcada como paga", "amount": comm_data.get("commission_amount")}


@api_router.get("/apoiador/me")
async def get_apoiador_me(token_data: dict = Depends(verify_apoiador)):
    """Retorna dados do parceiro vinculado ao uid autenticado."""
    uid = token_data["uid"]

    docs = list(
        db.collection("partners")
        .where(filter=firestore.FieldFilter("firebase_uid", "==", uid))
        .limit(1)
        .stream()
    )
    if not docs:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Nenhum parceiro vinculado a este usuário"
        )

    partner_data = docs[0].to_dict()
    partner_data["id"] = docs[0].id

    # Remove campos sensíveis antes de retornar
    partner_data.pop("firebase_uid", None)

    partner_data = deserialize_datetime(partner_data, ["created_at", "updated_at"])
    return partner_data

@api_router.get("/apoiador/sales")
async def get_apoiador_sales(token_data: dict = Depends(verify_apoiador)):
    """
    Apoiador busca APENAS suas próprias vendas.
    Filtro duplo: firebase_uid → supporter_code → payments.
    Nunca retorna vendas de outros apoiadores.
    """
    uid = token_data["uid"]

    # 1. Busca parceiro pelo firebase_uid — garante propriedade
    docs = list(
        db.collection("partners")
        .where(filter=firestore.FieldFilter("firebase_uid", "==", uid))
        .limit(1)
        .stream()
    )
    if not docs:
        raise HTTPException(status_code=404, detail="Parceiro não encontrado")

    partner_data = docs[0].to_dict()
    partner_id = docs[0].id
    supporter_code = partner_data.get("supporter_code") or partner_data.get("code")

    if not supporter_code:
        raise HTTPException(status_code=400, detail="Parceiro sem código configurado")

    # 2. Busca vendas filtrando TANTO por supporter_code QUANTO por partner_id
    #    para garantir consistência mesmo que o código mude no futuro
    payments_by_code = list(
        db.collection("payments")
        .where(filter=firestore.FieldFilter("supporter_code", "==", supporter_code))
        .stream()
    )

    sales = []
    for pd in payments_by_code:
        p = pd.to_dict()
        p["id"] = pd.id

        # Validação extra: se tiver partner_id salvo, deve bater com o parceiro autenticado
        if p.get("partner_id") and p.get("partner_id") != partner_id:
            continue  # Ignora silenciosamente — dado inconsistente

        p = deserialize_datetime(p, ["created_at", "updated_at"])

        # Remove dados sensíveis do comprador
        p.pop("user_id", None)
        p.pop("mercadopago_payment_id", None)
        p.pop("mercadopago_preference_id", None)
        p.pop("delivery_address_snapshot", None)
        p.pop("payer_document", None)

        # Mascara email parcialmente (mantém domínio)
        if p.get("user_email"):
            email = p["user_email"]
            parts = email.split("@")
            if len(parts) == 2:
                p["user_email"] = parts[0][:3] + "***@" + parts[1]

        sales.append(p)

    # 3. Ordena por data decrescente
    sales.sort(
        key=lambda x: x.get("created_at") if isinstance(x.get("created_at"), datetime)
        else datetime.min.replace(tzinfo=timezone.utc),
        reverse=True
    )

    return {
        "sales": sales,
        "total": len(sales),
        "partner_id": partner_id,
    }

@api_router.get("/apoiador/commissions")
async def get_apoiador_commissions(token_data: dict = Depends(verify_apoiador)):
    """
    Apoiador busca APENAS suas próprias comissões.
    Filtro por firebase_uid → partner_id.
    """
    uid = token_data["uid"]

    # 1. Busca parceiro pelo firebase_uid
    docs = list(
        db.collection("partners")
        .where(filter=firestore.FieldFilter("firebase_uid", "==", uid))
        .limit(1)
        .stream()
    )
    if not docs:
        raise HTTPException(status_code=404, detail="Parceiro não encontrado")

    partner_id = docs[0].id
    partner_data = docs[0].to_dict()

    # 2. Busca comissões filtrando por partner_id
    comm_docs = list(
        db.collection("supporter_commissions")
        .where(filter=firestore.FieldFilter("partner_id", "==", partner_id))
        .stream()
    )

    commissions = []
    for cd in comm_docs:
        c = cd.to_dict()
        c["id"] = cd.id

        # Validação extra de ownership
        if c.get("partner_id") != partner_id:
            continue

        c = deserialize_datetime(c, ["created_at", "paid_at", "updated_at"])

        # Remove campos que o apoiador não deve ver
        c.pop("admin_notes", None)
        c.pop("pix_key", None)
        c.pop("bank_data", None)

        commissions.append(c)

    commissions.sort(
        key=lambda x: x.get("created_at") if isinstance(x.get("created_at"), datetime)
        else datetime.min.replace(tzinfo=timezone.utc),
        reverse=True
    )

    totals = {
        "pending":   sum(c.get("commission_amount", 0) for c in commissions if c.get("commission_status") == "pending"),
        "available": sum(c.get("commission_amount", 0) for c in commissions if c.get("commission_status") == "available"),
        "paid":      sum(c.get("commission_amount", 0) for c in commissions if c.get("commission_status") == "paid"),
    }

    return {
        "commissions": commissions,
        "totals": totals,
    }

@api_router.post("/admin/partners/{partner_id}/commissions/pay")
async def mark_commissions_paid(
    partner_id: str,
    body: MarkCommissionPaidRequest,
    background_tasks: BackgroundTasks,
    admin: dict = Depends(verify_admin),
):
    """
    Admin marca todas as comissões 'available' de um período como 'paid'.
    Apenas admin pode chamar este endpoint.
    """
    # Valida formato do período
    import re
    if not re.match(r"^\d{4}-\d{2}$", body.period):
        raise HTTPException(status_code=400, detail="Formato de período inválido. Use YYYY-MM")

    # Confirma que o parceiro existe
    partner_ref = db.collection("partners").document(partner_id)
    if not partner_ref.get().exists:
        raise HTTPException(status_code=404, detail="Parceiro não encontrado")

    # Busca comissões available do parceiro
    comm_docs = list(
        db.collection("supporter_commissions")
        .where(filter=firestore.FieldFilter("partner_id", "==", partner_id))
        .where(filter=firestore.FieldFilter("commission_status", "==", "available"))
        .stream()
    )

    # Filtra pelo período
    now = datetime.now(timezone.utc)
    updated = []
    total_paid = 0.0

    for cd in comm_docs:
        c = cd.to_dict()
        created = c.get("created_at")
        if isinstance(created, str):
            try:
                created = datetime.fromisoformat(created)
            except Exception:
                continue

        if created:
            period_key = f"{created.year}-{str(created.month).zfill(2)}"
            if period_key != body.period:
                continue

        # Atualiza para paid
        cd.reference.update({
            "commission_status": "paid",
            "paid_at": now.isoformat(),
            "payment_method": body.payment_method,
            "payment_notes": body.payment_notes,
            "paid_by_admin_uid": admin.get("uid"),
            "updated_at": now.isoformat(),
        })
        total_paid += c.get("commission_amount", 0)
        updated.append(cd.id)

    if not updated:
        raise HTTPException(
            status_code=404,
            detail=f"Nenhuma comissão disponível encontrada para o período {body.period}"
        )

    background_tasks.add_task(
        create_admin_log,
        admin.get("uid"), admin.get("email"),
        "mark_commissions_paid", "partner", partner_id,
        {"period": body.period, "count": len(updated), "total_paid": total_paid}
    )

    return {
        "message": f"{len(updated)} comissão(ões) marcada(s) como paga(s)",
        "period": body.period,
        "count": len(updated),
        "total_paid": total_paid,
    }

@api_router.post("/admin/apoiador/create-user")
async def create_apoiador_user(
    body: CreateApoiadorUserRequest,
    background_tasks: BackgroundTasks,
    admin: dict = Depends(verify_admin)
):
    """Admin cria usuário apoiador no Firebase Auth + Firestore + vincula ao parceiro."""

    # 1. Cria usuário no Firebase Authentication
    try:
        firebase_user = auth.create_user(
            email=body.email,
            password=body.password,
            display_name=body.name,
        )
    except auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="Este email já está cadastrado no Firebase.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar usuário: {str(e)}")

    uid = firebase_user.uid
    now = datetime.now(timezone.utc).isoformat()

    # 2. Cria documento na coleção users com role = apoiador
    user_dict = {
        "firebase_uid": uid,
        "email": body.email,
        "name": body.name,
        "role": "apoiador",
        "phone": None,
        "created_at": now,
        "updated_at": now,
    }
    db.collection("users").document(uid).set(user_dict)

    # 3. Vincula ao parceiro se informado
    if body.partner_id:
        partner_ref = db.collection("partners").document(body.partner_id)
        if not partner_ref.get().exists:
            raise HTTPException(status_code=404, detail="Parceiro não encontrado.")
        partner_ref.update({
            "firebase_uid": uid,
            "updated_at": now,
        })

    background_tasks.add_task(
        create_admin_log, admin.get("uid"), admin.get("email"),
        "create_apoiador_user", "user", uid,
        {"email": body.email, "partner_id": body.partner_id}
    )

    return {
        "message": "Usuário apoiador criado com sucesso.",
        "uid": uid,
        "email": body.email,
        "role": "apoiador",
    }

# ========== FINANCIAL ENDPOINTS ==========

@api_router.get("/admin/finance/summary")
async def get_finance_summary(
    user: dict = Depends(verify_admin),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    from collections import defaultdict

    payments_docs = list(db.collection("payments").stream())

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

    total_revenue = 0.0
    total_orders  = 0
    revenue_by_type  = defaultdict(float)
    orders_by_type   = defaultdict(int)
    revenue_by_month = defaultdict(float)
    filtered_payments = []

    for doc in payments_docs:
        payment = doc.to_dict()
        # ✅ CORREÇÃO PROBLEMA 3: finance/summary usa o mesmo PAID_STATUSES do dashboard
        # garante consistência entre os dois endpoints
        if payment.get("status") not in PAID_STATUSES:
            continue
        created_at = payment.get("created_at")
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                if created_at.tzinfo is None:
                    created_at = created_at.replace(tzinfo=timezone.utc)
            except: continue
        if start and created_at < start: continue
        if end   and created_at > end:   continue

        amount    = payment.get("amount", 0)
        plan_type = payment.get("plan_type", "digital")
        total_revenue += amount
        total_orders  += 1
        revenue_by_type[plan_type]  += amount
        orders_by_type[plan_type]   += 1
        month_key = f"{created_at.year}-{created_at.month:02d}"
        revenue_by_month[month_key] += amount

        filtered_payments.append({
            "id":                payment.get("id"),
            "amount":            amount,
            "original_amount":   payment.get("original_amount", amount),
            "discount_amount":   payment.get("discount_amount", 0.0),
            "final_amount":      payment.get("final_amount", amount),
            "plan_type":         plan_type,
            "user_email":        payment.get("user_email"),
            "supporter_code":    payment.get("supporter_code"),
            "commission_amount": payment.get("commission_amount", 0.0),
            "commission_status": payment.get("commission_status"),
            "created_at":        created_at.isoformat(),
            "status":            payment.get("status"),
        })

    pending_commissions   = 0.0
    available_commissions = 0.0
    total_commissions_paid = 0.0
    total_with_code       = 0

    comm_docs = list(db.collection("supporter_commissions").stream())
    for d in comm_docs:
        c   = d.to_dict()
        amt = c.get("commission_amount", 0) or 0
        s   = c.get("commission_status", "")
        if s == "pending":   pending_commissions   += amt
        if s == "available": available_commissions += amt
        if s == "paid":      total_commissions_paid += amt
        if s != "canceled":  total_with_code += 1

    sales_with_code_pct = round(
        (total_with_code / total_orders * 100) if total_orders > 0 else 0.0, 1
    )

    return {
        "total_revenue":          total_revenue,
        "total_orders":           total_orders,
        "avg_ticket":             total_revenue / total_orders if total_orders > 0 else 0,
        "revenue_by_type":        dict(revenue_by_type),
        "orders_by_type":         dict(orders_by_type),
        "revenue_by_month":       dict(revenue_by_month),
        "pending_commissions":    round(pending_commissions, 2),
        "available_commissions":  round(available_commissions, 2),
        "total_commissions_paid": round(total_commissions_paid, 2),
        "sales_with_code_pct":    sales_with_code_pct,
        "estimated_profit":       round(
            total_revenue - total_commissions_paid - pending_commissions - available_commissions, 2
        ),
        "payments": filtered_payments[:100],
    }


@api_router.get("/admin/finance/export")
async def export_finance_data(
    user: dict = Depends(verify_admin),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    summary = await get_finance_summary(user, start_date, end_date)
    return {
        "summary": {
            "total_revenue":          summary["total_revenue"],
            "total_orders":           summary["total_orders"],
            "avg_ticket":             summary["avg_ticket"],
            "pending_commissions":    summary["pending_commissions"],
            "available_commissions":  summary["available_commissions"],
            "total_commissions_paid": summary["total_commissions_paid"],
            "estimated_profit":       summary["estimated_profit"],
        },
        "by_type":      [{"type": k, "revenue": v, "orders": summary["orders_by_type"].get(k, 0)} for k, v in summary["revenue_by_type"].items()],
        "by_month":     [{"month": k, "revenue": v} for k, v in sorted(summary["revenue_by_month"].items())],
        "transactions": summary["payments"],
    }


# ========== MEMORIALS ADMIN ENDPOINTS ==========

@api_router.put("/admin/memorials/{memorial_id}")
async def update_memorial_admin(memorial_id: str, updates: UpdateMemorialAdminRequest, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    memorial_ref = db.collection("memorials").document(memorial_id)
    if not memorial_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial não encontrado")
    updates_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    updates_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    memorial_ref.update(updates_dict)
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "update_memorial", "memorial", memorial_id, updates_dict)
    return {"message": "Memorial atualizado com sucesso"}


@api_router.put("/admin/memorials/{memorial_id}/toggle")
async def toggle_memorial(memorial_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    memorial_ref = db.collection("memorials").document(memorial_id)
    doc = memorial_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial não encontrado")
    new_active = not doc.to_dict().get("active", True)
    memorial_ref.update({"active": new_active, "updated_at": datetime.now(timezone.utc).isoformat()})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "toggle_memorial", "memorial", memorial_id, {"active": new_active})
    return {"message": f"Memorial {'ativado' if new_active else 'desativado'}", "active": new_active}


@api_router.put("/admin/memorials/{memorial_id}/feature")
async def feature_memorial(memorial_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    memorial_ref = db.collection("memorials").document(memorial_id)
    doc = memorial_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial não encontrado")
    new_featured = not doc.to_dict().get("featured", False)
    memorial_ref.update({"featured": new_featured, "updated_at": datetime.now(timezone.utc).isoformat()})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "feature_memorial", "memorial", memorial_id, {"featured": new_featured})
    return {"message": f"Memorial {'destacado' if new_featured else 'removido dos destaques'}", "featured": new_featured}


# [A-3.3] Regenerar QR Code de um memorial (quando URL muda, erro na geração, etc.)
@api_router.post("/admin/memorials/{memorial_id}/regenerate-qr")
async def regenerate_qr_code(
    memorial_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    memorial_ref = db.collection("memorials").document(memorial_id)
    doc = memorial_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial não encontrado")

    memorial_data = doc.to_dict()
    memorial_slug = memorial_data.get("slug") or memorial_id
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    memorial_url = f"{frontend_url}/memorial/{memorial_slug}"
    new_qr_code = generate_qr_code(memorial_url)

    memorial_ref.update({
        "qr_code_url": new_qr_code,
        "qr_regenerated_at": datetime.now(timezone.utc).isoformat(),
        "qr_regenerated_by": user.get("email"),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })

    background_tasks.add_task(
        create_admin_log, user.get("uid"), user.get("email"),
        "regenerate_qr", "memorial", memorial_id,
        {"memorial_url": memorial_url}
    )

    return {"message": "QR Code regenerado com sucesso", "memorial_url": memorial_url, "qr_code_url": new_qr_code}


# [A-3.4] Reenviar email de confirmação/status ao cliente
@api_router.post("/admin/orders/{order_id}/resend-email")
async def resend_confirmation_email(
    order_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    doc = db.collection("payments").document(order_id).get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")

    order_data = doc.to_dict()
    order_status = order_data.get("status", "")

    sendable_statuses = {"approved", "paid", "in_production", "produced", "shipped", "entregue", "cancelled"}
    if order_status not in sendable_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Não é possível reenviar email para pedidos com status '{order_status}'"
        )

    memorial_data = get_memorial_for_order(order_data)
    status_to_send = "paid" if order_status == "approved" else order_status
    tracking_code = order_data.get("tracking_code")
    delivery_type = order_data.get("delivery_type", "correios")

    background_tasks.add_task(
        send_order_status_email, order_data, memorial_data, status_to_send, tracking_code, delivery_type
    )
    background_tasks.add_task(
        create_admin_log, user.get("uid"), user.get("email"),
        "resend_email", "order", order_id,
        {"status": status_to_send, "customer_email": order_data.get("user_email")}
    )

    return {
        "message": f"Email reenviado com sucesso para {order_data.get('user_email')}",
        "status_template": status_to_send
    }


# ========== NOTIFICATIONS ENDPOINTS ==========

@api_router.get("/admin/notifications")
async def get_admin_notifications(user: dict = Depends(verify_admin)):
    # ✅ CORREÇÃO PROBLEMA 2: busca sem orderBy no Firestore para evitar índice composto.
    # Ordenação por prioridade + data feita em Python.
    docs = db.collection("admin_notifications").limit(100).stream()
    notifications = []
    for doc in docs:
        notif_data = doc.to_dict()
        notif_data = deserialize_datetime(notif_data, ["created_at"])
        # Garante que documentos antigos sem o campo priority recebam prioridade normal
        if "priority" not in notif_data:
            notif_data["priority"] = NOTIFICATION_PRIORITY.get(notif_data.get("type", ""), 3)
        notifications.append(notif_data)

    # Ordena: primeiro por prioridade ASC (1=crítico vem antes), depois por data DESC
    notifications.sort(
        key=lambda n: (
            n.get("priority", 3),
            -(n["created_at"].timestamp() if isinstance(n.get("created_at"), datetime)
              else 0)
        )
    )
    return notifications


@api_router.get("/admin/notifications/unread-count")
async def get_unread_count(user: dict = Depends(verify_admin)):
    docs = list(db.collection("admin_notifications").where(filter=firestore.FieldFilter("read", "==", False)).stream())
    return {"count": len(docs)}


@api_router.put("/admin/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user: dict = Depends(verify_admin)):
    notif_ref = db.collection("admin_notifications").document(notification_id)
    if not notif_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Notificação não encontrada")
    notif_ref.update({"read": True})
    return {"message": "Notificação marcada como lida"}


@api_router.put("/admin/notifications/read-all")
async def mark_all_notifications_read(user: dict = Depends(verify_admin)):
    docs = db.collection("admin_notifications").where(filter=firestore.FieldFilter("read", "==", False)).stream()
    for doc in docs:
        doc.reference.update({"read": True})
    return {"message": "Todas as notificações marcadas como lidas"}


# [A-6.6] Deletar notificação individual
@api_router.delete("/admin/notifications/{notification_id}")
async def delete_notification(notification_id: str, user: dict = Depends(verify_admin)):
    notif_ref = db.collection("admin_notifications").document(notification_id)
    if not notif_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Notificação não encontrada")
    notif_ref.delete()
    return {"message": "Notificação excluída"}


# [A-6.6] Limpar todas as notificações já lidas — evita crescimento indefinido da coleção
@api_router.delete("/admin/notifications/clear-read")
async def clear_read_notifications(user: dict = Depends(verify_admin)):
    docs = list(db.collection("admin_notifications").where(
        filter=firestore.FieldFilter("read", "==", True)
    ).stream())
    count = 0
    for doc in docs:
        doc.reference.delete()
        count += 1
    return {"message": f"{count} notificações lidas foram excluídas", "deleted_count": count}


# ========== ADMIN LOGS ENDPOINTS ==========

@api_router.get("/admin/logs")
async def get_admin_logs(user: dict = Depends(verify_admin), limit: int = 100, entity_type: Optional[str] = None):
    logs_ref = db.collection("admin_logs").order_by("created_at", direction=firestore.Query.DESCENDING)
    if entity_type:
        logs_ref = logs_ref.where(filter=firestore.FieldFilter("entity_type", "==", entity_type))
    docs = logs_ref.limit(limit).stream()
    logs = []
    for doc in docs:
        log_data = doc.to_dict()
        log_data = deserialize_datetime(log_data, ["created_at"])
        logs.append(log_data)
    return logs


# ========== REVIEWS ENDPOINTS ==========

@api_router.post("/reviews", response_model=Review)
async def create_review(review_req: CreateReviewRequest, token_data: dict = Depends(verify_firebase_token)):
    existing_reviews = list(db.collection("reviews").where(filter=firestore.FieldFilter("user_id", "==", token_data["uid"])).limit(1).stream())
    if existing_reviews:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Você já enviou uma avaliação. Obrigado pelo feedback!")
    user_doc = db.collection("users").document(token_data["uid"]).get()
    if not user_doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    user = user_doc.to_dict()
    review = Review(user_id=token_data["uid"], user_name=user.get("name", "Usuário"), user_email=user.get("email", ""), user_photo_url=user.get("photo_url"), rating=review_req.rating, title=review_req.title, comment=review_req.comment, approved=False)
    review_dict = review.model_dump()
    review_dict = serialize_datetime(review_dict)
    db.collection("reviews").document(review.id).set(review_dict)
    return review


@api_router.get("/reviews")
async def get_approved_reviews():
    try:
        reviews_ref = db.collection("reviews").where(filter=firestore.FieldFilter("approved", "==", True)).order_by("created_at", direction=firestore.Query.DESCENDING)
        docs = reviews_ref.stream()
    except Exception:
        reviews_ref = db.collection("reviews").where(filter=firestore.FieldFilter("approved", "==", True))
        docs = reviews_ref.stream()
    reviews = []
    for doc in docs:
        review_data = doc.to_dict()
        review_data.pop("user_email", None)
        review_data = deserialize_datetime(review_data, ["created_at"])
        reviews.append(review_data)
    reviews.sort(key=lambda r: r.get("created_at", datetime.min.replace(tzinfo=timezone.utc)), reverse=True)
    return reviews


@api_router.get("/reviews/my")
async def get_my_review(token_data: dict = Depends(verify_firebase_token)):
    docs = list(db.collection("reviews").where(filter=firestore.FieldFilter("user_id", "==", token_data["uid"])).limit(1).stream())
    if not docs:
        return None
    review_data = docs[0].to_dict()
    review_data = deserialize_datetime(review_data, ["created_at"])
    return review_data


@api_router.get("/admin/reviews")
async def get_all_reviews(user: dict = Depends(verify_admin)):
    docs = db.collection("reviews").order_by("created_at", direction=firestore.Query.DESCENDING).stream()
    reviews = []
    for doc in docs:
        review_data = doc.to_dict()
        review_data = deserialize_datetime(review_data, ["created_at"])
        reviews.append(review_data)
    return reviews


@api_router.put("/admin/reviews/{review_id}/approve")
async def approve_review(review_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    review_ref = db.collection("reviews").document(review_id)
    if not review_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Avaliação não encontrada")
    review_ref.update({"approved": True})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "approve_review", "review", review_id, {})
    return {"message": "Avaliação aprovada com sucesso"}


@api_router.put("/admin/reviews/{review_id}/reject")
async def reject_review(review_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    review_ref = db.collection("reviews").document(review_id)
    if not review_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Avaliação não encontrada")
    review_ref.update({"approved": False})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "reject_review", "review", review_id, {})
    return {"message": "Avaliação reprovada"}


@api_router.post("/admin/reviews/{review_id}/respond")
async def respond_to_review(review_id: str, response_data: RespondReviewRequest, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    review_ref = db.collection("reviews").document(review_id)
    if not review_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Avaliação não encontrada")
    review_ref.update({"admin_response": response_data.response, "response_date": datetime.now(timezone.utc).isoformat(), "responded_by": user.get("email")})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "respond_review", "review", review_id, {"response": response_data.response[:100]})
    return {"message": "Resposta adicionada com sucesso"}


@api_router.delete("/admin/reviews/{review_id}")
async def delete_review(review_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    review_ref = db.collection("reviews").document(review_id)
    if not review_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Avaliação não encontrada")
    review_ref.delete()
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "delete_review", "review", review_id, {})
    return {"message": "Avaliação excluída com sucesso"}


# ========== ROOT ENDPOINT ==========

@api_router.get("/")
async def root():
    return {"status": "ok", "message": "API Remember está rodando 🚀"}


app.include_router(api_router)


# ========== WEBSOCKET ==========

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Mensagem recebida via WebSocket: {data}")
            await websocket.send_text(f"Echo: {data}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        await websocket.close()
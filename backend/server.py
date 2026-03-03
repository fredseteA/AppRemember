from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, BackgroundTasks, Request, WebSocket
from fastapi import status as http_status  # ✅ FIX 1: import de status sem conflito
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List, Any
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


class ConfirmPaymentRequest(BaseModel):
    payment_id: str
    mp_payment_id: Optional[str] = None


class UpdateOrderStatusRequest(BaseModel):
    status: str


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


class CreatePartnerRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    commission_rate: float = 0.10


class UpdatePartnerRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    commission_rate: Optional[float] = None
    status: Optional[str] = None


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
    delivery_type: str = "correios"  # correios ou local


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
    if token_data is None or not token_data.get("admin", False):
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Admin access required. User does not have admin privileges."
        )
    return token_data


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
    notification = AdminNotification(
        type=type,
        title=title,
        message=message,
        entity_type=entity_type,
        entity_id=entity_id
    )
    notif_dict = notification.model_dump()
    notif_dict = serialize_datetime(notif_dict)
    db.collection("admin_notifications").document(notification.id).set(notif_dict)
    return notification


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
    """Envia e-mail de notificação para o ADMINISTRADOR quando um pagamento é aprovado."""
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
    """Envia email ao CLIENTE quando status do pedido muda."""
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


# ========== HELPER: buscar memorial do pedido ==========

def get_memorial_for_order(order_data: dict) -> dict:
    memorial_id = order_data.get("memorial_id")
    if memorial_id:
        mem_doc = db.collection("memorials").document(memorial_id).get()
        if mem_doc.exists:
            return mem_doc.to_dict()
    return {}


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
    doc = db.collection("memorials").document(memorial_id).get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial not found")
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
async def create_checkout(payment_req: CreatePaymentRequest, token_data: dict = Depends(verify_firebase_token)):
    logger.info("=" * 60)
    logger.info("=== INICIANDO CRIAÇÃO DE PREFERENCE (CHECKOUT PRO) ===")
    logger.info("=" * 60)

    memorial_doc = db.collection("memorials").document(payment_req.memorial_id).get()
    if not memorial_doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial not found")

    memorial = memorial_doc.to_dict()

    if not mp_access_token:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Mercado Pago não configurado")

    payment = Payment(
        memorial_id=payment_req.memorial_id,
        user_id=token_data["uid"],
        user_email=payment_req.payer_email,
        plan_type=payment_req.plan_type,
        amount=payment_req.transaction_amount,
        status="pending"
    )

    try:
        backend_url = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')

        preference_payload = {
            "items": [{"title": payment_req.description, "quantity": 1, "unit_price": float(payment_req.transaction_amount), "currency_id": "BRL"}],
            "payer": {"email": payment_req.payer_email},
            "back_urls": {
                "success": f"{frontend_url}/payment/success?payment_id={payment.id}",
                "failure": f"{frontend_url}/payment/failure?payment_id={payment.id}",
                "pending": f"{frontend_url}/payment/pending?payment_id={payment.id}"
            },
            "auto_return": "approved",
            "external_reference": payment.id,
            "statement_descriptor": "Remember QrCode",
            "notification_url": f"{backend_url}/api/webhooks/mercadopago"
        }

        result = mp_sdk.preference().create(preference_payload)

        if result["status"] == 201:
            mp_preference = result["response"]
            preference_id = mp_preference.get("id")
            init_point = mp_preference.get("init_point")
            if not init_point:
                raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Mercado Pago não retornou URL de checkout")
            payment.mercadopago_payment_id = preference_id
            payment_dict = payment.model_dump()
            payment_dict = serialize_datetime(payment_dict)
            db.collection("payments").document(payment.id).set(payment_dict)
            return {"success": True, "payment_id": payment.id, "preference_id": preference_id, "checkout_url": init_point, "message": "Checkout criado com sucesso"}

        elif result["status"] == 400:
            error_response = result.get("response", {})
            error_msg = error_response.get('message', 'Erro ao criar preference')
            causes = error_response.get('cause', [])
            if isinstance(causes, list) and causes:
                error_msg = causes[0].get('description', error_msg)
            raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail=f"Mercado Pago: {error_msg}")

        else:
            raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao criar checkout (status {result.get('status')})")

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"❌ EXCEÇÃO: {type(e).__name__} - {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno ao processar pagamento: {str(e)}")


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
async def confirm_payment(body: ConfirmPaymentRequest, background_tasks: BackgroundTasks):
    payment_ref = db.collection("payments").document(body.payment_id)
    payment_doc = payment_ref.get()
    if not payment_doc.exists:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")

    payment_data = payment_doc.to_dict()
    mp_status = "approved"

    if body.mp_payment_id:
        try:
            result = mp_sdk.payment().get(body.mp_payment_id)
            if result["status"] == 200:
                mp_status = result["response"].get("status", "approved")
        except Exception as e:
            logger.warning(f"Não foi possível verificar MP: {e}.")

    payment_ref.update({
        "status": mp_status,
        "mercadopago_payment_id": body.mp_payment_id or payment_data.get("mercadopago_payment_id"),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })

    if mp_status == "approved":
        memorial_id = payment_data["memorial_id"]
        plan_type = payment_data["plan_type"]
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        memorial_doc = db.collection("memorials").document(memorial_id).get().to_dict()
        memorial_slug = memorial_doc.get("slug") or memorial_id
        memorial_url = f"{frontend_url}/memorial/{memorial_slug}"
        qr_code_data = generate_qr_code(memorial_url)
        db.collection("memorials").document(memorial_id).update({
            "status": "published",
            "plan_type": plan_type,
            "qr_code_url": qr_code_data,
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        updated_payment = payment_ref.get().to_dict()
        memorial_data = db.collection("memorials").document(memorial_id).get().to_dict()
        if updated_payment and memorial_data:
            background_tasks.add_task(send_payment_notification_email, updated_payment, memorial_data)

    return {"status": mp_status, "memorial_published": mp_status == "approved"}

@api_router.post("/payments/{payment_id}/request-cancel")
async def request_cancel_payment(
    payment_id: str,
    background_tasks: BackgroundTasks,
    token_data: dict = Depends(verify_firebase_token)
):
    """Cliente solicita cancelamento do pedido (janela de 7 dias)"""
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

    # Verificar janela de 7 dias
    created_at = payment_data.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    now = datetime.now(timezone.utc)
    diff_days = (now - created_at).total_seconds() / 86400
    if diff_days > 7:
        raise HTTPException(status_code=400, detail="Prazo de cancelamento encerrado (7 dias)")

    # Marcar solicitação
    payment_ref.update({
        "cancel_requested": True,
        "cancel_requested_at": now.isoformat(),
        "updated_at": now.isoformat()
    })

    # Notificação para o admin
    memorial_id = payment_data.get("memorial_id")
    memorial_data = {}
    if memorial_id:
        mem_doc = db.collection("memorials").document(memorial_id).get()
        if mem_doc.exists:
            memorial_data = mem_doc.to_dict()

    person_name = memorial_data.get("person_data", {}).get("full_name", "N/A")

    background_tasks.add_task(
        create_admin_notification,
        "cancellation_request",
        "Solicitacao de Cancelamento",
        f"Cliente {payment_data.get('user_email')} solicitou cancelamento do pedido #{payment_id[:8]} — {person_name}",
        "order",
        payment_id
    )

    # Guardar detalhes na notificação
    notif = AdminNotification(
        type="cancellation_request",
        title="Solicitacao de Cancelamento",
        message=f"Cliente {payment_data.get('user_email')} solicitou cancelamento do pedido #{payment_id[:8]} — {person_name}",
        entity_type="order",
        entity_id=payment_id
    )
    notif_dict = notif.model_dump()
    notif_dict["details"] = {
        "user_email": payment_data.get("user_email"),
        "plan_type": payment_data.get("plan_type"),
        "amount": payment_data.get("amount"),
        "person_name": person_name
    }
    notif_dict = serialize_datetime(notif_dict)
    db.collection("admin_notifications").document(notif.id).set(notif_dict)

    # Email ao cliente confirmando recebimento
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
                                payment_ref.update({"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()})
                                if new_status == "approved":
                                    memorial_id = payment_data["memorial_id"]
                                    plan_type = payment_data["plan_type"]
                                    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
                                    memorial_doc = db.collection("memorials").document(memorial_id).get().to_dict()
                                    memorial_slug = memorial_doc.get("slug") or memorial_id
                                    memorial_url = f"{frontend_url}/memorial/{memorial_slug}"
                                    qr_code_data = generate_qr_code(memorial_url)
                                    db.collection("memorials").document(memorial_id).update({
                                        "status": "published",
                                        "plan_type": plan_type,
                                        "qr_code_url": qr_code_data,
                                        "updated_at": datetime.now(timezone.utc).isoformat()
                                    })
                                    updated_payment = payment_ref.get().to_dict()
                                    memorial_data = db.collection("memorials").document(memorial_id).get().to_dict()
                                    if updated_payment and memorial_data:
                                        background_tasks.add_task(send_payment_notification_email, updated_payment, memorial_data)
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
    total_partners = len(list(partners_docs))

    total_revenue = 0.0
    monthly_revenue = 0.0
    total_orders = 0
    monthly_orders = 0
    total_plaques = 0
    monthly_plaques = 0
    sales_by_month = defaultdict(lambda: {"revenue": 0.0, "orders": 0})
    sales_by_type = {"digital": 0, "plaque": 0, "complete": 0}
    revenue_by_type = {"digital": 0.0, "plaque": 0.0, "complete": 0.0}

    for payment in payments:
        if payment.get("status", "") not in ["approved", "paid"]:
            continue
        amount = payment.get("amount", 0)
        plan_type = payment.get("plan_type", "digital")
        created_at = payment.get("created_at")
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            except:
                created_at = now
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
        {"name": "Digital", "value": sales_by_type["digital"], "revenue": revenue_by_type["digital"]},
        {"name": "Placa QR", "value": sales_by_type["plaque"], "revenue": revenue_by_type["plaque"]},
        {"name": "Completo", "value": sales_by_type["complete"], "revenue": revenue_by_type["complete"]}
    ]

    return {
        "total_revenue": total_revenue, "monthly_revenue": monthly_revenue,
        "avg_ticket": avg_ticket, "monthly_avg_ticket": monthly_avg_ticket,
        "total_orders": total_orders, "monthly_orders": monthly_orders,
        "total_memorials": total_memorials, "total_plaques": total_plaques,
        "monthly_plaques": monthly_plaques, "total_partners": total_partners,
        "pending_commissions": pending_commissions,
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
async def get_all_orders(user: dict = Depends(verify_admin), status: Optional[str] = None, archived: bool = False):
    payments_ref = db.collection("payments")
    if not archived:
        try:
            payments_ref = payments_ref.where(filter=firestore.FieldFilter("archived", "!=", True))
        except:
            pass
    docs = payments_ref.order_by("created_at", direction=firestore.Query.DESCENDING).stream()
    orders = []
    for doc in docs:
        order_data = doc.to_dict()
        if status and order_data.get("status") != status:
            continue
        if not archived and order_data.get("archived", False):
            continue
        order_data = deserialize_datetime(order_data, ["created_at", "updated_at"])
        orders.append(order_data)
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
    status_history.append({"from_status": old_status, "to_status": new_status, "changed_by": user.get("email"), "changed_at": datetime.now(timezone.utc).isoformat()})

    order_ref.update({"status": new_status, "status_history": status_history, "updated_at": datetime.now(timezone.utc).isoformat()})

    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "update_status", "order", order_id, {"old_status": old_status, "new_status": new_status})

    return {"message": "Status atualizado com sucesso", "new_status": new_status}


@api_router.put("/admin/orders/{order_id}/archive")
async def archive_order(order_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    order_ref = db.collection("payments").document(order_id)
    if not order_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_ref.update({"archived": True, "archived_at": datetime.now(timezone.utc).isoformat(), "archived_by": user.get("email"), "updated_at": datetime.now(timezone.utc).isoformat()})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "archive_order", "order", order_id, {})
    return {"message": "Pedido arquivado com sucesso"}


@api_router.put("/admin/orders/{order_id}/unarchive")
async def unarchive_order(order_id: str, user: dict = Depends(verify_admin)):
    order_ref = db.collection("payments").document(order_id)
    if not order_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_ref.update({"archived": False, "updated_at": datetime.now(timezone.utc).isoformat()})
    return {"message": "Pedido desarquivado com sucesso"}


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
        "shipped_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })

    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "add_tracking", "order", order_id, {"tracking_code": tracking_data.tracking_code, "delivery_type": tracking_data.delivery_type})

    # Email ao cliente
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


@api_router.put("/admin/orders/{order_id}/cancel")
async def cancel_order(order_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")

    order_data = doc.to_dict()
    old_status = order_data.get("status")
    status_history = order_data.get("status_history", [])
    status_history.append({"from_status": old_status, "to_status": "cancelled", "changed_by": user.get("email"), "changed_at": datetime.now(timezone.utc).isoformat()})

    order_ref.update({
        "status": "cancelled",
        "status_history": status_history,
        "cancelled_at": datetime.now(timezone.utc).isoformat(),
        "cancelled_by": user.get("email"),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })

    # Deletar memorial associado
    memorial_id = order_data.get("memorial_id")
    if memorial_id:
        try:
            db.collection("memorials").document(memorial_id).delete()
            logger.info(f"Memorial {memorial_id} deletado apos cancelamento do pedido {order_id}")
        except Exception as e:
            logger.error(f"Erro ao deletar memorial {memorial_id}: {str(e)}")

    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "cancel_order", "order", order_id, {"old_status": old_status})

    # Email ao cliente
    memorial_data = get_memorial_for_order(order_data)
    background_tasks.add_task(send_order_status_email, order_data, memorial_data, "cancelled")

    return {"message": "Pedido cancelado com sucesso"}


# ========== PRODUCTION QUEUE ==========

@api_router.get("/admin/production-queue")
async def get_production_queue(user: dict = Depends(verify_admin)):
    payments_ref = db.collection("payments")
    docs = payments_ref.stream()
    queue = []
    for doc in docs:
        order_data = doc.to_dict()
        plan_type = order_data.get("plan_type", "")
        if plan_type not in ["plaque", "complete", "qrcode_plaque"]:
            continue
        status = order_data.get("status", "")
        if status not in ["approved", "paid", "in_production", "produced", "shipped", "entregue", "cancelled"]:
            continue
        if order_data.get("archived", False):
            continue
        order_data = deserialize_datetime(order_data, ["created_at", "updated_at"])
        memorial_id = order_data.get("memorial_id")
        if memorial_id:
            memorial_doc = db.collection("memorials").document(memorial_id).get()
            if memorial_doc.exists:
                memorial_data = memorial_doc.to_dict()
                order_data["person_name"] = memorial_data.get("person_data", {}).get("full_name", "N/A")
                order_data["memorial_slug"] = memorial_data.get("slug")
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

    # Email ao cliente
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

    # Email ao cliente
    memorial_data = get_memorial_for_order(order_data)
    background_tasks.add_task(send_order_status_email, order_data, memorial_data, "produced")

    return {"message": "Produção concluída"}


@api_router.delete("/admin/orders/{order_id}")
async def delete_order(order_id: str, user: dict = Depends(verify_admin)):
    order_ref = db.collection("payments").document(order_id)
    if not order_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    order_ref.delete()
    return {"message": "Pedido excluído com sucesso"}


# ========== PARTNERS ENDPOINTS ==========

@api_router.get("/admin/partners")
async def get_all_partners(user: dict = Depends(verify_admin)):
    partners_ref = db.collection("partners").order_by("created_at", direction=firestore.Query.DESCENDING)
    docs = partners_ref.stream()
    partners = []
    for doc in docs:
        partner_data = doc.to_dict()
        partner_data = deserialize_datetime(partner_data, ["created_at", "updated_at"])
        partners.append(partner_data)
    return partners


@api_router.post("/admin/partners")
async def create_partner(partner_req: CreatePartnerRequest, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    code = generate_partner_code(partner_req.name)
    existing = list(db.collection("partners").where(filter=firestore.FieldFilter("code", "==", code)).limit(1).stream())
    if existing:
        code = generate_partner_code(partner_req.name + str(uuid.uuid4())[:4])
    partner = Partner(name=partner_req.name, code=code, email=partner_req.email, phone=partner_req.phone, commission_rate=partner_req.commission_rate)
    partner_dict = partner.model_dump()
    partner_dict = serialize_datetime(partner_dict)
    db.collection("partners").document(partner.id).set(partner_dict)
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "create_partner", "partner", partner.id, {"name": partner.name, "code": code})
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
async def update_partner(partner_id: str, updates: UpdatePartnerRequest, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    partner_ref = db.collection("partners").document(partner_id)
    if not partner_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Parceiro não encontrado")
    updates_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    updates_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    partner_ref.update(updates_dict)
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "update_partner", "partner", partner_id, updates_dict)
    return {"message": "Parceiro atualizado com sucesso"}


@api_router.get("/admin/partners/{partner_id}/sales")
async def get_partner_sales(partner_id: str, user: dict = Depends(verify_admin)):
    doc = db.collection("partners").document(partner_id).get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Parceiro não encontrado")
    partner_data = doc.to_dict()
    partner_code = partner_data.get("code")
    payments_docs = list(db.collection("payments").where(filter=firestore.FieldFilter("partner_code", "==", partner_code)).stream())
    now = datetime.now(timezone.utc)
    sales = []
    monthly_total = 0.0
    monthly_count = 0
    for doc in payments_docs:
        payment = doc.to_dict()
        if payment.get("status") not in ["approved", "paid"]:
            continue
        payment = deserialize_datetime(payment, ["created_at", "updated_at"])
        sales.append(payment)
        created_at = payment.get("created_at")
        if isinstance(created_at, datetime):
            if created_at.month == now.month and created_at.year == now.year:
                monthly_total += payment.get("amount", 0)
                monthly_count += 1
    commission_rate = partner_data.get("commission_rate", 0.10)
    if monthly_count > 10:
        commission_rate = 0.15
    return {"sales": sales, "monthly_count": monthly_count, "monthly_total": monthly_total, "commission_rate": commission_rate, "monthly_commission": monthly_total * commission_rate}


@api_router.post("/admin/partners/{partner_id}/pay-commission")
async def pay_partner_commission(partner_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    doc = db.collection("partners").document(partner_id).get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Parceiro não encontrado")
    partner_data = doc.to_dict()
    now = datetime.now(timezone.utc)
    sales_data = await get_partner_sales(partner_id, user)
    if sales_data["monthly_commission"] <= 0:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Sem comissão pendente para este período")
    commission = CommissionPayment(partner_id=partner_id, partner_name=partner_data.get("name"), amount=sales_data["monthly_commission"], period_month=now.month, period_year=now.year, sales_count=sales_data["monthly_count"], status="paid", paid_at=now)
    comm_dict = commission.model_dump()
    comm_dict = serialize_datetime(comm_dict)
    db.collection("commission_payments").document(commission.id).set(comm_dict)
    db.collection("partners").document(partner_id).update({"total_sales_month": 0, "total_revenue_month": 0.0, "updated_at": datetime.now(timezone.utc).isoformat()})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "pay_commission", "partner", partner_id, {"amount": sales_data["monthly_commission"], "period": f"{now.month}/{now.year}"})
    return {"message": "Comissão paga com sucesso", "amount": sales_data["monthly_commission"]}


@api_router.get("/admin/commissions")
async def get_all_commissions(user: dict = Depends(verify_admin)):
    comms_ref = db.collection("commission_payments").order_by("created_at", direction=firestore.Query.DESCENDING)
    docs = comms_ref.stream()
    commissions = []
    for doc in docs:
        comm_data = doc.to_dict()
        comm_data = deserialize_datetime(comm_data, ["created_at", "paid_at"])
        commissions.append(comm_data)
    return commissions


# ========== FINANCIAL ENDPOINTS ==========

@api_router.get("/admin/finance/summary")
async def get_finance_summary(
    user: dict = Depends(verify_admin),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    from collections import defaultdict

    payments_docs = list(db.collection("payments").stream())

    start = None
    end = None
    if start_date:
        try:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if start.tzinfo is None:
                start = start.replace(tzinfo=timezone.utc)
        except:
            pass
    if end_date:
        try:
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            if end.tzinfo is None:
                end = end.replace(tzinfo=timezone.utc)
        except:
            pass

    total_revenue = 0.0
    total_orders = 0
    revenue_by_type = defaultdict(float)
    orders_by_type = defaultdict(int)
    revenue_by_month = defaultdict(float)
    filtered_payments = []

    for doc in payments_docs:
        payment = doc.to_dict()
        if payment.get("status") not in ["approved", "paid"]:
            continue
        created_at = payment.get("created_at")
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                if created_at.tzinfo is None:
                    created_at = created_at.replace(tzinfo=timezone.utc)
            except:
                continue
        if start and created_at < start:
            continue
        if end and created_at > end:
            continue
        amount = payment.get("amount", 0)
        plan_type = payment.get("plan_type", "digital")
        total_revenue += amount
        total_orders += 1
        revenue_by_type[plan_type] += amount
        orders_by_type[plan_type] += 1
        month_key = f"{created_at.year}-{created_at.month:02d}"
        revenue_by_month[month_key] += amount
        filtered_payments.append({"id": payment.get("id"), "amount": amount, "plan_type": plan_type, "user_email": payment.get("user_email"), "created_at": created_at.isoformat(), "status": payment.get("status")})

    pending_commissions = 0.0
    for doc in list(db.collection("commission_payments").where(filter=firestore.FieldFilter("status", "==", "pending")).stream()):
        pending_commissions += doc.to_dict().get("amount", 0)

    total_commissions_paid = 0.0
    for doc in list(db.collection("commission_payments").where(filter=firestore.FieldFilter("status", "==", "paid")).stream()):
        total_commissions_paid += doc.to_dict().get("amount", 0)

    return {
        "total_revenue": total_revenue, "total_orders": total_orders,
        "avg_ticket": total_revenue / total_orders if total_orders > 0 else 0,
        "revenue_by_type": dict(revenue_by_type), "orders_by_type": dict(orders_by_type),
        "revenue_by_month": dict(revenue_by_month), "pending_commissions": pending_commissions,
        "total_commissions_paid": total_commissions_paid,
        "estimated_profit": total_revenue - total_commissions_paid - pending_commissions,
        "payments": filtered_payments[:100]
    }


@api_router.get("/admin/finance/export")
async def export_finance_data(user: dict = Depends(verify_admin), start_date: Optional[str] = None, end_date: Optional[str] = None):
    summary = await get_finance_summary(user, start_date, end_date)
    return {
        "summary": {"total_revenue": summary["total_revenue"], "total_orders": summary["total_orders"], "avg_ticket": summary["avg_ticket"], "pending_commissions": summary["pending_commissions"], "estimated_profit": summary["estimated_profit"]},
        "by_type": [{"type": k, "revenue": v, "orders": summary["orders_by_type"].get(k, 0)} for k, v in summary["revenue_by_type"].items()],
        "by_month": [{"month": k, "revenue": v} for k, v in sorted(summary["revenue_by_month"].items())],
        "transactions": summary["payments"]
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


# ========== NOTIFICATIONS ENDPOINTS ==========

@api_router.get("/admin/notifications")
async def get_admin_notifications(user: dict = Depends(verify_admin)):
    docs = db.collection("admin_notifications").order_by("created_at", direction=firestore.Query.DESCENDING).limit(50).stream()
    notifications = []
    for doc in docs:
        notif_data = doc.to_dict()
        notif_data = deserialize_datetime(notif_data, ["created_at"])
        notifications.append(notif_data)
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
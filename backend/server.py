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

# ✅ CORS robusto: lê origens do .env ou libera tudo em desenvolvimento
_raw_origins = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

# Se não configurou origens explícitas, usa allow_origins=["*"] (desenvolvimento)
# Em produção, defina ALLOWED_ORIGINS no .env com as URLs reais
if ALLOWED_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
else:
    # Modo desenvolvimento: aceita qualquer origem
    # ATENÇÃO: não use allow_credentials=True com allow_origins=["*"]
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


# ✅ Handler global para OPTIONS — garante que preflight nunca retorne 400
@app.options("/{rest_of_path:path}")
async def preflight_handler(request: Request, rest_of_path: str):
    from fastapi.responses import Response
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
            "Access-Control-Max-Age": "600",
        }
    )

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


# ✅ FIX 3: Modelo Pydantic para update de memorial (substitui dict puro)
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


# ✅ FIX 4: Modelo Pydantic para update de status de pedido (substitui dict puro)
class UpdateOrderStatusRequest(BaseModel):
    status: str


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
    # ✅ Libera preflight CORS
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
    """Verifica se o usuário tem custom claim admin=true no Firebase"""
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
    """Converte nome para slug URL-friendly. Ex: 'Maria da Silva' → 'maria-da-silva'"""
    # Normaliza unicode (remove acentos)
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    # Minúsculas
    text = text.lower()
    # Remove tudo que não é letra, número ou espaço
    text = re.sub(r'[^\w\s-]', '', text)
    # Substitui espaços e underscores por hífen
    text = re.sub(r'[-\s]+', '-', text).strip('-')
    return text


def generate_unique_slug(full_name: str) -> str:
    """Gera slug único checando colisão no Firestore"""
    base_slug = slugify(full_name)
    slug = base_slug
    counter = 2

    while True:
        # Verifica se já existe memorial com esse slug
        existing = db.collection("memorials").where(
            filter=firestore.FieldFilter("slug", "==", slug)
        ).limit(1).stream()

        if not list(existing):
            return slug  # Slug disponível

        # Colisão: tenta maria-da-silva-2, maria-da-silva-3...
        slug = f"{base_slug}-{counter}"
        counter += 1

def serialize_datetime(data: Any) -> Any:
    """
    ✅ FIX 8: Converte campos datetime para string ISO format recursivamente,
    suportando dicts, listas e valores primitivos.
    """
    if isinstance(data, datetime):
        return data.isoformat()
    elif isinstance(data, dict):
        return {key: serialize_datetime(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [serialize_datetime(item) for item in data]
    return data


def deserialize_datetime(data: dict, datetime_fields: List[str]) -> dict:
    """Converte campos string ISO format para datetime"""
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


# ========== EMAIL NOTIFICATION ==========

async def send_payment_notification_email(payment_data: dict, memorial_data: dict):
    """
    Envia e-mail de notificação para o administrador quando um pagamento é aprovado.
    """
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
        <head>
            <meta charset="UTF-8">
        </head>
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
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return doc.to_dict()


@api_router.put("/auth/me")
async def update_current_user(
    update_data: UpdateUserRequest,
    token_data: dict = Depends(verify_firebase_token)
):
    user_ref = db.collection("users").document(token_data["uid"])
    doc = user_ref.get()

    if not doc.exists:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    update_dict = {
        k: v for k, v in update_data.model_dump().items()
        if v is not None
    }

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
    """
    ✅ FIX 2: Firestore não suporta where em campos aninhados com dot notation
    combinado com outro where sem índice composto.
    Solução: filtrar status=published no Firestore e filtrar public_memorial em Python,
    ou criar o índice composto no console do Firebase para
    (person_data.public_memorial ASC, status ASC).
    
    IMPORTANTE: Para usar a query composta no Firestore você PRECISA criar o índice:
    Collection: memorials
    Fields: status (Ascending) + person_data.public_memorial (Ascending)
    
    Por ora, filtramos apenas por status e validamos public_memorial em Python:
    """
    memorials_ref = db.collection("memorials").where(
        filter=firestore.FieldFilter("status", "==", "published")
    )
    docs = memorials_ref.stream()

    memorials = []
    for doc in docs:
        memorial_data = doc.to_dict()
        # Filtro local para public_memorial (campo aninhado)
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
    updates: UpdateMemorialRequest,  # ✅ FIX 3: Modelo Pydantic ao invés de dict
    token_data: dict = Depends(verify_firebase_token)
):
    memorial_ref = db.collection("memorials").document(memorial_id)
    doc = memorial_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial not found")

    memorial_data = doc.to_dict()

    if memorial_data["user_id"] != token_data["uid"]:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # Serializar apenas os campos que foram enviados (não-None)
    updates_dict = {
        k: v for k, v in updates.model_dump().items()
        if v is not None
    }
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
    logger.info(f"Memorial ID: {payment_req.memorial_id}")
    logger.info(f"Plan Type: {payment_req.plan_type}")
    logger.info(f"Amount: {payment_req.transaction_amount}")
    logger.info(f"User Email: {payment_req.payer_email}")

    memorial_doc = db.collection("memorials").document(payment_req.memorial_id).get()
    if not memorial_doc.exists:
        logger.error(f"❌ Memorial não encontrado: {payment_req.memorial_id}")
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial not found")

    memorial = memorial_doc.to_dict()
    logger.info(f"✅ Memorial encontrado: {memorial.get('person_data', {}).get('full_name')}")

    if not mp_access_token:
        logger.error("❌ MERCADOPAGO_ACCESS_TOKEN não configurado!")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Mercado Pago não configurado"
        )

    logger.info(f"Token tipo: {'TESTE' if mp_access_token.startswith('TEST-') else 'PRODUÇÃO'}")

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
        # ✅ FIX 6: usar FRONTEND_URL separada da backend URL
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')

        logger.info(f"Backend URL: {backend_url}")
        logger.info(f"Frontend URL: {frontend_url}")

        preference_payload = {
            "items": [
                {
                    "title": payment_req.description,
                    "quantity": 1,
                    "unit_price": float(payment_req.transaction_amount),
                    "currency_id": "BRL"
                }
            ],
            "payer": {
                "email": payment_req.payer_email
            },
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

        logger.info("PAYLOAD ENVIADO PARA MERCADO PAGO:")
        logger.info(json.dumps(preference_payload, indent=2, ensure_ascii=False))

        result = mp_sdk.preference().create(preference_payload)

        logger.info(f"Status Code: {result.get('status')}")

        if result["status"] == 201:
            mp_preference = result["response"]
            preference_id = mp_preference.get("id")
            init_point = mp_preference.get("init_point")

            if not init_point:
                logger.error("❌ init_point não retornado pela API do Mercado Pago!")
                raise HTTPException(
                    status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Mercado Pago não retornou URL de checkout"
                )

            logger.info(f"✅ Preference criada | ID: {preference_id} | URL: {init_point}")

            payment.mercadopago_payment_id = preference_id
            payment_dict = payment.model_dump()
            payment_dict = serialize_datetime(payment_dict)
            db.collection("payments").document(payment.id).set(payment_dict)

            return {
                "success": True,
                "payment_id": payment.id,
                "preference_id": preference_id,
                "checkout_url": init_point,
                "message": "Checkout criado com sucesso"
            }

        elif result["status"] == 400:
            error_response = result.get("response", {})
            logger.error(f"❌ ERRO 400 - BAD REQUEST: {json.dumps(error_response, indent=2, ensure_ascii=False)}")

            error_msg = error_response.get('message', 'Erro ao criar preference')
            causes = error_response.get('cause', [])
            if isinstance(causes, list) and causes:
                error_msg = causes[0].get('description', error_msg)

            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=f"Mercado Pago: {error_msg}"
            )

        else:
            logger.error(f"❌ Erro inesperado - Status: {result.get('status')}")
            raise HTTPException(
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao criar checkout (status {result.get('status')})"
            )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"❌ EXCEÇÃO: {type(e).__name__} - {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao processar pagamento: {str(e)}"
        )


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
    background_tasks: BackgroundTasks
):
    payment_ref = db.collection("payments").document(body.payment_id)
    payment_doc = payment_ref.get()

    if not payment_doc.exists:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")

    payment_data = payment_doc.to_dict()

    # Tenta verificar status real no MP se tiver o ID deles
    mp_status = "approved"
    if body.mp_payment_id:
        try:
            result = mp_sdk.payment().get(body.mp_payment_id)
            if result["status"] == 200:
                mp_status = result["response"].get("status", "approved")
                logger.info(f"Status MP verificado: {mp_status}")
        except Exception as e:
            logger.warning(f"Não foi possível verificar MP: {e}. Usando status da URL.")

    # Atualiza o pagamento
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
        memorial_slug = memorial_doc.get("slug") or memorial_id  # fallback para UUID se não tiver slug
        memorial_url = f"{frontend_url}/memorial/{memorial_slug}"
        qr_code_data = generate_qr_code(memorial_url)

        db.collection("memorials").document(memorial_id).update({
            "status": "published",
            "plan_type": plan_type,
            "qr_code_url": qr_code_data,
            "updated_at": datetime.now(timezone.utc).isoformat()
        })

        logger.info(f"✅ Memorial {memorial_id} publicado via confirm | Plano: {plan_type}")

        updated_payment = payment_ref.get().to_dict()
        memorial_data = db.collection("memorials").document(memorial_id).get().to_dict()
        if updated_payment and memorial_data:
            background_tasks.add_task(
                send_payment_notification_email,
                updated_payment,
                memorial_data
            )

    return {
        "status": mp_status,
        "memorial_published": mp_status == "approved"
    }

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

                                payment_ref.update({
                                    "status": new_status,
                                    "updated_at": datetime.now(timezone.utc).isoformat()
                                })

                                if new_status == "approved":
                                    memorial_id = payment_data["memorial_id"]
                                    plan_type = payment_data["plan_type"]

                                    # ✅ FIX 6: usar FRONTEND_URL para a URL do memorial
                                    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
                                    memorial_doc = db.collection("memorials").document(memorial_id).get().to_dict()
                                    memorial_slug = memorial_doc.get("slug") or memorial_id  # fallback para UUID se não tiver slug
                                    memorial_url = f"{frontend_url}/memorial/{memorial_slug}"
                                    qr_code_data = generate_qr_code(memorial_url)

                                    db.collection("memorials").document(memorial_id).update({
                                        "status": "published",
                                        "plan_type": plan_type,
                                        "qr_code_url": qr_code_data,
                                        "updated_at": datetime.now(timezone.utc).isoformat()
                                    })

                                    logger.info(f"Memorial {memorial_id} publicado com plano {plan_type}")

                                    updated_payment = payment_ref.get().to_dict()
                                    memorial_data = db.collection("memorials").document(memorial_id).get().to_dict()

                                    if updated_payment and memorial_data:
                                        background_tasks.add_task(
                                            send_payment_notification_email,
                                            updated_payment,
                                            memorial_data
                                        )
                                        logger.info("📧 E-mail de notificação agendado")
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
    total_memorials = len(memorials_docs)

    payments_docs = list(db.collection("payments").stream())
    total_orders = len(payments_docs)

    total_plaques = sum(
        1 for doc in payments_docs
        if doc.to_dict().get("plan_type") in ["plaque", "complete"]
    )

    return {
        "total_memorials": total_memorials,
        "total_orders": total_orders,
        "total_plaques": total_plaques
    }


@api_router.post("/admin/test-email")
async def test_email_notification(user: dict = Depends(verify_admin)):
    try:
        test_payment = {
            "id": "test-payment-123",
            "user_email": "teste@exemplo.com",
            "plan_type": "plaque",
            "amount": 119.90,
            "status": "approved",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        test_memorial = {
            "id": "test-memorial-456",
            "person_data": {"full_name": "Maria da Silva (TESTE)"},
            "responsible": {
                "name": "João da Silva (TESTE)",
                "email": "joao@teste.com",
                "phone": "(22) 99999-9999"
            }
        }

        result = await send_payment_notification_email(test_payment, test_memorial)

        if result:
            return {"status": "success", "message": f"E-mail de teste enviado para {ADMIN_EMAIL}"}
        else:
            raise HTTPException(
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Falha ao enviar e-mail de teste"
            )
    except Exception as e:
        logger.error(f"Erro no teste de e-mail: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao enviar e-mail: {str(e)}"
        )


@api_router.get("/admin/orders")
async def get_all_orders(user: dict = Depends(verify_admin)):
    payments_ref = db.collection("payments").order_by("created_at", direction=firestore.Query.DESCENDING)
    docs = payments_ref.stream()

    orders = []
    for doc in docs:
        order_data = doc.to_dict()
        order_data = deserialize_datetime(order_data, ["created_at", "updated_at"])
        orders.append(order_data)

    return orders


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
    status_update: UpdateOrderStatusRequest,  # ✅ FIX 4: Modelo Pydantic ao invés de dict
    user: dict = Depends(verify_admin)
):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")

    order_ref.update({
        "status": status_update.status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    })

    return {"message": "Order status updated"}


@api_router.delete("/admin/orders/{order_id}")
async def delete_order(order_id: str, user: dict = Depends(verify_admin)):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")

    order_ref.delete()
    logger.info(f"Pedido {order_id} excluído pelo admin {user.get('email')}")

    return {"message": "Pedido excluído com sucesso"}


# ========== REVIEWS ENDPOINTS ==========

@api_router.post("/reviews", response_model=Review)
async def create_review(review_req: CreateReviewRequest, token_data: dict = Depends(verify_firebase_token)):
    reviews_ref = db.collection("reviews").where(
        filter=firestore.FieldFilter("user_id", "==", token_data["uid"])
    ).limit(1)
    existing_reviews = list(reviews_ref.stream())

    if existing_reviews:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Você já enviou uma avaliação. Obrigado pelo feedback!"
        )

    user_ref = db.collection("users").document(token_data["uid"])
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")

    user = user_doc.to_dict()

    review = Review(
        user_id=token_data["uid"],
        user_name=user.get("name", "Usuário"),
        user_email=user.get("email", ""),
        user_photo_url=user.get("photo_url"),
        rating=review_req.rating,
        title=review_req.title,
        comment=review_req.comment,
        approved=False
    )

    review_dict = review.model_dump()
    review_dict = serialize_datetime(review_dict)

    db.collection("reviews").document(review.id).set(review_dict)
    logger.info(f"Nova avaliação criada por {user.get('email')}")

    return review


@api_router.get("/reviews")
async def get_approved_reviews():
    """
    ✅ FIX 7: Query composta where("approved") + order_by("created_at") exige
    índice composto no Firestore. Crie o índice no console Firebase:
    Collection: reviews | Fields: approved (Ascending) + created_at (Descending)
    
    Alternativa sem índice: filtrar por approved e ordenar em Python.
    """
    try:
        reviews_ref = db.collection("reviews") \
            .where(filter=firestore.FieldFilter("approved", "==", True)) \
            .order_by("created_at", direction=firestore.Query.DESCENDING)
        docs = reviews_ref.stream()
    except Exception:
        reviews_ref = db.collection("reviews").where(
            filter=firestore.FieldFilter("approved", "==", True)
        )
        docs = reviews_ref.stream()

    reviews = []
    for doc in docs:
        review_data = doc.to_dict()
        review_data.pop("user_email", None)
        review_data = deserialize_datetime(review_data, ["created_at"])
        reviews.append(review_data)

    # Garante ordenação mesmo no fallback
    reviews.sort(key=lambda r: r.get("created_at", datetime.min.replace(tzinfo=timezone.utc)), reverse=True)

    return reviews


@api_router.get("/reviews/my")
async def get_my_review(token_data: dict = Depends(verify_firebase_token)):
    reviews_ref = db.collection("reviews").where(
        filter=firestore.FieldFilter("user_id", "==", token_data["uid"])
    ).limit(1)
    docs = list(reviews_ref.stream())

    if not docs:
        return None

    review_data = docs[0].to_dict()
    review_data = deserialize_datetime(review_data, ["created_at"])

    return review_data


@api_router.get("/admin/reviews")
async def get_all_reviews(user: dict = Depends(verify_admin)):
    reviews_ref = db.collection("reviews").order_by("created_at", direction=firestore.Query.DESCENDING)
    docs = reviews_ref.stream()

    reviews = []
    for doc in docs:
        review_data = doc.to_dict()
        review_data = deserialize_datetime(review_data, ["created_at"])
        reviews.append(review_data)

    return reviews


@api_router.put("/admin/reviews/{review_id}/approve")
async def approve_review(review_id: str, user: dict = Depends(verify_admin)):
    review_ref = db.collection("reviews").document(review_id)
    doc = review_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Avaliação não encontrada")

    review_ref.update({"approved": True})

    return {"message": "Avaliação aprovada com sucesso"}


@api_router.delete("/admin/reviews/{review_id}")
async def delete_review(review_id: str, user: dict = Depends(verify_admin)):
    review_ref = db.collection("reviews").document(review_id)
    doc = review_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Avaliação não encontrada")

    review_ref.delete()

    return {"message": "Avaliação excluída com sucesso"}


# ========== ROOT ENDPOINT ==========

@api_router.get("/")
async def root():
    return {
        "status": "ok",
        "message": "API Remember está rodando 🚀"
    }


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
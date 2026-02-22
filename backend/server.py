from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, BackgroundTasks, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import uuid
import qrcode
import io
import base64
import mercadopago
import hmac
import hashlib
import json
import asyncio
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ========== FIREBASE FIRESTORE SETUP ==========
import firebase_admin
from firebase_admin import credentials, firestore

FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS_PATH")

if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS)
    firebase_admin.initialize_app(cred)

# Cliente Firestore síncrono
db = firestore.client()

app = FastAPI(title="Remember QrCode API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CreateMemorialRequest(BaseModel):
    person_data: PersonData
    content: MemorialContent
    responsible: ResponsibleData


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

async def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        import requests

        url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={os.getenv('FIREBASE_API_KEY')}"

        response = requests.post(url, json={"idToken": token})

        if response.status_code == 200:
            data = response.json()
            if 'users' in data and len(data['users']) > 0:
                user_data = data['users'][0]

                # Decodificar o token para pegar custom claims
                import jwt
                decoded = jwt.decode(token, options={"verify_signature": False})

                return {
                    "uid": user_data.get('localId'),
                    "email": user_data.get('email'),
                    "email_verified": user_data.get('emailVerified', False),
                    "admin": decoded.get('admin', False)  # Custom claim do Firebase
                }

        logger.error(f"Token verification failed: {response.text}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed")


async def verify_admin(token_data: dict = Depends(verify_firebase_token)):
    """Verifica se o usuário tem custom claim admin=true no Firebase"""
    if not token_data.get("admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
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


def serialize_datetime(data: dict) -> dict:
    """Converte campos datetime para string ISO format para armazenar no Firestore"""
    result = data.copy()
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, dict):
            result[key] = serialize_datetime(value)
    return result


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
    Destaca quando é um pedido de placa QR Code física.
    """
    try:
        # Determinar se é plano com placa física
        plan_type = payment_data.get('plan_type', '')
        is_plaque_order = plan_type in ['plaque', 'complete', 'qrcode_plaque']

        # Dados do responsável
        responsible = memorial_data.get('responsible', {})
        person_data = memorial_data.get('person_data', {})

        # Formatação do valor
        amount = payment_data.get('amount', 0)
        formatted_amount = f"R$ {amount:.2f}".replace('.', ',')

        # Formatação da data
        payment_date = payment_data.get('updated_at') or payment_data.get('created_at')
        if isinstance(payment_date, str):
            try:
                payment_date = datetime.fromisoformat(payment_date.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                payment_date = datetime.now(timezone.utc)
        formatted_date = payment_date.strftime('%d/%m/%Y às %H:%M')

        # Nome do plano
        plan_names = {
            'digital': 'Plano Digital',
            'plaque': 'Plano Placa QR Code',
            'qrcode_plaque': 'Plano Placa QR Code',
            'complete': 'Plano Completo com Placa'
        }
        plan_name = plan_names.get(plan_type, plan_type)

        # Construir o HTML do e-mail
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
                    <td style="padding: 12px; background-color: #e8f4f8; border-bottom: 1px solid #ddd; font-weight: bold; width: 40%;">
                        👤 Nome do Comprador
                    </td>
                    <td style="padding: 12px; background-color: #fff; border-bottom: 1px solid #ddd;">
                        {responsible.get('name', 'Não informado')}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; border-bottom: 1px solid #ddd; font-weight: bold;">
                        📧 E-mail do Comprador
                    </td>
                    <td style="padding: 12px; background-color: #fff; border-bottom: 1px solid #ddd;">
                        {payment_data.get('user_email', responsible.get('email', 'Não informado'))}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; border-bottom: 1px solid #ddd; font-weight: bold;">
                        📱 Telefone
                    </td>
                    <td style="padding: 12px; background-color: #fff; border-bottom: 1px solid #ddd;">
                        {responsible.get('phone', 'Não informado')}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; border-bottom: 1px solid #ddd; font-weight: bold;">
                        🕊️ Pessoa Homenageada
                    </td>
                    <td style="padding: 12px; background-color: #fff; border-bottom: 1px solid #ddd;">
                        {person_data.get('full_name', 'Não informado')}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; border-bottom: 1px solid #ddd; font-weight: bold;">
                        🆔 ID do Memorial
                    </td>
                    <td style="padding: 12px; background-color: #fff; border-bottom: 1px solid #ddd;">
                        <code style="background-color: #f0f0f0; padding: 2px 6px; border-radius: 4px;">{memorial_data.get('id', 'N/A')}</code>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; border-bottom: 1px solid #ddd; font-weight: bold;">
                        📦 Plano Adquirido
                    </td>
                    <td style="padding: 12px; background-color: #fff; border-bottom: 1px solid #ddd;">
                        <strong style="color: {'#dc2626' if is_plaque_order else '#5B8FB9'};">{plan_name}</strong>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; border-bottom: 1px solid #ddd; font-weight: bold;">
                        💰 Valor Pago
                    </td>
                    <td style="padding: 12px; background-color: #fff; border-bottom: 1px solid #ddd;">
                        <strong style="color: #16a34a; font-size: 18px;">{formatted_amount}</strong>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; border-bottom: 1px solid #ddd; font-weight: bold;">
                        📅 Data do Pagamento
                    </td>
                    <td style="padding: 12px; background-color: #fff; border-bottom: 1px solid #ddd;">
                        {formatted_date}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px; background-color: #e8f4f8; font-weight: bold;">
                        🔗 ID do Pagamento
                    </td>
                    <td style="padding: 12px; background-color: #fff;">
                        <code style="background-color: #f0f0f0; padding: 2px 6px; border-radius: 4px;">{payment_data.get('id', 'N/A')}</code>
                    </td>
                </tr>
            </table>

            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
                <p style="margin: 0; color: #166534;">
                    ✅ <strong>Status:</strong> Pagamento aprovado e memorial publicado com sucesso!
                </p>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="font-size: 12px; color: #888; text-align: center;">
                Este é um e-mail automático enviado pela plataforma Remember QRCode.<br>
                © {datetime.now().year} Remember QRCode - Transformando lembranças em homenagens.
            </p>
        </body>
        </html>
        """

        # Definir assunto do e-mail
        subject = "🏷️ SOLICITAÇÃO DE PLACA QRCODE - Novo Pagamento Aprovado" if is_plaque_order else "💳 Novo Pagamento Aprovado - Remember QRCode"

        # Enviar e-mail usando Resend (non-blocking)
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
    user_dict["created_at"] = user_dict["created_at"].isoformat()

    user_ref.set(user_dict)
    return user_dict


@api_router.get("/auth/me")
async def get_current_user(token_data: dict = Depends(verify_firebase_token)):
    user_ref = db.collection("users").document(token_data["uid"])
    doc = user_ref.get()

    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
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
            status_code=status.HTTP_404_NOT_FOUND,
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

    memorial_dict = memorial.model_dump()
    memorial_dict = serialize_datetime(memorial_dict)

    # Salvar no Firestore usando o ID do memorial como document ID
    db.collection("memorials").document(memorial.id).set(memorial_dict)
    
    return memorial


@api_router.get("/memorials/my", response_model=List[Memorial])
async def get_my_memorials(token_data: dict = Depends(verify_firebase_token)):
    # Query no Firestore filtrando por user_id
    memorials_ref = db.collection("memorials").where("user_id", "==", token_data["uid"])
    docs = memorials_ref.stream()
    
    memorials = []
    for doc in docs:
        memorial_data = doc.to_dict()
        memorial_data = deserialize_datetime(memorial_data, ["created_at", "updated_at"])
        memorials.append(memorial_data)
    
    return memorials


@api_router.get("/memorials/explore", response_model=List[Memorial])
async def explore_memorials():
    # Query composta: public_memorial=True AND status=published
    memorials_ref = db.collection("memorials")\
        .where("person_data.public_memorial", "==", True)\
        .where("status", "==", "published")
    docs = memorials_ref.stream()
    
    memorials = []
    for doc in docs:
        memorial_data = doc.to_dict()
        memorial_data = deserialize_datetime(memorial_data, ["created_at", "updated_at"])
        memorials.append(memorial_data)
    
    return memorials


@api_router.get("/memorials/{memorial_id}", response_model=Memorial)
async def get_memorial(memorial_id: str):
    # Buscar documento direto pelo ID
    doc = db.collection("memorials").document(memorial_id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memorial not found")
    
    memorial_data = doc.to_dict()
    memorial_data = deserialize_datetime(memorial_data, ["created_at", "updated_at"])
    
    return memorial_data


@api_router.put("/memorials/{memorial_id}")
async def update_memorial(memorial_id: str, updates: dict, token_data: dict = Depends(verify_firebase_token)):
    memorial_ref = db.collection("memorials").document(memorial_id)
    doc = memorial_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memorial not found")
    
    memorial_data = doc.to_dict()
    
    if memorial_data["user_id"] != token_data["uid"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    updates['updated_at'] = datetime.now(timezone.utc).isoformat()
    memorial_ref.update(updates)
    
    return {"message": "Memorial updated successfully"}


# ========== PAYMENT ENDPOINTS ==========

@api_router.post("/payments/create-checkout")
async def create_checkout(payment_req: CreatePaymentRequest, token_data: dict = Depends(verify_firebase_token)):
    """
    Cria uma preference no Mercado Pago usando Checkout Pro.
    Retorna init_point para redirecionar o usuário.
    """
    logger.info("=" * 60)
    logger.info("=== INICIANDO CRIAÇÃO DE PREFERENCE (CHECKOUT PRO) ===")
    logger.info("=" * 60)
    logger.info(f"Memorial ID: {payment_req.memorial_id}")
    logger.info(f"Plan Type: {payment_req.plan_type}")
    logger.info(f"Amount: {payment_req.transaction_amount} (type: {type(payment_req.transaction_amount)})")
    logger.info(f"User Email: {payment_req.payer_email}")

    # Verificar memorial no Firestore
    memorial_doc = db.collection("memorials").document(payment_req.memorial_id).get()
    if not memorial_doc.exists:
        logger.error(f"❌ Memorial não encontrado: {payment_req.memorial_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memorial not found")

    memorial = memorial_doc.to_dict()
    logger.info(f"✅ Memorial encontrado: {memorial.get('person_data', {}).get('full_name')}")

    # Verificar Access Token
    if not mp_access_token:
        logger.error("❌ MERCADOPAGO_ACCESS_TOKEN não configurado!")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Mercado Pago não configurado"
        )

    logger.info(f"Token tipo: {'TESTE' if mp_access_token.startswith('TEST-') else 'PRODUÇÃO'}")
    logger.info(f"Token início: {mp_access_token[:30]}...")

    # Criar registro de pagamento
    payment = Payment(
        memorial_id=payment_req.memorial_id,
        user_id=token_data["uid"],
        user_email=payment_req.payer_email,
        plan_type=payment_req.plan_type,
        amount=payment_req.transaction_amount,
        status="pending"
    )

    try:
        # Configurar URLs de retorno
        backend_url = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
        frontend_url = backend_url.replace(':8001', ':3000').replace('/api', '')

        logger.info(f"Backend URL: {backend_url}")
        logger.info(f"Frontend URL: {frontend_url}")

        # Construir preference no formato EXATO do Checkout Pro
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
            "external_reference": payment.id,
            "statement_descriptor": "Remember QrCode",
            "notification_url": f"{backend_url}/api/webhooks/mercadopago"
        }

        logger.info("=" * 60)
        logger.info("PAYLOAD ENVIADO PARA MERCADO PAGO:")
        logger.info(json.dumps(preference_payload, indent=2, ensure_ascii=False))
        logger.info("=" * 60)

        # Enviar para Mercado Pago usando SDK
        logger.info("Enviando requisição para Mercado Pago...")

        result = mp_sdk.preference().create(preference_payload)

        logger.info("=" * 60)
        logger.info("RESPOSTA DO MERCADO PAGO:")
        logger.info(f"Status Code: {result.get('status')}")
        logger.info(f"Response completo: {json.dumps(result, indent=2, ensure_ascii=False)}")
        logger.info("=" * 60)

        if result["status"] == 201:
            mp_preference = result["response"]
            preference_id = mp_preference.get("id")
            init_point = mp_preference.get("init_point")

            if not init_point:
                logger.error("❌ init_point não retornado pela API do Mercado Pago!")
                logger.error(f"Resposta: {mp_preference}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Mercado Pago não retornou URL de checkout"
                )

            logger.info("✅ Preference criada com SUCESSO!")
            logger.info(f"Preference ID: {preference_id}")
            logger.info(f"Init Point: {init_point}")

            # Salvar no Firestore
            payment.mercadopago_payment_id = preference_id

            payment_dict = payment.model_dump()
            payment_dict = serialize_datetime(payment_dict)
            db.collection("payments").document(payment.id).set(payment_dict)

            logger.info(f"Pagamento salvo no banco: {payment.id}")
            logger.info("=" * 60)

            return {
                "success": True,
                "payment_id": payment.id,
                "preference_id": preference_id,
                "checkout_url": init_point,
                "message": "Checkout criado com sucesso"
            }

        elif result["status"] == 400:
            # Erro 400 - Bad Request
            error_response = result.get("response", {})
            logger.error("=" * 60)
            logger.error("❌ ERRO 400 - BAD REQUEST DO MERCADO PAGO")
            logger.error(f"Mensagem: {error_response.get('message')}")
            logger.error(f"Causa: {error_response.get('cause')}")
            logger.error(f"Erros: {json.dumps(error_response.get('cause', []), indent=2)}")
            logger.error(f"Response completo: {json.dumps(error_response, indent=2, ensure_ascii=False)}")
            logger.error("=" * 60)

            # Extrair mensagem de erro específica
            error_msg = error_response.get('message', 'Erro ao criar preference')
            if 'cause' in error_response and error_response['cause']:
                causes = error_response['cause']
                if isinstance(causes, list) and len(causes) > 0:
                    error_msg = causes[0].get('description', error_msg)

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Mercado Pago: {error_msg}"
            )

        else:
            # Outro erro
            logger.error(f"❌ Erro inesperado - Status: {result.get('status')}")
            logger.error(f"Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao criar checkout (status {result.get('status')})"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("=" * 60)
        logger.error(f"❌ EXCEÇÃO NÃO TRATADA: {type(e).__name__}")
        logger.error(f"Mensagem: {str(e)}")
        import traceback
        logger.error(f"Traceback completo:\n{traceback.format_exc()}")
        logger.error("=" * 60)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao processar pagamento: {str(e)}"
        )


@api_router.get("/payments/my", response_model=List[Payment])
async def get_my_payments(token_data: dict = Depends(verify_firebase_token)):
    # Query no Firestore filtrando por user_id
    payments_ref = db.collection("payments").where("user_id", "==", token_data["uid"])
    docs = payments_ref.stream()
    
    payments = []
    for doc in docs:
        payment_data = doc.to_dict()
        payment_data = deserialize_datetime(payment_data, ["created_at", "updated_at"])
        payments.append(payment_data)
    
    return payments


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
                            # Buscar pagamento no Firestore
                            payment_ref = db.collection("payments").document(external_ref)
                            payment_doc = payment_ref.get()

                            if payment_doc.exists:
                                payment_data = payment_doc.to_dict()
                                
                                # Atualizar status do pagamento
                                payment_ref.update({
                                    "status": new_status,
                                    "updated_at": datetime.now(timezone.utc).isoformat()
                                })

                                if new_status == "approved":
                                    memorial_id = payment_data["memorial_id"]
                                    plan_type = payment_data["plan_type"]

                                    memorial_url = f"{os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:3000')}/memorial/{memorial_id}"
                                    qr_code_data = generate_qr_code(memorial_url)

                                    # Atualizar memorial no Firestore
                                    db.collection("memorials").document(memorial_id).update({
                                        "status": "published",
                                        "plan_type": plan_type,
                                        "qr_code_url": qr_code_data,
                                        "updated_at": datetime.now(timezone.utc).isoformat()
                                    })

                                    logger.info(f"Memorial {memorial_id} published with plan {plan_type}")

                                    # Buscar dados atualizados para o e-mail
                                    updated_payment = payment_ref.get().to_dict()
                                    memorial_data = db.collection("memorials").document(memorial_id).get().to_dict()

                                    # Enviar e-mail de notificação em background
                                    if updated_payment and memorial_data:
                                        background_tasks.add_task(
                                            send_payment_notification_email,
                                            updated_payment,
                                            memorial_data
                                        )
                                        logger.info("📧 E-mail de notificação agendado para envio")
                except Exception as e:
                    logger.error(f"Error processing payment webhook: {str(e)}")

        return {"status": "success"}

    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}


# ========== ADMIN ENDPOINTS ==========

@api_router.get("/admin/stats")
async def get_admin_stats(user: dict = Depends(verify_admin)):
    # Contar documentos no Firestore
    memorials_docs = list(db.collection("memorials").stream())
    total_memorials = len(memorials_docs)
    
    payments_docs = list(db.collection("payments").stream())
    total_orders = len(payments_docs)
    
    # Contar placas (plaque ou complete)
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
    """
    Endpoint de teste para verificar se o envio de e-mail está funcionando.
    Envia um e-mail de teste para o administrador.
    """
    try:
        # Dados de teste
        test_payment = {
            "id": "test-payment-123",
            "user_email": "teste@exemplo.com",
            "plan_type": "plaque",  # Teste com plano de placa para ver o destaque
            "amount": 119.90,
            "status": "approved",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        test_memorial = {
            "id": "test-memorial-456",
            "person_data": {
                "full_name": "Maria da Silva (TESTE)"
            },
            "responsible": {
                "name": "João da Silva (TESTE)",
                "email": "joao@teste.com",
                "phone": "(22) 99999-9999"
            }
        }

        # Enviar e-mail de teste
        result = await send_payment_notification_email(test_payment, test_memorial)

        if result:
            return {
                "status": "success",
                "message": f"E-mail de teste enviado com sucesso para {ADMIN_EMAIL}"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Falha ao enviar e-mail de teste"
            )
    except Exception as e:
        logger.error(f"Erro no teste de e-mail: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao enviar e-mail: {str(e)}"
        )


@api_router.get("/admin/orders")
async def get_all_orders(user: dict = Depends(verify_admin)):
    # Buscar todos os pagamentos ordenados por created_at desc
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
    # Buscar todos os memoriais ordenados por created_at desc
    memorials_ref = db.collection("memorials").order_by("created_at", direction=firestore.Query.DESCENDING)
    docs = memorials_ref.stream()
    
    memorials = []
    for doc in docs:
        memorial_data = doc.to_dict()
        memorial_data = deserialize_datetime(memorial_data, ["created_at", "updated_at"])
        memorials.append(memorial_data)
    
    return memorials


@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status_update: dict, user: dict = Depends(verify_admin)):
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
    
    order_ref.update({
        "status": status_update.get("status"),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Order status updated"}


@api_router.delete("/admin/orders/{order_id}")
async def delete_order(order_id: str, user: dict = Depends(verify_admin)):
    """Admin: Excluir um pedido"""
    order_ref = db.collection("payments").document(order_id)
    doc = order_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")

    # Excluir o pedido
    order_ref.delete()

    logger.info(f"Pedido {order_id} excluído pelo admin {user.get('email')}")

    return {"message": "Pedido excluído com sucesso"}


# ========== REVIEWS ENDPOINTS ==========

@api_router.post("/reviews", response_model=Review)
async def create_review(review_req: CreateReviewRequest, token_data: dict = Depends(verify_firebase_token)):
    """Criar uma nova avaliação (apenas usuários logados)"""
    # Verificar se o usuário já avaliou
    reviews_ref = db.collection("reviews").where("user_id", "==", token_data["uid"]).limit(1)
    existing_reviews = list(reviews_ref.stream())
    
    if existing_reviews:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você já enviou uma avaliação. Obrigado pelo feedback!"
        )

    # Buscar dados do usuário no Firestore
    user_ref = db.collection("users").document(token_data["uid"])
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    
    user = user_doc.to_dict()

    review = Review(
        user_id=token_data["uid"],
        user_name=user.get("name", "Usuário"),
        user_email=user.get("email", ""),
        user_photo_url=user.get("photo_url"),
        rating=review_req.rating,
        title=review_req.title,
        comment=review_req.comment,
        approved=False  # Avaliações precisam ser aprovadas pelo admin
    )

    review_dict = review.model_dump()
    review_dict = serialize_datetime(review_dict)
    
    db.collection("reviews").document(review.id).set(review_dict)
    logger.info(f"Nova avaliação criada por {user.get('email')}")

    return review


@api_router.get("/reviews")
async def get_approved_reviews():
    """Buscar avaliações aprovadas para exibição pública"""
    reviews_ref = db.collection("reviews")\
        .where("approved", "==", True)\
        .order_by("created_at", direction=firestore.Query.DESCENDING)
    docs = reviews_ref.stream()
    
    reviews = []
    for doc in docs:
        review_data = doc.to_dict()
        # Não expor email
        review_data.pop("user_email", None)
        review_data = deserialize_datetime(review_data, ["created_at"])
        reviews.append(review_data)
    
    return reviews


@api_router.get("/reviews/my")
async def get_my_review(token_data: dict = Depends(verify_firebase_token)):
    """Buscar avaliação do usuário logado"""
    reviews_ref = db.collection("reviews").where("user_id", "==", token_data["uid"]).limit(1)
    docs = list(reviews_ref.stream())
    
    if not docs:
        return None
    
    review_data = docs[0].to_dict()
    review_data = deserialize_datetime(review_data, ["created_at"])
    
    return review_data


@api_router.get("/admin/reviews")
async def get_all_reviews(user: dict = Depends(verify_admin)):
    """Admin: Buscar todas as avaliações"""
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
    """Admin: Aprovar uma avaliação"""
    review_ref = db.collection("reviews").document(review_id)
    doc = review_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avaliação não encontrada")
    
    review_ref.update({"approved": True})
    
    return {"message": "Avaliação aprovada com sucesso"}


@api_router.delete("/admin/reviews/{review_id}")
async def delete_review(review_id: str, user: dict = Depends(verify_admin)):
    """Admin: Excluir uma avaliação"""
    review_ref = db.collection("reviews").document(review_id)
    doc = review_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avaliação não encontrada")
    
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

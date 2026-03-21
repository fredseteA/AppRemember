import sys
import os
from unittest.mock import MagicMock, patch
import pytest

# ── Mocka módulos Firebase/externos ANTES de qualquer import do projeto ───────
sys.modules["firebase_admin"] = MagicMock()
sys.modules["firebase_admin.credentials"] = MagicMock()
sys.modules["firebase_admin.firestore"] = MagicMock()
sys.modules["firebase_admin.auth"] = MagicMock()
sys.modules["mercadopago"] = MagicMock()
sys.modules["resend"] = MagicMock()
sys.modules["qrcode"] = MagicMock()

# ── Variáveis de ambiente mínimas para o servidor iniciar ─────────────────────
os.environ.setdefault("FIREBASE_CREDENTIALS_JSON", '{"type":"service_account","project_id":"test"}')
os.environ.setdefault("MERCADOPAGO_ACCESS_TOKEN", "TEST-fake-token")
os.environ.setdefault("RESEND_API_KEY", "re_fake_key")
os.environ.setdefault("ADMIN_EMAIL", "admin@test.com")
os.environ.setdefault("SENDER_EMAIL", "sender@test.com")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")
os.environ.setdefault("REACT_APP_BACKEND_URL", "http://localhost:8001")


# ── Coleções Firestore simuladas ──────────────────────────────────────────────

class FakeCollection:
    """Simula db.collection('nome') com encadeamento de métodos."""

    def __init__(self):
        self.document = MagicMock()
        self.where = MagicMock(return_value=self)
        self.order_by = MagicMock(return_value=self)
        self.limit = MagicMock(return_value=self)
        self.stream = MagicMock(return_value=iter([]))
        self.add = MagicMock()

    def reset(self):
        self.document.reset_mock()
        self.where.reset_mock()
        self.where.return_value = self
        self.order_by.reset_mock()
        self.order_by.return_value = self
        self.limit.reset_mock()
        self.limit.return_value = self
        self.stream.reset_mock()
        self.stream.return_value = iter([])
        self.add.reset_mock()


@pytest.fixture
def mock_db():
    """
    Fixture que mocka core.firebase.db — caminho correto no projeto refatorado.
    Cada coleção é um FakeCollection independente.
    """
    collections = {
        "users": FakeCollection(),
        "memorials": FakeCollection(),
        "payments": FakeCollection(),
        "partners": FakeCollection(),
        "reviews": FakeCollection(),
        "supporter_commissions": FakeCollection(),
        "admin_logs": FakeCollection(),
        "admin_notifications": FakeCollection(),
        "commission_payments": FakeCollection(),
        "settings": FakeCollection(),
        "condolences": FakeCollection(),
        "commission_adjustments": FakeCollection(),
    }

    def fake_collection(name):
        return collections.get(name, FakeCollection())

    fake_db = MagicMock()
    fake_db.collection.side_effect = fake_collection

    with patch("core.firebase.db", fake_db), \
         patch("routers.auth.db", fake_db), \
         patch("routers.memorials.db", fake_db), \
         patch("routers.payments.db", fake_db), \
         patch("routers.admin.db", fake_db), \
         patch("routers.reviews.db", fake_db), \
         patch("routers.affiliate.db", fake_db), \
         patch("services.commission_service.db", fake_db):
        yield collections


@pytest.fixture
def client(mock_db):
    """TestClient do FastAPI com Firestore mockado."""
    from fastapi.testclient import TestClient
    from main import app
    with TestClient(app) as c:
        yield c


# ── Fixtures de autenticação ──────────────────────────────────────────────────

@pytest.fixture
def mock_verify_token(mock_db):
    """Simula usuário autenticado comum (role=user)."""
    user_token = {
        "uid": "uid-123",
        "email": "user@test.com",
        "email_verified": True,
        "admin": False,
    }

    user_doc = MagicMock()
    user_doc.exists = True
    user_doc.to_dict.return_value = {
        "firebase_uid": "uid-123",
        "email": "user@test.com",
        "name": "Test User",
        "role": "user",
        "delivery_address": None,
        "created_at": "2024-01-01T00:00:00+00:00",
        "updated_at": "2024-01-01T00:00:00+00:00",
    }
    mock_db["users"].document.return_value.get.return_value = user_doc

    with patch("dependencies.auth.auth") as mock_auth:
        mock_auth.verify_id_token.return_value = {
            "uid": "uid-123",
            "email": "user@test.com",
            "email_verified": True,
            "admin": False,
        }
        yield user_token


@pytest.fixture
def mock_verify_admin(mock_db):
    """Simula admin autenticado."""
    admin_token = {
        "uid": "admin-uid",
        "email": "admin@test.com",
        "email_verified": True,
        "admin": True,
        "role": "admin",
    }

    admin_user_doc = MagicMock()
    admin_user_doc.exists = True
    admin_user_doc.to_dict.return_value = {
        "firebase_uid": "admin-uid",
        "email": "admin@test.com",
        "name": "Admin",
        "role": "admin",
        "created_at": "2024-01-01T00:00:00+00:00",
        "updated_at": "2024-01-01T00:00:00+00:00",
    }
    mock_db["users"].document.return_value.get.return_value = admin_user_doc

    with patch("dependencies.auth.auth") as mock_auth:
        mock_auth.verify_id_token.return_value = {
            "uid": "admin-uid",
            "email": "admin@test.com",
            "email_verified": True,
            "admin": True,
        }
        yield admin_token


@pytest.fixture
def mock_verify_affiliate(mock_db):
    """Simula affiliate autenticado."""
    affiliate_token = {
        "uid": "uid-123",
        "email": "affiliate@test.com",
        "email_verified": True,
        "admin": False,
        "role": "affiliate",
        "user_data": {
            "firebase_uid": "uid-123",
            "email": "affiliate@test.com",
            "name": "Affiliate User",
            "role": "affiliate",
        },
    }

    affiliate_doc = MagicMock()
    affiliate_doc.exists = True
    affiliate_doc.to_dict.return_value = {
        "firebase_uid": "uid-123",
        "email": "affiliate@test.com",
        "name": "Affiliate User",
        "role": "affiliate",
        "created_at": "2024-01-01T00:00:00+00:00",
        "updated_at": "2024-01-01T00:00:00+00:00",
    }
    mock_db["users"].document.return_value.get.return_value = affiliate_doc

    with patch("dependencies.auth.auth") as mock_auth:
        mock_auth.verify_id_token.return_value = {
            "uid": "uid-123",
            "email": "affiliate@test.com",
            "email_verified": True,
            "admin": False,
        }
        yield affiliate_token


# ── Fixture do Mercado Pago ───────────────────────────────────────────────────

@pytest.fixture
def mock_mp_sdk():
    """
    Simula o SDK do Mercado Pago.
    Mocka em routers.payments onde o sdk é usado.
    """
    preference_mock = MagicMock()
    preference_mock.create.return_value = {
        "status": 201,
        "response": {
            "id": "pref-123",
            "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=pref-123",
        },
    }

    payment_mock = MagicMock()
    payment_mock.get.return_value = {
        "status": 200,
        "response": {
            "status": "approved",
            "external_reference": "pay-123",
        },
    }

    sdk_instance = MagicMock()
    sdk_instance.preference.return_value = preference_mock
    sdk_instance.payment.return_value = payment_mock

    with patch("routers.payments.mp_sdk", sdk_instance):
        yield {
            "sdk": sdk_instance,
            "preference_create": preference_mock.create,
            "payment_get": payment_mock.get,
        }
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

FIREBASE_CREDENTIALS_JSON = os.getenv("FIREBASE_CREDENTIALS_JSON")
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH")

MERCADOPAGO_ACCESS_TOKEN = os.getenv("MERCADOPAGO_ACCESS_TOKEN")

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "rememberqrcode@gmail.com")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "onboarding@resend.dev")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.getenv("REACT_APP_BACKEND_URL", "http://localhost:8001")
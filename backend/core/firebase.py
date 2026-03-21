import json
import firebase_admin
from firebase_admin import credentials, firestore, auth
from core.config import FIREBASE_CREDENTIALS_JSON, FIREBASE_CREDENTIALS_PATH

if not firebase_admin._apps:
    if FIREBASE_CREDENTIALS_JSON:
        cred = credentials.Certificate(json.loads(FIREBASE_CREDENTIALS_JSON))
    elif FIREBASE_CREDENTIALS_PATH:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    else:
        raise RuntimeError("Firebase credentials não configuradas.")

    firebase_admin.initialize_app(cred)

db = firestore.client()
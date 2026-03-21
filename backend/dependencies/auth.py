from fastapi import HTTPException, Request, Depends
from fastapi import status as http_status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from core.firebase import db
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)


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
    if token_data is None:
        raise HTTPException(
            status_code=http_status.HTTP_401_UNAUTHORIZED,
            detail="Não autenticado"
        )

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


async def verify_affiliate(token_data: dict = Depends(verify_firebase_token)):
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

    if role not in ("affiliate", "admin"):
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Área restrita a apoiadores."
        )

    return {**token_data, "role": role, "user_data": user_data}
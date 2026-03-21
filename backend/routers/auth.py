from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi import status as http_status
from datetime import datetime, timezone
from core.firebase import db
from dependencies.auth import verify_firebase_token, verify_admin
from models.admin import User, UpdateUserRequest, UpdateRoleRequest
from models.payments import DeliveryAddress
from utils.serialization import serialize_datetime
from services.admin_services import create_admin_log

router = APIRouter(prefix="/api")


@router.post("/auth/register")
async def register_user(user: User):
    user_ref = db.collection("users").document(user.firebase_uid)
    doc = user_ref.get()
    if doc.exists:
        return doc.to_dict()
    user_dict = user.model_dump()
    user_dict = serialize_datetime(user_dict)
    user_ref.set(user_dict)
    return user_dict


@router.get("/auth/me")
async def get_current_user(token_data: dict = Depends(verify_firebase_token)):
    user_ref = db.collection("users").document(token_data["uid"])
    doc = user_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="User not found")
    return doc.to_dict()


@router.put("/auth/me")
async def update_current_user(
    update_data: UpdateUserRequest,
    token_data: dict = Depends(verify_firebase_token)
):
    user_ref = db.collection("users").document(token_data["uid"])
    if not user_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="User not found")
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
        user_ref.update(update_dict)
    return user_ref.get().to_dict()


@router.get("/auth/me/address")
async def get_my_address(token_data: dict = Depends(verify_firebase_token)):
    doc = db.collection("users").document(token_data["uid"]).get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="User not found")
    address = doc.to_dict().get("delivery_address")
    return {"has_address": address is not None, "address": address}


@router.put("/auth/me/address")
async def update_my_address(
    address: DeliveryAddress,
    token_data: dict = Depends(verify_firebase_token)
):
    user_ref = db.collection("users").document(token_data["uid"])
    if not user_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="User not found")
    address_dict = address.model_dump()
    user_ref.update({"delivery_address": address_dict, "updated_at": datetime.now(timezone.utc).isoformat()})
    return {"message": "Endereço salvo com sucesso", "address": address_dict}


@router.put("/admin/users/{uid}/role")
async def update_user_role(
    uid: str,
    body: UpdateRoleRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    valid_roles = {"user", "admin", "affiliate"}
    if body.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Role inválido. Use: {valid_roles}")
    user_ref = db.collection("users").document(uid)
    if not user_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    user_ref.update({"role": body.role, "updated_at": datetime.now(timezone.utc).isoformat()})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "update_user_role", "user", uid, {"new_role": body.role})
    return {"message": f"Role atualizado para '{body.role}'", "uid": uid}
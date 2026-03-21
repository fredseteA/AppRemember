from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi import status as http_status
from fastapi.security import HTTPAuthorizationCredentials
from firebase_admin import firestore
from datetime import datetime, timezone
from typing import List

from core.firebase import db
from dependencies.auth import verify_firebase_token, verify_admin, security
from models.memorial import (
    Memorial, CreateMemorialRequest, UpdateMemorialRequest,
    CondolenceCreate, CondolenceResponse
)
from models.admin import UpdateMemorialAdminRequest
from utils.serialization import serialize_datetime, deserialize_datetime
from utils.slug import generate_unique_slug
from services.admin_services import create_admin_log

router = APIRouter(prefix="/api")


@router.post("/memorials", response_model=Memorial)
async def create_memorial(
    memorial_request: CreateMemorialRequest,
    token_data: dict = Depends(verify_firebase_token)
):
    memorial = Memorial(
        user_id=token_data["uid"],
        person_data=memorial_request.person_data,
        content=memorial_request.content,
        responsible=memorial_request.responsible
    )
    slug = generate_unique_slug(memorial_request.person_data.full_name, db)
    memorial.slug = slug
    full_name    = memorial_request.person_data.full_name
    relationship = memorial_request.person_data.relationship
    year         = datetime.now(timezone.utc).year
    memorial.display_name = f"{full_name} — {relationship} — {year}"
    memorial_dict = serialize_datetime(memorial.model_dump())
    db.collection("memorials").document(memorial.id).set(memorial_dict)
    return memorial


@router.get("/memorials/my", response_model=List[Memorial])
async def get_my_memorials(token_data: dict = Depends(verify_firebase_token)):
    docs = db.collection("memorials").where(
        filter=firestore.FieldFilter("user_id", "==", token_data["uid"])
    ).stream()
    memorials = []
    for doc in docs:
        data = doc.to_dict()
        if data.get("active") == False:
            continue
        memorials.append(deserialize_datetime(data, ["created_at", "updated_at"]))
    return memorials


@router.get("/memorials/explore", response_model=List[Memorial])
async def explore_memorials():
    docs = db.collection("memorials").where(
        filter=firestore.FieldFilter("status", "==", "published")
    ).stream()
    memorials = []
    for doc in docs:
        data = doc.to_dict()
        if data.get("active") == False:
            continue
        if not data.get("person_data", {}).get("public_memorial", False):
            continue
        memorials.append(deserialize_datetime(data, ["created_at", "updated_at"]))
    return memorials


@router.get("/memorials/by-slug/{slug}", response_model=Memorial)
async def get_memorial_by_slug(slug: str):
    docs = list(db.collection("memorials").where(
        filter=firestore.FieldFilter("slug", "==", slug)
    ).limit(1).stream())
    if not docs:
        raise HTTPException(status_code=404, detail="Memorial not found")
    return deserialize_datetime(docs[0].to_dict(), ["created_at", "updated_at"])


@router.get("/memorials/{memorial_id}", response_model=Memorial)
async def get_memorial(memorial_id: str):
    doc = db.collection("memorials").document(memorial_id).get()
    if not doc.exists:
        docs = list(db.collection("memorials").where(
            filter=firestore.FieldFilter("slug", "==", memorial_id)
        ).limit(1).stream())
        if not docs:
            raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial not found")
        doc = docs[0]
    return deserialize_datetime(doc.to_dict(), ["created_at", "updated_at"])


@router.put("/memorials/{memorial_id}")
async def update_memorial(
    memorial_id: str,
    updates: UpdateMemorialRequest,
    token_data: dict = Depends(verify_firebase_token)
):
    memorial_ref = db.collection("memorials").document(memorial_id)
    doc = memorial_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial not found")
    if doc.to_dict()["user_id"] != token_data["uid"]:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Not authorized")
    updates_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    updates_dict = serialize_datetime(updates_dict)
    updates_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    memorial_ref.update(updates_dict)
    return {"message": "Memorial updated successfully"}


@router.delete("/memorials/{memorial_id}")
async def delete_memorial(
    memorial_id: str,
    token_data: dict = Depends(verify_firebase_token)
):
    memorial_ref = db.collection("memorials").document(memorial_id)
    doc = memorial_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial not found")
    data = doc.to_dict()
    if data["user_id"] != token_data["uid"]:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Not authorized")
    if data.get("status") != "draft":
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Only draft memorials can be deleted")
    memorial_ref.delete()
    return {"message": "Memorial deleted successfully"}


@router.post("/memorials/{memorial_id}/condolences", response_model=CondolenceResponse, status_code=201)
async def create_condolence(memorial_id: str, data: CondolenceCreate):
    if not db.collection("memorials").document(memorial_id).get().exists:
        raise HTTPException(status_code=404, detail="Memorial não encontrado")
    message = (data.message or "").strip()
    if len(message) < 10:
        raise HTTPException(status_code=400, detail="Mensagem muito curta (mínimo 10 caracteres)")
    if len(message) > 1000:
        raise HTTPException(status_code=400, detail="Mensagem muito longa (máximo 1000 caracteres)")
    if not data.anonymous and not (data.sender_name or "").strip():
        raise HTTPException(status_code=400, detail="Informe seu nome ou envie como anônimo")
    valid_relations = {"familia", "amigo", "colega", "vizinho", "outro", None}
    relation    = data.relation if data.relation in valid_relations else None
    sender_name = None if data.anonymous else (data.sender_name or "").strip() or None
    condolence_id = str(__import__('uuid').uuid4())
    now = datetime.now(timezone.utc)
    doc = {
        "id": condolence_id, "memorial_id": memorial_id,
        "message": message, "sender_name": sender_name,
        "relation": relation, "anonymous": data.anonymous, "created_at": now,
    }
    db.collection("condolences").document(condolence_id).set(doc)
    return CondolenceResponse(
        id=condolence_id, message=message, sender_name=sender_name,
        relation=relation, anonymous=data.anonymous, created_at=now.isoformat(),
    )


@router.get("/memorials/{memorial_id}/condolences", response_model=List[CondolenceResponse])
async def get_condolences(memorial_id: str):
    if not db.collection("memorials").document(memorial_id).get().exists:
        raise HTTPException(status_code=404, detail="Memorial não encontrado")
    docs = db.collection("condolences").where(
        "memorial_id", "==", memorial_id
    ).order_by("created_at", direction=firestore.Query.DESCENDING).stream()
    result = []
    for doc in docs:
        d = doc.to_dict()
        created = d.get("created_at")
        result.append(CondolenceResponse(
            id=d.get("id", doc.id), message=d.get("message", ""),
            sender_name=d.get("sender_name"), relation=d.get("relation"),
            anonymous=d.get("anonymous", False),
            created_at=created.isoformat() if hasattr(created, "isoformat") else str(created or ""),
        ))
    return result


@router.delete("/condolences/{condolence_id}")
async def delete_condolence(
    condolence_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    from dependencies.auth import verify_firebase_token as _verify
    user = _verify(credentials)
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Não autorizado")
    ref = db.collection("condolences").document(condolence_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Condolência não encontrada")
    ref.delete()
    return {"message": "Condolência removida"}


@router.post("/admin/migrate/slugs")
async def migrate_slugs(user: dict = Depends(verify_admin)):
    docs = list(db.collection("memorials").stream())
    updated = 0
    for doc in docs:
        data = doc.to_dict()
        if not data.get("slug"):
            slug = generate_unique_slug(data.get("person_data", {}).get("full_name", "memorial"), db)
            db.collection("memorials").document(doc.id).update({"slug": slug})
            updated += 1
    return {"updated": updated}


@router.put("/admin/memorials/{memorial_id}")
async def update_memorial_admin(
    memorial_id: str,
    updates: UpdateMemorialAdminRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    from models.admin import UpdateMemorialAdminRequest
    memorial_ref = db.collection("memorials").document(memorial_id)
    if not memorial_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial não encontrado")
    updates_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    updates_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    memorial_ref.update(updates_dict)
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "update_memorial", "memorial", memorial_id, updates_dict)
    return {"message": "Memorial atualizado com sucesso"}


@router.put("/admin/memorials/{memorial_id}/toggle")
async def toggle_memorial(
    memorial_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    memorial_ref = db.collection("memorials").document(memorial_id)
    doc = memorial_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial não encontrado")
    new_active = not doc.to_dict().get("active", True)
    memorial_ref.update({"active": new_active, "updated_at": datetime.now(timezone.utc).isoformat()})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "toggle_memorial", "memorial", memorial_id, {"active": new_active})
    return {"message": f"Memorial {'ativado' if new_active else 'desativado'}", "active": new_active}


@router.put("/admin/memorials/{memorial_id}/feature")
async def feature_memorial(
    memorial_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    memorial_ref = db.collection("memorials").document(memorial_id)
    doc = memorial_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial não encontrado")
    new_featured = not doc.to_dict().get("featured", False)
    memorial_ref.update({"featured": new_featured, "updated_at": datetime.now(timezone.utc).isoformat()})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "feature_memorial", "memorial", memorial_id, {"featured": new_featured})
    return {"message": f"Memorial {'destacado' if new_featured else 'removido dos destaques'}", "featured": new_featured}


@router.post("/admin/memorials/{memorial_id}/regenerate-qr")
async def regenerate_qr_code(
    memorial_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_admin)
):
    from utils.qrcode import generate_qr_code
    memorial_ref = db.collection("memorials").document(memorial_id)
    doc = memorial_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Memorial não encontrado")
    from core.config import FRONTEND_URL
    memorial_data = doc.to_dict()
    memorial_slug = memorial_data.get("slug") or memorial_id
    memorial_url  = f"{FRONTEND_URL}/memorial/{memorial_slug}"
    new_qr_code   = generate_qr_code(memorial_url)
    memorial_ref.update({
        "qr_code_url": new_qr_code,
        "qr_regenerated_at": datetime.now(timezone.utc).isoformat(),
        "qr_regenerated_by": user.get("email"),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "regenerate_qr", "memorial", memorial_id, {"memorial_url": memorial_url})
    return {"message": "QR Code regenerado com sucesso", "memorial_url": memorial_url, "qr_code_url": new_qr_code}
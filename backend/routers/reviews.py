from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi import status as http_status
from firebase_admin import firestore
from datetime import datetime, timezone

from core.firebase import db
from dependencies.auth import verify_firebase_token, verify_admin
from models.review import Review, CreateReviewRequest, RespondReviewRequest
from utils.serialization import serialize_datetime, deserialize_datetime
from services.admin_services import create_admin_log

router = APIRouter(prefix="/api")


@router.post("/reviews", response_model=Review)
async def create_review(
    review_req: CreateReviewRequest,
    token_data: dict = Depends(verify_firebase_token)
):
    existing = list(db.collection("reviews").where(
        filter=firestore.FieldFilter("user_id", "==", token_data["uid"])
    ).limit(1).stream())
    if existing:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Você já enviou uma avaliação. Obrigado pelo feedback!")
    user_doc = db.collection("users").document(token_data["uid"]).get()
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
    db.collection("reviews").document(review.id).set(serialize_datetime(review.model_dump()))
    return review


@router.get("/reviews")
async def get_approved_reviews():
    try:
        docs = db.collection("reviews").where(
            filter=firestore.FieldFilter("approved", "==", True)
        ).order_by("created_at", direction=firestore.Query.DESCENDING).stream()
    except Exception:
        docs = db.collection("reviews").where(
            filter=firestore.FieldFilter("approved", "==", True)
        ).stream()
    reviews = []
    for doc in docs:
        data = doc.to_dict()
        data.pop("user_email", None)
        reviews.append(deserialize_datetime(data, ["created_at"]))
    reviews.sort(key=lambda r: r.get("created_at", datetime.min.replace(tzinfo=timezone.utc)), reverse=True)
    return reviews


@router.get("/reviews/my")
async def get_my_review(token_data: dict = Depends(verify_firebase_token)):
    docs = list(db.collection("reviews").where(
        filter=firestore.FieldFilter("user_id", "==", token_data["uid"])
    ).limit(1).stream())
    if not docs:
        return None
    return deserialize_datetime(docs[0].to_dict(), ["created_at"])


@router.get("/admin/reviews")
async def get_all_reviews(user: dict = Depends(verify_admin)):
    docs = db.collection("reviews").order_by("created_at", direction=firestore.Query.DESCENDING).stream()
    return [deserialize_datetime(doc.to_dict(), ["created_at"]) for doc in docs]


@router.put("/admin/reviews/{review_id}/approve")
async def approve_review(review_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    review_ref = db.collection("reviews").document(review_id)
    if not review_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Avaliação não encontrada")
    review_ref.update({"approved": True})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "approve_review", "review", review_id, {})
    return {"message": "Avaliação aprovada com sucesso"}


@router.put("/admin/reviews/{review_id}/reject")
async def reject_review(review_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    review_ref = db.collection("reviews").document(review_id)
    if not review_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Avaliação não encontrada")
    review_ref.update({"approved": False})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "reject_review", "review", review_id, {})
    return {"message": "Avaliação reprovada"}


@router.post("/admin/reviews/{review_id}/respond")
async def respond_to_review(review_id: str, response_data: RespondReviewRequest, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    review_ref = db.collection("reviews").document(review_id)
    if not review_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Avaliação não encontrada")
    review_ref.update({"admin_response": response_data.response, "response_date": datetime.now(timezone.utc).isoformat(), "responded_by": user.get("email")})
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "respond_review", "review", review_id, {"response": response_data.response[:100]})
    return {"message": "Resposta adicionada com sucesso"}


@router.delete("/admin/reviews/{review_id}")
async def delete_review(review_id: str, background_tasks: BackgroundTasks, user: dict = Depends(verify_admin)):
    review_ref = db.collection("reviews").document(review_id)
    if not review_ref.get().exists:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Avaliação não encontrada")
    review_ref.delete()
    background_tasks.add_task(create_admin_log, user.get("uid"), user.get("email"), "delete_review", "review", review_id, {})
    return {"message": "Avaliação excluída com sucesso"}
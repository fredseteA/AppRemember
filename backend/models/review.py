from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid


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


class RespondReviewRequest(BaseModel):
    response: str
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid


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
    email: str


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
    display_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CreateMemorialRequest(BaseModel):
    person_data: PersonData
    content: MemorialContent
    responsible: ResponsibleData


class UpdateMemorialRequest(BaseModel):
    person_data: Optional[PersonData] = None
    content: Optional[MemorialContent] = None
    responsible: Optional[ResponsibleData] = None
    status: Optional[str] = None
    plan_type: Optional[str] = None
    qr_code_url: Optional[str] = None


class CondolenceCreate(BaseModel):
    message: str
    sender_name: Optional[str] = None
    relation: Optional[str] = None
    anonymous: bool = False


class CondolenceResponse(BaseModel):
    id: str
    message: str
    sender_name: Optional[str]
    relation: Optional[str]
    anonymous: bool
    created_at: str
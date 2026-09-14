from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# --- User ---
class UserCreate(BaseModel):
    pseudo: str
    password: str
    level: Optional[str] = None


class UserLogin(BaseModel):
    pseudo: str
    password: str


class UserResponse(BaseModel):
    id: int
    pseudo: str
    role: str
    level: Optional[str]
    is_online: bool
    network_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# --- Private messages ---
class PrivateMessageCreate(BaseModel):
    content: str
    receiver_id: int


class PrivateMessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    user_id: int
    pseudo: str
    is_online: bool
    last_message: Optional[str]
    last_message_time: Optional[datetime]
    unread_count: int


# --- Zones ---
class ZoneCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: str = "classic"


class ZoneResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    type: str
    member_count: int
    is_member: bool

    class Config:
        from_attributes = True


class ZoneMessageResponse(BaseModel):
    id: int
    zone_id: int
    sender_id: int
    sender_pseudo: str
    content: str
    created_at: datetime


# --- Resources ---
class ResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject: str
    level: str
    file_url: str


class ResourceResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    subject: str
    level: str
    file_url: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Events ---
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str = "campus"
    date: datetime
    class_name: Optional[str] = None


class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    event_type: str
    date: datetime
    class_name: Optional[str]

    class Config:
        from_attributes = True

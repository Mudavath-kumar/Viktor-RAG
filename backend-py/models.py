from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SignupRequest(BaseModel):
    email: str
    password: str
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    user: Optional[dict] = None
    session: Optional[dict] = None
    error: Optional[str] = None


class UploadRequest(BaseModel):
    user_id: str
    name: str
    size: str
    file_type: str


class ChatRequest(BaseModel):
    session_id: str
    user_id: str
    content: str


class CreateSessionRequest(BaseModel):
    user_id: str
    document_id: Optional[str] = None
    document_name: Optional[str] = None


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: str


class SessionResponse(BaseModel):
    id: str
    title: str
    created_at: str


class DocumentResponse(BaseModel):
    id: str
    name: str
    size: str
    type: str
    status: str
    created_at: str


class DashboardResponse(BaseModel):
    documents: int
    queries: int
    sessions: int
    recent_activity: list

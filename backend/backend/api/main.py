from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

import os
import sys

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from GenAI.ai_workflows.orchestration.rag_pipeline import RAGPipeline

from api.database import get_db
from api.models.user import User
from api.auth import hash_password, verify_password
from api.routers.user_router import router as user_router
from api.routers.department_router import router as department_router
from api.routers.document_router import router as document_router
from api.routers.dashboard_router import router as dashboard_router
from api.routers.activity_router import router as activity_router
from api.routers.chat_router import router as chat_router

app = FastAPI(title="Enterprise RAG API Hub")

app.include_router(user_router)
app.include_router(department_router)
app.include_router(document_router)
app.include_router(dashboard_router)
app.include_router(activity_router)
app.include_router(chat_router)

# ==========================
# CORS
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Initialize RAG
# ==========================

pipeline = RAGPipeline()

# ==========================
# Request Schemas
# ==========================

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str
    department: str
    designation: str


class LoginRequest(BaseModel):
    email: str
    password: str
    role: str


class QueryRequest(BaseModel):
    query: str
    designation: Optional[str] = "Software Engineer"


# ==========================
# Register
# ==========================

@app.post("/api/auth/register")
def register_user(payload: RegisterRequest, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == payload.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already registered."
        )

    user = User(
        name=payload.name,
        email=payload.email,
        password=hash_password(payload.password),
        role=payload.role,
        department=payload.department,
        designation=payload.designation,
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "status": "success",
        "message": "Account created successfully."
    }


# ==========================
# Login
# ==========================

@app.post("/api/auth/login")
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == payload.email).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email."
        )
    print("Input Password:", payload.password)
    print("Stored Hash:", user.password)

    print("=" * 50)
    print("Entered password :", payload.password)
    print("Stored password  :", user.password)
    print("Type             :", type(user.password))
    print("=" * 50)

    if not verify_password(
        payload.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid password."
        )

    if user.role.lower() != payload.role.lower():
        raise HTTPException(
            status_code=403,
            detail="Invalid role."
        )

    return {
        "status": "success",
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "department": user.department,
        "designation": user.designation,
    }


# ==========================
# RAG Endpoint
# ==========================

@app.post("/api/rag/ask")
def ask_question(payload: QueryRequest):

    try:

        mapped_role = (
            "HR Operations Lead"
            if payload.designation == "Admin"
            else payload.designation
        )

        result = pipeline.answer(
            query=payload.query,
            designation=mapped_role
        )

        citations = []

        if hasattr(result, "citations") and result.citations:
            for item in result.citations:
                citations.append(
                    getattr(item, "source", str(item))
                )

        return {
            "answer": result.answer,
            "citations": citations
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==========================
# Health Check
# ==========================

@app.get("/")
def health():
    return {
        "status": "running",
        "message": "Enterprise RAG API Hub is running."
    }
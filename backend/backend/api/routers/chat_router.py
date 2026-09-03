from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
import os

from GenAI.ai_workflows.orchestration.rag_pipeline import RAGPipeline

load_dotenv()

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# -------------------------
# Supabase Client
# -------------------------
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY"),
)

# -------------------------
# Initialize RAG
# -------------------------
pipeline = RAGPipeline()

# -------------------------
# Request Models
# -------------------------
class NewChatRequest(BaseModel):
    title: str
    user_id: int


class ChatMessageRequest(BaseModel):
    chat_id: str
    message: str
    designation: str = "Software Engineer"


# -------------------------
# Create New Chat
# -------------------------
@router.post("/new")
def create_chat(payload: NewChatRequest):

    result = (
        supabase
        .table("chat_history")
        .insert({
            "title": payload.title,
            "user_id": payload.user_id,
            "messages": []
        })
        .execute()
    )

    return result.data[0]


# -------------------------
# Send Message
# -------------------------
@router.post("/message")
def send_message(payload: ChatMessageRequest):

    # Fetch chat
    result = (
        supabase
        .table("chat_history")
        .select("*")
        .eq("id", payload.chat_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    chat = result.data

    messages = chat.get("messages", [])

    # Save user message
    messages.append({
        "role": "user",
        "content": payload.message
    })

    try:

        mapped_role = (
            "HR Operations Lead"
            if payload.designation == "Admin"
            else payload.designation
        )

        rag_result = pipeline.answer(
            query=payload.message,
            designation=mapped_role
        )

        ai_reply = rag_result.answer

        citations = []

        if hasattr(rag_result, "citations"):
            for item in rag_result.citations:
                citations.append(
                    getattr(item, "source", str(item))
                )

    except Exception as e:
        ai_reply = f"Error: {str(e)}"
        citations = []

    # Save assistant reply
    messages.append({
        "role": "assistant",
        "content": ai_reply,
        "citations": citations
    })

    # Update database
    (
        supabase
        .table("chat_history")
        .update({
            "messages": messages
        })
        .eq("id", payload.chat_id)
        .execute()
    )

    return {
        "chat_id": payload.chat_id,
        "reply": ai_reply,
        "citations": citations,
        "messages": messages
    }


# -------------------------
# Get Chat By ID
# -------------------------
@router.get("/{chat_id}")
def get_chat(chat_id: str):

    result = (
        supabase
        .table("chat_history")
        .select("*")
        .eq("id", chat_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    return result.data


# -------------------------
# List Chats
# -------------------------
@router.get("/list/{user_id}")
def list_chats(user_id: int):

    result = (
        supabase
        .table("chat_history")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data


# -------------------------
# Delete Chat
# -------------------------
@router.delete("/{chat_id}")
def delete_chat(chat_id: str):

    (
        supabase
        .table("chat_history")
        .delete()
        .eq("id", chat_id)
        .execute()
    )

    return {
        "message": "Chat deleted successfully"
    }
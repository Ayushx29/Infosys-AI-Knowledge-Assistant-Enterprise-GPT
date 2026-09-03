# import os
# import sys
# from pathlib import Path

# # =====================================================
# # 1. Force Physical secrets.toml Creation on Linux Disk
# # =====================================================
# api_key = (
#     os.getenv("GOOGLE_API_KEY")
#     or os.getenv("GEMINI_API_KEY")
#     or os.getenv("OPENAI_API_KEY")
#     or ""
# )

# secrets_body = f"""GOOGLE_API_KEY = "{api_key}"
# GEMINI_API_KEY = "{api_key}"

# [default]
# GOOGLE_API_KEY = "{api_key}"
# GEMINI_API_KEY = "{api_key}"
# """

# for target_dir in [
#     Path("/root/.streamlit"),
#     Path("/app/.streamlit"),
#     Path.home() / ".streamlit",
#     Path.cwd() / ".streamlit"
# ]:
#     try:
#         target_dir.mkdir(parents=True, exist_ok=True)
#         (target_dir / "secrets.toml").write_text(secrets_body.strip(), encoding="utf-8")
#     except Exception:
#         pass

# # Streamlit in-memory mock
# try:
#     import streamlit as st
#     st.secrets["GOOGLE_API_KEY"] = api_key
#     st.secrets["GEMINI_API_KEY"] = api_key
# except Exception:
#     pass

# # =====================================================
# # 2. Path Setup
# # =====================================================
# PROJECT_ROOT = Path(__file__).resolve().parent.parent
# BACKEND_ROOT = PROJECT_ROOT / "backend"

# if str(PROJECT_ROOT) not in sys.path:
#     sys.path.insert(0, str(PROJECT_ROOT))
# if str(BACKEND_ROOT) not in sys.path:
#     sys.path.insert(0, str(BACKEND_ROOT))

# # =====================================================
# # 3. FastAPI Initialization & RAG Pipeline
# # =====================================================
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# import uvicorn

# app = FastAPI(title="Enterprise GPT API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# pipeline = None

# def get_pipeline():
#     global pipeline
#     if pipeline is None:
#         from backend.GenAI.ai_workflows.orchestration.rag_pipeline import RAGPipeline
#         pipeline = RAGPipeline()
#     return pipeline

# class QueryRequest(BaseModel):
#     query: str
#     designation: str = "HR Operations Lead"

# @app.get("/")
# def health():
#     return {"status": "ok", "message": "Enterprise GPT Backend is active"}

# @app.post("/api/query")
# @app.post("/query")
# async def execute_query(payload: QueryRequest):
#     if not payload.query or not payload.query.strip():
#         raise HTTPException(status_code=400, detail="Query cannot be empty.")

#     try:
#         rag = get_pipeline()
#         result = rag.answer(
#             query=payload.query.strip(),
#             designation=payload.designation,
#         )

#         citations_data = []
#         if hasattr(result, "citations") and result.citations:
#             for c in result.citations:
#                 citations_data.append({
#                     "citation_id": getattr(c, "citation_id", None),
#                     "document_name": getattr(c, "document_name", None),
#                     "document_id": getattr(c, "document_id", None),
#                     "chunk_id": getattr(c, "chunk_id", None),
#                     "page_number": getattr(c, "page_number", None),
#                 })

#         return {
#             "status": "success",
#             "answer": result.answer if hasattr(result, "answer") else str(result),
#             "citations": citations_data,
#             "metadata": getattr(result, "metadata", {})
#         }
#     except Exception as exc:
#         raise HTTPException(status_code=500, detail=f"Failed to load RAG Pipeline: {str(exc)}")

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))



import sys
from pathlib import Path

import streamlit as st


# =====================================================
# Python paths
# =====================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_ROOT = PROJECT_ROOT / "backend"

# Project root → allows: backend.GenAI...
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Backend root → allows: config...
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


# =====================================================
# RAG Pipeline
# =====================================================

from backend.GenAI.ai_workflows.orchestration.rag_pipeline import (
    RAGPipeline,
)


# =====================================================
# Page configuration
# =====================================================

st.set_page_config(
    page_title="Enterprise GPT - AI Workflow Demo",
    page_icon="🤖",
    layout="wide",
)


# =====================================================
# Initialize pipeline
# =====================================================

@st.cache_resource
def load_pipeline():
    return RAGPipeline()


pipeline = load_pipeline()


# =====================================================
# Header
# =====================================================

st.title("🤖 Enterprise GPT")

st.caption(
    "AI Workflow Demonstration — RAG, Hybrid Search, "
    "Grounding & Citation Verification"
)


# =====================================================
# Sidebar
# =====================================================

with st.sidebar:

    st.header("⚙️ Query Configuration")

    designation = st.selectbox(
        "Designation",
        [
            "Software Engineer",
            "Senior Software Engineer",
            "DevOps Lead",
            "Solutions Architect",
            "Engineering Lead",
            "Sales Executive",
            "Business Development Manager",
            "Account Manager",
            "Sales Enablement Lead",
            "Delivery Manager",
            "PMO Lead",
            "Operations Lead",
            "HR Associate",
            "HR Operations Lead",
            "Senior Manager",
        ],
    )

    st.divider()

    st.markdown("### AI Pipeline")

    st.markdown(
        """
        **1. Query Classification**  
        ↓  
        **2. RBAC Authorization**  
        ↓  
        **3. Hybrid Retrieval**  
        ↓  
        **4. RRF Fusion**  
        ↓  
        **5. Gemini 3.5 Flash Reranking**  
        ↓  
        **6. Grounded Synthesis**  
        ↓  
        **7. Citation Validation**  
        ↓  
        **8. Claim Verification**  
        ↓  
        **9. Citation Builder**  
        ↓  
        **10. Final Response**
        """
    )


# =====================================================
# Query
# =====================================================

st.subheader("Ask Enterprise GPT")

query = st.text_area(
    "Enter your question",
    placeholder=(
        "Example: What is the annual casual "
        "leave entitlement?"
    ),
    height=100,
)


ask = st.button(
    "🔍 Ask",
    type="primary",
    use_container_width=True,
)


# =====================================================
# Execute pipeline
# =====================================================

if ask:

    if not query.strip():

        st.warning(
            "Please enter a question."
        )

    else:

        with st.spinner(
            "Running AI workflow..."
        ):

            try:

                result = pipeline.answer(
                    query=query,
                    designation=designation,
                )

                st.session_state[
                    "rag_result"
                ] = result

            except Exception as exc:

                st.error(
                    f"Pipeline error: {exc}"
                )

                st.exception(exc)


# =====================================================
# Display result
# =====================================================

if "rag_result" in st.session_state:

    result = st.session_state[
        "rag_result"
    ]

    st.divider()

    # =================================================
    # Final Answer
    # =================================================

    st.subheader("💬 Answer")

    st.markdown(
        result.answer
    )

    # =================================================
    # Citations
    # =================================================

    st.subheader("📚 Citations")

    if result.citations:

        for citation in result.citations:

            with st.expander(
                f"[{citation.citation_id}] "
                f"{citation.document_name}"
            ):

                col1, col2 = st.columns(2)

                with col1:

                    st.write(
                        "**Document ID:**",
                        citation.document_id,
                    )

                    st.write(
                        "**Chunk ID:**",
                        citation.chunk_id,
                    )

                with col2:

                    st.write(
                        "**Page:**",
                        (
                            citation.page_number
                            if citation.page_number
                            is not None
                            else "N/A"
                        ),
                    )

    else:

        st.info(
            "No citations were generated."
        )

    # =================================================
    # Pipeline Trace
    # =================================================

    st.divider()

    st.subheader(
        "🔬 AI Pipeline Trace"
    )

    metadata = result.metadata

    # -------------------------------------------------
    # Pipeline status
    # -------------------------------------------------

    status = metadata.get(
        "pipeline_status",
        "unknown",
    )

    if status == "success":

        st.success(
            "Pipeline completed successfully."
        )

    else:

        st.info(
            f"Pipeline status: {status}"
        )

    # -------------------------------------------------
    # Metrics
    # -------------------------------------------------

    col1, col2, col3, col4 = st.columns(4)

    with col1:

        st.metric(
            "Retrieved",
            metadata.get(
                "retrieved_count",
                0,
            ),
        )

    with col2:

        st.metric(
            "Final Evidence",
            metadata.get(
                "final_evidence_count",
                0,
            ),
        )

    with col3:

        st.metric(
            "Verified Claims",
            metadata.get(
                "verified_claim_count",
                0,
            ),
        )

    with col4:

        st.metric(
            "Citations",
            len(result.citations),
        )

    # =================================================
    # Verification Results
    # =================================================

    verification_results = metadata.get(
        "verification_results",
        [],
    )

    if verification_results:

        st.subheader(
            "✓ Claim Verification"
        )

        for item in verification_results:

            score = item.get(
                "support_score",
                0,
            )

            supported = item.get(
                "supported",
                False,
            )

            if supported:

                st.success(
                    f"✓ {item['claim']}\n\n"
                    f"Support score: "
                    f"{score:.2f}"
                )

            else:

                st.error(
                    f"✗ {item['claim']}\n\n"
                    f"Support score: "
                    f"{score:.2f}\n\n"
                    f"Reason: "
                    f"{item.get('reason', 'N/A')}"
                )

    # =================================================
    # Raw Pipeline Metadata
    # =================================================

    with st.expander(
        "🛠️ Raw Pipeline Metadata"
    ):

        st.json(
            metadata
        )
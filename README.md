

# 🤖 Enterprise AI Knowledge Assistant

An enterprise document-based AI chatbot built using **Retrieval-Augmented Generation (RAG)**.  
The system allows users to ask questions about enterprise documents and receive grounded answers generated using relevant information retrieved from the document knowledge base.

---

## 📌 Project Overview

Large Language Models (LLMs) are powerful, but they do not automatically have access to an organization's private or project-specific documents.

This project solves that problem using a **Retrieval-Augmented Generation (RAG)** architecture.

Instead of directly sending a user's question to an LLM, the system:

1. Receives the user's question.
2. Searches the enterprise document knowledge base.
3. Retrieves the most relevant document chunks.
4. Adds the retrieved information to the LLM prompt.
5. Sends the question and context to Gemini.
6. Generates a grounded answer.
7. Returns the answer along with document source information.

### Simple Flow

User Question

↓

Semantic Search

↓

ChromaDB

↓

Relevant Document Chunks

↓

Context + Question

↓

Google Gemini

↓

Grounded Answer + Sources

---

# 🎯 Project Objectives

The main objectives of this project are:

- Build an enterprise document-based AI assistant.
- Allow users to query internal knowledge using natural language.
- Implement a complete RAG pipeline.
- Retrieve semantically relevant information from enterprise documents.
- Generate answers using Google Gemini.
- Provide document and page-level source information.
- Build a REST API using FastAPI.
- Provide a user-friendly web-based chat interface.
- Keep API credentials secure using environment variables.

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │   Enterprise PDFs    │
                    │                      │
                    │ HR / Engineering /   │
                    │ Sales / Project Docs │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Document Ingestion │
                    │      PyMuPDF         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Chunking        │
                    │  Text Preprocessing  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Embeddings      │
                    │    MiniLM / ONNX     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       ChromaDB       │
                    │    Vector Database   │
                    └──────────┬───────────┘
                               │
                               │
                 ┌─────────────▼─────────────┐
                 │        User Question      │
                 └─────────────┬─────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Retrieval       │
                    │      Top-K Search     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Context Builder    │
                    │ Question + Documents │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     Google Gemini    │
                    │        LLM           │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Answer + Sources     │
                    └──────────────────────┘
````

---

# 🔄 RAG Pipeline

## 1. Document Collection

Enterprise PDF documents are stored in:

```text
data/documents/
```

Example:

```text
data/
└── documents/
    ├── 01_hr_policy.pdf
    ├── 02_delivery_guidelines.pdf
    ├── 03_engineering_guidelines.pdf
    └── 04_project_management.pdf
```

---

## 2. Text Extraction

PDF documents are processed using **PyMuPDF**.

The system extracts:

* Text
* Page number
* Document name

Example metadata:

```python
{
    "document": "01_hr_policy.pdf",
    "page": 1
}
```

---

## 3. Text Chunking

Large documents are divided into smaller chunks.

The initial implementation uses:

```text
Chunk size: approximately 500 characters
Overlap: approximately 50 characters
```

Chunk overlap helps preserve context when important information crosses chunk boundaries.

---

## 4. Embeddings

Each document chunk is converted into a numerical vector representation.

```text
Text
 ↓
Embedding Model
 ↓
Vector Representation
```

The vector representation allows the system to perform semantic similarity search.

For example:

```text
Question:
"How many vacation days can employees take?"

Document:
"Employees are eligible for 20 casual leave days."

```

Even though the wording is different, semantic retrieval can identify the relationship.

---

## 5. Vector Database

The embeddings and associated document information are stored in **ChromaDB**.

Collection:

```text
enterprise_documents
```

Stored information includes:

* Document chunks
* Embeddings
* Document metadata

---

## 6. Retrieval

When the user asks a question, the system searches ChromaDB.

The current implementation retrieves the:

```text
Top 3 relevant chunks
```

Example:

```text
User:
How many casual leaves are employees eligible for?

        ↓

ChromaDB

        ↓

Relevant chunk:
Employees are eligible for 20 casual leave
days per calendar year.
```

---

## 7. Prompt Construction

The retrieved document chunks are combined with the user's question.

Conceptually:

```text
User Question
      +
Retrieved Context
      ↓
RAG Prompt
      ↓
Gemini
```

The prompt instructs the model to:

* Use the retrieved context.
* Avoid unsupported information.
* Avoid inventing information.
* Respond that sufficient information was not found when the documents do not contain the answer.

---

## 8. LLM Generation

Google Gemini receives:

```text
Question + Retrieved Context
```

and generates the final response.

---

## 9. Source Information

The system preserves document metadata so the response can identify the source.

Example:

```text
Answer:
Employees are eligible for 20 casual leave days per calendar year.

Source:
01_hr_policy.pdf | Page 1
```

---

# 🧩 Backend

The backend is responsible for:

* RAG processing
* Document retrieval
* LLM integration
* API endpoints
* Request/response handling
* Environment configuration

### Backend Technology Stack

| Technology    | Purpose                |
| ------------- | ---------------------- |
| Python        | Backend development    |
| FastAPI       | REST API               |
| PyMuPDF       | PDF text extraction    |
| ChromaDB      | Vector database        |
| Google Gemini | LLM generation         |
| google-genai  | Gemini API integration |
| python-dotenv | Environment variables  |
| Pydantic      | Data validation        |

---

# 🌐 Frontend

The frontend provides a simple conversational interface for users.

### Frontend Responsibilities

* Display chat interface.
* Accept user questions.
* Send requests to the FastAPI backend.
* Display AI-generated responses.
* Display document sources.
* Handle loading and error states.
* Maintain a clean conversational experience.

### Example UI

```text
┌─────────────────────────────────────────────┐
│       Enterprise AI Knowledge Assistant     │
├─────────────────────────────────────────────┤
│                                             │
│ User                                        │
│ How many casual leaves are available?      │
│                                             │
│ AI Assistant                                │
│ Employees are eligible for 20 casual        │
│ leave days per calendar year.               │
│                                             │
│ Sources                                     │
│ • 01_hr_policy.pdf - Page 1                 │
│                                             │
├─────────────────────────────────────────────┤
│ Ask a question...                    [Send] │
└─────────────────────────────────────────────┘
```

---

# 🔌 Backend API Flow

The frontend communicates with the backend through HTTP requests.

```text
Frontend
   │
   │ POST /ask
   ▼
FastAPI
   │
   ▼
RAG Retrieval
   │
   ▼
ChromaDB
   │
   ▼
Relevant Context
   │
   ▼
Gemini
   │
   ▼
FastAPI Response
   │
   ▼
Frontend
```

---

# 📡 API Endpoint

## Ask Question

### Endpoint

```http
POST /ask
```

### Request

```json
{
  "question": "How many casual leaves are employees eligible for?"
}
```

### Response

```json
{
  "answer": "Employees are eligible for 20 casual leave days per calendar year.",
  "sources": [
    {
      "document": "01_hr_policy.pdf",
      "page": 1
    }
  ]
}
```

> The exact response schema may change as the backend is further developed.

---

# 📁 Project Structure

```text
enterprise-ai-knowledge-assistant/
│
├── backend/
│   │
│   ├── app.py
│   │
│   ├── rag/
│   │   ├── __init__.py
│   │   ├── ingestion.py
│   │   ├── chunking.py
│   │   ├── vector_store.py
│   │   ├── retrieval.py
│   │   └── generator.py
│   │
│   ├── data/
│   │   └── documents/
│   │       ├── 01_hr_policy.pdf
│   │       ├── 02_delivery_guidelines.pdf
│   │       ├── 03_engineering_guidelines.pdf
│   │       └── 04_project_management.pdf
│   │
│   ├── chroma_db/
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.*
│   │
│   ├── public/
│   └── package.json
│
├── README.md
└── LICENSE
```

> Adjust the folder names above to match the final repository structure.

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd enterprise-ai-knowledge-assistant
```

---

# 🐍 Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# 🔐 Environment Variables

Create a `.env` file inside the backend directory.

```env
GEMINI_API_KEY=your_gemini_api_key
```

Never commit the real `.env` file.

Use `.env.example` as the template:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

# 🗄️ Build the Vector Database

Run the document ingestion/vector-store process according to the project's ingestion script.

The pipeline will:

```text
PDF
 ↓
Text Extraction
 ↓
Chunking
 ↓
Embeddings
 ↓
ChromaDB
```

After successful ingestion, the vector database contains the enterprise document knowledge base.

---

# 🚀 Start the Backend

Example:

```bash
uvicorn app:app --reload
```

The FastAPI backend will then be available locally.

---

# 💻 Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend communicates with the FastAPI backend to process user questions.

---

# 🧪 Example Query

### Question

```text
How many casual leaves are employees eligible for?
```

### Retrieval

```text
01_hr_policy.pdf
Page: 1
```

### Retrieved Context

```text
Employees are eligible for 20 casual leave days
per calendar year.
```

### Generated Answer

```text
Employees are eligible for 20 casual leave days
per calendar year.
```

---

# 🛡️ Hallucination Control

The system uses a grounded generation approach.

The LLM is instructed to:

```text
1. Answer using the retrieved context.
2. Do not invent information.
3. Do not rely on unrelated outside knowledge.
4. State when sufficient information is not available.
```

### Important

RAG does **not** completely eliminate hallucinations.

Answer quality depends on:

* Document quality
* Chunking strategy
* Embedding quality
* Retrieval accuracy
* Prompt design
* LLM behavior

---

# 📊 RAG Evaluation

The system should be evaluated using representative questions from the enterprise documents.

Example evaluation set:

| Question                                | Expected Knowledge Area |
| --------------------------------------- | ----------------------- |
| How many casual leaves are available?   | HR                      |
| How is a production incident escalated? | Delivery                |
| What is required before deployment?     | Engineering             |
| How are project risks recorded?         | Project Management      |
| What are the approved sales guidelines? | Sales                   |

Evaluation should consider:

* Retrieval accuracy
* Relevance of retrieved chunks
* Answer correctness
* Source correctness
* No-answer behavior

---

# 🔒 Security

Sensitive credentials are not stored in source code.

The project uses:

```text
.env
```

for API credentials.

`.gitignore` prevents sensitive/local files from being committed.

Example:

```gitignore
.env
chroma_db/
__pycache__/
venv/
.venv/
```

**Never expose your Gemini API key in GitHub.**

---

# 🧠 Key Technical Concepts

This project demonstrates knowledge of:

* Retrieval-Augmented Generation
* Large Language Models
* Prompt Engineering
* Text preprocessing
* Document chunking
* Embeddings
* Semantic Search
* Vector Databases
* ChromaDB
* Google Gemini
* Python
* FastAPI
* REST APIs
* Frontend/API integration
* Source attribution
* Hallucination mitigation

---

# 📈 Future Improvements

Potential improvements include:

### RAG Improvements

* Section-aware chunking
* Better chunk overlap strategy
* Retrieval similarity thresholds
* Hybrid keyword + semantic search
* Reranking
* Query rewriting
* Retrieval evaluation
* Answer evaluation
* Improved source citation
* Conversation-aware retrieval

### Backend Improvements

* Authentication
* Request validation
* Rate limiting
* Logging
* Error handling
* API documentation
* Persistent chat history
* Database integration

### Frontend Improvements

* Streaming responses
* Conversation history
* Source cards
* File upload
* Typing indicators
* Error notifications
* Responsive design
* Dark mode

### Deployment

The system can later be deployed using:

```text
Frontend
   ↓
Cloud Hosting

Backend
   ↓
FastAPI Server

Vector Database
   ↓
ChromaDB / Production Vector DB

LLM
   ↓
Google Gemini API
```

---

# 🎓 What I Learned

Through this project, I worked with the complete RAG lifecycle:

```text
Document Ingestion
        ↓
Text Processing
        ↓
Chunking
        ↓
Embeddings
        ↓
Vector Storage
        ↓
Semantic Retrieval
        ↓
Context Construction
        ↓
LLM Generation
        ↓
Answer + Sources
```

I also gained practical experience integrating a RAG pipeline with a backend API and a frontend conversational interface.

---

# 👨‍💻 Project Role

### Data Science / RAG Developer

My primary contribution focused on:

* Document processing
* Text chunking
* Embedding generation
* ChromaDB vector storage
* Semantic retrieval
* RAG prompt construction
* Gemini LLM integration
* Retrieval testing
* Source metadata handling

---

# 📌 Interview Summary

> "I developed an enterprise knowledge assistant using Retrieval-Augmented Generation. The system processes enterprise PDF documents, extracts and chunks their content, generates embeddings, and stores them in ChromaDB. When a user asks a question, the system retrieves the most relevant chunks and combines them with the question as context for Gemini. Gemini then generates a grounded response, while document and page metadata can be returned as sources. The RAG pipeline is exposed through a FastAPI backend and consumed by a web-based frontend."

---

# ⭐ Project Highlights

* ✅ End-to-end RAG pipeline
* ✅ Enterprise document search
* ✅ Semantic retrieval
* ✅ ChromaDB vector database
* ✅ Google Gemini integration
* ✅ Source metadata
* ✅ FastAPI backend
* ✅ Web-based chat frontend
* ✅ Environment-based API security
* ✅ Modular architecture
* ✅ Designed for future production improvements

---

# 📜 License

This project is intended for educational, training, and portfolio purposes.

```

### One important correction before you publish this

Your README should **not claim features that you haven't actually implemented yet**.

Right now, based on what we've actually built together, you have verified:

- ✅ PDF ingestion
- ✅ Chunking
- ✅ Embeddings
- ✅ ChromaDB
- ✅ Retrieval
- ✅ Gemini generation
- ✅ Basic end-to-end RAG
- ✅ `.env` / `.gitignore`

The **FastAPI backend and frontend are the next implementation stages**. So keep those sections in the README as the intended architecture, but once we build them, we should update the README to reflect the **actual endpoints, frontend framework, request schema, screenshots, and deployment instructions**.

That distinction matters in an interview: **never claim an implementation you cannot demonstrate.**
```

from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from config.env_config import envConfig
from config.llm_config import (
    GEMINI_EMBEDDING_MODEL,
    EMBEDDING_DIMENSION,
)

embeddings = GoogleGenerativeAIEmbeddings(
    model=GEMINI_EMBEDDING_MODEL,
    google_api_key=envConfig.GEMINI_API_KEY,
    output_dimensionality=EMBEDDING_DIMENSION,
)

db = Chroma(
    persist_directory="vector_db",
    embedding_function=embeddings,
    collection_name="documents",
)

data = db.get(limit=5)

print("=" * 80)
print("Number of documents:", len(data["ids"]))

for i in range(len(data["ids"])):
    print("\nChunk:", i + 1)
    print("ID:", data["ids"][i])
    print("Metadata:", data["metadatas"][i])
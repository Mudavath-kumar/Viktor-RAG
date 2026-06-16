import config
from groq import Groq
from sentence_transformers import SentenceTransformer
from typing import List, Optional
import numpy as np
import data_store as store

# Lazy-loaded singletons — loaded once on first use
_model: SentenceTransformer | None = None
_groq_client: Groq | None = None


def get_model() -> SentenceTransformer:
    """Load sentence-transformers model locally (downloads ~80 MB on first run)."""
    global _model
    if _model is None:
        print("Loading embedding model (first run may take a moment)...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Embedding model loaded.")
    return _model


def get_groq() -> Groq:
    global _groq_client
    if _groq_client is None:
        _groq_client = Groq(api_key=config.GROQ_API_KEY)
    return _groq_client


def chunk_text(text: str, max_chars: int = 800) -> List[str]:
    chunks, paragraphs = [], text.split("\n\n")
    current = ""
    for p in paragraphs:
        if len(current) + len(p) > max_chars and current:
            chunks.append(current.strip())
            current = p
        else:
            current = (current + "\n\n" + p) if current else p
    if current.strip():
        chunks.append(current.strip())
    return chunks if chunks else [text[:max_chars]]


def extract_text(file_path: str) -> str:
    ext = file_path.rsplit(".", 1)[-1].lower() if "." in file_path else ""
    if ext == "txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    if ext == "pdf":
        from PyPDF2 import PdfReader
        reader = PdfReader(file_path)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read(50000)


def process_document(doc_id: str, text: str, user_id: str):
    model = get_model()
    chunks = chunk_text(text)

    # Generate embeddings locally — no API call, completely free
    embeddings = model.encode(chunks, convert_to_numpy=True)

    chunk_data = []
    for i, chunk in enumerate(chunks):
        chunk_data.append({
            "content": chunk,
            "embedding": embeddings[i].tolist(),
            "index": i,
        })

    store.save_chunks(doc_id, chunk_data)
    store.update_document_status(user_id, doc_id, "done")
    print(f"Processed doc {doc_id}: {len(chunks)} chunks")


def search_chunks(user_id: str, query: str, document_id: Optional[str] = None, limit: int = 5) -> List[dict]:
    model = get_model()
    query_emb = model.encode([query], convert_to_numpy=True)[0]

    if document_id:
        chunks = store.get_chunks(document_id)
        doc_name = "Unknown File"
        try:
            docs = store.get_documents(user_id)
            for d in docs:
                if d["id"] == document_id:
                    doc_name = d.get("name", "Unknown File")
                    break
        except Exception:
            pass
        for c in chunks:
            c["doc_id"] = document_id
            c["doc_name"] = doc_name
    else:
        chunks = store.get_all_user_chunks(user_id)

    scored = []
    for c in chunks:
        if "embedding" not in c:
            continue
        emb = np.array(c["embedding"])
        score = float(
            np.dot(query_emb, emb)
            / (np.linalg.norm(query_emb) * np.linalg.norm(emb) + 1e-10)
        )
        scored.append({
            "content": c["content"],
            "score": score,
            "doc_name": c.get("doc_name", "Unknown File")
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:limit]


def generate_answer(user_id: str, query: str, session_id: str) -> str:
    groq = get_groq()

    # Find if session is restricted to a document
    document_id = None
    try:
        sessions = store.get_sessions(user_id)
        for s in sessions:
            if s["id"] == session_id:
                document_id = s.get("document_id")
                break
    except Exception as e:
        print(f"Error checking session scope: {e}")

    chunks = search_chunks(user_id, query, document_id=document_id)

    if not chunks:
        return "No relevant documents found. Upload some documents first and try again."

    context = "\n\n---\n\n".join(
        f"[Source {i+1} from Document: {c['doc_name']}] {c['content']}" for i, c in enumerate(chunks)
    )

    completion = groq.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a precise RAG assistant. Answer comprehensively based on the provided context. "
                    "If the context lacks information, say so."
                ),
            },
            {"role": "user", "content": f"Context:\n\n{context}\n\nQuestion: {query}"},
        ],
        max_tokens=1000,
    )

    answer = completion.choices[0].message.content or "Sorry, couldn't generate an answer."

    # Append unique document names as sources
    unique_docs = []
    for c in chunks:
        doc = c.get("doc_name", "Unknown File")
        if doc not in unique_docs:
            unique_docs.append(doc)

    if unique_docs:
        answer += "\n\n**Sources:** " + ", ".join(f"`{d}`" for d in unique_docs)

    return answer

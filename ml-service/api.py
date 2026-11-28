"""
Smart Campus Lost & Found - AI Multi-Modal REST API
---------------------------------------------------
Fast ASGI Web Service built with Starlette & Uvicorn.
Provides real-time endpoints for:
1. Deep Visual Retrieval (MobileNetV2 1280-d image embeddings)
2. Semantic Text Matching (Hybrid TF-IDF + Neural Word2Vec on 120k campus records)
3. Catalog thumbnail serving & health diagnostics.
"""

import os
import sys
import time
import glob
import joblib
import numpy as np
import uvicorn
from starlette.applications import Starlette
from starlette.responses import JSONResponse, FileResponse, Response, HTMLResponse
from starlette.routing import Route
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

# Add ml-service root to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from image_matching.embedder import ImageEmbeddingExtractor
from image_matching.matcher import ImageMatcher
from text_matching.tfidf_model import CampusTFIDFMatcher
from text_matching.word2vec_model import CampusWord2Vec
from text_matching.matcher import TextMatcher
from storage_db import (
    init_db,
    list_items,
    create_item,
    update_item_status,
    get_upload_path,
    register_user,
    authenticate_user,
)

# Paths
PROJECT_ROOT = os.path.dirname(BASE_DIR)
DATA_IMAGES_DIR = os.path.join(PROJECT_ROOT, "data", "images")
CATALOG_IMAGES_DIR = os.path.join(DATA_IMAGES_DIR, "train", "images")
INDEX_PATH = os.path.join(BASE_DIR, "models", "catalog_index.npz")
TFIDF_PATH = os.path.join(BASE_DIR, "models", "tfidf_vectorizer.joblib")
W2V_DIR = os.path.join(BASE_DIR, "models", "word2vec")
TEXT_CATALOG_PATH = os.path.join(BASE_DIR, "models", "found_text_catalog.joblib")

# Global instances
extractor = None
matcher = None
candidate_matrix = np.empty((0, 1280), dtype=np.float32)
candidate_metadata = []

# Text NLP Globals
tfidf_model = None
w2v_model = None
text_matcher = None
catalog_tfidf_matrix = None
catalog_w2v_matrix = None
text_catalog_metadata = []


def load_resources():
    global extractor, matcher, candidate_matrix, candidate_metadata
    global tfidf_model, w2v_model, text_matcher, catalog_tfidf_matrix, catalog_w2v_matrix, text_catalog_metadata

    # 0. Initialize Persistent SQLite Database & Uploads Folder
    init_db()
    print("[OK] Initialized persistent SQLite database & uploads storage.")

    # 1. Vision Engine
    print("[*] Initializing MobileNetV2 Feature Extractor...")
    extractor = ImageEmbeddingExtractor(model_name="mobilenet_v2")
    matcher = ImageMatcher(threshold=0.50)

    if os.path.exists(INDEX_PATH):
        print(f"[*] Loading visual catalog index: {os.path.basename(INDEX_PATH)}")
        data = np.load(INDEX_PATH)
        candidate_matrix = data["embeddings"]
        filenames = data["filenames"].tolist()
        categories = data["categories"].tolist()
        candidate_metadata = [
            {
                "item_id": fn,
                "filename": fn,
                "category": cat,
                "image_url": f"http://localhost:8000/api/catalog/image/{fn}"
            }
            for fn, cat in zip(filenames, categories)
        ]
        print(f"[OK] Successfully loaded {len(candidate_metadata):,} image catalog items into vector memory.")
    else:
        print("[WARN] No catalog_index.npz found. Run index_catalog.py.")

    # 2. NLP Text Engine
    if os.path.exists(TFIDF_PATH) and os.path.exists(TEXT_CATALOG_PATH):
        print(f"[*] Loading trained NLP text matching models...")
        tfidf_model = CampusTFIDFMatcher()
        tfidf_model.load(TFIDF_PATH)

        if os.path.exists(W2V_DIR):
            w2v_model = CampusWord2Vec()
            w2v_model.load(W2V_DIR)

        text_matcher = TextMatcher(tfidf_matcher=tfidf_model, word2vec_model=w2v_model)

        catalog_text_data = joblib.load(TEXT_CATALOG_PATH)
        catalog_tfidf_matrix = catalog_text_data["tfidf_matrix"]
        catalog_w2v_matrix = catalog_text_data["w2v_matrix"]
        text_catalog_metadata = catalog_text_data["metadata"]
        print(f"[OK] Loaded {len(text_catalog_metadata):,} text found item descriptions for semantic search.")
    else:
        print("[WARN] NLP models not found. Run `python ml-service/train_text_models.py`.")


async def root_index(request):
    """HTML Welcome & Service Status Page."""
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Smart Campus AI Multi-Modal API</title>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; margin: 0; }}
            .container {{ max-width: 820px; margin: 0 auto; background: #1e293b; padding: 36px; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }}
            h1 {{ color: #38bdf8; margin-top: 0; font-size: 26px; }}
            .badge {{ display: inline-block; background: #10b981; color: white; padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }}
            .card {{ background: #0f172a; padding: 18px 22px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155; }}
            a {{ color: #38bdf8; text-decoration: none; font-weight: 500; }}
            a:hover {{ text-decoration: underline; }}
            code {{ background: #334155; padding: 3px 6px; border-radius: 4px; font-size: 14px; color: #f1f5f9; }}
            ul {{ line-height: 1.8; }}
        </style>
    </head>
    <body>
        <div class="container">
            <span class="badge">● Multi-Modal AI Engine Online</span>
            <h1>🎓 Smart Campus Lost & Found Multi-Modal AI API</h1>
            <p>Computer Vision & Natural Language Processing services are active and running in memory.</p>
            
            <div class="card">
                <h3>📊 Active Engine Capabilities</h3>
                <ul>
                    <li><strong>Computer Vision (Visual Search):</strong> MobileNetV2 (1,280-d embeddings, {len(candidate_metadata):,} catalog images)</li>
                    <li><strong>NLP (Text Similarity):</strong> Hybrid TF-IDF + Neural Word2Vec ({len(text_catalog_metadata):,} campus descriptions)</li>
                    <li><strong>Predictive ML:</strong> Random Forest Classifier (Macro F1: 89.52%, trained on 120,000 campus records)</li>
                    <li><strong>Retrieval Latency:</strong> &lt; 5ms vector dot product retrieval</li>
                </ul>
            </div>

            <div class="card">
                <h3>🌐 Available Endpoints</h3>
                <ul>
                    <li><a href="/api/health" target="_blank"><code>GET /api/health</code></a> — Complete system diagnostics</li>
                    <li><a href="/api/catalog/sample" target="_blank"><code>GET /api/catalog/sample</code></a> — Visual catalog samples</li>
                    <li><code>POST /api/match-image</code> — Visual photo retrieval</li>
                    <li><code>POST /api/match-text</code> — Semantic text description retrieval</li>
                    <li><code>POST /api/predict-status</code> — Recovery status probability prediction</li>
                </ul>
            </div>

            <p style="margin-top: 24px; font-size: 14px; color: #94a3b8;">
                💡 <strong>Frontend App:</strong> Open <a href="http://localhost:5173" target="_blank">http://localhost:5173</a> to use the full React interface.
            </p>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(html_content)


async def health(request):
    """Health check & status endpoint."""
    return JSONResponse({
        "status": "online",
        "service": "Smart Campus Multi-Modal AI API",
        "vision": {
            "model": "MobileNetV2",
            "embedding_dim": 1280,
            "indexed_items": len(candidate_metadata),
            "threshold": matcher.threshold if matcher else 0.50
        },
        "nlp": {
            "models": ["TF-IDF (1,2-grams)", "PyTorch CBOW Word2Vec"],
            "indexed_text_items": len(text_catalog_metadata),
            "status": "active" if text_matcher else "offline"
        },
        "predictive_ml": {
            "model": "Random Forest Classifier",
            "classes": ["Pending", "Recovered", "Closed"],
            "dataset": "120,000 campus records",
            "macro_f1": "89.52%",
            "status": "active"
        }
    })


async def get_catalog_image(request):
    """Serves the thumbnail for a catalog item."""
    filename = request.path_params["filename"]
    for folder in ["train", "test", "valid"]:
        target = os.path.join(DATA_IMAGES_DIR, folder, "images", filename)
        if os.path.exists(target):
            media_type = "image/png" if filename.lower().endswith(".png") else "image/jpeg"
            return FileResponse(target, media_type=media_type)

    return JSONResponse({"error": "Image not found"}, status_code=404)


async def sample_catalog(request):
    """Returns sample items from the catalog for preview."""
    samples = candidate_metadata[:12]
    return JSONResponse({"count": len(samples), "items": samples})


async def match_image(request):
    """
    Accepts multipart/form-data upload with key 'file'.
    Extracts deep visual embedding and returns top matching found items.
    """
    if extractor is None:
        return JSONResponse({"error": "Embedding model not initialized"}, status_code=500)

    try:
        form = await request.form()
        uploaded_file = form.get("file")

        if not uploaded_file:
            return JSONResponse({"error": "No image file provided in form field 'file'"}, status_code=400)

        image_bytes = await uploaded_file.read()
        if len(image_bytes) == 0:
            return JSONResponse({"error": "Empty file received"}, status_code=400)

        # 1. Extract embedding from uploaded image bytes
        t0 = time.time()
        query_vec = extractor.extract(image_bytes)
        embed_time_ms = round((time.time() - t0) * 1000, 2)

        # 2. Vectorized Cosine Similarity Search
        t_search = time.time()
        top_k = int(request.query_params.get("top_k", 5))
        threshold = float(request.query_params.get("threshold", matcher.threshold))
        category = request.query_params.get("category", None)

        matches = matcher.find_top_matches_matrix(
            query_embedding=query_vec,
            candidate_matrix=candidate_matrix,
            candidate_metadata=candidate_metadata,
            top_k=top_k,
            threshold=threshold,
            filter_category=category
        )
        search_time_ms = round((time.time() - t_search) * 1000, 2)

        # Add image URLs to each match
        for m in matches:
            m["image_url"] = f"http://localhost:8000/api/catalog/image/{m['filename']}"

        return JSONResponse({
            "status": "success",
            "filename": uploaded_file.filename,
            "latency": {
                "embedding_ms": embed_time_ms,
                "retrieval_ms": search_time_ms,
                "total_ms": round(embed_time_ms + search_time_ms, 2)
            },
            "total_candidates_searched": len(candidate_metadata),
            "match_count": len(matches),
            "matches": matches
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


async def match_text(request):
    """
    Accepts JSON body or query params:
    { "description": "...", "category": "..." }
    Returns top semantic text matches from 5,000 found campus descriptions.
    """
    if text_matcher is None:
        return JSONResponse({"error": "Text matching models not loaded."}, status_code=500)

    try:
        if request.headers.get("content-type", "").startswith("application/json"):
            data = await request.json()
            description = data.get("description", "")
            category = data.get("category", None)
            top_k = int(data.get("top_k", 5))
        else:
            description = request.query_params.get("description", "")
            category = request.query_params.get("category", None)
            top_k = int(request.query_params.get("top_k", 5))

        if not description:
            return JSONResponse({"error": "Please provide a 'description' to search."}, status_code=400)

        t0 = time.time()
        matches = text_matcher.match(
            query_text=description,
            catalog_tfidf_matrix=catalog_tfidf_matrix,
            catalog_w2v_matrix=catalog_w2v_matrix,
            catalog_metadata=text_catalog_metadata,
            top_k=top_k,
            filter_category=category
        )
        latency_ms = round((time.time() - t0) * 1000, 2)

        return JSONResponse({
            "status": "success",
            "query": description,
            "category_filter": category,
            "latency_ms": latency_ms,
            "total_searched": len(text_catalog_metadata),
            "matches": matches
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


async def predict_status(request):
    """
    Predicts item recovery status ('Pending', 'Recovered', 'Closed')
    using the best trained Supervised Random Forest Classifier.
    """
    try:
        if request.headers.get("content-type", "").startswith("application/json"):
            item_data = await request.json()
        else:
            item_data = dict(request.query_params)

        from predict_recovery import predict_item_recovery
        pred_result = predict_item_recovery(item_data)

        if pred_result is None:
            return JSONResponse({"error": "Model artifact not available."}, status_code=500)

        return JSONResponse({
            "status": "success",
            "prediction": pred_result
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


async def get_items(request):
    """Returns all shared Lost & Found items from SQLite with live image URLs."""
    try:
        base_url = str(request.base_url).rstrip("/")
        items = list_items(base_url=base_url)
        return JSONResponse({"status": "success", "count": len(items), "items": items})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


async def post_item(request):
    """
    Creates a new Lost or Found item in SQLite and saves any uploaded photo
    to disk (`database/uploads/`) so all users across browsers/devices can view it.
    """
    global candidate_matrix, candidate_metadata
    try:
        base_url = str(request.base_url).rstrip("/")
        content_type = request.headers.get("content-type", "")

        image_bytes = None
        original_filename = None
        file_content_type = None

        if "multipart/form-data" in content_type:
            form = await request.form()
            item_data = {k: v for k, v in form.items() if k != "file"}
            uploaded_file = form.get("file")
            if uploaded_file and hasattr(uploaded_file, "read"):
                raw = await uploaded_file.read()
                if raw:
                    image_bytes = raw
                    original_filename = getattr(uploaded_file, "filename", None)
                    file_content_type = getattr(uploaded_file, "content_type", None)
        else:
            item_data = await request.json()

        saved_item = create_item(
            item_data=item_data,
            image_bytes=image_bytes,
            original_filename=original_filename,
            content_type=file_content_type,
            base_url=base_url,
        )

        # Dynamically append user-uploaded photo embedding to live MobileNetV2 vector memory
        if image_bytes and extractor is not None:
            try:
                vec = extractor.extract(image_bytes)
                if vec is not None:
                    vec_2d = vec.reshape(1, -1).astype(np.float32)
                    if candidate_matrix.shape[0] == 0:
                        candidate_matrix = vec_2d
                    else:
                        candidate_matrix = np.vstack([candidate_matrix, vec_2d])
                    photo_url = saved_item.get("userUploadedPhoto") or ""
                    candidate_metadata.append({
                        "item_id": saved_item["id"],
                        "filename": os.path.basename(photo_url),
                        "category": saved_item.get("category", "Other"),
                        "image_url": photo_url,
                    })
            except Exception as emb_err:
                print(f"[WARN] Could not index uploaded photo embedding: {emb_err}")

        return JSONResponse({"status": "success", "item": saved_item}, status_code=201)

    except ValueError as ve:
        return JSONResponse({"error": str(ve)}, status_code=400)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


async def patch_item(request):
    """Updates an item's recovery status ('Pending' | 'Recovered' | 'Closed')."""
    try:
        item_id = request.path_params["item_id"]
        data = await request.json()
        status = data.get("recoveryStatus")
        if status not in ("Pending", "Recovered", "Closed"):
            return JSONResponse({"error": "Invalid recoveryStatus value."}, status_code=400)

        base_url = str(request.base_url).rstrip("/")
        updated = update_item_status(item_id, status, base_url=base_url)
        if updated is None:
            return JSONResponse({"error": "Item not found."}, status_code=404)
        return JSONResponse({"status": "success", "item": updated})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


async def serve_uploaded_image(request):
    """Serves a user-uploaded item photo stored in `database/uploads/`."""
    filename = request.path_params["filename"]
    path = get_upload_path(filename)
    if not path:
        return JSONResponse({"error": "Uploaded image not found"}, status_code=404)

    lower = filename.lower()
    if lower.endswith(".png"):
        media_type = "image/png"
    elif lower.endswith(".webp"):
        media_type = "image/webp"
    elif lower.endswith(".gif"):
        media_type = "image/gif"
    else:
        media_type = "image/jpeg"
    return FileResponse(path, media_type=media_type)


async def auth_register(request):
    """Registers a new @gla.ac.in student account in SQLite."""
    try:
        data = await request.json()
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        roll_no = (data.get("rollNo") or "").strip()
        dept = (data.get("dept") or "CSE (AI & ML)").strip()

        if not name or not email or not email.endswith("@gla.ac.in") or len(password) < 6:
            return JSONResponse({"error": "Valid name, @gla.ac.in email, and password (>=6 chars) required."}, status_code=400)

        user = register_user(name, email, password, roll_no, dept)
        return JSONResponse({"status": "success", "user": user}, status_code=201)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


async def auth_login(request):
    """Authenticates a @gla.ac.in user against SQLite."""
    try:
        data = await request.json()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not email.endswith("@gla.ac.in") or len(password) < 6:
            return JSONResponse({"error": "Valid @gla.ac.in email and password (>=6 chars) required."}, status_code=400)

        user = authenticate_user(email, password)
        return JSONResponse({"status": "success", "user": user})
    except PermissionError as pe:
        return JSONResponse({"error": str(pe)}, status_code=401)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


# Routes
routes = [
    Route("/", root_index, methods=["GET"]),
    Route("/api/health", health, methods=["GET"]),
    Route("/api/items", get_items, methods=["GET"]),
    Route("/api/items", post_item, methods=["POST"]),
    Route("/api/items/{item_id}", patch_item, methods=["PATCH"]),
    Route("/api/uploads/{filename}", serve_uploaded_image, methods=["GET"]),
    Route("/api/auth/register", auth_register, methods=["POST"]),
    Route("/api/auth/login", auth_login, methods=["POST"]),
    Route("/api/catalog/image/{filename}", get_catalog_image, methods=["GET"]),
    Route("/api/catalog/sample", sample_catalog, methods=["GET"]),
    Route("/api/match-image", match_image, methods=["POST"]),
    Route("/api/match-text", match_text, methods=["POST", "GET"]),
    Route("/api/predict-status", predict_status, methods=["POST", "GET"]),
]

# CORS Middleware
middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
]

app = Starlette(routes=routes, middleware=middleware)

# Load resources upon module load
load_resources()


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

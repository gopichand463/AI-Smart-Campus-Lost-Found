"""
Text Similarity Matching Runner
-------------------------------
CLI tool for finding matching found items from a lost item text description.
Uses the trained hybrid TF-IDF + Neural Word2Vec engine.
"""

import os
import sys
import time
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from text_matching.tfidf_model import CampusTFIDFMatcher
from text_matching.word2vec_model import CampusWord2Vec
from text_matching.matcher import TextMatcher


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    models_dir = os.path.join(BASE_DIR, "models")
    tfidf_path = os.path.join(models_dir, "tfidf_vectorizer.joblib")
    w2v_dir = os.path.join(models_dir, "word2vec")
    catalog_path = os.path.join(models_dir, "found_text_catalog.joblib")

    print("=" * 65)
    print("  Smart Campus Lost & Found - Text Similarity Search")
    print("=" * 65)

    if not os.path.exists(tfidf_path) or not os.path.exists(catalog_path):
        print("[!] Models not found. Run `python ml-service/train_text_models.py` first.")
        return

    # Load artifacts
    print("[*] Loading trained TF-IDF model...")
    tfidf = CampusTFIDFMatcher()
    tfidf.load(tfidf_path)

    print("[*] Loading trained Neural Word2Vec model...")
    w2v = CampusWord2Vec()
    w2v.load(w2v_dir)

    print("[*] Loading catalog of 5,000 found item records...")
    catalog_data = joblib.load(catalog_path)
    catalog_tfidf = catalog_data["tfidf_matrix"]
    catalog_w2v = catalog_data["w2v_matrix"]
    metadata = catalog_data["metadata"]

    matcher = TextMatcher(tfidf_matcher=tfidf, word2vec_model=w2v)

    query = sys.argv[1] if len(sys.argv) > 1 else "Blue water bottle left behind after class at Library"
    category = sys.argv[2] if len(sys.argv) > 2 else None

    print(f"\n[?] Query: \"{query}\"")
    if category:
        print(f"[*] Category Filter: {category}")

    t0 = time.time()
    matches = matcher.match(
        query_text=query,
        catalog_tfidf_matrix=catalog_tfidf,
        catalog_w2v_matrix=catalog_w2v,
        catalog_metadata=metadata,
        top_k=5,
        filter_category=category
    )
    search_time_ms = (time.time() - t0) * 1000
    print(f"[*] Searched 5,000 found items in {search_time_ms:.2f}ms!\n")

    print("=" * 65)
    print("  Top Matching Found Items (Ranked by AI NLP Engine)")
    print("=" * 65)
    for m in matches:
        tag = "[MATCH CANDIDATE]" if m["is_candidate"] else "[LOW CONFIDENCE]"
        print(f"  #{m['rank']}: {m['item_name']} ({m['category']}) - {m['confidence_percent']}% Match {tag}")
        print(f"      Location: {m['location']}")
        print(f"      Description: \"{m['description']}\"")
        print()


if __name__ == "__main__":
    main()


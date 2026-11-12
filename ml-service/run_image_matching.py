"""
Image Matching Runner
---------------------
Demonstration script for comparing lost and found item images using
preprocessed visual embeddings (MobileNetV2 backbone).
Supports ultra-fast retrieval using cached catalog index (`catalog_index.npz`).
"""

import os
import sys
import time
import glob
import numpy as np

# Ensure ml-service root is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from image_matching.embedder import ImageEmbeddingExtractor
from image_matching.matcher import ImageMatcher


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    print("=" * 65)
    print("  Smart Campus Lost & Found - Fast Visual Retrieval Engine")
    print("=" * 65)

    data_dir = os.path.join(os.path.dirname(BASE_DIR), "data", "images")
    test_dir = os.path.join(data_dir, "test", "images")
    index_file = os.path.join(BASE_DIR, "models", "catalog_index.npz")

    # 1. Initialize Extractor & Matcher
    print("\n[*] Initializing Pre-trained MobileNetV2 Feature Extractor...")
    extractor = ImageEmbeddingExtractor(model_name="mobilenet_v2")
    matcher = ImageMatcher(threshold=0.70)

    # 2. Load or verify gallery
    if os.path.exists(index_file):
        print(f"[*] Loading precomputed catalog vector index from: {os.path.basename(index_file)}")
        data = np.load(index_file)
        candidate_matrix = data["embeddings"]
        filenames = data["filenames"].tolist()
        categories = data["categories"].tolist()
        metadata = [{"filename": fn, "category": cat} for fn, cat in zip(filenames, categories)]
        print(f"[OK] Loaded {candidate_matrix.shape[0]:,} indexed catalog items in vector space.")
    else:
        print("[!] Catalog index not found. Please run `python ml-service/index_catalog.py` first.")
        return

    # 3. Pick a query image (simulating a newly reported Lost Item)
    test_images = sorted(glob.glob(os.path.join(test_dir, "*.jpg")) + glob.glob(os.path.join(test_dir, "*.png")))
    if not test_images:
        print("[!] No query images found in test/images.")
        return

    query_image = test_images[0]
    query_name = os.path.basename(query_image)
    print(f"\n[?] Query Item (Lost Report Photo): {query_name}")

    t0 = time.time()
    query_vec = extractor.extract(query_image)
    extract_time = (time.time() - t0) * 1000
    print(f"[*] Query embedding extracted in {extract_time:.1f}ms (Vector dim: {len(query_vec)})")

    # 4. Fast Vectorized Matrix Dot-Product Retrieval
    t_search = time.time()
    top_matches = matcher.find_top_matches_matrix(query_vec, candidate_matrix, metadata, top_k=5)
    search_time = (time.time() - t_search) * 1000
    print(f"[*] Searched across {len(candidate_matrix)} catalog items in {search_time:.3f}ms!")

    # 5. Display results
    print("\n" + "=" * 65)
    print(f"  Top Candidate Matches Found for: {query_name}")
    print("=" * 65)
    for res in top_matches:
        status = "[MATCH CANDIDATE]" if res["is_candidate"] else "[LOW CONFIDENCE]"
        print(f"  #{res['rank']}: {res['filename']} (Category: {res['category']})")
        print(f"      Similarity Score: {res['similarity_score']:.4f} ({res['confidence_percent']}%) {status}")

    print("\n[OK] Fast image matching pipeline executed successfully!")


if __name__ == "__main__":
    main()

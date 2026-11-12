"""
Image Matching Benchmark & Evaluation Script
--------------------------------------------
Evaluates retrieval accuracy of the MobileNetV2 image similarity pipeline
on the held-out test dataset (`data/images/test/`).

Metrics evaluated:
- Top-1 Accuracy: % of queries where the #1 match is in the same category
- Top-3 Accuracy: % of queries where at least one of top-3 matches is in the same category
- Top-5 Accuracy: % of queries where at least one of top-5 matches is in the same category
- Mean Reciprocal Rank (MRR)
- Average Retrieval Latency (ms)
"""

import os
import sys
import time
import glob
import argparse
import numpy as np
from collections import defaultdict

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from image_matching.embedder import ImageEmbeddingExtractor
from image_matching.matcher import ImageMatcher

CLASS_NAMES = ['Bottle', 'Calculator', 'Charger', 'Key', 'None', 'Umbrella']


def infer_label(img_path: str, labels_dir: str) -> str:
    base = os.path.splitext(os.path.basename(img_path))[0]
    l_path = os.path.join(labels_dir, f"{base}.txt")
    if os.path.exists(l_path):
        try:
            with open(l_path, "r", encoding="utf-8") as f:
                line = f.readline().strip()
                if line:
                    cid = int(line.split()[0])
                    if 0 <= cid < len(CLASS_NAMES):
                        return CLASS_NAMES[cid]
        except Exception:
            pass
    return "Unknown"


def run_benchmark(sample_size: int = 100):
    print("=" * 65)
    print("  Smart Campus Lost & Found - Image Retrieval Benchmark")
    print("=" * 65)

    index_path = os.path.join(BASE_DIR, "models", "catalog_index.npz")
    if not os.path.exists(index_path):
        print("[!] Catalog index not found. Please run index_catalog.py first.")
        return

    # 1. Load catalog index
    data = np.load(index_path)
    candidate_matrix = data["embeddings"]
    filenames = data["filenames"].tolist()
    categories = data["categories"].tolist()
    metadata = [{"filename": fn, "category": cat} for fn, cat in zip(filenames, categories)]
    print(f"[*] Loaded catalog gallery: {len(metadata):,} items across categories: {set(categories)}")

    # 2. Gather test images
    project_root = os.path.dirname(BASE_DIR)
    test_img_dir = os.path.join(project_root, "data", "images", "test", "images")
    test_lbl_dir = os.path.join(project_root, "data", "images", "test", "labels")

    all_test_imgs = glob.glob(os.path.join(test_img_dir, "*.jpg")) + glob.glob(os.path.join(test_img_dir, "*.png"))
    print(f"[*] Found {len(all_test_imgs):,} available test images.")

    # Sample balanced queries from each category
    by_cat = defaultdict(list)
    for p in all_test_imgs:
        lbl = infer_label(p, test_lbl_dir)
        if lbl in CLASS_NAMES and lbl != 'None':
            by_cat[lbl].append(p)

    selected_queries = []
    per_cat = max(1, sample_size // max(1, len(by_cat)))
    for cat, items in by_cat.items():
        for p in items[:per_cat]:
            selected_queries.append((p, cat))

    print(f"[*] Evaluating {len(selected_queries)} balanced test query items ({per_cat} per class)...")

    # 3. Initialize Extractor & Matcher
    extractor = ImageEmbeddingExtractor(model_name="mobilenet_v2")
    matcher = ImageMatcher(threshold=0.50)

    top1_correct = 0
    top3_correct = 0
    top5_correct = 0
    reciprocal_ranks = []
    latencies = []

    print("\n[*] Running retrieval evaluations...")
    for idx, (img_path, true_cat) in enumerate(selected_queries, start=1):
        t0 = time.time()
        q_vec = extractor.extract(img_path)
        matches = matcher.find_top_matches_matrix(q_vec, candidate_matrix, metadata, top_k=5)
        latency = (time.time() - t0) * 1000
        latencies.append(latency)

        retrieved_cats = [m["category"] for m in matches]

        # Top-1 Check
        if retrieved_cats and retrieved_cats[0].lower() == true_cat.lower():
            top1_correct += 1

        # Top-3 Check
        if any(c.lower() == true_cat.lower() for c in retrieved_cats[:3]):
            top3_correct += 1

        # Top-5 Check
        if any(c.lower() == true_cat.lower() for c in retrieved_cats[:5]):
            top5_correct += 1

        # MRR calculation
        rr = 0.0
        for rank, c in enumerate(retrieved_cats, start=1):
            if c.lower() == true_cat.lower():
                rr = 1.0 / rank
                break
        reciprocal_ranks.append(rr)

        if idx % 25 == 0 or idx == len(selected_queries):
            print(f"  Tested [{idx}/{len(selected_queries)}] queries - Current Top-1: {top1_correct/idx*100:.1f}% | Top-3: {top3_correct/idx*100:.1f}%")

    total = len(selected_queries)
    top1_acc = (top1_correct / total) * 100
    top3_acc = (top3_correct / total) * 100
    top5_acc = (top5_correct / total) * 100
    mrr = np.mean(reciprocal_ranks)
    avg_latency = np.mean(latencies)

    print("\n" + "=" * 65)
    print("  🏆 FINAL RETRIEVAL BENCHMARK RESULTS")
    print("=" * 65)
    print(f"  • Total Test Queries Evaluated: {total}")
    print(f"  • Top-1 Retrieval Accuracy:      {top1_acc:.2f}%")
    print(f"  • Top-3 Retrieval Accuracy:      {top3_acc:.2f}%")
    print(f"  • Top-5 Retrieval Accuracy:      {top5_acc:.2f}%")
    print(f"  • Mean Reciprocal Rank (MRR):    {mrr:.4f}")
    print(f"  • Average End-to-End Latency:    {avg_latency:.1f} ms / query")
    print("=" * 65)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Image Matching Benchmark")
    parser.add_argument("--samples", type=int, default=100, help="Total sample queries to benchmark")
    args = parser.parse_args()

    run_benchmark(sample_size=args.samples)


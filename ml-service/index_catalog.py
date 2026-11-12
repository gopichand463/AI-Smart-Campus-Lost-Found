"""
Catalog Vector Indexer (Balanced Multi-Class Version)
-----------------------------------------------------
Precomputes and caches MobileNetV2 embedding vectors across all campus item classes:
- Bottle
- Calculator
- Charger
- Key
- Umbrella

Ensures balanced representation so every category has catalog candidates.
"""

import os
import sys
import time
import glob
import argparse
import random
import numpy as np
from collections import defaultdict

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from image_matching.embedder import ImageEmbeddingExtractor

CLASS_NAMES = ['Bottle', 'Calculator', 'Charger', 'Key', 'None', 'Umbrella']


def infer_category(image_path: str, labels_dir: str) -> str:
    """Infers category from YOLO label file or filename."""
    base_name = os.path.splitext(os.path.basename(image_path))[0]
    label_path = os.path.join(labels_dir, f"{base_name}.txt")

    if os.path.exists(label_path):
        try:
            with open(label_path, "r", encoding="utf-8") as f:
                first_line = f.readline().strip()
                if first_line:
                    class_id = int(first_line.split()[0])
                    if 0 <= class_id < len(CLASS_NAMES):
                        return CLASS_NAMES[class_id]
        except Exception:
            pass

    # Fallback to filename keywords
    lower_name = base_name.lower()
    for cat in CLASS_NAMES:
        if cat.lower() in lower_name:
            return cat
    return "Campus Item"


def build_catalog_index(per_class_limit: int = 150, model_name: str = "mobilenet_v2"):
    project_root = os.path.dirname(BASE_DIR)
    images_dir = os.path.join(project_root, "data", "images", "train", "images")
    labels_dir = os.path.join(project_root, "data", "images", "train", "labels")
    output_dir = os.path.join(BASE_DIR, "models")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "catalog_index.npz")

    print("=" * 65)
    print("  Smart Campus Lost & Found - Balanced Catalog Indexer")
    print("=" * 65)
    print(f"[*] Scanning images directory: {images_dir}")

    all_images = glob.glob(os.path.join(images_dir, "*.jpg")) + glob.glob(os.path.join(images_dir, "*.png"))
    if not all_images:
        print("[!] No images found in train/images.")
        return

    print(f"[*] Total raw images found: {len(all_images):,}")
    print(f"[*] Grouping images into balanced class buckets...")

    images_by_class = defaultdict(list)
    for img_path in all_images:
        cat = infer_category(img_path, labels_dir)
        if cat != 'None':
            images_by_class[cat].append(img_path)

    for cat, items in images_by_class.items():
        print(f"    - {cat}: {len(items):,} available images")

    selected_images_with_cat = []
    for cat, items in images_by_class.items():
        # Deterministic sample for reproducibility
        items.sort()
        count = min(per_class_limit, len(items)) if per_class_limit > 0 else len(items)
        for img in items[:count]:
            selected_images_with_cat.append((img, cat))

    # Shuffle to interleave classes
    random.seed(42)
    random.shuffle(selected_images_with_cat)

    total = len(selected_images_with_cat)
    print(f"\n[*] Total images selected for indexing: {total:,} ({per_class_limit} per class)")

    # Initialize Extractor
    extractor = ImageEmbeddingExtractor(model_name=model_name)

    embeddings = []
    filenames = []
    categories = []

    t0 = time.time()
    for idx, (img_path, cat) in enumerate(selected_images_with_cat, start=1):
        try:
            emb = extractor.extract(img_path)
            embeddings.append(emb)
            filenames.append(os.path.basename(img_path))
            categories.append(cat)

            if idx % 50 == 0 or idx == total:
                elapsed = time.time() - t0
                rate = idx / elapsed
                print(f"  Processed [{idx}/{total}] ({idx/total*100:.1f}%) - {rate:.1f} imgs/sec")
        except Exception as e:
            print(f"  [!] Skipped {os.path.basename(img_path)}: {e}")

    embeddings_matrix = np.array(embeddings, dtype=np.float32)

    # Save to compressed npz file
    np.savez_compressed(
        output_path,
        embeddings=embeddings_matrix,
        filenames=np.array(filenames),
        categories=np.array(categories),
        model_name=model_name,
        created_at=time.time()
    )

    total_time = time.time() - t0
    print("\n" + "=" * 65)
    print(f"[OK] Successfully built balanced catalog vector index!")
    print(f"  - Saved to: {output_path}")
    print(f"  - Matrix shape: {embeddings_matrix.shape} (Float32)")
    print(f"  - Indexed items: {len(filenames):,}")
    print(f"  - Total indexing time: {total_time:.2f}s ({total_time/len(filenames)*1000:.1f}ms/image)")
    print("=" * 65)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build Balanced Catalog Vector Index")
    parser.add_argument("--per-class", type=int, default=150, help="Images per class (default: 150)")
    parser.add_argument("--model", type=str, default="mobilenet_v2", help="Model backbone")
    args = parser.parse_args()

    build_catalog_index(per_class_limit=args.per_class, model_name=args.model)

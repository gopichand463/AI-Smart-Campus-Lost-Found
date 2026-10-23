"""
Image Matching Runner
---------------------
Demonstration script for comparing lost and found item images using
preprocessed visual embeddings (MobileNetV2 backbone).
"""

import os
import sys
import time
import glob

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
    print("  Smart Campus Lost & Found - Image Retrieval & Matching")
    print("=" * 65)

    data_dir = os.path.join(os.path.dirname(BASE_DIR), "data", "images")
    train_dir = os.path.join(data_dir, "train", "images")
    test_dir = os.path.join(data_dir, "test", "images")

    # 1. Initialize Extractor & Matcher
    print("\n[*] Initializing Pre-trained MobileNetV2 Feature Extractor...")
    extractor = ImageEmbeddingExtractor(model_name="mobilenet_v2")
    matcher = ImageMatcher(threshold=0.70)

    # 2. Gather images
    test_images = sorted(glob.glob(os.path.join(test_dir, "*.jpg")) + glob.glob(os.path.join(test_dir, "*.png")))
    train_images = sorted(glob.glob(os.path.join(train_dir, "*.jpg")) + glob.glob(os.path.join(train_dir, "*.png")))

    if not test_images or not train_images:
        print("\n[!] Dataset images not found in train/images or test/images.")
        return

    print(f"[*] Found {len(train_images):,} Catalog (Found) items.")
    print(f"[*] Found {len(test_images):,} Test (Lost) items.")

    # 3. Pick a query image (simulating a newly reported Lost Item)
    query_image = test_images[0]
    query_name = os.path.basename(query_image)
    print(f"\n[?] Query Item (Lost Report): {query_name}")

    t0 = time.time()
    query_vec = extractor.extract_from_path(query_image)
    extract_time = (time.time() - t0) * 1000
    print(f"[*] Feature embedding extracted in {extract_time:.1f}ms (Dimension: {len(query_vec)})")

    # 4. Search across gallery candidate items (first 50 for quick demo)
    gallery_sample = train_images[:50]
    print(f"[*] Comparing against {len(gallery_sample)} candidate catalog images...")

    candidate_vectors = []
    t_gallery = time.time()
    for img_path in gallery_sample:
        vec = extractor.extract_from_path(img_path)
        candidate_vectors.append((os.path.basename(img_path), vec))
    gallery_time = time.time() - t_gallery
    print(f"[*] Catalog embeddings generated in {gallery_time:.2f}s ({gallery_time/len(gallery_sample)*1000:.1f}ms/image)")

    # 5. Compute similarities and rank top matches
    top_matches = matcher.find_top_matches(query_vec, candidate_vectors, top_k=3)

    print("\n" + "=" * 65)
    print("  Top Candidate Matches Found")
    print("=" * 65)
    for rank, res in enumerate(top_matches, start=1):
        status = "[MATCH CANDIDATE]" if res["is_candidate"] else "[LOW CONFIDENCE]"
        print(f"  #{rank}: {res['item']}")
        print(f"      Similarity Score: {res['similarity_score']:.4f} ({res['confidence_percent']}%) {status}")

    print("\n[OK] Image matching pipeline executed successfully!")


if __name__ == "__main__":
    main()

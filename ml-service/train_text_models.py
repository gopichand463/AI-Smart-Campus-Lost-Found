"""
Train Text Similarity Models on 120,000 Campus Records
------------------------------------------------------
1. Loads `data/smart_campus_dataset_120k.csv`.
2. Fits Scikit-learn TF-IDF Vectorizer with unigrams + bigrams.
3. Trains Custom PyTorch Word2Vec (CBOW) Neural Network from scratch.
4. Precomputes text matrices for found items catalog and saves model artifacts.
"""

import os
import sys
import time
import joblib
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from text_matching.tfidf_model import CampusTFIDFMatcher
from text_matching.word2vec_model import CampusWord2Vec
from text_matching.matcher import TextMatcher


def main():
    print("=" * 70)
    print("  Smart Campus Lost & Found - Training NLP Text Similarity Models")
    print("=" * 70)

    project_root = os.path.dirname(BASE_DIR)
    dataset_path = os.path.join(project_root, "data", "smart_campus_dataset_120k.csv")
    models_dir = os.path.join(BASE_DIR, "models")
    os.makedirs(models_dir, exist_ok=True)

    # 1. Load Dataset
    print(f"\n[*] Loading 120,000 records from: {os.path.basename(dataset_path)}...")
    t0 = time.time()
    df = pd.read_csv(dataset_path)
    print(f"[OK] Loaded {len(df):,} records in {time.time() - t0:.2f}s.")

    descriptions = df['description'].dropna().astype(str).tolist()
    print(f"[*] Total valid descriptions: {len(descriptions):,}")

    # 2. Fit TF-IDF Vectorizer
    print("\n" + "-" * 70)
    print("  STEP 1: Fitting TF-IDF Statistical Vectorizer (120,000 Descriptions)")
    print("-" * 70)
    tfidf = CampusTFIDFMatcher(ngram_range=(1, 2), max_features=20000)
    t_tfidf = time.time()
    tfidf.fit(descriptions)
    print(f"[OK] TF-IDF fitted in {time.time() - t_tfidf:.2f}s. Vocabulary size: {len(tfidf.vectorizer.vocabulary_):,} tokens.")

    tfidf_path = os.path.join(models_dir, "tfidf_vectorizer.joblib")
    tfidf.save(tfidf_path)

    # 3. Train PyTorch Word2Vec Neural Embedder
    print("\n" + "-" * 70)
    print("  STEP 2: Training Custom PyTorch Word2Vec (CBOW) from Scratch")
    print("-" * 70)
    w2v = CampusWord2Vec(embedding_dim=64, context_size=2, min_count=3)
    # Train on a representative sample of 25,000 descriptions for fast training
    sample_size = 25000
    print(f"[*] Training neural embeddings on {sample_size:,} campus descriptions...")
    train_sample = descriptions[:sample_size]

    t_w2v = time.time()
    w2v.train(train_sample, epochs=3, batch_size=256, lr=0.015)
    print(f"[OK] Word2Vec neural network trained in {time.time() - t_w2v:.2f}s.")

    w2v_dir = os.path.join(models_dir, "word2vec")
    w2v.save(w2v_dir)

    # 4. Build Found Items Catalog Search Index
    print("\n" + "-" * 70)
    print("  STEP 3: Indexing Found Item Descriptions for Instant Search")
    print("-" * 70)
    # Extract found records
    found_df = df[df['item_type'].str.lower() == 'found'].head(5000).copy()
    print(f"[*] Indexing {len(found_df):,} candidate Found items...")

    found_descriptions = found_df['description'].tolist()
    found_metadata = found_df[['record_id', 'item_name', 'category', 'location', 'description']].to_dict('records')

    # Compute TF-IDF sparse matrix
    t_idx = time.time()
    catalog_tfidf_matrix = tfidf.transform(found_descriptions)

    # Compute Word2Vec dense matrix
    catalog_w2v_matrix = np.array([w2v.embed_sentence(d) for d in found_descriptions], dtype=np.float32)

    catalog_path = os.path.join(models_dir, "found_text_catalog.joblib")
    joblib.dump({
        "tfidf_matrix": catalog_tfidf_matrix,
        "w2v_matrix": catalog_w2v_matrix,
        "metadata": found_metadata
    }, catalog_path)
    print(f"[OK] Indexed and saved {len(found_metadata):,} found item records to: {os.path.basename(catalog_path)} in {time.time() - t_idx:.2f}s.")

    # 5. Demonstration Queries
    print("\n" + "=" * 70)
    print("  VERIFICATION: Testing Sample Lost Queries Against Found Catalog")
    print("=" * 70)

    matcher = TextMatcher(tfidf_matcher=tfidf, word2vec_model=w2v)

    sample_queries = [
        ("Casio fx-991 Calculator left behind after class at Convocation Hall", "Calculator"),
        ("White Nike Football lost near Hostel block playground", "Sports Equipment"),
        ("Purple Puma Basketball left on a table at Central Library", "Sports Equipment"),
    ]

    for query, cat in sample_queries:
        print(f"\n[?] Query: \"{query}\" (Category: {cat})")
        results = matcher.match(
            query_text=query,
            catalog_tfidf_matrix=catalog_tfidf_matrix,
            catalog_w2v_matrix=catalog_w2v_matrix,
            catalog_metadata=found_metadata,
            top_k=2,
            filter_category=None
        )

        for r in results:
            print(f"    #{r['rank']}: [{r['confidence_percent']}% Match] {r['item_name']} at {r['location']}")
            print(f"         \"{r['description']}\"")

    total_time = time.time() - t0
    print("\n" + "=" * 70)
    print(f"[OK] All NLP models successfully trained and verified in {total_time:.2f}s!")
    print("=" * 70)


if __name__ == "__main__":
    main()

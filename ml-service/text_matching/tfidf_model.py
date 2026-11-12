"""
TF-IDF Text Similarity Model
----------------------------
Implements statistical text vectorization using Scikit-Learn TF-IDF.
Fits on campus lost & found description corpus and calculates cosine similarities.
"""

import os
import joblib
import numpy as np
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from text_matching.preprocessor import clean_text


class CampusTFIDFMatcher:
    def __init__(self, ngram_range=(1, 2), max_features: int = 15000, threshold: float = 0.25):
        """
        Initializes the TF-IDF Vectorizer.
        
        Args:
            ngram_range: (1, 2) captures unigrams and bigrams (e.g. 'water bottle', 'casio fx').
            max_features: Maximum vocabulary size.
            threshold: Minimum cosine similarity score for candidate acceptance.
        """
        self.threshold = threshold
        self.vectorizer = TfidfVectorizer(
            ngram_range=ngram_range,
            max_features=max_features,
            sublinear_tf=True,
            strip_accents='unicode'
        )
        self.is_fitted = False

    def fit(self, descriptions: List[str]):
        """Fits the TF-IDF vocabulary on the training corpus of descriptions."""
        cleaned_docs = [clean_text(d, remove_stopwords=False) for d in descriptions]
        self.vectorizer.fit(cleaned_docs)
        self.is_fitted = True
        return self

    def transform(self, texts: List[str]):
        """Transforms text descriptions into sparse TF-IDF vectors."""
        if not self.is_fitted:
            raise RuntimeError("TF-IDF Vectorizer is not fitted yet. Call fit() or load().")
        cleaned_docs = [clean_text(t, remove_stopwords=False) for t in texts]
        return self.vectorizer.transform(cleaned_docs)

    def save(self, filepath: str):
        """Saves the fitted TF-IDF model artifact."""
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        joblib.dump(self.vectorizer, filepath)
        print(f"[OK] Saved fitted TF-IDF model to: {filepath}")

    def load(self, filepath: str):
        """Loads a pre-fitted TF-IDF model artifact."""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file not found at: {filepath}")
        self.vectorizer = joblib.load(filepath)
        self.is_fitted = True
        print(f"[OK] Loaded TF-IDF model from: {filepath} (Vocab size: {len(self.vectorizer.vocabulary_):,})")
        return self

    def match(
        self,
        query_text: str,
        catalog_matrix: Any,
        catalog_metadata: List[Dict[str, Any]],
        top_k: int = 5,
        threshold: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Computes cosine similarity between a single query description and
        precomputed catalog TF-IDF vectors.

        Returns:
            List of top-k match dictionaries ranked by similarity score descending.
        """
        if not self.is_fitted:
            raise RuntimeError("TF-IDF Vectorizer is not fitted.")

        active_thresh = self.threshold if threshold is None else threshold

        # Transform query
        query_vec = self.transform([query_text])

        # Compute cosine similarity
        scores = cosine_similarity(query_vec, catalog_matrix).flatten()

        # Rank top-k
        k = min(top_k, len(scores))
        top_indices = np.argsort(scores)[::-1][:k]

        results = []
        for rank_idx, idx in enumerate(top_indices, start=1):
            score = float(scores[idx])
            confidence_pct = round(max(0.0, score) * 100, 2)
            meta = catalog_metadata[idx] if idx < len(catalog_metadata) else {}

            results.append({
                "rank": rank_idx,
                "item_id": meta.get("record_id", str(idx)),
                "item_name": meta.get("item_name", "Unknown Item"),
                "category": meta.get("category", "Unknown"),
                "description": meta.get("description", ""),
                "location": meta.get("location", ""),
                "similarity_score": round(score, 4),
                "confidence_percent": confidence_pct,
                "is_candidate": score >= active_thresh,
                "metadata": meta
            })

        return results


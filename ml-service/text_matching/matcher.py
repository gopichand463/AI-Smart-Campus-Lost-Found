"""
Unified Text Matcher Engine
---------------------------
Combines statistical TF-IDF keyword matching with deep semantic Word2Vec embeddings.
Provides hybrid scoring, category filtering, and confidence percentage ranking.
"""

import numpy as np
from typing import List, Dict, Any, Optional
from text_matching.tfidf_model import CampusTFIDFMatcher
from text_matching.word2vec_model import CampusWord2Vec


class TextMatcher:
    def __init__(self, tfidf_matcher: Optional[CampusTFIDFMatcher] = None, word2vec_model: Optional[CampusWord2Vec] = None):
        self.tfidf = tfidf_matcher
        self.w2v = word2vec_model

    def match(
        self,
        query_text: str,
        catalog_tfidf_matrix: Any,
        catalog_w2v_matrix: Optional[np.ndarray],
        catalog_metadata: List[Dict[str, Any]],
        top_k: int = 5,
        threshold: float = 0.20,
        alpha: float = 0.60,
        filter_category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Computes hybrid text similarity:
        score = alpha * tfidf_score + (1 - alpha) * w2v_score

        Args:
            query_text: User's reported lost item description.
            catalog_tfidf_matrix: Precomputed sparse TF-IDF matrix of catalog descriptions.
            catalog_w2v_matrix: Precomputed dense matrix of catalog neural embeddings.
            catalog_metadata: List of item metadata dicts.
            top_k: Max matches to return.
            threshold: Minimum score.
            alpha: Weight for TF-IDF (default: 0.60).
            filter_category: Optional category filter.
        """
        if self.tfidf is None or not self.tfidf.is_fitted:
            raise RuntimeError("TF-IDF model is required and must be fitted.")

        # Filter by category if requested
        valid_indices = list(range(len(catalog_metadata)))
        if filter_category and filter_category.lower() not in ["all", "other", ""]:
            matched = [
                i for i, m in enumerate(catalog_metadata)
                if m.get("category", "").lower() == filter_category.lower()
            ]
            if matched:
                valid_indices = matched

        sub_metadata = [catalog_metadata[i] for i in valid_indices]
        sub_tfidf = catalog_tfidf_matrix[valid_indices]

        # 1. TF-IDF Cosine Similarity
        query_tfidf = self.tfidf.transform([query_text])
        from sklearn.metrics.pairwise import cosine_similarity
        tfidf_scores = cosine_similarity(query_tfidf, sub_tfidf).flatten()

        # 2. Neural Word2Vec Cosine Similarity (if matrix provided)
        if self.w2v is not None and catalog_w2v_matrix is not None and len(catalog_w2v_matrix) > 0:
            sub_w2v = catalog_w2v_matrix[valid_indices]
            query_w2v = self.w2v.embed_sentence(query_text)
            w2v_scores = np.dot(sub_w2v, query_w2v)
            # Combine scores
            combined_scores = (alpha * tfidf_scores) + ((1.0 - alpha) * w2v_scores)
        else:
            combined_scores = tfidf_scores

        k = min(top_k, len(combined_scores))
        top_indices = np.argsort(combined_scores)[::-1][:k]

        results = []
        for rank_idx, idx in enumerate(top_indices, start=1):
            score = float(combined_scores[idx])
            meta = sub_metadata[idx]
            confidence_pct = round(max(0.0, score) * 100, 2)

            results.append({
                "rank": rank_idx,
                "item_id": meta.get("record_id", str(idx)),
                "item_name": meta.get("item_name", "Unknown Item"),
                "category": meta.get("category", "Unknown"),
                "description": meta.get("description", ""),
                "location": meta.get("location", ""),
                "similarity_score": round(score, 4),
                "confidence_percent": confidence_pct,
                "is_candidate": score >= threshold,
                "metadata": meta
            })

        return results


"""
Image Matcher & Retrieval Engine
--------------------------------
Computes cosine similarity between query lost items and catalog of
found items, returning ranked candidates with confidence scores.
Supports both single-tuple iteration and fast vectorized matrix retrieval.
"""

import numpy as np
from typing import List, Dict, Any, Tuple, Optional


class ImageMatcher:
    def __init__(self, threshold: float = 0.50):
        """
        Args:
            threshold: Minimum cosine similarity score (0.0 to 1.0) to qualify as a candidate match.
        """
        self.threshold = threshold

    @staticmethod
    def cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
        """
        Calculates cosine similarity between two unit-normalized vectors.
        Since vectors are already L2 normalized, similarity is the dot product.
        """
        return float(np.dot(vec_a, vec_b))

    def find_top_matches(
        self,
        query_embedding: np.ndarray,
        candidate_embeddings: List[Tuple[Any, np.ndarray]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Compares query embedding against a list of candidate tuples (item_info, vector).
        """
        results = []
        for item_info, emb in candidate_embeddings:
            score = self.cosine_similarity(query_embedding, emb)
            confidence_pct = round(max(0.0, score) * 100, 2)
            is_match = score >= self.threshold

            results.append({
                "item": item_info,
                "similarity_score": round(score, 4),
                "confidence_percent": confidence_pct,
                "is_candidate": is_match
            })

        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:top_k]

    def find_top_matches_matrix(
        self,
        query_embedding: np.ndarray,
        candidate_matrix: np.ndarray,
        candidate_metadata: List[Dict[str, Any]],
        top_k: int = 5,
        threshold: Optional[float] = None,
        filter_category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Fast vectorized matrix retrieval with optional category filtering.
        Computes dot products simultaneously using BLAS matrix-vector product.

        Args:
            query_embedding: (D,) unit-normalized query vector.
            candidate_matrix: (N, D) float32 matrix of candidate embeddings.
            candidate_metadata: List of length N with metadata dicts per item.
            top_k: Number of highest ranking matches to return.
            threshold: Optional override for minimum match threshold.
            filter_category: Optional category name to restrict or prioritize search.

        Returns:
            List of match dictionaries sorted by confidence descending.
        """
        if candidate_matrix.size == 0 or len(candidate_metadata) == 0:
            return []

        active_thresh = self.threshold if threshold is None else threshold

        # Apply category filter if specified
        matrix = candidate_matrix
        meta_list = candidate_metadata

        if filter_category and filter_category.lower() not in ["all", "other", ""]:
            matched_indices = [
                i for i, m in enumerate(candidate_metadata)
                if m.get("category", "").lower() == filter_category.lower()
            ]
            if len(matched_indices) > 0:
                matrix = candidate_matrix[matched_indices]
                meta_list = [candidate_metadata[i] for i in matched_indices]

        # Vectorized dot product for all candidates in parallel
        scores = np.dot(matrix, query_embedding)

        # Get top-k indices
        k = min(top_k, len(scores))
        top_indices = np.argsort(scores)[::-1][:k]

        results = []
        for rank_idx, idx in enumerate(top_indices, start=1):
            score = float(scores[idx])
            confidence_pct = round(max(0.0, score) * 100, 2)
            meta = meta_list[idx]

            results.append({
                "rank": rank_idx,
                "item_id": meta.get("item_id", meta.get("filename", str(idx))),
                "filename": meta.get("filename", ""),
                "category": meta.get("category", "Unknown"),
                "similarity_score": round(score, 4),
                "confidence_percent": confidence_pct,
                "is_candidate": score >= active_thresh,
                "metadata": meta
            })

        return results

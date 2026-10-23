"""
Image Matcher & Retrieval Engine
--------------------------------
Computes cosine similarity between query lost items and database of
found items, returning ranked candidates with confidence scores.
"""

import numpy as np
from typing import List, Dict, Any, Tuple


class ImageMatcher:
    def __init__(self, threshold: float = 0.70):
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
        Compares query embedding against a list of candidates.

        Args:
            query_embedding: L2 normalized vector of the query (e.g. Lost item).
            candidate_embeddings: List of tuples (item_id_or_metadata, embedding_vector).
            top_k: Number of highest ranking matches to return.

        Returns:
            List of match dictionaries sorted by confidence descending.
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

        # Sort descending by similarity score
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:top_k]

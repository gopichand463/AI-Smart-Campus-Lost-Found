"""
Smart Campus Lost & Found - Text Matching & NLP Module
------------------------------------------------------
Complies with SRS Section 1 (Text Similarity-Based Matching).
Provides text preprocessing, TF-IDF vectorization, neural word embeddings,
and cosine similarity retrieval.
"""

from text_matching.preprocessor import clean_text, tokenize_text
from text_matching.tfidf_model import CampusTFIDFMatcher
from text_matching.matcher import TextMatcher

__all__ = [
    "clean_text",
    "tokenize_text",
    "CampusTFIDFMatcher",
    "TextMatcher"
]


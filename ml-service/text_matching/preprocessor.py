"""
Text Preprocessor for Campus Lost & Found Descriptions
------------------------------------------------------
Cleans, normalizes, and tokenizes item descriptions.
Strips boilerplate phrases and filters stopwords to focus on salient item features.
"""

import re
from typing import List

# Standard English stopwords + campus reporting boilerplate
STOPWORDS = {
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
    'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
    'between', 'both', 'but', 'by', 'could', 'did', 'do', 'does', 'doing', 'down',
    'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having',
    'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if',
    'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my',
    'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or',
    'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should',
    'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves',
    'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
    'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while',
    'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves',
    # Campus boilerplate words
    'item', 'items', 'found', 'lost', 'left', 'behind', 'after', 'class', 'table',
    'near', 'outside', 'inside', 'floor', 'room', 'block', 'hall'
}


def clean_text(text: str, remove_stopwords: bool = False) -> str:
    """
    Cleans raw text string:
    - Lowercases text
    - Replaces punctuation with spaces
    - Collapses multiple whitespace
    - Optionally removes stopwords
    """
    if not isinstance(text, str):
        text = str(text) if text is not None else ""

    text = text.lower().strip()
    # Replace non-alphanumeric (keep hyphens in model numbers like fx-991)
    text = re.sub(r'[^a-z0-9\-\s]', ' ', text)
    # Remove stand-alone hyphens
    text = re.sub(r'\s+-\s+', ' ', text)

    words = text.split()
    if remove_stopwords:
        words = [w for w in words if w not in STOPWORDS and len(w) > 1]

    return " ".join(words)


def tokenize_text(text: str) -> List[str]:
    """Tokenizes text into a list of cleaned words."""
    cleaned = clean_text(text, remove_stopwords=True)
    return [w for w in cleaned.split() if len(w) > 1]


"""
Custom Neural Word Embedding Model (PyTorch Word2Vec / CBOW)
------------------------------------------------------------
Trains dense word embeddings (e.g. 64-d or 100-d) from scratch on campus text.
Learns contextual representations of campus locations, item categories, and colors.
Computes semantic document embeddings via mean-pooling for similarity retrieval.
"""

import os
import json
import numpy as np
import torch
import torch.nn as nn
from typing import List, Dict, Tuple, Optional
from text_matching.preprocessor import tokenize_text


class CBOWModel(nn.Module):
    """Continuous Bag of Words (CBOW) Neural Network Architecture."""
    def __init__(self, vocab_size: int, embedding_dim: int):
        super(CBOWModel, self).__init__()
        self.embeddings = nn.Embedding(vocab_size, embedding_dim)
        self.linear = nn.Linear(embedding_dim, vocab_size)

    def forward(self, inputs):
        # inputs shape: (batch_size, context_size * 2)
        embeds = self.embeddings(inputs)  # (batch_size, context, emb_dim)
        context_mean = torch.mean(embeds, dim=1)  # (batch_size, emb_dim)
        out = self.linear(context_mean)  # (batch_size, vocab_size)
        return out


class CampusWord2Vec:
    def __init__(self, embedding_dim: int = 64, context_size: int = 2, min_count: int = 2):
        self.embedding_dim = embedding_dim
        self.context_size = context_size
        self.min_count = min_count
        self.word_to_ix = {}
        self.ix_to_word = {}
        self.vocab_size = 0
        self.model = None

    def build_vocab(self, corpus_sentences: List[str]):
        """Builds word vocabulary with min_count threshold."""
        word_counts = {}
        for sentence in corpus_sentences:
            tokens = tokenize_text(sentence)
            for t in tokens:
                word_counts[t] = word_counts.get(t, 0) + 1

        self.word_to_ix = {"<UNK>": 0}
        self.ix_to_word = {0: "<UNK>"}

        for word, count in word_counts.items():
            if count >= self.min_count:
                idx = len(self.word_to_ix)
                self.word_to_ix[word] = idx
                self.ix_to_word[idx] = word

        self.vocab_size = len(self.word_to_ix)
        print(f"[OK] Built vocabulary of {self.vocab_size:,} words from {len(corpus_sentences):,} sentences.")

    def create_cbow_dataset(self, sentences: List[str], max_pairs: int = 100000):
        """Generates (context, target) training pairs."""
        data = []
        for s in sentences:
            tokens = [w for w in tokenize_text(s) if w in self.word_to_ix]
            if len(tokens) < self.context_size * 2 + 1:
                continue

            for i in range(self.context_size, len(tokens) - self.context_size):
                context = (
                    tokens[i - self.context_size : i] +
                    tokens[i + 1 : i + self.context_size + 1]
                )
                target = tokens[i]
                context_idx = [self.word_to_ix[w] for w in context]
                target_idx = self.word_to_ix[target]
                data.append((context_idx, target_idx))

                if len(data) >= max_pairs:
                    return data
        return data

    def train(self, sentences: List[str], epochs: int = 5, batch_size: int = 256, lr: float = 0.01):
        """Trains the CBOW neural network from scratch."""
        if not self.word_to_ix:
            self.build_vocab(sentences)

        training_pairs = self.create_cbow_dataset(sentences)
        print(f"[*] Generated {len(training_pairs):,} CBOW training pairs. Starting neural training...")

        self.model = CBOWModel(self.vocab_size, self.embedding_dim)
        loss_fn = nn.CrossEntropyLoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=lr)

        self.model.train()
        for epoch in range(1, epochs + 1):
            total_loss = 0.0
            np.random.shuffle(training_pairs)

            for i in range(0, len(training_pairs), batch_size):
                batch = training_pairs[i : i + batch_size]
                contexts = torch.tensor([p[0] for p in batch], dtype=torch.long)
                targets = torch.tensor([p[1] for p in batch], dtype=torch.long)

                optimizer.zero_grad()
                outputs = self.model(contexts)
                loss = loss_fn(outputs, targets)
                loss.backward()
                optimizer.step()

                total_loss += loss.item()

            avg_loss = total_loss / (len(training_pairs) / batch_size)
            print(f"  Epoch [{epoch}/{epochs}] - Loss: {avg_loss:.4f}")

        print("[OK] Custom Word2Vec neural training complete!")

    def get_word_vector(self, word: str) -> np.ndarray:
        """Returns the embedding vector for a given word."""
        if self.model is None:
            raise RuntimeError("Model is not trained yet.")
        idx = self.word_to_ix.get(word, 0)
        with torch.no_grad():
            vec = self.model.embeddings(torch.tensor([idx])).squeeze().numpy()
        return vec

    def embed_sentence(self, sentence: str) -> np.ndarray:
        """Embeds a full sentence by mean-pooling its constituent word vectors."""
        tokens = tokenize_text(sentence)
        if not tokens:
            return np.zeros(self.embedding_dim, dtype=np.float32)

        vecs = [self.get_word_vector(t) for t in tokens]
        mean_vec = np.mean(vecs, axis=0)

        # L2 normalize
        norm = np.linalg.norm(mean_vec)
        if norm > 0:
            mean_vec = mean_vec / norm
        return mean_vec.astype(np.float32)

    def save(self, model_dir: str):
        """Saves model weights and vocabulary dictionary."""
        os.makedirs(model_dir, exist_ok=True)
        torch.save(self.model.state_dict(), os.path.join(model_dir, "word2vec_weights.pt"))
        with open(os.path.join(model_dir, "vocab.json"), "w", encoding="utf-8") as f:
            json.dump({
                "word_to_ix": self.word_to_ix,
                "embedding_dim": self.embedding_dim,
                "context_size": self.context_size
            }, f)
        print(f"[OK] Saved custom neural embeddings to: {model_dir}")

    def load(self, model_dir: str):
        """Loads model weights and vocabulary dictionary."""
        with open(os.path.join(model_dir, "vocab.json"), "r", encoding="utf-8") as f:
            data = json.load(f)
            self.word_to_ix = data["word_to_ix"]
            self.ix_to_word = {v: k for k, v in self.word_to_ix.items()}
            self.embedding_dim = data["embedding_dim"]
            self.context_size = data["context_size"]
            self.vocab_size = len(self.word_to_ix)

        self.model = CBOWModel(self.vocab_size, self.embedding_dim)
        weights_path = os.path.join(model_dir, "word2vec_weights.pt")
        self.model.load_state_dict(torch.load(weights_path, map_location="cpu"))
        self.model.eval()
        print(f"[OK] Loaded custom neural embeddings from: {model_dir}")
        return self


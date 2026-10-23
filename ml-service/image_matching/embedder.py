"""
Feature Embedding Extractor
---------------------------
Extracts high-dimensional visual feature vectors using pre-trained
MobileNetV2 (1280-d) or ResNet50 (2048-d) backbones.
Supports Torchvision and fallback inference.
"""

import numpy as np
from typing import Literal
from image_matching.preprocessor import load_and_preprocess_image


class ImageEmbeddingExtractor:
    def __init__(self, model_name: Literal["mobilenet_v2", "resnet50"] = "mobilenet_v2", device: str = "cpu"):
        """
        Initializes the pre-trained CNN feature extractor.
        
        Args:
            model_name: 'mobilenet_v2' (lightweight, 1280-d) or 'resnet50' (deep, 2048-d).
            device: 'cpu' or 'cuda'.
        """
        self.model_name = model_name
        self.device = device
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            import torch
            import torchvision.models as models

            if self.model_name == "mobilenet_v2":
                weights = models.MobileNet_V2_Weights.DEFAULT
                base = models.mobilenet_v2(weights=weights)
                # Replace final classification head with Identity to extract raw embeddings
                base.classifier = torch.nn.Identity()
                self.embedding_dim = 1280
            elif self.model_name == "resnet50":
                weights = models.ResNet50_Weights.DEFAULT
                base = models.resnet50(weights=weights)
                base.fc = torch.nn.Identity()
                self.embedding_dim = 2048
            else:
                raise ValueError(f"Unsupported model: {self.model_name}")

            base.to(self.device)
            base.eval()
            self.model = base
            print(f"[OK] Loaded pre-trained {self.model_name} (Dim: {self.embedding_dim}) on {self.device}.")

        except ImportError:
            print("[WARN] PyTorch/Torchvision not installed yet. Please run `pip install torch torchvision`.")
            self.model = None

    def extract_from_path(self, image_path: str) -> np.ndarray:
        """
        Runs OpenCV preprocessing and extracts normalized feature embedding vector.
        """
        # 1. Preprocess with OpenCV
        img_np = load_and_preprocess_image(image_path, target_size=(224, 224))

        if self.model is None:
            raise RuntimeError("PyTorch model is not initialized. Please ensure torch and torchvision are installed.")

        import torch

        # 2. Convert to PyTorch tensor format: (C, H, W)
        tensor = torch.from_numpy(img_np).permute(2, 0, 1).unsqueeze(0).float()

        # 3. Standard ImageNet normalization: (x - mean) / std
        mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1)
        std = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1)
        tensor = (tensor - mean) / std
        tensor = tensor.to(self.device)

        # 4. Forward pass
        with torch.no_grad():
            feat = self.model(tensor)
            feat = feat.squeeze().cpu().numpy()

        # 5. L2 unit normalization for exact Cosine Similarity via dot product
        norm = np.linalg.norm(feat)
        if norm > 0:
            feat = feat / norm

        return feat

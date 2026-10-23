"""
Image Preprocessing Pipeline (OpenCV with PIL Fallback)
-------------------------------------------------------
Handles image loading, aspect-ratio-preserving square cropping,
color space conversion (BGR -> RGB), resizing, and normalization
for CNN feature extraction (MobileNet / ResNet).
"""

import os
import numpy as np

try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False
    from PIL import Image


def load_and_preprocess_image(
    image_path: str,
    target_size: tuple = (224, 224),
    apply_clahe: bool = False
) -> np.ndarray:
    """
    Loads an image from disk and preprocesses it:
    1. Reads image (using OpenCV if available, else PIL).
    2. Optional: Contrast Limited Adaptive Histogram Equalization (CLAHE via OpenCV).
    3. Center-crops to 1:1 aspect ratio to avoid stretching items.
    4. Resizes to target dimension (e.g., 224x224).
    5. Converts color from BGR to RGB.
    6. Normalizes pixels to [0.0, 1.0].

    Returns:
        np.ndarray of shape (target_size[0], target_size[1], 3) as float32 in range [0, 1].
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at: {image_path}")

    if HAS_OPENCV:
        # Step 1: Read image with OpenCV
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Failed to decode image at: {image_path}")

        # Step 2: Optional CLAHE for lighting variation adjustment
        if apply_clahe:
            lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            cl = clahe.apply(l)
            limg = cv2.merge((cl, a, b))
            img = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

        # Step 3: Center crop to square
        h, w = img.shape[:2]
        min_dim = min(h, w)
        start_x = (w - min_dim) // 2
        start_y = (h - min_dim) // 2
        cropped = img[start_y:start_y + min_dim, start_x:start_x + min_dim]

        # Step 4: Resize to target size (standard 224x224 for MobileNet/ResNet)
        resized = cv2.resize(cropped, target_size, interpolation=cv2.INTER_AREA)

        # Step 5: Convert BGR to RGB
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)

        # Step 6: Normalize to [0, 1] float32
        return rgb.astype(np.float32) / 255.0

    else:
        # Fallback to PIL
        with Image.open(image_path) as pil_img:
            pil_img = pil_img.convert("RGB")
            w, h = pil_img.size
            min_dim = min(w, h)
            left = (w - min_dim) // 2
            top = (h - min_dim) // 2
            cropped = pil_img.crop((left, top, left + min_dim, top + min_dim))
            resized = cropped.resize(target_size, Image.Resampling.LANCZOS)
            rgb = np.array(resized, dtype=np.float32) / 255.0
            return rgb

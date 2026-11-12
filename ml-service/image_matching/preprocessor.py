"""
Image Preprocessing Pipeline (OpenCV with PIL Fallback)
-------------------------------------------------------
Handles image loading from file path, bytes, or PIL Image.
Performs aspect-ratio-preserving square center-cropping,
color space conversion (BGR -> RGB), resizing, and normalization
for CNN feature extraction (MobileNet / ResNet).
"""

import os
import io
import numpy as np
from typing import Union

try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False


def preprocess_pil_image(
    pil_img: "Image.Image",
    target_size: tuple = (224, 224)
) -> np.ndarray:
    """Preprocesses a PIL Image with square center-crop and resize."""
    pil_img = pil_img.convert("RGB")
    w, h = pil_img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    cropped = pil_img.crop((left, top, left + min_dim, top + min_dim))
    resized = cropped.resize(target_size, Image.Resampling.LANCZOS)
    rgb = np.array(resized, dtype=np.float32) / 255.0
    return rgb


def load_and_preprocess_image(
    image_source: Union[str, bytes, io.BytesIO],
    target_size: tuple = (224, 224),
    apply_clahe: bool = False
) -> np.ndarray:
    """
    Loads an image from disk path or in-memory bytes and preprocesses it:
    1. Reads image (using OpenCV if available, else PIL).
    2. Optional: Contrast Limited Adaptive Histogram Equalization (CLAHE).
    3. Center-crops to 1:1 square aspect ratio to avoid distortion.
    4. Resizes to target dimension (e.g. 224x224).
    5. Converts color from BGR to RGB.
    6. Normalizes pixels to [0.0, 1.0].

    Returns:
        np.ndarray of shape (target_size[0], target_size[1], 3) as float32.
    """
    # Case 1: In-memory bytes
    if isinstance(image_source, (bytes, bytearray)):
        if HAS_OPENCV:
            nparr = np.frombuffer(image_source, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Failed to decode image from provided bytes.")
        elif HAS_PIL:
            pil_img = Image.open(io.BytesIO(image_source))
            return preprocess_pil_image(pil_img, target_size)
        else:
            raise RuntimeError("Neither OpenCV nor PIL is available.")

    elif isinstance(image_source, io.BytesIO):
        if HAS_PIL:
            pil_img = Image.open(image_source)
            return preprocess_pil_image(pil_img, target_size)
        elif HAS_OPENCV:
            nparr = np.frombuffer(image_source.getvalue(), np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Failed to decode image from BytesIO.")
        else:
            raise RuntimeError("Neither OpenCV nor PIL is available.")

    # Case 2: File path
    elif isinstance(image_source, str):
        if not os.path.exists(image_source):
            raise FileNotFoundError(f"Image not found at: {image_source}")

        if HAS_OPENCV:
            img = cv2.imread(image_source)
            if img is None:
                raise ValueError(f"Failed to decode image at: {image_source}")
        elif HAS_PIL:
            with Image.open(image_source) as pil_img:
                return preprocess_pil_image(pil_img, target_size)
        else:
            raise RuntimeError("Neither OpenCV nor PIL is available.")
    else:
        raise TypeError(f"Unsupported image_source type: {type(image_source)}")

    # Processing using OpenCV if reached here
    if apply_clahe:
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b))
        img = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

    h, w = img.shape[:2]
    min_dim = min(h, w)
    start_x = (w - min_dim) // 2
    start_y = (h - min_dim) // 2
    cropped = img[start_y:start_y + min_dim, start_x:start_x + min_dim]

    resized = cv2.resize(cropped, target_size, interpolation=cv2.INTER_AREA)
    rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
    return rgb.astype(np.float32) / 255.0

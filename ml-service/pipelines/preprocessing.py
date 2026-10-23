"""
Smart Campus Lost & Found System - Preprocessing Pipeline
---------------------------------------------------------
Standard preprocessing, validation, and feature preparation logic.
Complies with SRS requirements:
- FR-1.1 to FR-1.4: Input validation, handling unknown brands, date parsing.
- FR-2.1: Shared preprocessor transformer for training and inference.
"""

import os
import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin

STATUS_MAPPING = {
    'Searching': 'Pending',
    'pending': 'Pending',
    'searching': 'Pending',
    'Pending': 'Pending',
    'Recovered': 'Recovered',
    'recovered': 'Recovered',
    'Closed': 'Closed',
    'closed': 'Closed'
}

STATUS_CODE_MAP = {
    'Pending': 1,
    'Recovered': 2,
    'Closed': 3
}


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Standard tabular cleaning:
    - Normalizes text columns (stripping whitespace, consistent Title casing).
    - Fills missing/blank brands with 'Unknown' (FR-1.3).
    - Converts date strings to datetime and extracts calendar features.
    - Standardizes target recovery status to 3 classes (Pending, Recovered, Closed).
    - Recomputes derived features (description_length, has_brand).
    """
    df = df.copy()

    # 1. Text normalization
    text_cols = ['item_type', 'item_name', 'category', 'color', 'brand', 'location', 'description']
    for col in text_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    # 2. Brand normalization (FR-1.3)
    if 'brand' in df.columns:
        df['brand'] = df['brand'].replace(['', 'nan', 'NaN', 'None', 'null', 'N/A', 'none', '-'], 'Unknown')
        df['has_brand'] = (df['brand'] != 'Unknown').astype(int)

    # 3. Categorical formatting
    for col in ['item_type', 'category', 'color']:
        if col in df.columns:
            df[col] = df[col].str.title()

    # 4. Date parsing & temporal feature extraction
    if 'item_date' in df.columns:
        df['item_date'] = pd.to_datetime(df['item_date'], errors='coerce')
        df['report_month'] = df['item_date'].dt.month
        df['report_day_of_week'] = df['item_date'].dt.weekday
        df['is_weekend'] = df['report_day_of_week'].apply(lambda x: 1 if x in [5, 6] else 0)

    # 5. Derived text features
    if 'description' in df.columns:
        df['description_length'] = df['description'].apply(lambda x: len(str(x)) if pd.notna(x) else 0)

    if 'item_age_days' in df.columns:
        df['item_age_days'] = df['item_age_days'].clip(lower=0)

    # 6. Target status standardization (3 Canonical SRS Classes)
    if 'recovery_status' in df.columns:
        df['recovery_status'] = df['recovery_status'].map(STATUS_MAPPING).fillna('Pending')
        df['recovery_status_code'] = df['recovery_status'].map(STATUS_CODE_MAP)

    return df


class CampusDataPreprocessor(BaseEstimator, TransformerMixin):
    """
    Scikit-learn compatible transformer for single-record or batch inference.
    Satisfies SRS FR-2.1.
    """
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        if isinstance(X, dict):
            df = pd.DataFrame([X])
        elif isinstance(X, pd.DataFrame):
            df = X.copy()
        else:
            df = pd.DataFrame(X)

        return clean_dataframe(df)

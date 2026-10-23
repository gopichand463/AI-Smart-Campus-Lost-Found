"""
Data Preprocessing Execution Script
-----------------------------------
Runs standard preprocessing on the 120k dataset and exports the processed file.
"""

import os
import time
import pandas as pd
from pipelines.preprocessing import clean_dataframe

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
INPUT_CSV = os.path.join(DATA_DIR, "smart_campus_dataset_120k.csv")
OUTPUT_CSV = os.path.join(DATA_DIR, "smart_campus_processed_120k.csv")


def main():
    print(f"[*] Loading dataset from: {INPUT_CSV}")
    t0 = time.time()
    df = pd.read_csv(INPUT_CSV)
    print(f"[*] Raw records: {len(df):,}")

    df_cleaned = clean_dataframe(df)

    print(f"[*] Saving processed dataset to: {OUTPUT_CSV}")
    df_cleaned.to_csv(OUTPUT_CSV, index=False)
    print(f"[OK] Preprocessing finished in {time.time() - t0:.2f}s ({len(df_cleaned):,} records).")


if __name__ == "__main__":
    main()

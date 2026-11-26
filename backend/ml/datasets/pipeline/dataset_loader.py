import os
import pandas as pd
from typing import Optional
from backend.ml.utils.logger import setup_logger

logger = setup_logger("DatasetLoader")

def load_dataset(file_path: str, nrows: Optional[int] = None) -> pd.DataFrame:
    """Safely loads the raw or processed dataset."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset file not found at: {file_path}")

    logger.info(f"Loading dataset from: {file_path} (nrows={nrows})")
    if file_path.endswith(".parquet"):
        df = pd.read_parquet(file_path)
    elif file_path.endswith(".csv"):
        # Handle UTF-8 with BOM or encoding issues gracefully
        df = pd.read_csv(file_path, nrows=nrows, encoding="utf-8-sig", low_memory=False)
    else:
        raise ValueError(f"Unsupported dataset format: {file_path}")

    # Normalize column names: strip leading/trailing spaces and BOM artifacts
    df.columns = [c.strip().lstrip('\ufeff') for c in df.columns]
    logger.info(f"Loaded dataset successfully. Shape: {df.shape}")
    return df

import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any
from utils.logger import setup_logger

logger = setup_logger("Preprocessing")

class DataPreprocessor:
    def __init__(self, url_col: str = "URL", target_col: str = "label", domain_col: str = "Domain"):
        self.url_col = url_col
        self.target_col = target_col
        self.domain_col = domain_col

    def clean_and_normalize(self, df: pd.DataFrame) -> pd.DataFrame:
        """Cleans raw dataset: handles nulls, drops invalid URLs, removes duplicates."""
        initial_len = len(df)
        logger.info(f"Starting data preprocessing on {initial_len} rows...")

        # 1. Drop rows where URL or target is missing
        df_clean = df.dropna(subset=[self.url_col, self.target_col]).copy()

        # 2. Ensure URL is string and trimmed
        df_clean[self.url_col] = df_clean[self.url_col].astype(str).str.strip()
        df_clean = df_clean[df_clean[self.url_col].str.len() > 3]

        # 3. Standardize labels into: 0 = LEGITIMATE, 1 = PHISHING
        # IMPORTANT: In the raw PhiUSIIL dataset, label 1 = Legitimate (benign) and label 0 = Phishing.
        # As explicitly specified: Standardize labels into 0 = LEGITIMATE, 1 = PHISHING (invert raw label).
        df_clean[self.target_col] = pd.to_numeric(df_clean[self.target_col], errors="coerce")
        df_clean = df_clean.dropna(subset=[self.target_col])
        df_clean[self.target_col] = df_clean[self.target_col].astype(int)
        df_clean = df_clean[df_clean[self.target_col].isin([0, 1])]
        df_clean[self.target_col] = 1 - df_clean[self.target_col]

        # 4. Check conflicting labels: same URL with different labels
        conflicts = df_clean.groupby(self.url_col)[self.target_col].nunique()
        conflicting_urls = conflicts[conflicts > 1].index
        if len(conflicting_urls) > 0:
            logger.warning(f"Found {len(conflicting_urls)} URLs with conflicting labels. Removing conflicting entries.")
            df_clean = df_clean[~df_clean[self.url_col].isin(conflicting_urls)]

        # 5. Remove exact duplicate URLs (keep first)
        dup_count = df_clean.duplicated(subset=[self.url_col]).sum()
        if dup_count > 0:
            logger.info(f"Removing {dup_count} duplicate URLs.")
            df_clean = df_clean.drop_duplicates(subset=[self.url_col], keep="first")

        final_len = len(df_clean)
        logger.info(f"Preprocessing completed: {initial_len} -> {final_len} rows retained ({initial_len - final_len} removed).")
        return df_clean

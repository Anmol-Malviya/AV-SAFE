import os
import pandas as pd
import numpy as np
from sklearn.model_selection import GroupShuffleSplit
from typing import Tuple, Dict, Any
from utils.logger import setup_logger

logger = setup_logger("DataSplitter")

class DataSplitter:
    def __init__(self,
                 train_ratio: float = 0.70,
                 val_ratio: float = 0.15,
                 test_ratio: float = 0.15,
                 random_seed: int = 42,
                 domain_col: str = "Domain"):
        assert abs(train_ratio + val_ratio + test_ratio - 1.0) < 1e-4, "Ratios must sum to 1.0"
        self.train_ratio = train_ratio
        self.val_ratio = val_ratio
        self.test_ratio = test_ratio
        self.random_seed = random_seed
        self.domain_col = domain_col

    def split_domain_grouped(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Splits data strictly by Domain groups so URLs from the same domain never cross train/val/test splits."""
        logger.info(f"Splitting dataset by Domain groups to guarantee zero domain leakage...")
        
        # Ensure domain column exists or extract it
        if self.domain_col not in df.columns:
            logger.info("Extracting domain column for grouping...")
            df[self.domain_col] = df["URL"].apply(lambda u: str(u).split("/")[2] if "//" in str(u) else str(u).split("/")[0])

        groups = df[self.domain_col].astype(str)

        # 1. Split out Test set (15%)
        gss_test = GroupShuffleSplit(n_splits=1, test_size=self.test_ratio, random_state=self.random_seed)
        train_val_idx, test_idx = next(gss_test.split(df, groups=groups))

        train_val_df = df.iloc[train_val_idx].copy()
        test_df = df.iloc[test_idx].copy()

        # 2. Split train_val into Train and Val
        # val_ratio relative to remaining train_val
        relative_val_ratio = self.val_ratio / (self.train_ratio + self.val_ratio)
        train_val_groups = train_val_df[self.domain_col].astype(str)

        gss_val = GroupShuffleSplit(n_splits=1, test_size=relative_val_ratio, random_state=self.random_seed)
        train_idx, val_idx = next(gss_val.split(train_val_df, groups=train_val_groups))

        train_df = train_val_df.iloc[train_idx].copy()
        val_df = train_val_df.iloc[val_idx].copy()

        # Verification of zero leakage
        train_domains = set(train_df[self.domain_col])
        val_domains = set(val_df[self.domain_col])
        test_domains = set(test_df[self.domain_col])

        train_val_leak = train_domains.intersection(val_domains)
        train_test_leak = train_domains.intersection(test_domains)
        val_test_leak = val_domains.intersection(test_domains)

        assert len(train_val_leak) == 0, f"Domain leakage detected between train and val: {len(train_val_leak)}"
        assert len(train_test_leak) == 0, f"Domain leakage detected between train and test: {len(train_test_leak)}"
        assert len(val_test_leak) == 0, f"Domain leakage detected between val and test: {len(val_test_leak)}"

        logger.info(f"Split completed without leakage:")
        logger.info(f"  Train: {len(train_df)} rows ({len(train_domains)} unique domains)")
        logger.info(f"  Val:   {len(val_df)} rows ({len(val_domains)} unique domains)")
        logger.info(f"  Test:  {len(test_df)} rows ({len(test_domains)} unique domains)")

        return train_df, val_df, test_df

    def save_splits(self, train_df: pd.DataFrame, val_df: pd.DataFrame, test_df: pd.DataFrame, splits_dir: str):
        """Saves splits to parquet / csv."""
        os.makedirs(splits_dir, exist_ok=True)
        train_df.to_parquet(os.path.join(splits_dir, "train.parquet"), index=False)
        val_df.to_parquet(os.path.join(splits_dir, "val.parquet"), index=False)
        test_df.to_parquet(os.path.join(splits_dir, "test.parquet"), index=False)
        logger.info(f"Saved domain-grouped splits to {splits_dir}/")

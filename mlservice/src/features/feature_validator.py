from typing import List, Union
import numpy as np
import pandas as pd
from src.features.url_feature_extractor import FEATURE_NAMES_24
from src.utils.logger import setup_logger

logger = setup_logger("FeatureValidator")

class FeatureValidator:
    @staticmethod
    def validate_feature_matrix(X: Union[np.ndarray, pd.DataFrame], feature_names: List[str] = FEATURE_NAMES_24):
        """Checks for NaNs, Infs, dimension matching, and value sanity."""
        if isinstance(X, pd.DataFrame):
            cols = list(X.columns)
            assert cols == feature_names, f"Feature ordering mismatch: expected {feature_names}, got {cols}"
            arr = X.values
        else:
            arr = np.asarray(X)

        n_rows, n_cols = arr.shape
        assert n_cols == len(feature_names), f"Expected {len(feature_names)} features, got {n_cols}"

        has_nan = bool(np.isnan(arr).any())
        has_inf = bool(np.isinf(arr).any())

        if has_nan:
            raise ValueError("Feature matrix contains NaN values!")
        if has_inf:
            raise ValueError("Feature matrix contains Infinite values!")

        return {
            "num_samples": n_rows,
            "num_features": n_cols,
            "has_nan": has_nan,
            "has_inf": has_inf,
            "feature_names": feature_names
        }

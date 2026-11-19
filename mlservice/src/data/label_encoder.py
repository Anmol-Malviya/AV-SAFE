from typing import Union
import pandas as pd
import numpy as np

class LabelEncoderService:
    @staticmethod
    def encode(labels: Union[pd.Series, np.ndarray, list]) -> np.ndarray:
        """Converts arbitrary binary labels to 0 (LEGITIMATE) and 1 (PHISHING)."""
        series = pd.Series(labels)
        if series.dtype == object or series.dtype == str:
            # Map common strings
            mapping = {
                "legitimate": 0, "safe": 0, "benign": 0, "0": 0, 0: 0,
                "phishing": 1, "malicious": 1, "bad": 1, "1": 1, 1: 1
            }
            encoded = series.str.lower().map(mapping).fillna(0).astype(int).values
        else:
            encoded = series.astype(int).values
        return encoded

    @staticmethod
    def decode(encoded: Union[np.ndarray, list]) -> list:
        return ["PHISHING" if val == 1 else "LEGITIMATE" for val in encoded]

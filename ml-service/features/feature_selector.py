from typing import List
import pandas as pd
from features.url_feature_extractor import FEATURE_NAMES_24
from utils.logger import setup_logger

logger = setup_logger("FeatureSelector")

class FeatureSelector:
    def __init__(self, feature_mode: str = "url_only"):
        self.feature_mode = feature_mode

    def get_features(self) -> List[str]:
        if self.feature_mode == "url_only":
            return FEATURE_NAMES_24
        else:
            raise ValueError(f"Unsupported feature mode: {self.feature_mode}")

    def select(self, df: pd.DataFrame) -> pd.DataFrame:
        features = self.get_features()
        missing = [f for f in features if f not in df.columns]
        if missing:
            raise KeyError(f"Missing required features in DataFrame: {missing}")
        return df[features]

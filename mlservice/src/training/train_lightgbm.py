import os
import joblib
import numpy as np
from lightgbm import LGBMClassifier
from typing import Dict, Any, Tuple
from src.utils.logger import setup_logger

logger = setup_logger("TrainLightGBM")

class LightGBMTrainer:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        lgb_cfg = self.config.get("training", {}).get("lightgbm", {})
        self.n_estimators = int(lgb_cfg.get("n_estimators", 250))
        self.max_depth = int(lgb_cfg.get("max_depth", 8))
        self.num_leaves = int(lgb_cfg.get("num_leaves", 31))
        self.learning_rate = float(lgb_cfg.get("learning_rate", 0.06))
        self.subsample = float(lgb_cfg.get("subsample", 0.8))
        self.colsample_bytree = float(lgb_cfg.get("colsample_bytree", 0.8))
        self.random_state = int(self.config.get("random_seed", 42))

        self.model = LGBMClassifier(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            num_leaves=self.num_leaves,
            learning_rate=self.learning_rate,
            subsample=self.subsample,
            colsample_bytree=self.colsample_bytree,
            objective="binary",
            random_state=self.random_state,
            n_jobs=-1,
            verbose=-1
        )

    def fit(self, X_train: np.ndarray, y_train: np.ndarray, eval_set: list = None) -> "LightGBMTrainer":
        logger.info(f"Fitting LightGBM on {X_train.shape[0]} samples with {self.n_estimators} estimators...")
        self.model.fit(X_train, y_train, eval_set=eval_set)
        logger.info("LightGBM training finished successfully.")
        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict_proba(X)[:, 1]

    def predict(self, X: np.ndarray, threshold: float = 0.5) -> np.ndarray:
        proba = self.predict_proba(X)
        return (proba >= threshold).astype(int)

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({"model": self.model}, filepath)
        # Also save native lightgbm model text
        txt_path = os.path.splitext(filepath)[0] + ".txt"
        self.model.booster_.save_model(txt_path)
        logger.info(f"Saved LightGBM model artifacts to {filepath} and {txt_path}")

    @classmethod
    def load(cls, filepath: str) -> LGBMClassifier:
        data = joblib.load(filepath)
        return data["model"]

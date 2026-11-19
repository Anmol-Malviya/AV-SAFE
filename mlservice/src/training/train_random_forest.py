import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from typing import Dict, Any, Tuple
from src.utils.logger import setup_logger

logger = setup_logger("TrainRandomForest")

class RandomForestTrainer:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        rf_cfg = self.config.get("training", {}).get("random_forest", {})
        self.n_estimators = int(rf_cfg.get("n_estimators", 150))
        self.max_depth = rf_cfg.get("max_depth", 16)
        self.min_samples_split = int(rf_cfg.get("min_samples_split", 5))
        self.min_samples_leaf = int(rf_cfg.get("min_samples_leaf", 2))
        self.n_jobs = int(rf_cfg.get("n_jobs", -1))
        self.class_weight = rf_cfg.get("class_weight", "balanced")
        self.random_state = int(self.config.get("random_seed", 42))

        self.model = RandomForestClassifier(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            min_samples_split=self.min_samples_split,
            min_samples_leaf=self.min_samples_leaf,
            n_jobs=self.n_jobs,
            class_weight=self.class_weight,
            random_state=self.random_state
        )

    def fit(self, X_train: np.ndarray, y_train: np.ndarray) -> "RandomForestTrainer":
        logger.info(f"Fitting RandomForest on {X_train.shape[0]} samples with {self.n_estimators} trees...")
        self.model.fit(X_train, y_train)
        logger.info("RandomForest training finished successfully.")
        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict_proba(X)[:, 1]

    def predict(self, X: np.ndarray, threshold: float = 0.5) -> np.ndarray:
        proba = self.predict_proba(X)
        return (proba >= threshold).astype(int)

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({"model": self.model}, filepath)
        logger.info(f"Saved RandomForest model artifact to {filepath}")

    @classmethod
    def load(cls, filepath: str) -> RandomForestClassifier:
        data = joblib.load(filepath)
        return data["model"]

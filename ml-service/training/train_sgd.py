import os
import joblib
import numpy as np
from sklearn.linear_model import SGDClassifier
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, Tuple
from utils.logger import setup_logger

logger = setup_logger("TrainSGD")

class SGDTrainer:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        sgd_cfg = self.config.get("training", {}).get("sgd", {})
        self.loss = sgd_cfg.get("loss", "log_loss")
        self.penalty = sgd_cfg.get("penalty", "l2")
        self.alpha = float(sgd_cfg.get("alpha", 0.0001))
        self.max_iter = int(sgd_cfg.get("max_iter", 2000))
        self.tol = float(sgd_cfg.get("tol", 1e-4))
        self.class_weight = sgd_cfg.get("class_weight", "balanced")
        self.random_state = int(self.config.get("random_seed", 42))

        self.model = SGDClassifier(
            loss=self.loss,
            penalty=self.penalty,
            alpha=self.alpha,
            max_iter=self.max_iter,
            tol=self.tol,
            class_weight=self.class_weight,
            random_state=self.random_state
        )
        self.scaler = StandardScaler()

    def fit(self, X_train: np.ndarray, y_train: np.ndarray) -> "SGDTrainer":
        logger.info(f"Fitting SGDClassifier with StandardScaler on {X_train.shape[0]} samples...")
        X_scaled = self.scaler.fit_transform(X_train)
        self.model.fit(X_scaled, y_train)
        logger.info("SGD training finished successfully.")
        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        X_scaled = self.scaler.transform(X)
        return self.model.predict_proba(X_scaled)[:, 1]

    def predict(self, X: np.ndarray, threshold: float = 0.5) -> np.ndarray:
        proba = self.predict_proba(X)
        return (proba >= threshold).astype(int)

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({"model": self.model, "scaler": self.scaler}, filepath)
        logger.info(f"Saved SGD model artifact to {filepath}")

    @classmethod
    def load(cls, filepath: str) -> Tuple[SGDClassifier, StandardScaler]:
        data = joblib.load(filepath)
        return data["model"], data["scaler"]

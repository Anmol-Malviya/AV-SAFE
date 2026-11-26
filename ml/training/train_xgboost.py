import os
import joblib
import numpy as np
from xgboost import XGBClassifier
from typing import Dict, Any, Tuple
from ml.utils.logger import setup_logger

logger = setup_logger("TrainXGBoost")

class XGBoostTrainer:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        xgb_cfg = self.config.get("training", {}).get("xgboost", {})
        self.n_estimators = int(xgb_cfg.get("n_estimators", 200))
        self.max_depth = int(xgb_cfg.get("max_depth", 6))
        self.learning_rate = float(xgb_cfg.get("learning_rate", 0.08))
        self.subsample = float(xgb_cfg.get("subsample", 0.8))
        self.colsample_bytree = float(xgb_cfg.get("colsample_bytree", 0.8))
        self.tree_method = xgb_cfg.get("tree_method", "hist")
        self.eval_metric = xgb_cfg.get("eval_metric", "logloss")
        self.random_state = int(self.config.get("random_seed", 42))

        self.model = XGBClassifier(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            learning_rate=self.learning_rate,
            subsample=self.subsample,
            colsample_bytree=self.colsample_bytree,
            tree_method=self.tree_method,
            eval_metric=self.eval_metric,
            random_state=self.random_state,
            n_jobs=-1
        )

    def fit(self, X_train: np.ndarray, y_train: np.ndarray, eval_set: list = None) -> "XGBoostTrainer":
        logger.info(f"Fitting XGBoost on {X_train.shape[0]} samples with {self.n_estimators} estimators...")
        self.model.fit(X_train, y_train, eval_set=eval_set, verbose=False)
        logger.info("XGBoost training finished successfully.")
        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict_proba(X)[:, 1]

    def predict(self, X: np.ndarray, threshold: float = 0.5) -> np.ndarray:
        proba = self.predict_proba(X)
        return (proba >= threshold).astype(int)

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({"model": self.model}, filepath)
        # Also save native booster format for maximum portability
        native_path = os.path.splitext(filepath)[0] + ".json"
        self.model.save_model(native_path)
        logger.info(f"Saved XGBoost model artifacts to {filepath} and {native_path}")

    @classmethod
    def load(cls, filepath: str) -> XGBClassifier:
        data = joblib.load(filepath)
        return data["model"]

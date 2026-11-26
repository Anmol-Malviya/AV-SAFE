from sklearn.model_selection import RandomizedSearchCV
from typing import Dict, Any
from utils.logger import setup_logger

logger = setup_logger("HyperparameterTuning")

class HyperparameterTuner:
    @staticmethod
    def tune_sgd(X, y, n_iter: int = 10, cv: int = 3, random_state: int = 42) -> Dict[str, Any]:
        from sklearn.linear_model import SGDClassifier
        from sklearn.pipeline import Pipeline
        from sklearn.preprocessing import StandardScaler

        pipeline = Pipeline([
            ("scaler", StandardScaler()),
            ("sgd", SGDClassifier(loss="log_loss", random_state=random_state))
        ])

        param_dist = {
            "sgd__alpha": [1e-5, 1e-4, 1e-3, 1e-2],
            "sgd__penalty": ["l2", "l1", "elasticnet"],
            "sgd__max_iter": [1000, 2000]
        }

        search = RandomizedSearchCV(pipeline, param_dist, n_iter=n_iter, cv=cv, scoring="f1", random_state=random_state, n_jobs=-1)
        search.fit(X, y)
        logger.info(f"Best SGD params: {search.best_params_} (F1: {search.best_score_:.4f})")
        return search.best_params_

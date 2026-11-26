import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

from ml.utils.logger import setup_logger
from ml.utils.config_loader import get_training_config
from ml.features.url_feature_extractor import FEATURE_NAMES_24
from ml.evaluation.evaluate import ModelEvaluator

logger = setup_logger("EvaluatePipeline")

def main():
    cfg = get_training_config(base_dir=os.path.dirname(os.path.abspath(__file__)))
    test_split_path = os.path.join(cfg["dataset"]["splits_dir"], "test.parquet")
    if not os.path.exists(test_split_path):
        logger.error(f"Test split not found at {test_split_path}. Run 'python train.py --all' first.")
        sys.exit(1)

    logger.info(f"Loading unseen-domain test dataset from {test_split_path}...")
    test_df = pd.read_parquet(test_split_path)
    X_test = test_df[FEATURE_NAMES_24].values
    y_test = test_df[cfg["dataset"]["target_column"]].values
    test_urls = test_df[cfg["dataset"]["url_column"]].tolist()

    models_dir = cfg["training"]["models_dir"]
    evaluator = ModelEvaluator(reports_dir=cfg["evaluation"]["reports_dir"])

    model_files = {
        "sgd": "sgd_model.joblib",
        "random_forest": "random_forest_model.joblib",
        "xgboost": "xgboost_model.joblib",
        "lightgbm": "lightgbm_model.joblib"
    }

    results = {}
    for name, fname in model_files.items():
        fpath = os.path.join(models_dir, fname)
        if not os.path.exists(fpath):
            continue

        data = joblib.load(fpath)
        if name == "sgd":
            model = data["model"]
            scaler = data["scaler"]
            metrics = evaluator.evaluate_model(model, X_test, y_test, name, test_urls=test_urls, scaler=scaler)
        else:
            model = data["model"]
            metrics = evaluator.evaluate_model(model, X_test, y_test, name, test_urls=test_urls)
        results[name] = metrics

    # Save summary
    res_path = os.path.join(cfg["evaluation"]["reports_dir"], "evaluation_summary.json")
    with open(res_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    logger.info(f"Evaluation complete for {list(results.keys())}. Saved to {res_path}")

if __name__ == "__main__":
    main()

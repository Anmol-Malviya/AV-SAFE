import os
import argparse
import sys
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any

from ml.utils.logger import setup_logger
from ml.utils.config_loader import get_training_config
from ml.utils.reproducibility import set_seed
from ml.datasets.pipeline.dataset_loader import load_dataset
from ml.datasets.pipeline.dataset_validator import DatasetValidator
from ml.datasets.pipeline.preprocessing import DataPreprocessor
from ml.datasets.pipeline.data_splitter import DataSplitter
from ml.inference.features.url_feature_extractor import URLFeatureExtractor, FEATURE_NAMES_24
from ml.inference.features.feature_validator import FeatureValidator

from ml.training.train_sgd import SGDTrainer
from ml.training.train_random_forest import RandomForestTrainer
from ml.training.train_xgboost import XGBoostTrainer
from ml.training.train_lightgbm import LightGBMTrainer
from ml.inference.evaluation.evaluate import ModelEvaluator
from ml.training.model_selector import ModelSelector

logger = setup_logger("TrainPipeline")

def extract_features_df(df: pd.DataFrame, url_col: str = "URL") -> pd.DataFrame:
    """Extracts the 24 runtime features into a DataFrame with proper column names."""
    logger.info(f"Extracting 24 runtime URL features for {len(df)} records...")
    urls = df[url_col].tolist()
    feature_matrix = [URLFeatureExtractor.extract_vector(u) for u in urls]
    feat_df = pd.DataFrame(feature_matrix, columns=FEATURE_NAMES_24)
    return feat_df

def prepare_or_load_processed_data(cfg: Dict[str, Any], force_reprocess: bool = False):
    """Loads raw dataset, cleans, extracts 24 URL features, splits by domain groups, and saves."""
    splits_dir = cfg["dataset"]["splits_dir"]
    train_split_path = os.path.join(splits_dir, "train.parquet")
    val_split_path = os.path.join(splits_dir, "val.parquet")
    test_split_path = os.path.join(splits_dir, "test.parquet")

    if not force_reprocess and os.path.exists(train_split_path) and os.path.exists(test_split_path):
        logger.info(f"Loading existing processed splits from {splits_dir}...")
        train_df = pd.read_parquet(train_split_path)
        val_df = pd.read_parquet(val_split_path)
        test_df = pd.read_parquet(test_split_path)
        return train_df, val_df, test_df

    raw_path = cfg["dataset"]["raw_path"]
    logger.info(f"Processing raw dataset from: {raw_path}")
    raw_df = load_dataset(raw_path)

    # 1. Clean & Preprocess
    preprocessor = DataPreprocessor(
        url_col=cfg["dataset"]["url_column"],
        target_col=cfg["dataset"]["target_column"],
        domain_col=cfg["dataset"].get("domain_column", "Domain")
    )
    clean_df = preprocessor.clean_and_normalize(raw_df)

    # 2. Extract 24 runtime features
    feat_df = extract_features_df(clean_df, url_col=cfg["dataset"]["url_column"])
    
    # Merge metadata and labels
    for col in [cfg["dataset"]["url_column"], cfg["dataset"]["target_column"], cfg["dataset"].get("domain_column", "Domain")]:
        if col in clean_df.columns:
            feat_df[col] = clean_df[col].values

    # 3. Domain Grouped Split
    splitter = DataSplitter(
        train_ratio=cfg["splitting"]["train_ratio"],
        val_ratio=cfg["splitting"]["val_ratio"],
        test_ratio=cfg["splitting"]["test_ratio"],
        random_seed=cfg["random_seed"],
        domain_col=cfg["dataset"].get("domain_column", "Domain")
    )
    train_df, val_df, test_df = splitter.split_domain_grouped(feat_df)
    splitter.save_splits(train_df, val_df, test_df, splits_dir)

    # Also save full processed dataset
    proc_path = cfg["dataset"]["processed_path"]
    os.makedirs(os.path.dirname(proc_path), exist_ok=True)
    feat_df.to_parquet(proc_path, index=False)
    logger.info(f"Saved full processed feature dataset to {proc_path}")

    return train_df, val_df, test_df

def run_dataset_analysis(cfg: Dict[str, Any]):
    """Analyzes raw dataset and generates validation summaries and charts."""
    raw_path = cfg["dataset"]["raw_path"]
    df = load_dataset(raw_path)
    validator = DatasetValidator(
        df,
        url_col=cfg["dataset"]["url_column"],
        target_col=cfg["dataset"]["target_column"],
        domain_col=cfg["dataset"].get("domain_column", "Domain")
    )
    reports_dir = os.path.join(cfg["evaluation"]["reports_dir"], "dataset_analysis")
    summary = validator.generate_analysis_reports(reports_dir)
    print("\n" + "="*60)
    print("DATASET ANALYSIS COMPLETED")
    print("="*60)
    print(f"Total records:      {summary['total_records']:,}")
    print(f"Total columns:      {summary['total_columns']}")
    print(f"Unique domains:     {summary['unique_domains']:,}")
    print(f"Exact duplicates:   {summary['exact_duplicates']:,}")
    print(f"URL duplicates:     {summary['url_duplicates']:,}")
    print(f"Class distribution: {summary['class_distribution']}")
    print(f"Reports saved in:   {reports_dir}/")
    print("="*60 + "\n")

def main():
    parser = argparse.ArgumentParser(description="AV-SAFE Machine Learning Service Training Pipeline")
    parser.add_argument("--analyze-only", action="store_true", help="Analyze raw dataset and generate reports without training")
    parser.add_argument("--all", action="store_true", help="Train and benchmark all models (SGD, RF, XGB, LGBM)")
    parser.add_argument("--model", type=str, choices=["sgd", "random_forest", "xgboost", "lightgbm"], help="Train a specific model")
    parser.add_argument("--reprocess", action="store_true", help="Force reprocessing and feature extraction of raw dataset")
    parser.add_argument("--config", type=str, default=None, help="Path to custom training_config.yaml")

    args = parser.parse_args()
    cfg = get_training_config(base_dir=os.path.dirname(os.path.abspath(__file__)))
    set_seed(cfg["random_seed"])

    if args.analyze_only:
        run_dataset_analysis(cfg)
        return

    # Prepare or load data
    train_df, val_df, test_df = prepare_or_load_processed_data(cfg, force_reprocess=args.reprocess)

    target_col = cfg["dataset"]["target_column"]
    X_train = train_df[FEATURE_NAMES_24].values
    y_train = train_df[target_col].values

    X_val = val_df[FEATURE_NAMES_24].values
    y_val = val_df[target_col].values

    X_test = test_df[FEATURE_NAMES_24].values
    y_test = test_df[target_col].values
    test_urls = test_df[cfg["dataset"]["url_column"]].tolist()

    FeatureValidator.validate_feature_matrix(X_train, FEATURE_NAMES_24)

    models_dir = cfg["training"]["models_dir"]
    os.makedirs(models_dir, exist_ok=True)
    evaluator = ModelEvaluator(reports_dir=cfg["evaluation"]["reports_dir"])

    algorithms = [args.model] if args.model else (cfg["training"]["algorithms"] if args.all else ["sgd"])

    results = {}

    for algo in algorithms:
        logger.info(f"\n{'='*30}\nStarting Training: {algo.upper()}\n{'='*30}")
        if algo == "sgd":
            trainer = SGDTrainer(cfg)
            trainer.fit(X_train, y_train)
            model_path = os.path.join(models_dir, "sgd_model.joblib")
            trainer.save(model_path)
            metrics = evaluator.evaluate_model(trainer.model, X_test, y_test, "sgd", test_urls=test_urls, scaler=trainer.scaler)
            results["sgd"] = metrics

        elif algo == "random_forest":
            trainer = RandomForestTrainer(cfg)
            trainer.fit(X_train, y_train)
            model_path = os.path.join(models_dir, "random_forest_model.joblib")
            trainer.save(model_path)
            metrics = evaluator.evaluate_model(trainer.model, X_test, y_test, "random_forest", test_urls=test_urls)
            results["random_forest"] = metrics

        elif algo == "xgboost":
            trainer = XGBoostTrainer(cfg)
            trainer.fit(X_train, y_train, eval_set=[(X_val, y_val)])
            model_path = os.path.join(models_dir, "xgboost_model.joblib")
            trainer.save(model_path)
            metrics = evaluator.evaluate_model(trainer.model, X_test, y_test, "xgboost", test_urls=test_urls)
            results["xgboost"] = metrics

        elif algo == "lightgbm":
            trainer = LightGBMTrainer(cfg)
            trainer.fit(X_train, y_train, eval_set=[(X_val, y_val)])
            model_path = os.path.join(models_dir, "lightgbm_model.joblib")
            trainer.save(model_path)
            metrics = evaluator.evaluate_model(trainer.model, X_test, y_test, "lightgbm", test_urls=test_urls)
            results["lightgbm"] = metrics

    # Save benchmark evaluation summary
    results_path = os.path.join(cfg["evaluation"]["reports_dir"], "evaluation_summary.json")
    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    logger.info(f"Training completed for: {list(results.keys())}. Summary saved to {results_path}")

    # Model selection decision
    if len(results) > 1:
        decision = ModelSelector.select_best_model(results, require_js_export=True)
        decision_path = os.path.join(cfg["evaluation"]["reports_dir"], "model_selection_decision.json")
        with open(decision_path, "w", encoding="utf-8") as f:
            json.dump(decision, f, indent=2)

if __name__ == "__main__":
    main()

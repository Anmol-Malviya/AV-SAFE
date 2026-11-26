import os
import sys
# Ensure repo root and ml module are resolvable when run directly
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)
import argparse
import json
import joblib
from typing import Dict, Any

from utils.logger import setup_logger
from utils.config_loader import get_training_config
from features.url_feature_extractor import FEATURE_NAMES_24
from inference.export.export_json import JSONModelExporter
from inference.export.model_metadata import ModelMetadataGenerator

logger = setup_logger("ExportPipeline")

def main():
    parser = argparse.ArgumentParser(description="AV-SAFE Export Pipeline")
    parser.add_argument("--deploy", action="store_true", help="Deploy exported weights directly to web-app/src/lib/phishing_model_weights.json")
    parser.add_argument("--force", action="store_true", help="Force overwrite production without prompt")
    args = parser.parse_args()

    cfg = get_training_config(base_dir=os.path.dirname(os.path.abspath(__file__)))
    models_dir = cfg["training"]["models_dir"]
    exported_dir = cfg["export"]["exported_dir"]
    metadata_dir = cfg["export"]["metadata_dir"]
    os.makedirs(exported_dir, exist_ok=True)
    os.makedirs(metadata_dir, exist_ok=True)

    sgd_model_path = os.path.join(models_dir, "sgd_model.joblib")
    if not os.path.exists(sgd_model_path):
        logger.error(f"SGD model artifact not found at {sgd_model_path}. Train the model first.")
        return

    # Load SGD model and scaler
    data = joblib.load(sgd_model_path)
    sgd_model = data["model"]
    scaler = data["scaler"]

    # Export to candidate JSON
    exported_json_path = os.path.join(exported_dir, "phishing_model_weights.json")
    payload = JSONModelExporter.export(sgd_model, scaler, exported_json_path, FEATURE_NAMES_24)

    # Load metrics if available
    summary_path = os.path.join(cfg["evaluation"]["reports_dir"], "evaluation_summary.json")
    metrics = {}
    if os.path.exists(summary_path):
        with open(summary_path, "r", encoding="utf-8") as f:
            metrics = json.load(f).get("sgd", {})

    # Generate metadata
    metadata = ModelMetadataGenerator.generate(
        model_name="SGD_Linear_Classifier",
        version="2.0.0",
        feature_names=FEATURE_NAMES_24,
        metrics=metrics,
        training_params={"loss": "log_loss", "penalty": "l2", "alpha": float(sgd_model.alpha)}
    )
    meta_path = os.path.join(metadata_dir, "model_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Model metadata saved to: {meta_path}")

    # Production deployment if requested
    if args.deploy:
        prod_target = os.path.abspath(os.path.join(os.path.dirname(__file__), cfg["export"]["target_json_path"]))
        backup_target = os.path.abspath(os.path.join(os.path.dirname(__file__), cfg["export"]["backup_json_path"]))
        JSONModelExporter.deploy_to_production(exported_json_path, prod_target, backup_target)
        print(f"\nSuccessfully deployed updated weights to production: {prod_target}\n")

if __name__ == "__main__":
    main()

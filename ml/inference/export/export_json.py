import os
import json
import shutil
import numpy as np
from typing import Dict, Any, List
from ml.inference.features.url_feature_extractor import FEATURE_NAMES_24
from ml.utils.logger import setup_logger

logger = setup_logger("ExportJSON")

class JSONModelExporter:
    """Exports standardized linear model weights, bias, means, and stds
    directly matching AV-SAFE src/lib/phishing_model_weights.json schema.
    """

    @staticmethod
    def export(sgd_model, scaler, output_path: str, feature_names: List[str] = FEATURE_NAMES_24) -> Dict[str, Any]:
        logger.info(f"Preparing JSON export matching AV-SAFE schema for: {output_path}")

        # Extract weights and bias
        raw_weights = sgd_model.coef_[0].tolist()
        bias = float(sgd_model.intercept_[0])

        # Extract means and stds from scaler
        means = {feat: float(scaler.mean_[i]) for i, feat in enumerate(feature_names)}
        stds = {feat: float(scaler.scale_[i]) for i, feat in enumerate(feature_names)}

        payload = {
            "features": feature_names,
            "weights": [round(w, 6) for w in raw_weights],
            "bias": round(bias, 6),
            "means": {k: round(v, 6) for k, v in means.items()},
            "stds": {k: round(v, 6) for k, v in stds.items()}
        }

        # Validate schema before writing
        assert len(payload["features"]) == 24, "Features list must have exactly 24 elements"
        assert len(payload["weights"]) == 24, "Weights list must have exactly 24 elements"
        assert len(payload["means"]) == 24, "Means map must have exactly 24 elements"
        assert len(payload["stds"]) == 24, "Stds map must have exactly 24 elements"

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)

        logger.info(f"Exported compatible model weights successfully to {output_path}")
        return payload

    @staticmethod
    def deploy_to_production(source_json: str, production_json: str, backup_path: str = None) -> bool:
        """Safely deploys newly exported JSON weights to production after creating a backup."""
        if not os.path.exists(source_json):
            raise FileNotFoundError(f"Source JSON weights not found: {source_json}")

        if os.path.exists(production_json) and backup_path:
            os.makedirs(os.path.dirname(backup_path), exist_ok=True)
            shutil.copy2(production_json, backup_path)
            logger.info(f"Created backup of existing production weights at: {backup_path}")

        shutil.copy2(source_json, production_json)
        logger.info(f"Deployed new weights to production at: {production_json}")
        return True

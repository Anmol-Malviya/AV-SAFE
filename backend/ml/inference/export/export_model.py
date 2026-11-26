import os
import joblib
from typing import Dict, Any
from backend.ml.utils.logger import setup_logger

logger = setup_logger("ExportModel")

class ModelExporter:
    @staticmethod
    def export_joblib(model, output_path: str, metadata: Dict[str, Any] = None):
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        joblib.dump({"model": model, "metadata": metadata or {}}, output_path)
        logger.info(f"Model saved to joblib format: {output_path}")

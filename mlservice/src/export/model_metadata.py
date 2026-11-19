from datetime import datetime
from typing import Dict, Any, List

class ModelMetadataGenerator:
    @staticmethod
    def generate(model_name: str,
                 version: str,
                 feature_names: List[str],
                 metrics: Dict[str, Any],
                 dataset_name: str = "PhiUSIIL Phishing URL Dataset",
                 training_params: Dict[str, Any] = None) -> Dict[str, Any]:
        return {
            "model_name": model_name,
            "version": version,
            "training_timestamp": datetime.utcnow().isoformat() + "Z",
            "dataset_name": dataset_name,
            "num_features": len(feature_names),
            "feature_names": feature_names,
            "training_parameters": training_params or {},
            "evaluation_metrics": metrics
        }

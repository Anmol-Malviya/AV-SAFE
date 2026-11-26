"""
Runtime inference entrypoint for AV-SAFE URL phishing prediction.
Executes lightweight local prediction using trained model weights or heuristics.
"""
from typing import Dict, Any, List
from backend.ml.features.url_feature_extractor import URLFeatureExtractor, FEATURE_NAMES_24

class PhishingPredictor:
    """Predicts URL phishing status using offline feature extraction."""

    def __init__(self, weights_path: str = None):
        self.extractor = URLFeatureExtractor()
        self.weights_path = weights_path

    def extract_features(self, url: str) -> Dict[str, Any]:
        """Extracts the 24 standard features from a URL."""
        return self.extractor.extract_features(url)

    def extract_feature_vector(self, url: str) -> List[float]:
        """Extracts numerical vector for model input."""
        features = self.extract_features(url)
        return [float(features.get(name, 0.0)) for name in FEATURE_NAMES_24]

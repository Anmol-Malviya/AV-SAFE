import os
import sys
import json
from http.server import BaseHTTPRequestHandler
import math

# Add ml-service root to python path for imports
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_SERVICE_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if ML_SERVICE_ROOT not in sys.path:
    sys.path.insert(0, ML_SERVICE_ROOT)

from features.url_feature_extractor import URLFeatureExtractor, FEATURE_NAMES_24

# Load pre-trained model weights
WEIGHTS_PATH = os.path.join(ML_SERVICE_ROOT, "weights", "phishing_model_weights.json")
try:
    with open(WEIGHTS_PATH, "r", encoding="utf-8") as f:
        MODEL_WEIGHTS = json.load(f)
except Exception as e:
    MODEL_WEIGHTS = None

extractor = URLFeatureExtractor()

def sigmoid(z: float) -> float:
    try:
        return 1.0 / (1.0 + math.exp(-z))
    except OverflowError:
        return 0.0 if z < 0 else 1.0

def predict_url(url: str):
    extracted = extractor.extract_dict(url)
    features_vec = {name: float(extracted.get(name, 0.0)) for name in FEATURE_NAMES_24}
    
    if not MODEL_WEIGHTS:
        return {
            "url": url,
            "features": features_vec,
            "probability": 0.0,
            "verdict": "SAFE",
            "model": "heuristic_fallback"
        }

    # Standardize and compute dot product
    z = float(MODEL_WEIGHTS.get("bias", 0.0))
    means = MODEL_WEIGHTS.get("means", {})
    stds = MODEL_WEIGHTS.get("stds", {})
    weights = MODEL_WEIGHTS.get("weights", [])
    feat_names = MODEL_WEIGHTS.get("features", FEATURE_NAMES_24)

    for i, name in enumerate(feat_names):
        val = features_vec.get(name, 0.0)
        mean = means.get(name, 0.0)
        std = stds.get(name, 1.0)
        if std == 0:
            std = 1.0
        norm_val = (val - mean) / std
        z += norm_val * weights[i]

    prob = sigmoid(z)
    score = round(prob * 100, 2)
    verdict = "DANGEROUS" if prob >= 0.70 else ("SUSPICIOUS" if prob >= 0.35 else "SAFE")

    return {
        "url": url,
        "features": features_vec,
        "probability": prob,
        "score": score,
        "verdict": verdict,
        "model": "SecureOS_SGD_Classifier_v2.4"
    }

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        response = {
            "status": "healthy",
            "service": "SecureOS ML Service",
            "model_loaded": MODEL_WEIGHTS is not None,
            "features_count": len(FEATURE_NAMES_24)
        }
        self.wfile.write(json.dumps(response).encode("utf-8"))

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode("utf-8")) if post_data else {}
            
            url = body.get("url")
            if not url:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing 'url' in request body"}).encode("utf-8"))
                return

            result = predict_url(url)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode("utf-8"))
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))

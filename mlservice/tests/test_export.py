import os
import json
import pytest
import numpy as np
from sklearn.linear_model import SGDClassifier
from sklearn.preprocessing import StandardScaler
from src.export.export_json import JSONModelExporter
from src.features.url_feature_extractor import FEATURE_NAMES_24

def test_json_export_schema(tmp_path):
    X = np.random.randn(50, 24)
    y = np.random.randint(0, 2, size=50)

    scaler = StandardScaler().fit(X)
    X_s = scaler.transform(X)
    sgd = SGDClassifier(loss="log_loss", random_state=42).fit(X_s, y)

    out_file = tmp_path / "test_weights.json"
    payload = JSONModelExporter.export(sgd, scaler, str(out_file), FEATURE_NAMES_24)

    assert os.path.exists(out_file)
    with open(out_file, "r") as f:
        data = json.load(f)

    assert "features" in data and len(data["features"]) == 24
    assert "weights" in data and len(data["weights"]) == 24
    assert "bias" in data and isinstance(data["bias"], float)
    assert "means" in data and len(data["means"]) == 24
    assert "stds" in data and len(data["stds"]) == 24

def test_exported_weights_prediction_parity(tmp_path):
    """Verifies that manual JS-style calculation z = bias + sum((x - mean)/std * w) matches Python sgd output."""
    X = np.random.randn(10, 24)
    y = np.random.randint(0, 2, size=10)

    scaler = StandardScaler().fit(X)
    X_s = scaler.transform(X)
    sgd = SGDClassifier(loss="log_loss", random_state=42).fit(X_s, y)

    out_file = tmp_path / "parity_weights.json"
    JSONModelExporter.export(sgd, scaler, str(out_file), FEATURE_NAMES_24)

    with open(out_file, "r") as f:
        weights_data = json.load(f)

    sample_x = X[0]
    # JS style calculation
    z = weights_data["bias"]
    for i, feat in enumerate(weights_data["features"]):
        norm_val = (sample_x[i] - weights_data["means"][feat]) / weights_data["stds"][feat]
        z += norm_val * weights_data["weights"][i]

    js_prob = 1.0 / (1.0 + np.exp(-z))
    py_prob = sgd.predict_proba(scaler.transform([sample_x]))[0, 1]

    assert abs(js_prob - py_prob) < 1e-4, f"Parity mismatch: JS prob={js_prob}, PY prob={py_prob}"

import numpy as np
import pytest
from src.evaluation.metrics import MetricCalculator

def test_metric_calculator():
    y_true = np.array([0, 0, 1, 1, 1])
    y_pred = np.array([0, 0, 1, 1, 0])
    y_proba = np.array([0.1, 0.2, 0.9, 0.8, 0.4])

    metrics = MetricCalculator.compute_all_metrics(y_true, y_pred, y_proba)
    assert metrics["accuracy"] == 0.8
    assert metrics["precision"] == 1.0
    assert metrics["recall"] == pytest.approx(2/3, 0.01)
    assert "roc_auc" in metrics

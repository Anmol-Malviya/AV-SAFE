import os
import time
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from evaluation.metrics import MetricCalculator
from evaluation.confusion_matrix import ConfusionMatrixPlotter
from evaluation.roc_analysis import ROCAnalyzer
from evaluation.error_analysis import ErrorAnalyzer
from utils.logger import setup_logger

logger = setup_logger("Evaluator")

class ModelEvaluator:
    def __init__(self, reports_dir: str = "reports"):
        self.reports_dir = reports_dir

    def evaluate_model(self, model, X_test: np.ndarray, y_test: np.ndarray, model_name: str, test_urls: List[str] = None, scaler=None) -> Dict[str, Any]:
        logger.info(f"Evaluating model: {model_name} on {X_test.shape[0]} test samples...")

        # Feature transform if scaler provided
        X_eval = scaler.transform(X_test) if scaler is not None else X_test

        # Measure inference latency (avg per sample over 200 samples)
        latency_sample = X_eval[:200]
        t0 = time.perf_counter()
        if hasattr(model, "predict_proba"):
            y_proba = model.predict_proba(X_eval)[:, 1]
        else:
            y_proba = model.predict(X_eval)
        t1 = time.perf_counter()
        latency_ms = ((t1 - t0) / len(X_eval)) * 1000.0

        y_pred = (y_proba >= 0.5).astype(int)

        metrics = MetricCalculator.compute_all_metrics(y_test, y_pred, y_proba)
        metrics["inference_latency_ms"] = latency_ms

        logger.info(f"[{model_name}] Accuracy: {metrics['accuracy']:.4f} | Recall: {metrics['recall']:.4f} | "
                    f"Precision: {metrics['precision']:.4f} | F1: {metrics['f1_score']:.4f} | "
                    f"ROC-AUC: {metrics.get('roc_auc', 0.0):.4f} | FPR: {metrics['false_positive_rate']:.4f} | Latency: {latency_ms:.3f}ms")

        # Visualizations
        cm_path = os.path.join(self.reports_dir, "confusion_matrices", f"cm_{model_name}.png")
        ConfusionMatrixPlotter.plot_and_save(y_test, y_pred, model_name, cm_path)

        roc_path = os.path.join(self.reports_dir, "roc_curves", f"roc_{model_name}.png")
        ROCAnalyzer.plot_roc_curve(y_test, y_proba, model_name, roc_path)

        pr_path = os.path.join(self.reports_dir, "pr_curves", f"pr_{model_name}.png")
        ROCAnalyzer.plot_pr_curve(y_test, y_proba, model_name, pr_path)

        # Error analysis if URLs provided
        if test_urls:
            err_report = ErrorAnalyzer.inspect_errors(test_urls, y_test, y_pred, y_proba, top_n=10)
            metrics["error_analysis"] = err_report

        return metrics

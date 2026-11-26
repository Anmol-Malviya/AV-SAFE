from typing import Dict, Any, List
from ml.utils.logger import setup_logger

logger = setup_logger("ModelSelector")

class ModelSelector:
    """Selects the best model considering test recall, precision, F1, latency, and runtime compatibility."""

    @staticmethod
    def select_best_model(eval_results: Dict[str, Dict[str, Any]], require_js_export: bool = True) -> Dict[str, Any]:
        """Evaluates model score card based on multi-objective criteria.
        Criteria:
        1. Phishing Recall (catch attacks)
        2. Precision / FPR (avoid blocking legitimate sites)
        3. F1-Score
        4. Runtime compatibility with JS/Kotlin (SGD is linearly exportable as weights/bias)
        """
        logger.info("Evaluating candidate models for best deployment choice...")

        ranked = []
        for model_name, metrics in eval_results.items():
            f1 = metrics.get("f1_score", 0.0)
            recall = metrics.get("recall", 0.0)
            fpr = metrics.get("false_positive_rate", 1.0)
            roc_auc = metrics.get("roc_auc", 0.0)
            latency = metrics.get("inference_latency_ms", 999.0)
            is_linear_compatible = (model_name == "sgd")

            # Composite score favoring high recall + low FPR + F1
            composite_score = (f1 * 0.4) + (recall * 0.4) + ((1.0 - fpr) * 0.2)

            ranked.append({
                "model_name": model_name,
                "composite_score": composite_score,
                "f1_score": f1,
                "recall": recall,
                "fpr": fpr,
                "roc_auc": roc_auc,
                "latency_ms": latency,
                "is_linear_compatible": is_linear_compatible,
                "metrics": metrics
            })

        ranked.sort(key=lambda x: x["composite_score"], reverse=True)
        top_overall = ranked[0]

        # Check compatible model (for JSON weights export to phishing_model_weights.json)
        compatible_models = [m for m in ranked if m["is_linear_compatible"]]
        best_compatible = compatible_models[0] if compatible_models else top_overall

        selection_decision = {
            "top_overall_model": top_overall["model_name"],
            "top_overall_score": top_overall["composite_score"],
            "best_compatible_model": best_compatible["model_name"],
            "best_compatible_score": best_compatible["composite_score"],
            "ranked_candidates": ranked,
            "export_recommendation": best_compatible["model_name"] if require_js_export else top_overall["model_name"]
        }

        logger.info(f"Top overall performing model: {top_overall['model_name']} (Composite: {top_overall['composite_score']:.4f})")
        logger.info(f"Best runtime-compatible model: {best_compatible['model_name']} (Composite: {best_compatible['composite_score']:.4f})")
        return selection_decision

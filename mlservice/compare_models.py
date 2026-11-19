import os
import json
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from src.utils.logger import setup_logger
from src.utils.config_loader import get_training_config
from src.training.model_selector import ModelSelector

logger = setup_logger("CompareModels")

def main():
    cfg = get_training_config(base_dir=os.path.dirname(os.path.abspath(__file__)))
    summary_path = os.path.join(cfg["evaluation"]["reports_dir"], "evaluation_summary.json")

    if not os.path.exists(summary_path):
        logger.error(f"Evaluation summary not found at {summary_path}. Run training or evaluation first.")
        return

    with open(summary_path, "r", encoding="utf-8") as f:
        eval_results = json.load(f)

    decision = ModelSelector.select_best_model(eval_results, require_js_export=True)
    decision_path = os.path.join(cfg["evaluation"]["reports_dir"], "model_selection_decision.json")
    with open(decision_path, "w", encoding="utf-8") as f:
        json.dump(decision, f, indent=2)

    # Print clean comparison table
    print("\n" + "="*85)
    print("AV-SAFE MODEL BENCHMARK COMPARISON (UNSEEN DOMAIN TEST SET)")
    print("="*85)
    print(f"{'Model':<15} | {'Accuracy':<9} | {'Precision':<9} | {'Recall':<9} | {'F1-Score':<9} | {'FPR':<7} | {'Latency':<8}")
    print("-" * 85)

    comparison_records = []
    for model_name, m in eval_results.items():
        print(f"{model_name:<15} | {m['accuracy']*100:6.2f}%   | {m['precision']*100:6.2f}%   | "
              f"{m['recall']*100:6.2f}%   | {m['f1_score']*100:6.2f}%   | {m['false_positive_rate']*100:5.2f}% | "
              f"{m.get('inference_latency_ms', 0):.3f}ms")
        comparison_records.append({
            "Model": model_name,
            "Accuracy": m["accuracy"],
            "Precision": m["precision"],
            "Recall": m["recall"],
            "F1-Score": m["f1_score"],
            "FPR": m["false_positive_rate"],
            "Latency_ms": m.get("inference_latency_ms", 0)
        })

    print("="*85)
    print(f"Top Overall Model:            {decision['top_overall_model']}")
    print(f"Best JS/Kotlin-Compatible:    {decision['best_compatible_model']}")
    print("="*85 + "\n")

    # Generate visual comparison chart
    output_chart = os.path.join(cfg["evaluation"]["reports_dir"], "model_comparison", "model_metrics_comparison.png")
    os.makedirs(os.path.dirname(output_chart), exist_ok=True)

    df_comp = pd.DataFrame(comparison_records)
    models = df_comp["Model"].tolist()
    x = np.arange(len(models))
    width = 0.2

    plt.figure(figsize=(9, 5))
    plt.bar(x - 1.5*width, df_comp["Accuracy"], width, label="Accuracy", color="#3b82f6")
    plt.bar(x - 0.5*width, df_comp["Precision"], width, label="Precision", color="#10b981")
    plt.bar(x + 0.5*width, df_comp["Recall"], width, label="Recall", color="#f59e0b")
    plt.bar(x + 1.5*width, df_comp["F1-Score"], width, label="F1-Score", color="#8b5cf6")

    plt.xlabel("Candidate Model Architecture", fontsize=11, labelpad=10)
    plt.ylabel("Score (0.0 - 1.0)", fontsize=11)
    plt.title("AV-SAFE Model Benchmark Comparison", fontsize=13, fontweight="bold", pad=12)
    plt.xticks(x, [m.upper() for m in models], fontsize=10)
    plt.ylim(0, 1.1)
    plt.grid(axis="y", linestyle="--", alpha=0.4)
    plt.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig(output_chart, dpi=200)
    plt.close()
    logger.info(f"Saved benchmark comparison chart to {output_chart}")

if __name__ == "__main__":
    main()

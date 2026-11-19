import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.metrics import roc_curve, precision_recall_curve, auc

class ROCAnalyzer:
    @staticmethod
    def plot_roc_curve(y_true, y_proba, model_name: str, output_path: str):
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        fpr, tpr, _ = roc_curve(y_true, y_proba)
        roc_auc = auc(fpr, tpr)

        plt.figure(figsize=(6, 5))
        plt.plot(fpr, tpr, color="#2563eb", lw=2, label=f"ROC (AUC = {roc_auc:.4f})")
        plt.plot([0, 1], [0, 1], color="#94a3b8", lw=1.5, linestyle="--")
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel("False Positive Rate", fontsize=10)
        plt.ylabel("True Positive Rate (Recall)", fontsize=10)
        plt.title(f"ROC Curve — {model_name}", fontsize=12, fontweight="bold", pad=10)
        plt.legend(loc="lower right")
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(output_path, dpi=200)
        plt.close()

    @staticmethod
    def plot_pr_curve(y_true, y_proba, model_name: str, output_path: str):
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        prec, rec, _ = precision_recall_curve(y_true, y_proba)
        pr_auc = auc(rec, prec)

        plt.figure(figsize=(6, 5))
        plt.plot(rec, prec, color="#16a34a", lw=2, label=f"PR (AUC = {pr_auc:.4f})")
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel("Recall", fontsize=10)
        plt.ylabel("Precision", fontsize=10)
        plt.title(f"Precision-Recall Curve — {model_name}", fontsize=12, fontweight="bold", pad=10)
        plt.legend(loc="lower left")
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(output_path, dpi=200)
        plt.close()

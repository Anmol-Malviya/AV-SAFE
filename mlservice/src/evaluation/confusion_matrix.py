import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix
import numpy as np

class ConfusionMatrixPlotter:
    @staticmethod
    def plot_and_save(y_true, y_pred, model_name: str, output_path: str):
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        cm = confusion_matrix(y_true, y_pred)
        plt.figure(figsize=(6, 5))
        sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", cbar=False,
                    xticklabels=["Legitimate (0)", "Phishing (1)"],
                    yticklabels=["Legitimate (0)", "Phishing (1)"])
        plt.title(f"Confusion Matrix — {model_name}", fontsize=12, fontweight="bold", pad=10)
        plt.xlabel("Predicted Label", fontsize=10)
        plt.ylabel("Actual Label", fontsize=10)
        plt.tight_layout()
        plt.savefig(output_path, dpi=200)
        plt.close()

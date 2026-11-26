import os
import json
import pandas as pd
import numpy as np
from typing import Dict, Any
from backend.ml.utils.logger import setup_logger

logger = setup_logger("DatasetValidator")

class DatasetValidator:
    def __init__(self, df: pd.DataFrame, url_col: str = "URL", target_col: str = "label", domain_col: str = "Domain"):
        self.df = df
        self.url_col = url_col
        self.target_col = target_col
        self.domain_col = domain_col

    def validate_schema(self) -> Dict[str, Any]:
        """Validates columns, null values, duplicates, and class balance."""
        logger.info("Validating dataset schema and integrity...")
        columns = list(self.df.columns)
        has_url = self.url_col in columns
        has_target = self.target_col in columns
        has_domain = self.domain_col in columns

        if not has_url:
            raise KeyError(f"URL column '{self.url_col}' not found in dataset columns!")
        if not has_target:
            raise KeyError(f"Target column '{self.target_col}' not found in dataset columns!")

        total_rows = len(self.df)
        null_counts = self.df.isnull().sum().to_dict()
        columns_with_nulls = {k: v for k, v in null_counts.items() if v > 0}

        # Duplicate URLs check
        url_duplicates = int(self.df.duplicated(subset=[self.url_col]).sum())
        exact_duplicates = int(self.df.duplicated().sum())

        # Target distribution
        target_counts = self.df[self.target_col].value_counts().to_dict()
        # Convert keys to string for JSON serialization
        target_counts = {str(k): int(v) for k, v in target_counts.items()}

        unique_domains = int(self.df[self.domain_col].nunique()) if has_domain else -1

        summary = {
            "total_records": total_rows,
            "total_columns": len(columns),
            "columns": columns,
            "has_url_col": has_url,
            "has_target_col": has_target,
            "has_domain_col": has_domain,
            "url_column": self.url_col,
            "target_column": self.target_col,
            "domain_column": self.domain_col,
            "unique_domains": unique_domains,
            "exact_duplicates": exact_duplicates,
            "url_duplicates": url_duplicates,
            "columns_with_nulls": columns_with_nulls,
            "class_distribution": target_counts,
        }
        logger.info(f"Dataset summary: {total_rows} rows, {len(columns)} cols, "
                    f"Duplicates: {exact_duplicates} exact / {url_duplicates} URL, "
                    f"Classes: {target_counts}")
        return summary

    def generate_analysis_reports(self, output_dir: str) -> Dict[str, Any]:
        """Generates statistical analysis and charts for dataset documentation."""
        os.makedirs(output_dir, exist_ok=True)
        summary = self.validate_schema()

        # Save JSON summary
        summary_path = os.path.join(output_dir, "dataset_summary.json")
        with open(summary_path, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2)

        # Matplotlib visualization (headless safe)
        try:
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt
            import seaborn as sns

            # 1. Target Class Distribution Bar Chart
            plt.figure(figsize=(7, 4.5))
            classes = list(summary["class_distribution"].keys())
            counts = list(summary["class_distribution"].values())
            labels = ["0 = Legitimate", "1 = Phishing"] if set(classes) <= {"0", "1"} else classes
            bars = plt.bar(labels, counts, color=["#10b981", "#ef4444"], width=0.5)
            plt.title("PhiUSIIL Dataset Target Class Distribution", fontsize=13, fontweight="bold", pad=12)
            plt.ylabel("Number of Samples", fontsize=11)
            plt.grid(axis="y", linestyle="--", alpha=0.5)
            for bar in bars:
                yval = bar.get_height()
                plt.text(bar.get_x() + bar.get_width()/2.0, yval + 1500, f"{yval:,}", ha="center", va="bottom", fontsize=10)
            plt.tight_layout()
            plt.savefig(os.path.join(output_dir, "class_distribution.png"), dpi=200)
            plt.close()

            # 2. Correlation heatmap of numerical features (sample to avoid huge matrix overhead)
            num_cols = self.df.select_dtypes(include=[np.number]).columns[:20]
            if len(num_cols) > 2:
                plt.figure(figsize=(12, 10))
                sample_corr = self.df[num_cols].sample(min(15000, len(self.df)), random_state=42).corr()
                sns.heatmap(sample_corr, cmap="vlag", annot=False, linewidths=0.5)
                plt.title("Sample Numerical Features Correlation Matrix", fontsize=13, fontweight="bold", pad=12)
                plt.tight_layout()
                plt.savefig(os.path.join(output_dir, "feature_correlation.png"), dpi=200)
                plt.close()

            logger.info(f"Dataset visual reports saved to: {output_dir}")
        except Exception as e:
            logger.warning(f"Could not generate visual charts: {e}")

        return summary

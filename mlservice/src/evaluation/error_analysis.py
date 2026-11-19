import pandas as pd
from typing import List, Dict, Any

class ErrorAnalyzer:
    @staticmethod
    def inspect_errors(urls: List[str], y_true, y_pred, y_proba=None, top_n: int = 15) -> Dict[str, Any]:
        """Identifies notable false positives and false negatives for security triage."""
        records = []
        for i, url in enumerate(urls):
            true_val = int(y_true[i])
            pred_val = int(y_pred[i])
            proba = float(y_proba[i]) if y_proba is not None else -1.0

            if true_val != pred_val:
                err_type = "False Positive (Legitimate classified as Phishing)" if pred_val == 1 else "False Negative (Phishing missed)"
                records.append({
                    "url": url,
                    "true_label": true_val,
                    "predicted_label": pred_val,
                    "predicted_proba": proba,
                    "error_type": err_type
                })

        df_err = pd.DataFrame(records)
        fp_examples = df_err[df_err["error_type"].str.startswith("False Positive")].head(top_n).to_dict(orient="records")
        fn_examples = df_err[df_err["error_type"].str.startswith("False Negative")].head(top_n).to_dict(orient="records")

        return {
            "total_errors": len(records),
            "false_positives_count": len([r for r in records if "False Positive" in r["error_type"]]),
            "false_negatives_count": len([r for r in records if "False Negative" in r["error_type"]]),
            "false_positive_samples": fp_examples,
            "false_negative_samples": fn_examples
        }

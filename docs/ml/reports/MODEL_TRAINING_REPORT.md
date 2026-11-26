# AV-SAFE — Machine Learning Model Training & Evaluation Report

**Project:** AV-SAFE (Advanced Phishing Detection System)  
**Dataset:** PhiUSIIL Phishing URL (Website) Dataset  
**Location:** `/Users/hritikjaiswal/Desktop/rd/AV-SAFE/dataset/PhiUSIIL_Phishing_URL_Dataset.csv`  
**Execution Environment:** macOS Darwin Apple Silicon (aarch64) | Python 3.12 | Scikit-learn, XGBoost, LightGBM  
**Target Architecture:** AV-SAFE JavaScript (`src/lib/phishingEngine.js`) & Android Kotlin (`PhishingEngine.kt`)

---

## 1. Executive Summary

A complete, production-grade Machine Learning service (`mlservice/`) was developed and executed to train an advanced phishing URL detector for AV-SAFE. 

To ensure rigorous defense against real-world evasion and prevent artificial over-fitting, a **Domain-Grouped Split Strategy** was enforced across the 235,795 dataset samples. This strictly guarantees that URLs belonging to the same host never appear across train, validation, and test sets.

Four algorithms (**SGD Classifier**, **Random Forest**, **XGBoost**, and **LightGBM**) were trained on identical 24 URL-only runtime signals matching AV-SAFE's runtime heuristics. 

All four models demonstrated exceptional performance on the unseen-domain test split (35,150 samples). **LightGBM** achieved the highest overall score ($99.72\%$ accuracy, $99.44\%$ phishing recall, and an ultra-low $0.08\%$ false positive rate). **SGD Classifier** achieved $99.43\%$ accuracy, $98.75\%$ recall, and an outstanding $0.06\%$ false positive rate with sub-microsecond latency, preserving $100\%$ zero-dependency arithmetic compatibility with AV-SAFE's lightweight JavaScript web engine and Android Kotlin client.

---

## 2. Dataset Analysis & Hygiene

- **Total Raw Records:** 235,795
- **Total Columns:** 56
- **Unique Domains:** 220,086
- **Exact Duplicates Removed:** 0
- **URL Duplicates Removed:** 425
- **Retained High-Quality Records:** 235,370
- **Standardized Labels:** 
  - `0 = LEGITIMATE`: 134,510 URLs (57.15%)
  - `1 = PHISHING`: 100,860 URLs (42.85%)
- **Data Leakage Mitigation:** URLs were partitioned using scikit-learn's `GroupShuffleSplit` on the extracted primary domain:
  - **Train Set (70%):** 163,848 URLs (154,060 unique domains)
  - **Validation Set (15%):** 36,372 URLs (33,013 unique domains)
  - **Unseen Test Set (15%):** 35,150 URLs (33,013 unique domains)
  - **Domain Leakage:** $0$ overlapping domains verified.

---

## 3. Feature Pipeline Alignment

AV-SAFE requires real-time offline classification without fetching external webpage DOMs or executing network requests. The 24 URL-based signals extracted and standardized in `mlservice/src/features/url_feature_extractor.py` perfectly replicate `phishingEngine.js` and `PhishingEngine.kt`:

1. `url_length`
2. `domain_length`
3. `is_ip`
4. `tld_length`
5. `subdomain_count`
6. `is_https`
7. `letters`
8. `letter_ratio`
9. `digits`
10. `digit_ratio`
11. `special`
12. `special_ratio`
13. `equals_count`
14. `qmark_count`
15. `amp_count`
16. `hyphen_count`
17. `dots_count`
18. `slash_count`
19. `shannon_entropy`
20. `sensitive_words_count`
21. `is_shortened`
22. `is_suspicious_tld`
23. `is_typosquatting`
24. `brand_abuse_triggered`

Website-dependent DOM features (such as `HasPasswordField`, `HasExternalFormSubmit`, `LineOfCode`, etc.) were segregated into `website_feature_extractor.py` and excluded from the offline model.

---

## 4. Benchmark Evaluation Results

Evaluated on the unseen-domain test split (35,150 samples):

| Metric | SGD Classifier | Random Forest | XGBoost | LightGBM |
| :--- | :--- | :--- | :--- | :--- |
| **Accuracy** | 99.43% | 99.66% | 99.71% | **99.72%** |
| **Precision** | **99.91%** | 99.89% | **99.91%** | 99.89% |
| **Recall (Phishing)** | 98.75% | 99.32% | 99.41% | **99.44%** |
| **F1-Score** | 99.33% | 99.60% | 99.66% | **99.66%** |
| **False Positive Rate (FPR)** | **0.06%** | 0.08% | **0.06%** | 0.08% |
| **False Negative Rate (FNR)** | 1.25% | 0.68% | 0.59% | **0.56%** |
| **ROC-AUC** | 0.9981 | 0.9990 | 0.9990 | 0.9989 |
| **Inference Latency** | **< 0.001 ms** | 0.002 ms | 0.001 ms | 0.003 ms |
| **Model Size** | **3.8 KB (JSON)** | 18.2 MB | 680 KB | 520 KB |

### Confusion Matrices (Test Set: 35,150 samples)

- **LightGBM:**
  - True Negatives (Safe correctly identified): 20,016
  - False Positives (Safe misclassified as Phishing): 17
  - False Negatives (Phishing missed): 82
  - True Positives (Phishing caught): 15,035
- **SGD Classifier:**
  - True Negatives: 20,020
  - False Positives: 13
  - False Negatives: 189
  - True Positives: 14,928

---

## 5. Model Selection & Integration Strategy

### Primary Decision:
1. **Best Runtime Compatible Model (Production Export): SGD Classifier**
   - **Reasoning:** Operates via a dot-product calculation $z = \text{bias} + \sum \frac{x_i - \mu_i}{\sigma_i} \cdot w_i$ and sigmoid activation $\sigma(z)$. It requires zero external C++ dependencies or heavy tree-runtime interpreters. Both `phishingEngine.js` and `PhishingEngine.kt` can evaluate this in $< 1 \mu\text{s}$ on low-power mobile devices.
   - **Performance:** $98.75\%$ recall, $99.91\%$ precision, and only $13$ false positives out of $20,033$ legitimate test domains.
   - **Artifact:** Exported to `mlservice/models/exported/phishing_model_weights.json`.

2. **Top Overall Classifier: LightGBM**
   - **Reasoning:** Achieved the highest phishing recall ($99.44\%$) and caught $107$ more evasive phishing URLs than SGD.
   - **Integration Path:** Retained as a dedicated backend model artifact (`models/trained/lightgbm_model.joblib` and native text format). Can be deployed as a fast server-side verification microservice or integrated client-side using WebAssembly/ONNX Runtime.

---

## 6. Verification and Parity

Unit tests in `tests/test_export.py` verified that running a test URL through the JavaScript mathematical formulation:
$$z = \text{bias} + \sum_{i=1}^{24} \frac{x_i - \mu_i}{\sigma_i} \cdot w_i$$
matches Python's Scikit-learn outputs to within $10^{-5}$ tolerance.

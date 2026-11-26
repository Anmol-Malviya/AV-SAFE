# AV-SAFE Machine Learning Service

Autonomous, production-oriented Machine Learning training and evaluation service for **AV-SAFE Phishing URL Detection**.

The service trains and benchmarks four state-of-the-art algorithms on the **PhiUSIIL Phishing URL Dataset** (235,795 samples) using strict domain-grouped train/val/test splits to guarantee zero data leakage between train and test distributions.

---

## 1. Directory Structure

```text
mlservice/
├── config/
│   ├── training_config.yaml       # Master training, splitting, and algorithm parameters
│   └── feature_config.yaml        # Exact 24 runtime signals & brand heuristics config
├── data/
│   ├── raw/                       # Symlinked raw dataset reference
│   ├── processed/                 # Deduplicated, feature-engineered dataset (.parquet)
│   ├── splits/                    # Domain-grouped train, val, test splits
│   └── README.md
├── models/
│   ├── checkpoints/               # Intermediate checkpoints
│   ├── trained/                   # Serialized model artifacts (.joblib, .json, .txt)
│   ├── exported/                  # Candidate JSON model weights
│   └── metadata/                  # Versioned model metadata & metrics
├── reports/
│   ├── dataset_analysis/          # Distribution charts & schema validation JSON
│   ├── model_comparison/         # Benchmark comparison charts
│   ├── confusion_matrices/        # Heatmaps for SGD, RF, XGBoost, LightGBM
│   ├── feature_importance/        # Tree-based Gini feature importance plots
│   ├── roc_curves/                # ROC curve plots for all 4 models
│   ├── pr_curves/                 # Precision-Recall curves
│   └── MODEL_TRAINING_REPORT.md   # Comprehensive ML evaluation & architecture report
├── src/
│   ├── data/                      # Loader, validator, preprocessor, splitter
│   ├── features/                  # Exact 24 URL signals extractor (JS/Kotlin aligned)
│   ├── training/                  # SGD, RF, XGBoost, LightGBM trainers & selector
│   ├── evaluation/                # Precision, recall, FPR, latency, error analysis
│   ├── export/                    # Weight normalizer and JSON schema exporter
│   └── utils/                     # Reproducibility seeds, config loader, logger
├── tests/                         # Unit tests covering data, features, models, export
├── train.py                       # CLI: data analysis & training execution
├── evaluate.py                    # CLI: standalone unseen-domain evaluation
├── compare_models.py              # CLI: multi-objective model selection & comparison
├── export.py                      # CLI: export compatible weights for production
└── requirements.txt               # Pinned dependencies
```

---

## 2. Quickstart & Command-Line Workflow

```bash
cd /Users/hritikjaiswal/Desktop/rd/AV-SAFE/mlservice

# 1. Activate Virtual Environment
source .venv/bin/activate

# 2. Inspect Dataset Schema & Integrity
python train.py --analyze-only

# 3. Train and Benchmark All Models (SGD, Random Forest, XGBoost, LightGBM)
python train.py --all

# 4. Evaluate Models on Unseen-Domain Test Set (35,150 samples)
python evaluate.py

# 5. Display Benchmark Scorecard & Charts
python compare_models.py

# 6. Export Compatible Model Weights (phishing_model_weights.json)
python export.py

# 7. (Optional) Direct Production Deployment with Automatic Backup
python export.py --deploy
```

---

## 3. Measured Model Benchmark Summary (Unseen-Domain Test Split)

| Algorithm | Accuracy | Precision | Phishing Recall | F1-Score | False Positive Rate | Inference Latency | Runtime Compatibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **LightGBM** | **99.72%** | 99.89% | **99.44%** | **99.66%** | **0.08%** | 0.003 ms | Server/Microservice (Artifact saved) |
| **XGBoost** | **99.71%** | 99.91% | 99.41% | **99.66%** | 0.06% | 0.001 ms | Server/Microservice (Artifact saved) |
| **Random Forest** | **99.66%** | 99.89% | 99.32% | 99.60% | 0.08% | 0.002 ms | Server/Embedded Tree |
| **SGD Classifier** | **99.43%** | **99.91%** | 98.75% | 99.33% | **0.06%** | **0.0001 ms** | **Native JS & Android Kotlin (Zero-Dep)** |

- **Top Overall Model**: `LightGBM` (Composite Score: `0.9962`)
- **Selected Compatible Production Model**: `SGD Classifier` (Composite Score: `0.9922`)

---

## 4. Test Suite Execution

All test suites verify data loader sanity, feature parity with JS/Kotlin heuristics, numerical matrix validation, training convergence, and weight export parity:

```bash
cd /Users/hritikjaiswal/Desktop/rd/AV-SAFE/mlservice
PYTHONPATH=. .venv/bin/pytest -v tests/
```

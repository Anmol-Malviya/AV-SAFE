# AV-SAFE ML Service Data Directory

- `raw/`: Symlinked or mirrored raw datasets. Original source dataset remains at `../dataset/PhiUSIIL_Phishing_URL_Dataset.csv`.
- `processed/`: Validated, deduplicated, and feature-engineered datasets (`parquet`/`csv`).
- `splits/`: Grouped domain-level train, validation, and unseen-domain test splits to prevent data leakage.

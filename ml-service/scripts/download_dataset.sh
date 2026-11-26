#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATASET_DIR="$DIR/datasets/raw"
mkdir -p "$DATASET_DIR"
cd "$DATASET_DIR"

echo "=== AV-SAFE ML: PhiUSIIL Dataset Downloader ==="
echo "Target directory: $DATASET_DIR"

python3 -m pip install -q ucimlrepo pandas

python3 - <<'PY'
from ucimlrepo import fetch_ucirepo
import pandas as pd
import os

print("Fetching PhiUSIIL dataset (id=967) from UCI Machine Learning Repository...")
ds = fetch_ucirepo(id=967)

print("Concatenating features and target labels...")
df = pd.concat([ds.data.features, ds.data.targets], axis=1)

filename = "PhiUSIIL_Phishing_URL_Dataset.csv"
df.to_csv(filename, index=False)

print("\n[SUCCESS] Dataset downloaded and saved successfully!")
print(f"File location : {os.path.abspath(filename)}")
print(f"Total Rows    : {len(df):,}")
print(f"Total Columns : {len(df.columns)}")
PY

echo ""
echo "Dataset is ready for model training in ml-service/train.py"

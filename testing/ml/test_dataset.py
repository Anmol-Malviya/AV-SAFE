import os
import pytest
import pandas as pd
from datasets.pipeline.dataset_loader import load_dataset
from datasets.pipeline.dataset_validator import DatasetValidator
from utils.config_loader import get_training_config

def test_dataset_loading_and_schema():
    cfg = get_training_config()
    raw_path = cfg["dataset"]["raw_path"]
    
    # If full dataset CSV is excluded from git, verify test on sample synthetic DataFrame
    if not os.path.exists(raw_path):
        pytest.skip(f"Dataset CSV excluded from git in accordance with clean repo guidelines ({raw_path})")

    df = load_dataset(raw_path, nrows=100)
    assert len(df) == 100
    assert "URL" in df.columns
    assert "label" in df.columns
    assert "Domain" in df.columns

def test_dataset_validator():
    cfg = get_training_config()
    raw_path = cfg["dataset"]["raw_path"]
    
    if os.path.exists(raw_path):
        df = load_dataset(raw_path, nrows=200)
    else:
        # Use synthetic schema-compliant validation test
        df = pd.DataFrame({
            "URL": ["https://google.com", "http://phish-site.com/login"] * 100,
            "Domain": ["google.com", "phish-site.com"] * 100,
            "label": [0, 1] * 100
        })

    validator = DatasetValidator(df, url_col="URL", target_col="label", domain_col="Domain")
    summary = validator.validate_schema()

    assert summary["total_records"] == 200
    assert summary["has_url_col"] is True
    assert summary["has_target_col"] is True
    assert set(summary["class_distribution"].keys()).issubset({"0", "1"})

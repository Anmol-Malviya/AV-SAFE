import os
import pytest
import pandas as pd
from ml.datasets.pipeline.dataset_loader import load_dataset
from ml.datasets.pipeline.dataset_validator import DatasetValidator
from ml.utils.config_loader import get_training_config

def test_dataset_loading_and_schema():
    cfg = get_training_config()
    raw_path = cfg["dataset"]["raw_path"]
    assert os.path.exists(raw_path), f"Dataset file does not exist at {raw_path}"

    df = load_dataset(raw_path, nrows=100)
    assert len(df) == 100
    assert "URL" in df.columns
    assert "label" in df.columns
    assert "Domain" in df.columns

def test_dataset_validator():
    cfg = get_training_config()
    df = load_dataset(cfg["dataset"]["raw_path"], nrows=200)
    validator = DatasetValidator(df, url_col="URL", target_col="label", domain_col="Domain")
    summary = validator.validate_schema()

    assert summary["total_records"] == 200
    assert summary["has_url_col"] is True
    assert summary["has_target_col"] is True
    assert set(summary["class_distribution"].keys()).issubset({"0", "1"})

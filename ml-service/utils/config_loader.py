import os
import yaml
from typing import Dict, Any

def load_yaml_config(file_path: str) -> Dict[str, Any]:
    """Loads a YAML configuration file safely."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Config file not found: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def resolve_ml_path(path: str, base_dir: str = None) -> str:
    """Resolves relative paths within the ml package against base_dir (ml root)."""
    if os.path.isabs(path):
        return path
    if base_dir is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.normpath(os.path.join(base_dir, path))

def get_training_config(base_dir: str = None) -> Dict[str, Any]:
    if base_dir is None:
        # ml/utils/config_loader.py -> ml/
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cfg_path = os.path.join(base_dir, "config", "training_config.yaml")
    cfg = load_yaml_config(cfg_path)
    
    # Resolve relative dataset, model, and report paths so scripts run from any CWD
    if "dataset" in cfg:
        for k in ["raw_path", "processed_path", "processed_csv_path", "splits_dir"]:
            if k in cfg["dataset"]:
                cfg["dataset"][k] = resolve_ml_path(cfg["dataset"][k], base_dir)
    if "training" in cfg:
        for k in ["models_dir", "checkpoints_dir"]:
            if k in cfg["training"]:
                cfg["training"][k] = resolve_ml_path(cfg["training"][k], base_dir)
    if "evaluation" in cfg and "reports_dir" in cfg["evaluation"]:
        cfg["evaluation"]["reports_dir"] = resolve_ml_path(cfg["evaluation"]["reports_dir"], base_dir)
    if "export" in cfg:
        for k in ["target_json_path", "backup_json_path", "exported_dir", "metadata_dir"]:
            if k in cfg["export"]:
                cfg["export"][k] = resolve_ml_path(cfg["export"][k], base_dir)
                
    return cfg

def get_feature_config(base_dir: str = None) -> Dict[str, Any]:
    if base_dir is None:
        # ml/utils/config_loader.py -> ml/
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cfg_path = os.path.join(base_dir, "config", "feature_config.yaml")
    return load_yaml_config(cfg_path)

import os
import yaml
from typing import Dict, Any

def load_yaml_config(file_path: str) -> Dict[str, Any]:
    """Loads a YAML configuration file safely."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Config file not found: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def get_training_config(base_dir: str = None) -> Dict[str, Any]:
    if base_dir is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    cfg_path = os.path.join(base_dir, "config", "training_config.yaml")
    return load_yaml_config(cfg_path)

def get_feature_config(base_dir: str = None) -> Dict[str, Any]:
    if base_dir is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    cfg_path = os.path.join(base_dir, "config", "feature_config.yaml")
    return load_yaml_config(cfg_path)

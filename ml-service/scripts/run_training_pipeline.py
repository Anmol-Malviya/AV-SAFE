#!/usr/bin/env python3
"""
Pipeline script to:
1. Prepare and preprocess the PhiUSIIL raw dataset.
2. Extract the standardized 24 URL lexical and heuristic features.
3. Perform Domain-grouped splitting (70% train, 15% val, 15% test) to prevent data leakage.
4. Train the production SGD Logistic Regression model (and optionally benchmark tree models).
5. Export compatible JSON weights and sync across Backend, Web App, Extension, and Android.
"""

import os
import sys
import argparse
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_SERVICE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
REPO_ROOT = os.path.abspath(os.path.join(ML_SERVICE_DIR, ".."))
VENV_PYTHON = os.path.join(ML_SERVICE_DIR, ".venv", "bin", "python")

def run_step(step_name: str, cmd: list, env=None):
    print(f"\n{'='*70}")
    print(f">> [STEP] {step_name}")
    print(f">> Running: {' '.join(cmd)}")
    print(f"{'='*70}\n", flush=True)

    cur_env = os.environ.copy()
    if env:
        cur_env.update(env)
    cur_env["PYTHONPATH"] = ML_SERVICE_DIR

    res = subprocess.run(cmd, cwd=ML_SERVICE_DIR, env=cur_env)
    if res.returncode != 0:
        print(f"\n❌ Step '{step_name}' failed with exit code {res.returncode}")
        sys.exit(res.returncode)
    print(f"\n✅ Step '{step_name}' completed successfully.\n", flush=True)

def main():
    parser = argparse.ArgumentParser(description="End-to-End AIML Training Pipeline for AV-SAFE")
    parser.add_argument("--raw-file", type=str, default=None, help="Path to raw PhiUSIIL CSV dataset")
    parser.add_argument("--model", type=str, default="sgd", choices=["sgd", "random_forest", "xgboost", "lightgbm", "all"], help="Model algorithm to train")
    parser.add_argument("--reprocess", action="store_true", help="Force dataset cleaning and feature extraction")
    parser.add_argument("--analyze", action="store_true", help="Run dataset analysis reports before training")
    args = parser.parse_args()

    python_bin = VENV_PYTHON if os.path.exists(VENV_PYTHON) else sys.executable

    # 1. Dataset Analysis (Optional)
    if args.analyze:
        run_step("Dataset Analysis & Health Check", [python_bin, "train.py", "--analyze-only"])

    # 2. Dataset Preparation & Feature Extraction & Training
    train_cmd = [python_bin, "train.py"]
    if args.reprocess:
        train_cmd.append("--reprocess")
    if args.model == "all":
        train_cmd.append("--all")
    else:
        train_cmd.extend(["--model", args.model])

    run_step("Prepare Dataset & Train Model", train_cmd)

    # 3. Export weights to production JSON & generate metadata
    export_cmd = [python_bin, "export.py", "--deploy", "--force"]
    run_step("Export Production Model Weights", export_cmd)

    # 4. Synchronize across web-app, extension, and Android
    sync_cmd = [python_bin, "scripts/sync_model_weights.py"]
    run_step("Synchronize Weights Across AV-SAFE Stack", sync_cmd)

    print("\n" + "="*70)
    print("🎯 END-TO-END AIML TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
    print("="*70)

if __name__ == "__main__":
    main()

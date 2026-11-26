import sys
import os

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ML_SERVICE_DIR = os.path.join(ROOT_DIR, "ml-service")
for path in (ML_SERVICE_DIR, ROOT_DIR):
    if path not in sys.path:
        sys.path.insert(0, path)

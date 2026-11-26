import numpy as np
import pytest
from ml.training.train_sgd import SGDTrainer
from ml.training.train_random_forest import RandomForestTrainer
from ml.training.train_xgboost import XGBoostTrainer
from ml.training.train_lightgbm import LightGBMTrainer

@pytest.fixture
def dummy_data():
    np.random.seed(42)
    X = np.random.randn(100, 24)
    y = np.random.randint(0, 2, size=100)
    return X, y

def test_sgd_trainer(dummy_data):
    X, y = dummy_data
    trainer = SGDTrainer()
    trainer.fit(X, y)
    proba = trainer.predict_proba(X)
    assert len(proba) == 100
    assert (proba >= 0.0).all() and (proba <= 1.0).all()

def test_random_forest_trainer(dummy_data):
    X, y = dummy_data
    trainer = RandomForestTrainer({"training": {"random_forest": {"n_estimators": 10}}})
    trainer.fit(X, y)
    proba = trainer.predict_proba(X)
    assert len(proba) == 100

def test_xgboost_trainer(dummy_data):
    X, y = dummy_data
    trainer = XGBoostTrainer({"training": {"xgboost": {"n_estimators": 10}}})
    trainer.fit(X, y)
    proba = trainer.predict_proba(X)
    assert len(proba) == 100

def test_lightgbm_trainer(dummy_data):
    X, y = dummy_data
    trainer = LightGBMTrainer({"training": {"lightgbm": {"n_estimators": 10}}})
    trainer.fit(X, y)
    proba = trainer.predict_proba(X)
    assert len(proba) == 100

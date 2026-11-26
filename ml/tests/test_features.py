import pytest
import numpy as np
from ml.inference.features.url_feature_extractor import URLFeatureExtractor, FEATURE_NAMES_24
from ml.inference.features.feature_validator import FeatureValidator

def test_feature_extractor_dimension_and_names():
    url = "https://secure-login.bank-update.xyz/account?ref=urgent"
    feats = URLFeatureExtractor.extract_dict(url)
    assert len(feats) == 24
    assert list(feats.keys()) == FEATURE_NAMES_24

    vec = URLFeatureExtractor.extract_vector(url)
    assert len(vec) == 24

def test_representative_url_categories():
    # 1. Normal Legitimate URL
    legit_vec = URLFeatureExtractor.extract_dict("https://www.google.com/search?q=cybersecurity")
    assert legit_vec["is_https"] == 1.0
    assert legit_vec["is_ip"] == 0.0
    assert legit_vec["is_shortened"] == 0.0

    # 2. IP-based Phishing URL
    ip_vec = URLFeatureExtractor.extract_dict("http://192.168.1.100/admin/login.php")
    assert ip_vec["is_https"] == 0.0
    assert ip_vec["is_ip"] == 1.0
    assert ip_vec["sensitive_words_count"] >= 1.0

    # 3. Suspicious TLD & Shortener
    susp_vec = URLFeatureExtractor.extract_dict("http://bit.ly/claim-prize-free")
    assert susp_vec["is_shortened"] == 1.0
    assert susp_vec["sensitive_words_count"] >= 2.0

def test_feature_validator_matrix():
    dummy_matrix = np.random.rand(10, 24)
    res = FeatureValidator.validate_feature_matrix(dummy_matrix, FEATURE_NAMES_24)
    assert res["num_samples"] == 10
    assert res["num_features"] == 24
    assert res["has_nan"] is False

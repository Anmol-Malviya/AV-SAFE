import pytest
import numpy as np
from features.url_feature_extractor import URLFeatureExtractor, FEATURE_NAMES_24
from features.feature_validator import FeatureValidator

def test_adversarial_obfuscated_urls():
    """Test URL feature extraction on heavily obfuscated and adversarial URL vectors."""
    # 1. Excessive subdomain depth and hyphen abuse
    deep_subdomain_url = "http://secure.account.update.verification.service.paypal.evil-domain.com/login"
    feats = URLFeatureExtractor.extract_dict(deep_subdomain_url)
    assert feats["subdomain_count"] >= 5
    assert feats["sensitive_words_count"] >= 1.0
    assert feats["domain_length"] > 10

    # 2. Port manipulation and query parameter stuffing
    port_manipulated = "http://malicious-gateway.org:8080/path/to/phish?target=banking&redirect=true&token=verify"
    feats_port = URLFeatureExtractor.extract_dict(port_manipulated)
    assert feats_port["is_https"] == 0.0
    assert feats_port["sensitive_words_count"] >= 1.0

    # 3. Unicode punycode homograph targeting Apple
    puny_apple = "https://xn--pple-43d.com/support"
    feats_puny = URLFeatureExtractor.extract_dict(puny_apple)
    assert feats_puny["hyphen_count"] >= 2.0
    assert feats_puny["is_https"] == 1.0

def test_extreme_and_degenerate_urls():
    """Verify feature extractor handles edge cases gracefully without crashing."""
    # Degenerate minimal URL
    min_feats = URLFeatureExtractor.extract_dict("http://a.co")
    assert len(min_feats) == 24
    assert min_feats["url_length"] > 0
    assert min_feats["is_https"] == 0.0

    # URL with encoded symbols
    encoded_url = "https://bank.com/%20%25%26%23test?id=%22%3Cscript%3E"
    enc_feats = URLFeatureExtractor.extract_dict(encoded_url)
    assert len(enc_feats) == 24
    assert enc_feats["is_https"] == 1.0

def test_feature_vector_bounds():
    """Ensure all extracted features fall within numeric ranges suitable for model inference."""
    url = "https://legitimate-store.com/item/49204"
    vec = URLFeatureExtractor.extract_vector(url)
    assert not np.isnan(vec).any(), "Extracted feature vector must not contain NaN"
    assert not np.isinf(vec).any(), "Extracted feature vector must not contain Inf"

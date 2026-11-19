import re
import math
import urllib.parse
from typing import List, Dict, Any, Union

# Runtime heuristic constants identical to AV-SAFE JS & Android Kotlin
TOP_BRANDS = [
    'google.com', 'facebook.com', 'apple.com', 'microsoft.com', 
    'amazon.com', 'netflix.com', 'paypal.com', 'instagram.com', 
    'twitter.com', 'yahoo.com', 'linkedin.com', 'zoom.us', 
    'chase.com', 'bankofamerica.com', 'wellsfargo.com', 'citibank.com',
    'github.com', 'gmail.com', 'outlook.com', 'coinbase.com', 
    'binance.com', 'metamask.io'
]

SHORTENERS = [
    'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 
    'buff.ly', 'adf.ly', 'bit.do', 'mcaf.ee', 'su.pr', 'rebrand.ly'
]

SUSPICIOUS_TLDS = [
    'zip', 'mov', 'fit', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'work', 
    'click', 'download', 'racing', 'stream', 'win', 'bid', 'vip', 'xyz',
    'ru', 'cn', 'su', 'buzz', 'date', 'icu', 'loan', 'men', 'xin'
]

SENSITIVE_WORDS = [
    'confirm', 'account', 'banking', 'secure', 'login', 'signin', 
    'verify', 'webscr', 'ebayisapi', 'update', 'password', 'credential',
    'wallet', 'auth', 'recover', 'claim', 'free', 'gift', 'award'
]

# Exact 24 features in matching order
FEATURE_NAMES_24 = [
    "url_length",
    "domain_length",
    "is_ip",
    "tld_length",
    "subdomain_count",
    "is_https",
    "letters",
    "letter_ratio",
    "digits",
    "digit_ratio",
    "special",
    "special_ratio",
    "equals_count",
    "qmark_count",
    "amp_count",
    "hyphen_count",
    "dots_count",
    "slash_count",
    "shannon_entropy",
    "sensitive_words_count",
    "is_shortened",
    "is_suspicious_tld",
    "is_typosquatting",
    "brand_abuse_triggered"
]

levenshtein_cache: Dict[str, int] = {}

def get_levenshtein_distance(a: str, b: str) -> int:
    key = f"{a}:{b}"
    if key in levenshtein_cache:
        return levenshtein_cache[key]
    rev_key = f"{b}:{a}"
    if rev_key in levenshtein_cache:
        return levenshtein_cache[rev_key]

    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) + 1):
        dp[i][0] = i
    for j in range(len(b) + 1):
        dp[0][j] = j

    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = min(
                    dp[i - 1][j - 1] + 1,  # substitution
                    dp[i - 1][j] + 1,      # deletion
                    dp[i][j - 1] + 1       # insertion
                )
    res = dp[len(a)][len(b)]
    levenshtein_cache[key] = res
    return res

def calculate_shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    probs = [float(s.count(c)) / len(s) for c in set(s)]
    return -sum(p * math.log(p, 2) for p in probs)

def extract_primary_domain_name(hostname: str) -> str:
    if not hostname:
        return ""
    hostname = re.sub(r'^www\.', '', hostname)
    parts = hostname.split('.')
    if len(parts) < 2:
        return hostname
    last_part = parts[-1]
    second_last_part = parts[-2]
    common_registry_tlds = ['co', 'com', 'org', 'net', 'gov', 'edu', 'asn', 'id', 'ac']
    is_multi_part_suffix = len(last_part) == 2 and second_last_part in common_registry_tlds
    if is_multi_part_suffix and len(parts) >= 3:
        return parts[-3]
    else:
        return parts[-2]

class URLFeatureExtractor:
    """Extracts the exact 24 runtime features used by AV-SAFE JavaScript and Android Kotlin engines."""

    @staticmethod
    def extract_dict(url: str) -> Dict[str, Union[float, int]]:
        url = str(url).strip()
        is_https = 1 if url.lower().startswith('https://') else 0

        # Parse host & path
        try:
            parsed = urllib.parse.urlparse(url)
            host = parsed.netloc.lower()
            path = parsed.path
            if not host:
                temp_url = 'https://' + url if not re.match(r'^https?://', url, re.IGNORECASE) else url
                parsed = urllib.parse.urlparse(temp_url)
                host = parsed.netloc.lower()
                path = parsed.path
        except Exception:
            host = ''
            path = ''

        if ':' in host:
            host = host.split(':')[0]

        url_len = len(url)
        domain_len = len(host)
        is_ip = 1 if re.match(r'^(?:\d{1,3}\.){3}\d{1,3}$', host) else 0

        tld_len = 0
        subdomain_count = 0
        if host and not is_ip:
            parts = host.split('.')
            if len(parts) >= 2:
                tld_len = len(parts[-1])
                subdomain_count = max(0, len(parts) - 2)

        letters = sum(c.isalpha() for c in url)
        digits = sum(c.isdigit() for c in url)
        special = len(url) - letters - digits

        equals_count = url.count('=')
        qmark_count = url.count('?')
        amp_count = url.count('&')
        hyphen_count = url.count('-')
        dots_count = url.count('.')
        slash_count = url.count('/')

        letter_ratio = letters / url_len if url_len > 0 else 0.0
        digit_ratio = digits / url_len if url_len > 0 else 0.0
        special_ratio = special / url_len if url_len > 0 else 0.0

        shannon_entropy = 0.0
        if host and not is_ip:
            primary_name = extract_primary_domain_name(host)
            shannon_entropy = calculate_shannon_entropy(primary_name)

        sensitive_words_count = 0
        lower_url = url.lower()
        for word in SENSITIVE_WORDS:
            sensitive_words_count += lower_url.count(word)

        is_shortened = 0
        if host:
            is_shortened = 1 if any(host == sh or host.endswith('.' + sh) for sh in SHORTENERS) else 0

        is_suspicious_tld = 0
        if host and not is_ip:
            parts = host.split('.')
            tld = parts[-1]
            is_suspicious_tld = 1 if tld in SUSPICIOUS_TLDS else 0

        is_typosquatting = 0
        brand_abuse_triggered = 0
        if host and not is_ip:
            primary_name = extract_primary_domain_name(host)
            host_parts = host.replace('www.', '').split('.')

            for brand in TOP_BRANDS:
                brand_raw = brand.split('.')[0]
                is_official = (host == brand or host.endswith('.' + brand))
                if not is_official:
                    has_brand_match = any(part == brand_raw or brand_raw in part for part in host_parts)
                    if has_brand_match:
                        brand_abuse_triggered = 1

            if not brand_abuse_triggered:
                for brand in TOP_BRANDS:
                    brand_raw = brand.split('.')[0]
                    if primary_name != brand_raw:
                        dist = get_levenshtein_distance(primary_name, brand_raw)
                        if 0 < dist <= 2:
                            is_typosquatting = 1

        return {
            "url_length": float(url_len),
            "domain_length": float(domain_len),
            "is_ip": float(is_ip),
            "tld_length": float(tld_len),
            "subdomain_count": float(subdomain_count),
            "is_https": float(is_https),
            "letters": float(letters),
            "letter_ratio": float(letter_ratio),
            "digits": float(digits),
            "digit_ratio": float(digit_ratio),
            "special": float(special),
            "special_ratio": float(special_ratio),
            "equals_count": float(equals_count),
            "qmark_count": float(qmark_count),
            "amp_count": float(amp_count),
            "hyphen_count": float(hyphen_count),
            "dots_count": float(dots_count),
            "slash_count": float(slash_count),
            "shannon_entropy": float(shannon_entropy),
            "sensitive_words_count": float(sensitive_words_count),
            "is_shortened": float(is_shortened),
            "is_suspicious_tld": float(is_suspicious_tld),
            "is_typosquatting": float(is_typosquatting),
            "brand_abuse_triggered": float(brand_abuse_triggered),
        }

    @staticmethod
    def extract_vector(url: str) -> List[float]:
        feats = URLFeatureExtractor.extract_dict(url)
        return [feats[name] for name in FEATURE_NAMES_24]

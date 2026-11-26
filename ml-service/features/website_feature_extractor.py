from typing import Dict, Any

class WebsiteFeatureExtractor:
    """Extracts website-dependent features from HTML DOM / response headers.
    Kept separate from the offline URL-only feature pipeline.
    """
    FEATURE_NAMES = [
        "LineOfCode",
        "LargestLineLength",
        "HasTitle",
        "DomainTitleMatchScore",
        "URLTitleMatchScore",
        "HasFavicon",
        "Robots",
        "IsResponsive",
        "NoOfURLRedirect",
        "NoOfSelfRedirect",
        "HasDescription",
        "NoOfPopup",
        "NoOfiFrame",
        "HasExternalFormSubmit",
        "HasSocialNet",
        "HasSubmitButton",
        "HasHiddenFields",
        "HasPasswordField",
        "Bank",
        "Pay",
        "Crypto",
        "HasCopyrightInfo",
        "NoOfImage",
        "NoOfCSS",
        "NoOfJS",
        "NoOfSelfRef",
        "NoOfEmptyRef",
        "NoOfExternalRef"
    ]

    @staticmethod
    def extract_from_html(html_content: str, url: str) -> Dict[str, Any]:
        """Skeleton extractor for online/crawled web analysis."""
        return {
            "LineOfCode": len(html_content.splitlines()) if html_content else 0,
            "HasPasswordField": 1 if html_content and 'type="password"' in html_content.lower() else 0,
            "HasSubmitButton": 1 if html_content and ('type="submit"' in html_content.lower() or '<button' in html_content.lower()) else 0,
            "HasHiddenFields": 1 if html_content and 'type="hidden"' in html_content.lower() else 0,
            "HasExternalFormSubmit": 1 if html_content and '<form' in html_content.lower() and 'action="http' in html_content.lower() else 0,
        }

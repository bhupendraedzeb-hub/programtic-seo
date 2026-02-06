from bs4 import BeautifulSoup


def is_valid_html(html: str) -> bool:
    try:
        BeautifulSoup(html or "", "html.parser")
        return True
    except Exception:
        return False

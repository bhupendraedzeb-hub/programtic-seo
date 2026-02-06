import re
from typing import List


VARIABLE_PATTERN = re.compile(r"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}")


def extract_variables(html_content: str) -> List[str]:
    matches = VARIABLE_PATTERN.findall(html_content or "")
    seen = set()
    ordered = []
    for name in matches:
        if name not in seen:
            seen.add(name)
            ordered.append(name)
    return ordered

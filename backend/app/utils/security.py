def sanitize_filename(name: str) -> str:
    cleaned = "".join(c for c in name if c.isalnum() or c in ("-", "_", "."))
    return cleaned.strip("._") or "file"

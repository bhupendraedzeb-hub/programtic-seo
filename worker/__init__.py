import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parents[1] / "backend"
if str(backend_path) not in sys.path:
    sys.path.append(str(backend_path))

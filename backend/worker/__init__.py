# Makes worker a package for module imports.
# Ensure submodules are importable by RQ import_attribute.
from . import jobs  # noqa: F401

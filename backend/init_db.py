#!/usr/bin/env python
"""Initialize the database tables for the application."""
import sys
sys.path.insert(0, '/c/Users/Panku/Downloads/programetic-seo/backend')

from app.dependencies import init_db

try:
    init_db()
    print('✓ Database initialized successfully!')
except Exception as e:
    print(f'✗ Error initializing database: {e}')
    sys.exit(1)

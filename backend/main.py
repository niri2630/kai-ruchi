"""Root ASGI entrypoint.

Vercel's Python runtime discovers a FastAPI app from a conventional module at
the project root, then serves it at `/` with the original request path intact.
An explicit rewrite is deliberately absent: rewrites now pass the *destination*
path to the app, which collapsed every URL onto a single route.
"""
from app.main import app

__all__ = ["app"]

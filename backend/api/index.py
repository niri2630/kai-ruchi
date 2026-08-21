"""Vercel entrypoint.

Vercel's Python runtime looks for an ASGI callable named `app` inside `api/`.
This module just re-exports the real application so the same code runs locally
under uvicorn and in a Vercel Function.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app  # noqa: E402,F401

__all__ = ["app"]

"""
FastAPI CLI entry point for development.

This file allows running the FastAPI application using:
    fastapi dev main.py

The actual application is defined in app/main.py
"""

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

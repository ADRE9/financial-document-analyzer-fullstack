"""
Common FastAPI dependencies for the application.
"""

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_logger():
    """Dependency to get logger instance."""
    return logger
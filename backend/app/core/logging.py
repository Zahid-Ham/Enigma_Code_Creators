"""Application Logging Configuration."""

import logging
import sys

from app.core.config import settings


def setup_logging() -> logging.Logger:
    """Configure and return the root application logger."""
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    formatter = logging.Formatter(
        fmt="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    handler.setLevel(log_level)

    app_logger = logging.getLogger("finclosure")
    app_logger.setLevel(log_level)

    # Avoid duplicate handlers if setup_logging is called multiple times
    if not app_logger.handlers:
        app_logger.addHandler(handler)
        app_logger.propagate = False

    return app_logger


logger = setup_logging()

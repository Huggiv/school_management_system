import logging
from logging.config import dictConfig


def configure_logging(log_level: str, app_env: str) -> None:
    formatter = "json" if app_env in {"staging", "production"} else "console"

    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "console": {
                    "format": "%(asctime)s %(levelname)s [%(name)s] %(message)s",
                },
                "json": {
                    "format": (
                        '{"timestamp":"%(asctime)s","level":"%(levelname)s",'
                        '"logger":"%(name)s","message":"%(message)s"}'
                    ),
                },
            },
            "handlers": {
                "default": {
                    "class": "logging.StreamHandler",
                    "formatter": formatter,
                    "level": log_level,
                }
            },
            "root": {"handlers": ["default"], "level": log_level},
        }
    )

    logging.getLogger("uvicorn.access").setLevel(log_level)

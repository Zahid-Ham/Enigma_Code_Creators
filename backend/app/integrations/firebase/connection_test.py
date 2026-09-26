"""Internal Firebase connectivity test and diagnostic utility."""

from typing import Any

from app.core.logging import logger
from app.integrations.firebase.firestore import (
    get_firestore_client,
    initialize_firebase,
)
from app.integrations.firebase.storage import get_storage_bucket


def verify_firebase_connection() -> dict[str, Any]:
    """Test Firebase initialization, Firestore client creation, and Storage configuration.

    Does not create or write persistent arbitrary documents.
    """
    results: dict[str, Any] = {
        "firebase_app": False,
        "firestore": False,
        "storage": False,
        "details": {},
    }

    try:
        app = initialize_firebase()
        results["firebase_app"] = True
        results["details"]["app_name"] = app.name
        results["details"]["project_id"] = app.project_id
    except Exception as e:  # noqa: BLE001
        results["details"]["firebase_error"] = str(e)
        logger.warning("Firebase App initialization test failed: %s", e)
        return results

    try:
        client = get_firestore_client()
        results["firestore"] = True
        results["details"]["firestore_project"] = client.project
    except Exception as e:  # noqa: BLE001
        results["details"]["firestore_error"] = str(e)
        logger.warning("Firestore connection test failed: %s", e)

    try:
        bucket = get_storage_bucket()
        results["storage"] = True
        results["details"]["storage_bucket"] = bucket.name
    except Exception as e:  # noqa: BLE001
        results["details"]["storage_error"] = str(e)
        logger.warning("Storage connection test failed: %s", e)

    return results

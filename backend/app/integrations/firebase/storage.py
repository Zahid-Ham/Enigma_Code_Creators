"""Firebase Storage integration layer for document uploads and asset management."""


from firebase_admin import storage
from google.cloud.storage.bucket import Bucket

from app.core.config import settings
from app.core.exceptions import ConfigurationError, FirebaseInitializationError
from app.core.logging import logger
from app.integrations.firebase.firestore import initialize_firebase

_storage_bucket: Bucket | None = None


def get_storage_bucket() -> Bucket:
    """Get or initialize the Firebase Storage bucket singleton."""
    global _storage_bucket

    if _storage_bucket is not None:
        return _storage_bucket

    app = initialize_firebase()

    bucket_name = settings.FIREBASE_STORAGE_BUCKET
    if not bucket_name:
        raise ConfigurationError(
            message="FIREBASE_STORAGE_BUCKET is not set in configuration."
        )

    try:
        _storage_bucket = storage.bucket(name=bucket_name, app=app)
        logger.info("Firebase Storage bucket initialized: %s", bucket_name)
        return _storage_bucket
    except Exception as e:
        logger.error("Failed to access Firebase Storage bucket: %s", bucket_name)
        raise FirebaseInitializationError(
            message=f"Could not connect to Firebase Storage bucket '{bucket_name}': {e!s}"
        ) from e


class StorageService:
    """Foundational service for Firebase Storage interactions."""

    def __init__(self, bucket: Bucket | None = None):
        self._bucket = bucket

    @property
    def bucket(self) -> Bucket:
        if self._bucket is None:
            self._bucket = get_storage_bucket()
        return self._bucket

    def get_blob_reference(self, storage_path: str):
        """Get a storage blob reference for a given path."""
        return self.bucket.blob(storage_path)

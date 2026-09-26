"""Firebase Admin SDK and Firestore database initialization layer."""

import os

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import Client as FirestoreClient

from app.core.config import settings
from app.core.exceptions import ConfigurationError, FirebaseInitializationError
from app.core.logging import logger

_firebase_app: firebase_admin.App | None = None
_firestore_client: FirestoreClient | None = None


def initialize_firebase() -> firebase_admin.App:
    """Initialize Firebase Admin SDK singleton instance safely."""
    global _firebase_app

    if _firebase_app is not None:
        return _firebase_app

    # Check if an app was already initialized in the default namespace
    if firebase_admin._apps:
        _firebase_app = firebase_admin.get_app()
        return _firebase_app

    cred = None
    cred_path = settings.FIREBASE_CREDENTIALS_PATH

    if cred_path:
        if not os.path.exists(cred_path):
            logger.error("Firebase credentials file not found at configured path")
            raise ConfigurationError(
                message=f"Firebase credentials file not found at: {cred_path}"
            )
        try:
            cred = credentials.Certificate(cred_path)
            logger.info("Loaded Firebase credentials from certificate file")
        except Exception as e:
            logger.error("Failed to load Firebase credentials certificate")
            raise FirebaseInitializationError(
                message=f"Invalid Firebase credentials certificate: {e!s}"
            ) from e
    elif settings.FIREBASE_PROJECT_ID:
        try:
            # Fallback to Application Default Credentials with explicit project ID
            cred = credentials.ApplicationDefault()
            logger.info("Using Application Default Credentials for Firebase")
        except Exception:  # noqa: BLE001
            logger.warning(
                "ApplicationDefault credentials unavailable, initializing with project ID only"
            )
            cred = None
    else:
        raise ConfigurationError(
            message=(
                "Firebase is not configured. Please supply FIREBASE_CREDENTIALS_PATH "
                "or FIREBASE_PROJECT_ID in environment variables."
            )
        )

    options = {}
    if settings.FIREBASE_PROJECT_ID:
        options["projectId"] = settings.FIREBASE_PROJECT_ID
    if settings.FIREBASE_STORAGE_BUCKET:
        options["storageBucket"] = settings.FIREBASE_STORAGE_BUCKET

    try:
        if cred:
            _firebase_app = firebase_admin.initialize_app(cred, options=options)
        else:
            _firebase_app = firebase_admin.initialize_app(options=options)
        logger.info("Firebase Admin SDK initialized successfully")
        return _firebase_app
    except Exception as e:
        logger.error("Failed to initialize Firebase Admin SDK")
        raise FirebaseInitializationError(
            message=f"Could not initialize Firebase Admin SDK: {e!s}"
        ) from e


def get_firestore_client() -> FirestoreClient:
    """Get or initialize the Firestore client singleton."""
    global _firestore_client

    if _firestore_client is not None:
        return _firestore_client

    app = initialize_firebase()
    try:
        _firestore_client = firestore.client(app=app)
        logger.info("Firestore client created successfully")
        return _firestore_client
    except Exception as e:
        logger.error("Failed to create Firestore client")
        raise FirebaseInitializationError(
            message=f"Could not connect to Firestore: {e!s}"
        ) from e

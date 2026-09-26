"""Tests for Firebase configuration and connectivity handling."""

from app.core.config import settings
from app.integrations.firebase.connection_test import verify_firebase_connection


def test_firebase_connection_utility_structure():
    """Verify that verify_firebase_connection returns structured diagnostic results without crashing."""
    results = verify_firebase_connection()
    assert isinstance(results, dict)
    assert "firebase_app" in results
    assert "firestore" in results
    assert "storage" in results
    assert "details" in results

    # If Firebase credentials are not provided in this environment, it should fail gracefully
    if not settings.FIREBASE_CREDENTIALS_PATH and not settings.FIREBASE_PROJECT_ID:
        assert results["firebase_app"] is False
        assert "firebase_error" in results["details"]

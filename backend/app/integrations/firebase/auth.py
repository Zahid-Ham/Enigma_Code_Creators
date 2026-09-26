"""Firebase Authentication verification layer."""

from typing import Any

from firebase_admin import auth

from app.core.exceptions import AuthenticationError, FirebaseInitializationError
from app.core.logging import logger
from app.integrations.firebase.firestore import initialize_firebase


class FirebaseAuthService:
    """Firebase Auth adapter for ID token verification and user context extraction."""

    def __init__(self):
        # Ensure Firebase is initialized
        self.app = initialize_firebase

    def verify_token(self, id_token: str) -> dict[str, Any]:
        """Verify a Firebase JWT ID token and return decoded user claims."""
        if not id_token:
            raise AuthenticationError(message="No authentication token provided.")

        try:
            self.app()
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except auth.ExpiredIdTokenError as e:
            logger.warning("Expired Firebase auth token provided")
            raise AuthenticationError(message="Authentication token has expired.") from e
        except auth.InvalidIdTokenError as e:
            logger.warning("Invalid Firebase auth token provided")
            raise AuthenticationError(message="Invalid authentication token.") from e
        except Exception as e:
            logger.error("Error during Firebase token verification")
            raise FirebaseInitializationError(
                message=f"Failed to verify authentication token: {e!s}"
            ) from e

    def get_user_id_from_token(self, id_token: str) -> str | None:
        """Extract the user UID from an ID token."""
        decoded = self.verify_token(id_token)
        return decoded.get("uid")

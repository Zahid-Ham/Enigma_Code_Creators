"""Custom Application Exceptions and error definitions."""

from typing import Any


class FinclosureException(Exception):
    """Base exception for all FINCLOSURE application errors."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: dict[str, Any] | None = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class ConfigurationError(FinclosureException):
    """Raised when required configuration is missing or invalid."""

    def __init__(self, message: str, details: dict[str, Any] | None = None):
        super().__init__(message=message, status_code=500, details=details)


class FirebaseInitializationError(FinclosureException):
    """Raised when Firebase Admin SDK, Firestore, or Storage initialization fails."""

    def __init__(self, message: str, details: dict[str, Any] | None = None):
        super().__init__(message=message, status_code=503, details=details)


class ResourceNotFoundError(FinclosureException):
    """Raised when a requested resource or entity is not found."""

    def __init__(self, message: str = "Resource not found", details: dict[str, Any] | None = None):
        super().__init__(message=message, status_code=404, details=details)


class AuthenticationError(FinclosureException):
    """Raised when user authentication or token verification fails."""

    def __init__(self, message: str = "Authentication failed", details: dict[str, Any] | None = None):
        super().__init__(message=message, status_code=401, details=details)


class DocumentProcessingException(FinclosureException):
    """Raised when document parsing, OCR, or chunking fails."""

    def __init__(self, message: str, details: dict[str, Any] | None = None):
        super().__init__(message=message, status_code=422, details=details)


class AIProcessingException(FinclosureException):
    """Raised when LLM extraction or structured reasoning fails."""

    def __init__(self, message: str, details: dict[str, Any] | None = None):
        super().__init__(message=message, status_code=502, details=details)


class UnsupportedFileTypeError(FinclosureException):
    """Raised when an uploaded document has an unsupported extension or MIME type."""

    def __init__(self, message: str = "Unsupported document file type or format", details: dict[str, Any] | None = None):
        super().__init__(message=message, status_code=415, details=details)


class FileTooLargeError(FinclosureException):
    """Raised when an uploaded document exceeds the maximum allowable size."""

    def __init__(self, message: str = "Document size exceeds allowable limit", details: dict[str, Any] | None = None):
        super().__init__(message=message, status_code=413, details=details)


class EmptyFileError(FinclosureException):
    """Raised when an uploaded document contains 0 bytes."""

    def __init__(self, message: str = "Uploaded document is empty (0 bytes)", details: dict[str, Any] | None = None):
        super().__init__(message=message, status_code=400, details=details)


class InvalidFileError(FinclosureException):
    """Raised when an uploaded document contains invalid content or metadata."""

    def __init__(self, message: str = "Invalid document provided", details: dict[str, Any] | None = None):
        super().__init__(message=message, status_code=422, details=details)


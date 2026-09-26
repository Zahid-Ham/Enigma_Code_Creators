"""Custom Application Exceptions."""

class FinclosureException(Exception):
    """Base exception for FINCLOSURE application."""
    pass


class DocumentProcessingException(FinclosureException):
    """Raised when document parsing or extraction fails."""
    pass


class AIProcessingException(FinclosureException):
    """Raised when LLM/Groq interaction fails."""
    pass


class EstateNotFoundException(FinclosureException):
    """Raised when the requested estate entity is not found."""
    pass

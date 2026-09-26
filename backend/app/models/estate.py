"""Estate domain model representing a person's financial estate twin ecosystem."""

from datetime import datetime, timezone
from enum import Enum


class EstateSubjectType(str, Enum):
    """Subject type of the financial estate."""

    INDIVIDUAL = "individual"


class EstateStatus(str, Enum):
    """Lifecycle status of the financial estate."""

    ACTIVE = "active"
    PREPARATION = "preparation"
    RECOVERY = "recovery"
    CLOSED = "closed"


class Estate:
    """Domain model representing a Financial Estate."""

    def __init__(
        self,
        estate_id: str,
        subject_name: str,
        subject_type: EstateSubjectType | str = EstateSubjectType.INDIVIDUAL,
        status: EstateStatus | str = EstateStatus.ACTIVE,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ) -> None:
        self.estate_id = estate_id
        self.subject_name = subject_name
        self.subject_type = (
            subject_type if isinstance(subject_type, EstateSubjectType) else EstateSubjectType(subject_type)
        )
        self.status = status if isinstance(status, EstateStatus) else EstateStatus(status)
        now = datetime.now(timezone.utc)
        self.created_at = created_at or now
        self.updated_at = updated_at or now

    def to_dict(self) -> dict:
        """Convert estate domain entity to dictionary for storage serialization."""
        return {
            "estate_id": self.estate_id,
            "subject_name": self.subject_name,
            "subject_type": self.subject_type.value,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Estate":
        """Reconstruct estate domain entity from storage dictionary."""
        created_at = data.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        elif created_at is not None and not isinstance(created_at, datetime):
            created_at = None

        updated_at = data.get("updated_at")
        if isinstance(updated_at, str):
            updated_at = datetime.fromisoformat(updated_at)
        elif updated_at is not None and not isinstance(updated_at, datetime):
            updated_at = None

        return cls(
            estate_id=data["estate_id"],
            subject_name=data["subject_name"],
            subject_type=data.get("subject_type", EstateSubjectType.INDIVIDUAL),
            status=data.get("status", EstateStatus.ACTIVE),
            created_at=created_at,
            updated_at=updated_at,
        )

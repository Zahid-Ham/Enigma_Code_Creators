"""Repository layer for Estate and Financial Entity persistence with Firestore and in-memory fallback."""

import threading
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any

from app.core.logging import logger
from app.integrations.firebase.firestore import get_firestore_client
from app.models.estate import Estate, EstateStatus, EstateSubjectType
from app.models.financial_entity import FinancialEntity


class EstateRepositoryProtocol(ABC):
    """Abstract interface defining operations for Estate and Financial Entity persistence."""

    @abstractmethod
    async def save_estate(self, estate: Estate) -> Estate:
        """Persist or update an estate record."""

    @abstractmethod
    async def get_estate(self, estate_id: str) -> Estate | None:
        """Retrieve an estate record by ID."""

    @abstractmethod
    async def list_estates(self) -> list[Estate]:
        """List all estates."""

    @abstractmethod
    async def save_entity(self, estate_id: str, entity: FinancialEntity) -> FinancialEntity:
        """Persist or update a financial entity under an estate."""

    @abstractmethod
    async def get_entity(self, estate_id: str, entity_id: str) -> FinancialEntity | None:
        """Retrieve a specific financial entity by ID within an estate."""

    @abstractmethod
    async def list_entities(self, estate_id: str) -> list[FinancialEntity]:
        """List all financial entities belonging to an estate."""

    @abstractmethod
    async def delete_entity(self, estate_id: str, entity_id: str) -> bool:
        """Delete a financial entity record."""


class InMemoryEstateRepository(EstateRepositoryProtocol):
    """Thread-safe in-memory repository for local development, demo, and automated testing."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._estates: dict[str, dict[str, Any]] = {}
        self._entities: dict[str, dict[str, dict[str, Any]]] = {}  # estate_id -> entity_id -> data
        self._seed_demo_estate()

    def _seed_demo_estate(self) -> None:
        """Explicit demo estate seed for development and testing."""
        demo_id = "demo-estate-001"
        now = datetime.now(timezone.utc)
        self._estates[demo_id] = {
            "estate_id": demo_id,
            "subject_name": "Arjun Mehta",
            "subject_type": EstateSubjectType.INDIVIDUAL.value,
            "status": EstateStatus.ACTIVE.value,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        }
        self._entities[demo_id] = {}

    async def save_estate(self, estate: Estate) -> Estate:
        with self._lock:
            self._estates[estate.estate_id] = estate.to_dict()
            if estate.estate_id not in self._entities:
                self._entities[estate.estate_id] = {}
            return estate

    async def get_estate(self, estate_id: str) -> Estate | None:
        with self._lock:
            data = self._estates.get(estate_id)
            if not data:
                return None
            return Estate.from_dict(data)

    async def list_estates(self) -> list[Estate]:
        with self._lock:
            return [Estate.from_dict(d) for d in self._estates.values()]

    async def save_entity(self, estate_id: str, entity: FinancialEntity) -> FinancialEntity:
        with self._lock:
            if estate_id not in self._entities:
                self._entities[estate_id] = {}
            self._entities[estate_id][entity.entity_id] = entity.to_dict()
            return entity

    async def get_entity(self, estate_id: str, entity_id: str) -> FinancialEntity | None:
        with self._lock:
            estate_ents = self._entities.get(estate_id, {})
            data = estate_ents.get(entity_id)
            if not data:
                return None
            return FinancialEntity.from_dict(data)

    async def list_entities(self, estate_id: str) -> list[FinancialEntity]:
        with self._lock:
            estate_ents = self._entities.get(estate_id, {})
            return [FinancialEntity.from_dict(d) for d in estate_ents.values()]

    async def delete_entity(self, estate_id: str, entity_id: str) -> bool:
        with self._lock:
            if estate_id in self._entities and entity_id in self._entities[estate_id]:
                del self._entities[estate_id][entity_id]
                return True
            return False


class FirestoreEstateRepository(EstateRepositoryProtocol):
    """Google Cloud Firestore implementation storing documents in `estates/{estate_id}`."""

    def __init__(self, client: Any) -> None:
        self.db = client

    async def save_estate(self, estate: Estate) -> Estate:
        doc_ref = self.db.collection("estates").document(estate.estate_id)
        doc_ref.set(estate.to_dict())
        return estate

    async def get_estate(self, estate_id: str) -> Estate | None:
        doc_ref = self.db.collection("estates").document(estate_id)
        doc = doc_ref.get()
        if not doc.exists:
            if estate_id == "demo-estate-001":
                demo_estate = Estate(
                    estate_id="demo-estate-001",
                    subject_name="Arjun Mehta",
                    subject_type=EstateSubjectType.INDIVIDUAL,
                    status=EstateStatus.ACTIVE,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc),
                )
                doc_ref.set(demo_estate.to_dict())
                return demo_estate
            return None
        data = doc.to_dict()
        return Estate.from_dict(data)

    async def list_estates(self) -> list[Estate]:
        docs = list(self.db.collection("estates").stream())
        estates = [Estate.from_dict(doc.to_dict()) for doc in docs]
        if not any(e.estate_id == "demo-estate-001" for e in estates):
            demo_estate = Estate(
                estate_id="demo-estate-001",
                subject_name="Arjun Mehta",
                subject_type=EstateSubjectType.INDIVIDUAL,
                status=EstateStatus.ACTIVE,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            self.db.collection("estates").document("demo-estate-001").set(demo_estate.to_dict())
            estates.insert(0, demo_estate)
        return estates

    async def save_entity(self, estate_id: str, entity: FinancialEntity) -> FinancialEntity:
        doc_ref = (
            self.db.collection("estates")
            .document(estate_id)
            .collection("entities")
            .document(entity.entity_id)
        )
        doc_ref.set(entity.to_dict())
        return entity

    async def get_entity(self, estate_id: str, entity_id: str) -> FinancialEntity | None:
        doc_ref = (
            self.db.collection("estates")
            .document(estate_id)
            .collection("entities")
            .document(entity_id)
        )
        doc = doc_ref.get()
        if not doc.exists:
            return None
        return FinancialEntity.from_dict(doc.to_dict())

    async def list_entities(self, estate_id: str) -> list[FinancialEntity]:
        docs = (
            self.db.collection("estates")
            .document(estate_id)
            .collection("entities")
            .stream()
        )
        return [FinancialEntity.from_dict(doc.to_dict()) for doc in docs]

    async def delete_entity(self, estate_id: str, entity_id: str) -> bool:
        doc_ref = (
            self.db.collection("estates")
            .document(estate_id)
            .collection("entities")
            .document(entity_id)
        )
        doc_ref.delete()
        return True


_default_repo: EstateRepositoryProtocol | None = None


def get_estate_repository() -> EstateRepositoryProtocol:
    """Factory creating or returning the configured Estate Repository singleton."""
    global _default_repo
    if _default_repo is not None:
        return _default_repo

    try:
        firestore_client = get_firestore_client()
        if firestore_client:
            _default_repo = FirestoreEstateRepository(firestore_client)
            logger.info("Initialized FirestoreEstateRepository")
            return _default_repo
    except Exception as e:  # noqa: BLE001
        logger.info("Firestore client unavailable (%s); using InMemoryEstateRepository", e)

    _default_repo = InMemoryEstateRepository()
    return _default_repo

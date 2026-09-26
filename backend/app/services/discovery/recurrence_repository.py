"""Persistence repository for Discovered Recurring Relationships.

Supports Firestore persistence with in-memory thread-safe fallback.
"""

import asyncio
import threading
from typing import Any, Protocol
import uuid

from app.integrations.firebase.firestore import get_firestore_client
from app.core.logging import logger
from app.models.recurrence import RecurringRelationship


class RecurrenceRepositoryProtocol(Protocol):
    """Interface for Recurring Relationship and Transaction persistence."""

    async def save_relationship(self, relationship: RecurringRelationship) -> None:
        ...

    async def save_relationships(self, relationships: list[RecurringRelationship]) -> None:
        ...

    async def get_relationship(self, estate_id: str, relationship_id: str) -> RecurringRelationship | None:
        ...

    async def get_estate_relationships(self, estate_id: str) -> list[RecurringRelationship]:
        ...

    async def delete_estate_relationships(self, estate_id: str) -> None:
        ...

    async def save_transactions(self, estate_id: str, transactions: list[Any]) -> None:
        ...

    async def get_estate_transactions(self, estate_id: str) -> list[Any]:
        ...


class InMemoryRecurrenceRepository:
    """Thread-safe in-memory recurrence repository for tests and local development."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        # estate_id -> dict of rel_id -> RecurringRelationship
        self._relationships: dict[str, dict[str, RecurringRelationship]] = {}
        # estate_id -> dict of dedup_key -> NormalizedTransaction
        self._transactions: dict[str, dict[str, Any]] = {}

    async def save_relationship(self, relationship: RecurringRelationship) -> None:
        with self._lock:
            estate_dict = self._relationships.setdefault(relationship.estate_id, {})
            estate_dict[relationship.relationship_id] = relationship

    async def save_relationships(self, relationships: list[RecurringRelationship]) -> None:
        with self._lock:
            for rel in relationships:
                estate_dict = self._relationships.setdefault(rel.estate_id, {})
                estate_dict[rel.relationship_id] = rel

    async def get_relationship(self, estate_id: str, relationship_id: str) -> RecurringRelationship | None:
        with self._lock:
            estate_dict = self._relationships.get(estate_id, {})
            return estate_dict.get(relationship_id)

    async def get_estate_relationships(self, estate_id: str) -> list[RecurringRelationship]:
        with self._lock:
            estate_dict = self._relationships.get(estate_id, {})
            return list(estate_dict.values())

    async def delete_estate_relationships(self, estate_id: str) -> None:
        with self._lock:
            self._relationships.pop(estate_id, None)
            self._transactions.pop(estate_id, None)

    async def save_transactions(self, estate_id: str, transactions: list[Any]) -> None:
        with self._lock:
            tx_dict = self._transactions.setdefault(estate_id, {})
            for tx in transactions:
                key = getattr(tx, "deduplication_key", getattr(tx, "transaction_id", str(uuid.uuid4())))
                tx_dict[key] = tx

    async def get_estate_transactions(self, estate_id: str) -> list[Any]:
        with self._lock:
            tx_dict = self._transactions.get(estate_id, {})
            return list(tx_dict.values())


class FirestoreRecurrenceRepository:
    """Firestore persistence layer for Recurring Relationships stored under

    estates/{estate_id}/recurring_relationships/{relationship_id}.
    """

    def __init__(self) -> None:
        self._db = get_firestore_client()
        self._in_mem = InMemoryRecurrenceRepository()

    async def save_relationship(self, relationship: RecurringRelationship) -> None:
        await self._in_mem.save_relationship(relationship)
        if self._db is None:
            return

        def _sync_save() -> None:
            doc_ref = (
                self._db.collection("estates")
                .document(relationship.estate_id)
                .collection("recurring_relationships")
                .document(relationship.relationship_id)
            )
            doc_ref.set(relationship.to_dict())

        await asyncio.to_thread(_sync_save)

    async def save_relationships(self, relationships: list[RecurringRelationship]) -> None:
        await self._in_mem.save_relationships(relationships)
        if self._db is None or not relationships:
            return

        def _sync_batch_save() -> None:
            batch = self._db.batch()
            for rel in relationships:
                doc_ref = (
                    self._db.collection("estates")
                    .document(rel.estate_id)
                    .collection("recurring_relationships")
                    .document(rel.relationship_id)
                )
                batch.set(doc_ref, rel.to_dict())
            batch.commit()

        await asyncio.to_thread(_sync_batch_save)

    async def get_relationship(self, estate_id: str, relationship_id: str) -> RecurringRelationship | None:
        mem_res = await self._in_mem.get_relationship(estate_id, relationship_id)
        if mem_res:
            return mem_res
        if self._db is None:
            return None

        def _sync_get() -> RecurringRelationship | None:
            doc_ref = (
                self._db.collection("estates")
                .document(estate_id)
                .collection("recurring_relationships")
                .document(relationship_id)
            )
            snap = doc_ref.get()
            if snap.exists:
                return RecurringRelationship.from_dict(snap.to_dict())
            return None

        return await asyncio.to_thread(_sync_get)

    async def get_estate_relationships(self, estate_id: str) -> list[RecurringRelationship]:
        if self._db is None:
            return await self._in_mem.get_estate_relationships(estate_id)

        def _sync_list() -> list[RecurringRelationship]:
            coll_ref = (
                self._db.collection("estates")
                .document(estate_id)
                .collection("recurring_relationships")
            )
            docs = coll_ref.stream()
            results: list[RecurringRelationship] = []
            for doc in docs:
                data = doc.to_dict()
                results.append(RecurringRelationship.from_dict(data))
            return results

        try:
            db_res = await asyncio.to_thread(_sync_list)
            if db_res:
                return db_res
        except Exception:
            pass
        return await self._in_mem.get_estate_relationships(estate_id)

    async def delete_estate_relationships(self, estate_id: str) -> None:
        await self._in_mem.delete_estate_relationships(estate_id)
        if self._db is None:
            return

        def _sync_delete_all() -> None:
            coll_ref = (
                self._db.collection("estates")
                .document(estate_id)
                .collection("recurring_relationships")
            )
            docs = coll_ref.stream()
            batch = self._db.batch()
            for doc in docs:
                batch.delete(doc.reference)
            batch.commit()

        await asyncio.to_thread(_sync_delete_all)

    async def save_transactions(self, estate_id: str, transactions: list[Any]) -> None:
        await self._in_mem.save_transactions(estate_id, transactions)
        if self._db is None or not transactions:
            return

        def _sync_tx_save() -> None:
            batch = self._db.batch()
            for tx in transactions:
                tx_dict = tx.to_dict() if hasattr(tx, "to_dict") else dict(tx)
                tx_id = tx_dict.get("transaction_id") or str(uuid.uuid4())
                doc_ref = (
                    self._db.collection("estates")
                    .document(estate_id)
                    .collection("transactions")
                    .document(tx_id)
                )
                batch.set(doc_ref, tx_dict)
            batch.commit()

        await asyncio.to_thread(_sync_tx_save)

    async def get_estate_transactions(self, estate_id: str) -> list[Any]:
        mem_txs = await self._in_mem.get_estate_transactions(estate_id)
        if mem_txs:
            return mem_txs
        if self._db is None:
            return []

        def _sync_tx_list() -> list[Any]:
            coll_ref = (
                self._db.collection("estates")
                .document(estate_id)
                .collection("transactions")
            )
            docs = coll_ref.stream()
            results = []
            for doc in docs:
                data = doc.to_dict()
                results.append(data)
            return results

        try:
            return await asyncio.to_thread(_sync_tx_list)
        except Exception:
            return mem_txs


# Singleton instance resolver
_recurrence_repo_instance: RecurrenceRepositoryProtocol | None = None


def get_recurrence_repository() -> RecurrenceRepositoryProtocol:
    """Provides the active recurrence repository (Firestore if configured, else in-memory)."""
    global _recurrence_repo_instance
    if _recurrence_repo_instance is None:
        db = get_firestore_client()
        if db is not None:
            try:
                _recurrence_repo_instance = FirestoreRecurrenceRepository()
                logger.info("Initialized FirestoreRecurrenceRepository")
            except Exception as e:
                logger.warning("Failed to initialize FirestoreRecurrenceRepository (%s), using InMemory", e)
                _recurrence_repo_instance = InMemoryRecurrenceRepository()
        else:
            _recurrence_repo_instance = InMemoryRecurrenceRepository()
    return _recurrence_repo_instance

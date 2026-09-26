"""Unit tests for EstateService and FinancialEntityService domain logic."""

import pytest
from app.core.exceptions import ResourceNotFoundError
from app.models.estate import EstateStatus, EstateSubjectType
from app.models.financial_entity import EntityStatus, EntityType, NomineeStatus
from app.schemas.estate import EstateCreate, EstateUpdate
from app.schemas.financial_entity import FinancialEntityCreate, FinancialEntityUpdate
from app.services.estate.entity_service import FinancialEntityService
from app.services.estate.estate_repository import InMemoryEstateRepository
from app.services.estate.estate_service import EstateService


@pytest.fixture
def repo() -> InMemoryEstateRepository:
    """Provide a fresh isolated InMemoryEstateRepository."""
    return InMemoryEstateRepository()


@pytest.fixture
def estate_svc(repo: InMemoryEstateRepository) -> EstateService:
    return EstateService(repository=repo)


@pytest.fixture
def entity_svc(repo: InMemoryEstateRepository) -> FinancialEntityService:
    return FinancialEntityService(repository=repo)


class TestEstateServiceUnit:
    """Unit tests for EstateService business logic."""

    @pytest.mark.asyncio
    async def test_demo_estate_seeded_by_default(self, estate_svc: EstateService):
        """Verify demo estate is automatically initialized."""
        demo = await estate_svc.get_estate("demo-estate-001")
        assert demo.estate_id == "demo-estate-001"
        assert demo.subject_name == "Arjun Mehta"
        assert demo.status == EstateStatus.ACTIVE

    @pytest.mark.asyncio
    async def test_create_and_get_estate(self, estate_svc: EstateService):
        """Verify creating and fetching an estate."""
        created = await estate_svc.create_estate(
            EstateCreate(
                estate_id="custom-estate-01",
                subject_name="Rohan Kapoor",
                subject_type=EstateSubjectType.INDIVIDUAL,
                status=EstateStatus.PREPARATION,
            )
        )
        assert created.estate_id == "custom-estate-01"
        assert created.subject_name == "Rohan Kapoor"
        assert created.status == EstateStatus.PREPARATION

        fetched = await estate_svc.get_estate("custom-estate-01")
        assert fetched.subject_name == "Rohan Kapoor"

    @pytest.mark.asyncio
    async def test_get_missing_estate_raises_not_found(self, estate_svc: EstateService):
        """Verify ResourceNotFoundError is raised for non-existent estate."""
        with pytest.raises(ResourceNotFoundError):
            await estate_svc.get_estate("non-existent-uuid")

    @pytest.mark.asyncio
    async def test_update_estate_fields(self, estate_svc: EstateService):
        """Verify updating estate status and subject name."""
        updated = await estate_svc.update_estate(
            "demo-estate-001",
            EstateUpdate(
                subject_name="Arjun Mehta (Updated)",
                status=EstateStatus.RECOVERY,
            ),
        )
        assert updated.subject_name == "Arjun Mehta (Updated)"
        assert updated.status == EstateStatus.RECOVERY


class TestFinancialEntityServiceUnit:
    """Unit tests for FinancialEntityService business logic."""

    @pytest.mark.asyncio
    async def test_create_and_retrieve_entity(self, entity_svc: FinancialEntityService):
        """Verify creating and retrieving a financial entity."""
        created = await entity_svc.create_entity(
            "demo-estate-001",
            FinancialEntityCreate(
                entity_type=EntityType.EPF,
                institution_name="EPFO India",
                display_name="Employee Provident Fund",
                account_reference="MH/BAN/12345/678",
                amount=850000.0,
                status=EntityStatus.VERIFIED,
                confidence=1.0,
                evidence_document_ids=["epf_passbook.pdf"],
                nominee_status=NomineeStatus.KNOWN,
            ),
        )
        assert created.entity_id.startswith("ent-")
        assert created.estate_id == "demo-estate-001"
        assert created.entity_type == EntityType.EPF
        assert created.amount == 850000.0

        fetched = await entity_svc.get_entity("demo-estate-001", created.entity_id)
        assert fetched.display_name == "Employee Provident Fund"
        assert fetched.nominee_status == NomineeStatus.KNOWN

    @pytest.mark.asyncio
    async def test_create_entity_missing_estate_raises_error(self, entity_svc: FinancialEntityService):
        """Verify creating entity for missing estate raises ResourceNotFoundError."""
        with pytest.raises(ResourceNotFoundError):
            await entity_svc.create_entity(
                "non-existent-estate-id",
                FinancialEntityCreate(
                    entity_type=EntityType.BANK_ACCOUNT,
                    display_name="SBI Account",
                ),
            )

    @pytest.mark.asyncio
    async def test_list_entities_for_estate(self, entity_svc: FinancialEntityService):
        """Verify listing multiple entities belonging to an estate."""
        await entity_svc.create_entity(
            "demo-estate-001",
            FinancialEntityCreate(
                entity_type=EntityType.BANK_ACCOUNT,
                display_name="ICICI Savings",
            ),
        )
        await entity_svc.create_entity(
            "demo-estate-001",
            FinancialEntityCreate(
                entity_type=EntityType.TAX,
                display_name="Income Tax Assessment FY 2025-26",
            ),
        )

        res = await entity_svc.list_entities("demo-estate-001")
        assert res.total >= 2
        names = [e.display_name for e in res.entities]
        assert "ICICI Savings" in names
        assert "Income Tax Assessment FY 2025-26" in names

    @pytest.mark.asyncio
    async def test_update_entity_status_transition(self, entity_svc: FinancialEntityService):
        """Verify status transition from inferred to verified."""
        entity = await entity_svc.create_entity(
            "demo-estate-001",
            FinancialEntityCreate(
                entity_type=EntityType.SUBSCRIPTION,
                institution_name="Netflix",
                display_name="Netflix Monthly",
                amount=649.0,
                status=EntityStatus.INFERRED,
                confidence=0.6,
            ),
        )

        updated = await entity_svc.update_entity(
            "demo-estate-001",
            entity.entity_id,
            FinancialEntityUpdate(
                status=EntityStatus.VERIFIED,
                confidence=1.0,
                evidence_document_ids=["credit_card_statement.pdf"],
            ),
        )
        assert updated.status == EntityStatus.VERIFIED
        assert updated.confidence == 1.0
        assert updated.evidence_document_ids == ["credit_card_statement.pdf"]

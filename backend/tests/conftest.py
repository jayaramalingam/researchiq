import os
from urllib.parse import urlsplit, urlunsplit

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.database.base import Base
from app.database import session as db_session

# Import all models so SQLAlchemy registers their tables with Base.metadata.
from app.models.paper import Paper
from app.models.paper_analysis import PaperAnalysis
from app.models.paper_relationship import PaperRelationship
from app.models.paper_source import PaperSource
from app.models.project_paper import ProjectPaper
from app.models.report import Report
from app.models.research_insight import ResearchInsight
from app.models.research_project import ResearchProject
from app.models.research_query import ResearchQuery
from app.models.search_run import SearchRun


def build_test_database_url() -> str:
    explicit_url = os.getenv("TEST_DATABASE_URL")
    if explicit_url:
        return explicit_url

    development_url = os.getenv("DATABASE_URL")
    if not development_url:
        raise RuntimeError(
            "DATABASE_URL must be configured in backend/.env "
            "or TEST_DATABASE_URL must be set."
        )

    parts = urlsplit(development_url)

    return urlunsplit(
        (
            parts.scheme,
            parts.netloc,
            "/researchiq_test",
            parts.query,
            parts.fragment,
        )
    )


TEST_DATABASE_URL = build_test_database_url()

test_engine = create_engine(
    TEST_DATABASE_URL,
    poolclass=NullPool,
    pool_pre_ping=True,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
    expire_on_commit=False,
)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    original_engine = db_session.engine
    original_session_local = db_session.SessionLocal

    db_session.engine = test_engine
    db_session.SessionLocal = TestingSessionLocal

    try:
        yield
    finally:
        db_session.SessionLocal = original_session_local
        db_session.engine = original_engine
        Base.metadata.drop_all(bind=test_engine)
        test_engine.dispose()

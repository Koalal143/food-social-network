import pytest

from src.core.config import Settings


@pytest.fixture(scope="session")
def test_settings() -> Settings:
    return Settings()

from pathlib import Path
from typing import Literal

from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict

PATH = Path(__file__).parent.parent.parent


class QdrantConfig(BaseModel):
    host: str
    port: int


class PostgresConfig(BaseModel):
    user: str
    password: str
    host: str
    port: int
    db: str
    echo: bool = False
    naming_convention: dict = {
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    }

    @property
    def url(self) -> str:
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.db}"


class GigachatConfig(BaseModel):
    api_key: str


class NatsConfig(BaseModel):
    host: str
    port: int


class AsgiFastStreamConfig(BaseModel):
    host: str
    port: str


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="RECSYS__", env_file=PATH.parent / ".env", env_nested_delimiter="__")

    gigachat: GigachatConfig
    qdrant: QdrantConfig
    postgres: PostgresConfig
    asgi_faststream: AsgiFastStreamConfig
    nats: NatsConfig
    mode: Literal["dev", "test", "prod"] = "prod"


settings = Settings()

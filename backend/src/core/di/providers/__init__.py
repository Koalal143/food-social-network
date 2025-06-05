from src.core.di.providers.config import ConfigProvider
from src.core.di.providers.database import DatabaseProvider
from src.core.di.providers.elasticsearch import ElasticsearchProvider
from src.core.di.providers.faststream import FastStreamProvider
from src.core.di.providers.recommendations import RecommendationsAdapterProvider
from src.core.di.providers.redis import RedisProvider
from src.core.di.providers.repositories import RepositoryProvider
from src.core.di.providers.s3 import S3Provider
from src.core.di.providers.services import ServiceProvider

__all__ = [
    "ConfigProvider",
    "DatabaseProvider",
    "ElasticsearchProvider",
    "FastStreamProvider",
    "RecommendationsAdapterProvider",
    "RedisProvider",
    "RepositoryProvider",
    "S3Provider",
    "ServiceProvider",
]

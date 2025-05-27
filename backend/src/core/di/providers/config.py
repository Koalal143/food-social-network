from dishka import Provider, Scope, provide

from src.core.config import (
    ElasticSearchConfig,
    JWTConfig,
    PostgresConfig,
    RedisConfig,
    S3Config,
    Settings,
    settings,
)


class ConfigProvider(Provider):
    scope = Scope.APP

    @provide
    def get_settings(self) -> Settings:
        return settings

    @provide
    def get_postgres_config(self, settings: Settings) -> PostgresConfig:
        return settings.postgres

    @provide
    def get_jwt_config(self, settings: Settings) -> JWTConfig:
        return settings.jwt

    @provide
    def get_redis_config(self, settings: Settings) -> RedisConfig:
        return settings.redis

    @provide
    def get_s3_config(self, settings: Settings) -> S3Config:
        return settings.s3_storage

    @provide
    def get_elasticsearch_config(self, settings: Settings) -> ElasticSearchConfig:
        return settings.elasticsearch

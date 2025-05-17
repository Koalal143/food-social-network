from elasticsearch import AsyncElasticsearch

from src.core.config import settings

elastic_search_client = AsyncElasticsearch(
    hosts=[f"{settings.elasticsearch.host}:{settings.elasticsearch.port}"],
    basic_auth=(settings.elasticsearch.user, settings.elasticsearch.password),
    verify_certs=False,
)

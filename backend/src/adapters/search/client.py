from elasticsearch import AsyncElasticsearch

from src.core.config import settings

elastic_search_client = AsyncElasticsearch(
    hosts=[f"{settings.elastic.host}:{settings.elastic.port}"],
    basic_auth=(settings.elastic.user, settings.elastic.password),
    verify_certs=False,
)

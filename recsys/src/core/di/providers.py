from collections.abc import AsyncIterator

from dishka import Provider, Scope, provide
from langchain_gigachat.embeddings import GigaChatEmbeddings
from qdrant_client.async_qdrant_client import AsyncQdrantClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.algorithms.recommendation_algorithm import RecommendationAlgorithm
from src.core.config import settings
from src.db.manager import DatabaseManager
from src.repositories.embeddings import EmbeddingsRepository
from src.repositories.postgres import RecipeRepository, UserFeedbackRepository, UserImpressionRepository
from src.repositories.qdrant import QdrantRepository
from src.services.recs_service import RecommendationService


class DatabaseProvider(Provider):
    scope = Scope.APP

    @provide
    def get_database_manager(self) -> DatabaseManager:
        engine = create_async_engine(
            settings.postgres.url,
            echo=settings.postgres.echo,
            pool_size=10,
            max_overflow=20,
        )
        sessionmaker = async_sessionmaker(engine, expire_on_commit=False)
        return DatabaseManager(engine, sessionmaker)


class DatabaseSessionProvider(Provider):
    scope = Scope.REQUEST

    @provide
    async def get_db_session(self, database_manager: DatabaseManager) -> AsyncIterator[AsyncSession]:
        async for session in database_manager.get_db_session():
            yield session


class QdrantProvider(Provider):
    scope = Scope.APP

    @provide
    def get_qdrant_client(self) -> AsyncQdrantClient:
        return AsyncQdrantClient(host=settings.qdrant.host, port=settings.qdrant.port)


class EmbeddingsProvider(Provider):
    scope = Scope.APP

    @provide
    def get_embeddings_model(self) -> GigaChatEmbeddings:
        return GigaChatEmbeddings(credentials=settings.gigachat.api_key, verify_ssl_certs=False)


class RepositoryProvider(Provider):
    scope = Scope.REQUEST

    @provide
    def get_recipe_repository(self, session: AsyncSession) -> RecipeRepository:
        return RecipeRepository(session)

    @provide
    def get_user_feedback_repository(self, session: AsyncSession) -> UserFeedbackRepository:
        return UserFeedbackRepository(session)

    @provide
    def get_user_impression_repository(self, session: AsyncSession) -> UserImpressionRepository:
        return UserImpressionRepository(session)

    @provide
    def get_qdrant_repository(self, qdrant_client: AsyncQdrantClient) -> QdrantRepository:
        return QdrantRepository(qdrant_client)

    @provide
    def get_embeddings_repository(self, embeddings_model: GigaChatEmbeddings) -> EmbeddingsRepository:
        return EmbeddingsRepository(embeddings_model)


class ServiceProvider(Provider):
    scope = Scope.REQUEST

    @provide
    def get_recommendation_service(
        self,
        recipe_repo: RecipeRepository,
        feedback_repo: UserFeedbackRepository,
        impression_repo: UserImpressionRepository,
        qdrant_repo: QdrantRepository,
        embeddings_repo: EmbeddingsRepository,
    ) -> RecommendationService:
        return RecommendationService(
            recipe_repo=recipe_repo,
            feedback_repo=feedback_repo,
            impression_repo=impression_repo,
            qdrant_repo=qdrant_repo,
            embeddings_repo=embeddings_repo,
        )

    @provide
    def get_recommendation_algorithm(
        self,
        feedback_repo: UserFeedbackRepository,
        impression_repo: UserImpressionRepository,
        qdrant_repo: QdrantRepository,
        embeddings_repo: EmbeddingsRepository,
        recipe_repo: RecipeRepository,
    ) -> RecommendationAlgorithm:
        return RecommendationAlgorithm(
            feedback_repo=feedback_repo,
            impression_repo=impression_repo,
            qdrant_repo=qdrant_repo,
            embeddings_repo=embeddings_repo,
            recipe_repo=recipe_repo,
        )

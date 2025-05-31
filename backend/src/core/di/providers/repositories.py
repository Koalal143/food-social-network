from dishka import Provider, Scope, provide
from faststream.nats import NatsBroker
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from src.adapters.storage import S3Storage
from src.repositories.anonymous_user import AnonymousUserRepository
from src.repositories.banned_email import BannedEmailRepository
from src.repositories.consent import ConsentRepository
from src.repositories.disliked_recipe import DislikedRecipeRepository
from src.repositories.favorite_recipe import FavoriteRecipeRepository
from src.repositories.interfaces import (
    AnonymousUserRepositoryProtocol,
    BannedEmailRepositoryProtocol,
    ConsentRepositoryProtocol,
    DislikedRecipeRepositoryProtocol,
    FavoriteRecipeRepositoryProtocol,
    RecipeImageRepositoryProtocol,
    RecipeImpressionRepositoryProtocol,
    RecipeIngredientRepositoryProtocol,
    RecipeInstructionRepositoryProtocol,
    RecipeRepositoryProtocol,
    RecipeSearchRepositoryProtocol,
    RecipeTagRepositoryProtocol,
    RecsysRepositoryProtocol,
    RefreshTokenRepositoryProtocol,
    UserAvatarRepositoryProtocol,
    UserProfileRepositoryProtocol,
    UserRepositoryProtocol,
)
from src.repositories.recipe import RecipeRepository
from src.repositories.recipe_image import RecipeImageRepository
from src.repositories.recipe_impression import RecipeImpressionRepository
from src.repositories.recipe_ingredient import RecipeIngredientRepository
from src.repositories.recipe_instruction import RecipeInstructionRepository
from src.repositories.recipe_search import RecipeSearchRepository
from src.repositories.recipe_tag import RecipeTagRepository
from src.repositories.recsys_client import RecsysRepository
from src.repositories.token import RefreshTokenRepository
from src.repositories.user import UserRepository
from src.repositories.user_avatar import UserAvatarRepository
from src.repositories.user_profile import UserProfileRepository


class RepositoryProvider(Provider):
    scope = Scope.REQUEST

    # User-related repositories
    @provide
    def get_user_repository(self, session: AsyncSession) -> UserRepositoryProtocol:
        return UserRepository(session)

    @provide
    def get_user_profile_repository(self, session: AsyncSession) -> UserProfileRepositoryProtocol:
        return UserProfileRepository(session)

    @provide
    def get_user_avatar_repository(self, session: AsyncSession, s3_storage: S3Storage) -> UserAvatarRepositoryProtocol:
        return UserAvatarRepository(session, s3_storage)

    @provide
    def get_anonymous_user_repository(self, session: AsyncSession) -> AnonymousUserRepositoryProtocol:
        return AnonymousUserRepository(session)

    # Auth-related repositories
    @provide
    def get_refresh_token_repository(self, session: AsyncSession, redis: Redis) -> RefreshTokenRepositoryProtocol:
        return RefreshTokenRepository(session, redis)

    @provide
    def get_banned_email_repository(self, session: AsyncSession) -> BannedEmailRepositoryProtocol:
        return BannedEmailRepository(session)

    @provide
    def get_consent_repository(self, session: AsyncSession) -> ConsentRepositoryProtocol:
        return ConsentRepository(session)

    # Recipe-related repositories
    @provide
    def get_recipe_repository(self, session: AsyncSession) -> RecipeRepositoryProtocol:
        return RecipeRepository(session)

    @provide
    def get_recipe_ingredient_repository(self, session: AsyncSession) -> RecipeIngredientRepositoryProtocol:
        return RecipeIngredientRepository(session)

    @provide
    def get_recipe_instruction_repository(self, session: AsyncSession) -> RecipeInstructionRepositoryProtocol:
        return RecipeInstructionRepository(session)

    @provide
    def get_recipe_tag_repository(self, session: AsyncSession) -> RecipeTagRepositoryProtocol:
        return RecipeTagRepository(session)

    @provide
    def get_recipe_image_repository(self, s3_storage: S3Storage) -> RecipeImageRepositoryProtocol:
        return RecipeImageRepository(s3_storage)

    @provide
    def get_recipe_search_repository(self, session: AsyncSession) -> RecipeSearchRepositoryProtocol:
        return RecipeSearchRepository(session)

    @provide
    def get_recipe_impression_repository(self, session: AsyncSession) -> RecipeImpressionRepositoryProtocol:
        return RecipeImpressionRepository(session)

    @provide
    def get_favorite_recipe_repository(self, session: AsyncSession) -> FavoriteRecipeRepositoryProtocol:
        return FavoriteRecipeRepository(session)

    @provide
    def get_disliked_recipe_repository(self, session: AsyncSession) -> DislikedRecipeRepositoryProtocol:
        return DislikedRecipeRepository(session)

    @provide
    def get_recsys_repository(self, broker: NatsBroker) -> RecsysRepositoryProtocol:
        return RecsysRepository(broker)

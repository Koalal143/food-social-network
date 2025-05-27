from dishka import Provider, Scope, provide

from src.repositories.interfaces import (
    AnonymousUserRepositoryProtocol,
    BannedEmailRepositoryProtocol,
    DislikedRecipeRepositoryProtocol,
    FavoriteRecipeRepositoryProtocol,
    RecipeImageRepositoryProtocol,
    RecipeImpressionRepositoryProtocol,
    RecipeIngredientRepositoryProtocol,
    RecipeInstructionRepositoryProtocol,
    RecipeRepositoryProtocol,
    RecipeSearchRepositoryProtocol,
    RecipeTagRepositoryProtocol,
    RefreshTokenRepositoryProtocol,
    UserAvatarRepositoryProtocol,
    UserProfileRepositoryProtocol,
    UserRepositoryProtocol,
)
from src.services.anonymous_user import AnonymousUserService
from src.services.avatar import UserAvatarService
from src.services.banned_email import BannedEmailService
from src.services.disliked_recipe import DislikedRecipeService
from src.services.favorite_recipe import FavoriteRecipeService
from src.services.recipe import RecipeService
from src.services.recipe_impression import RecipeImpressionService
from src.services.recipe_instructions import RecipeInstructionsService
from src.services.security import SecurityService
from src.services.token import RefreshTokenService, TokenService
from src.services.user import UserService


class ServiceProvider(Provider):
    scope = Scope.REQUEST

    # User-related services
    @provide
    def get_user_service(
        self,
        user_repository: UserRepositoryProtocol,
        user_profile_repository: UserProfileRepositoryProtocol,
        banned_email_repository: BannedEmailRepositoryProtocol,
        user_avatar_repository: UserAvatarRepositoryProtocol,
    ) -> UserService:
        return UserService(
            user_repository=user_repository,
            user_profile_repository=user_profile_repository,
            banned_email_repository=banned_email_repository,
            user_avatar_repository=user_avatar_repository,
        )

    @provide
    def get_user_avatar_service(self, user_avatar_repository: UserAvatarRepositoryProtocol) -> UserAvatarService:
        return UserAvatarService(user_avatar_repository=user_avatar_repository)

    @provide
    def get_anonymous_user_service(
        self, anonymous_user_repository: AnonymousUserRepositoryProtocol
    ) -> AnonymousUserService:
        return AnonymousUserService(anonymous_user_repository=anonymous_user_repository)

    # Auth-related services
    @provide
    def get_token_service(
        self,
        refresh_token_repository: RefreshTokenRepositoryProtocol,
        user_repository: UserRepositoryProtocol,
    ) -> TokenService:
        return TokenService(
            refresh_token_repository=refresh_token_repository,
            user_repository=user_repository,
        )

    @provide
    def get_refresh_token_service(
        self,
        refresh_token_repository: RefreshTokenRepositoryProtocol,
    ) -> RefreshTokenService:
        return RefreshTokenService(
            refresh_token_repository=refresh_token_repository,
        )

    @provide
    def get_security_service(self) -> SecurityService:
        return SecurityService()

    # Recipe-related services
    @provide
    def get_recipe_service(
        self,
        recipe_repository: RecipeRepositoryProtocol,
        recipe_ingredient_repository: RecipeIngredientRepositoryProtocol,
        recipe_instruction_repository: RecipeInstructionRepositoryProtocol,
        recipe_tag_repository: RecipeTagRepositoryProtocol,
        recipe_image_repository: RecipeImageRepositoryProtocol,
        recipe_search_repository: RecipeSearchRepositoryProtocol,
    ) -> RecipeService:
        return RecipeService(
            recipe_repository=recipe_repository,
            recipe_ingredient_repository=recipe_ingredient_repository,
            recipe_instruction_repository=recipe_instruction_repository,
            recipe_tag_repository=recipe_tag_repository,
            recipe_image_repository=recipe_image_repository,
            recipe_search_repository=recipe_search_repository,
        )

    @provide
    def get_recipe_instructions_service(
        self, recipe_image_repository: RecipeImageRepositoryProtocol
    ) -> RecipeInstructionsService:
        return RecipeInstructionsService(recipe_image_repository=recipe_image_repository)

    @provide
    def get_favorite_recipe_service(
        self,
        favorite_recipe_repository: FavoriteRecipeRepositoryProtocol,
        recipe_repository: RecipeRepositoryProtocol,
        disliked_recipe_repository: DislikedRecipeRepositoryProtocol,
        recipe_image_repository: RecipeImageRepositoryProtocol,
    ) -> FavoriteRecipeService:
        return FavoriteRecipeService(
            favorite_recipe_repository=favorite_recipe_repository,
            recipe_repository=recipe_repository,
            disliked_recipe_repository=disliked_recipe_repository,
            recipe_image_repository=recipe_image_repository,
        )

    @provide
    def get_disliked_recipe_service(
        self,
        disliked_recipe_repository: DislikedRecipeRepositoryProtocol,
        recipe_repository: RecipeRepositoryProtocol,
        favorite_recipe_repository: FavoriteRecipeRepositoryProtocol,
        recipe_image_repository: RecipeImageRepositoryProtocol,
    ) -> DislikedRecipeService:
        return DislikedRecipeService(
            disliked_recipe_repository=disliked_recipe_repository,
            recipe_repository=recipe_repository,
            favorite_recipe_repository=favorite_recipe_repository,
            recipe_image_repository=recipe_image_repository,
        )

    @provide
    def get_recipe_impression_service(
        self,
        recipe_impression_repository: RecipeImpressionRepositoryProtocol,
        recipe_repository: RecipeRepositoryProtocol,
        recipe_image_repository: RecipeImageRepositoryProtocol,
    ) -> RecipeImpressionService:
        return RecipeImpressionService(
            recipe_impression_repository=recipe_impression_repository,
            recipe_repository=recipe_repository,
            recipe_image_repository=recipe_image_repository,
        )

    # Admin services
    @provide
    def get_banned_email_service(self, banned_email_repository: BannedEmailRepositoryProtocol) -> BannedEmailService:
        return BannedEmailService(banned_email_repository=banned_email_repository)

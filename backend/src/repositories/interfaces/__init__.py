from src.repositories.interfaces.anonymous_user import AnonymousUserRepositoryProtocol
from src.repositories.interfaces.banned_email import BannedEmailRepositoryProtocol
from src.repositories.interfaces.consent import ConsentRepositoryProtocol
from src.repositories.interfaces.disliked_recipe import DislikedRecipeRepositoryProtocol
from src.repositories.interfaces.favorite_recipe import FavoriteRecipeRepositoryProtocol
from src.repositories.interfaces.recipe import RecipeRepositoryProtocol
from src.repositories.interfaces.recipe_image import RecipeImageRepositoryProtocol
from src.repositories.interfaces.recipe_impression import RecipeImpressionRepositoryProtocol
from src.repositories.interfaces.recipe_ingredient import RecipeIngredientRepositoryProtocol
from src.repositories.interfaces.recipe_instruction import RecipeInstructionRepositoryProtocol
from src.repositories.interfaces.recipe_report import RecipeReportRepositoryProtocol
from src.repositories.interfaces.recipe_search import RecipeSearchRepositoryProtocol
from src.repositories.interfaces.recipe_tag import RecipeTagRepositoryProtocol
from src.repositories.interfaces.recsys import RecsysRepositoryProtocol
from src.repositories.interfaces.search_query import SearchQueryRepositoryProtocol
from src.repositories.interfaces.shopping_list_item import ShoppingListItemRepositoryProtocol
from src.repositories.interfaces.token import RefreshTokenRepositoryProtocol
from src.repositories.interfaces.user import UserRepositoryProtocol
from src.repositories.interfaces.user_avatar import UserAvatarRepositoryProtocol
from src.repositories.interfaces.user_profile import UserProfileRepositoryProtocol

__all__ = [
    "AnonymousUserRepositoryProtocol",
    "BannedEmailRepositoryProtocol",
    "ConsentRepositoryProtocol",
    "DislikedRecipeRepositoryProtocol",
    "FavoriteRecipeRepositoryProtocol",
    "RecipeImageRepositoryProtocol",
    "RecipeImpressionRepositoryProtocol",
    "RecipeIngredientRepositoryProtocol",
    "RecipeInstructionRepositoryProtocol",
    "RecipeReportRepositoryProtocol",
    "RecipeRepositoryProtocol",
    "RecipeSearchRepositoryProtocol",
    "RecipeTagRepositoryProtocol",
    "RecsysRepositoryProtocol",
    "RefreshTokenRepositoryProtocol",
    "SearchQueryRepositoryProtocol",
    "ShoppingListItemRepositoryProtocol",
    "UserAvatarRepositoryProtocol",
    "UserProfileRepositoryProtocol",
    "UserRepositoryProtocol",
]

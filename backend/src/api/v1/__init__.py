from fastapi import APIRouter

from src.api.v1 import auth, banned_email, consent, disliked_recipe, favorite_recipe, recipe_search, recipes, user

router = APIRouter(prefix="/v1")

router.include_router(auth.router)
router.include_router(user.router)
router.include_router(banned_email.router)
router.include_router(consent.router)
router.include_router(recipe_search.router)
router.include_router(recipes.router)
router.include_router(recipe_search.router)
router.include_router(favorite_recipe.router)
router.include_router(disliked_recipe.router)

__all__ = ["router"]

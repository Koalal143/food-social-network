from src.models.recipe import Recipe


class RecipeWithFavorite(Recipe):
    is_on_favorites: bool

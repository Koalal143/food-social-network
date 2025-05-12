from src.models.recipe import Recipe


class RecipeWithFavorite(Recipe):
    __abstract__ = True

    is_on_favorites: bool

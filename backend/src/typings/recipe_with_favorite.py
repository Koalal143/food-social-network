from src.models.recipe import Recipe


class RecipeWithExtra(Recipe):
    __abstract__ = True

    is_on_favorites: bool
    impressions_count: int

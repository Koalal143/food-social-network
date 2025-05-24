from typing import Final

from slugify import slugify

MAX_SLUG_LENGTH: Final[int] = 60


def create_recipe_slug(title: str, recipe_id: int) -> str:
    title_slug = slugify(title, max_length=(MAX_SLUG_LENGTH - len(str(recipe_id)) - 1))
    return f"{title_slug}-{recipe_id}"

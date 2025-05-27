import uuid
from typing import Final

from slugify import slugify

MAX_SLUG_LENGTH: Final[int] = 60


def create_recipe_slug(title: str) -> str:
    title_slug = slugify(title, max_length=MAX_SLUG_LENGTH)
    return f"{title_slug}-{uuid.uuid4().hex[:8]}"

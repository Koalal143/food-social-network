from typing import Final

MAX_TITLE_WORDS: Final[int] = 15

MIN_RECOMMENDED_TITLE_WORDS: Final[int] = 2

MAX_ONE_WORD_TITLE_LENGTH: Final[int] = 25


def validate_recipe_title(title: str) -> str:
    """Validate recipe title to prevent spam and ensure quality."""
    title = title.strip()

    words = title.split()
    if len(words) < MIN_RECOMMENDED_TITLE_WORDS and len(title) > MAX_ONE_WORD_TITLE_LENGTH:
        msg = (
            f"Title must contain at least {MIN_RECOMMENDED_TITLE_WORDS} words"
            f"or be shorter than {MAX_ONE_WORD_TITLE_LENGTH} characters"
        )
        raise ValueError(msg)

    if len(words) > MAX_TITLE_WORDS:
        msg = f"Title cannot contain more than {MAX_TITLE_WORDS} words"
        raise ValueError(msg)

    return title

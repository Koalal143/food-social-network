from enum import StrEnum


class RecipeGetSourceEnum(StrEnum):
    SEARCH = "search"
    FEED = "feed"
    RECOMMENDATIONS = "recs"
    RECOMMENDATIONS_DETAIL = "recs-detail"
    FAVORITES = "favorites"
    AUTHOR_PAGE = "author-page"
    SHARED = "shared"

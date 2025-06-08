from enum import StrEnum


class RecipeSortFieldEnum(StrEnum):
    """Enum for recipe sorting fields with direction.

    Follows Django ORM pattern where "-" prefix means descending order.
    """

    CREATED_AT_ASC = "created_at"
    CREATED_AT_DESC = "-created_at"
    IMPRESSIONS_COUNT_ASC = "impressions_count"
    IMPRESSIONS_COUNT_DESC = "-impressions_count"

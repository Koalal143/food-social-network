from enum import StrEnum


class ReportReasonEnum(StrEnum):
    SPAM = "spam"
    INAPPROPRIATE_CONTENT = "inappropriate_content"
    COPYRIGHT = "copyright"
    FAKE_RECIPE = "fake_recipe"
    OTHER = "other"

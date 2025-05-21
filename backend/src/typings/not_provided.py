from typing import Any


class NotProvidedType:
    """A special type to mark fields that are unset in update data transfer objects."""

    _instance: "NotProvidedType | None" = None

    def __new__(cls) -> "NotProvidedType":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __repr__(self) -> str:
        return "NOT_PROVIDED"

    def __bool__(self) -> bool:
        return False

    def __eq__(self, other: object) -> bool:
        return isinstance(other, NotProvidedType)

    def __hash__(self) -> int:
        return hash("NOT_PROVIDED")


NOT_PROVIDED = NotProvidedType()


def is_provided(value: Any) -> bool:
    return value is not NOT_PROVIDED


__all__ = [
    "NOT_PROVIDED",
    "NotProvidedType",
]

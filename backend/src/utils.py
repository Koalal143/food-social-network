from typing import Any


def json_example_factory(example: Any) -> dict[str, dict[str, Any]]:
    return {
        "application/json": {
            "example": example,
        }
    }


def json_examples_factory(examples: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        "application/json": {
            "examples": examples,
        }
    }

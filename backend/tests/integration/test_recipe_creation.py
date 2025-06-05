import pytest
from dirty_equals import IsDatetime, IsInt, IsStr
from faker import Faker
from fastapi import status
from httpx import AsyncClient

fake = Faker()

pytestmark = pytest.mark.asyncio(loop_scope="session")

# Constants from schema validation
MAX_INGREDIENTS = 50
MAX_TAGS = 15
MAX_INSTRUCTIONS = 25


class TestRecipeCreation:
    async def test_create_recipe_success(self, api_client: AsyncClient, auth_headers: dict[str, str]):
        recipe_data = {
            "title": "Pasta Carbonara Classic",
            "short_description": "Traditional Italian pasta dish with eggs and cheese",
            "difficulty": "MEDIUM",
            "cook_time_minutes": 25,
            "ingredients": [
                {"name": "Spaghetti", "quantity": "400g"},
                {"name": "Eggs", "quantity": "4 pieces"},
                {"name": "Parmesan cheese", "quantity": "100g"},
            ],
            "tags": [{"name": "Italian"}, {"name": "Pasta"}],
            "instructions": [
                {"step_number": 1, "description": "Boil water in a large pot"},
                {"step_number": 2, "description": "Cook spaghetti until al dente"},
            ],
        }

        response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)

        assert response.status_code == status.HTTP_201_CREATED
        recipe = response.json()
        assert recipe["title"] == recipe_data["title"]
        assert recipe["short_description"] == recipe_data["short_description"]
        assert recipe["difficulty"] == recipe_data["difficulty"]
        assert recipe["cook_time_minutes"] == recipe_data["cook_time_minutes"]
        assert recipe["is_published"] is False
        assert recipe["id"] == IsInt(gt=0)
        assert recipe["slug"] == IsStr()
        assert recipe["created_at"] == IsDatetime(iso_string=True, delta=3)
        assert recipe["updated_at"] == IsDatetime(iso_string=True, delta=3)
        assert len(recipe["ingredients"]) == len(recipe_data["ingredients"])  # type: ignore[arg-type]
        assert len(recipe["tags"]) == len(recipe_data["tags"])  # type: ignore[arg-type]
        assert len(recipe["instructions"]) == len(recipe_data["instructions"])  # type: ignore[arg-type]

    async def test_create_recipe_without_auth(self, api_client: AsyncClient):
        recipe_data = {
            "title": "Test Recipe",
            "short_description": "Test description",
            "difficulty": "EASY",
            "cook_time_minutes": 30,
            "ingredients": [{"name": "Test", "quantity": "1 piece"}],
            "tags": [{"name": "test"}],
        }

        response = await api_client.post("/v1/recipes/", json=recipe_data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["error_key"] == "invalid_token"

    @pytest.mark.parametrize(
        ("field", "value"),
        [
            ("title", ""),
            ("title", "a" * 136),
            ("title", "a b c d e f g h i j k l m n o p"),
            ("short_description", ""),
            ("short_description", "a" * 256),
            ("difficulty", "INVALID"),
            ("cook_time_minutes", 0),
            ("cook_time_minutes", -5),
        ],
        ids=[
            "empty_title",
            "title_too_long",
            "title_too_many_words",
            "empty_description",
            "description_too_long",
            "invalid_difficulty",
            "zero_cook_time",
            "negative_cook_time",
        ],
    )
    async def test_create_recipe_validation_errors(
        self, api_client: AsyncClient, auth_headers: dict[str, str], field: str, value
    ):
        recipe_data = {
            "title": "Valid Recipe Title",
            "short_description": "Valid description",
            "difficulty": "EASY",
            "cook_time_minutes": 30,
            "ingredients": [{"name": "Test", "quantity": "1 piece"}],
            "tags": [{"name": "test"}],
        }
        recipe_data[field] = value

        response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert response.json()["error_key"] == "validation_error"

    @pytest.mark.parametrize(
        "ingredients",
        [
            [],
            [{"name": "Test", "quantity": "1 piece"}] * 51,
            [{"name": "", "quantity": "1 piece"}],
            [{"name": "a" * 136, "quantity": "1 piece"}],
            [{"name": "Test", "quantity": "a" * 136}],
        ],
        ids=[
            "empty_ingredients_list",
            "too_many_ingredients",
            "empty_ingredient_name",
            "ingredient_name_too_long",
            "ingredient_quantity_too_long",
        ],
    )
    async def test_create_recipe_ingredients_validation(
        self, api_client: AsyncClient, auth_headers: dict[str, str], ingredients: list
    ):
        recipe_data = {
            "title": "Valid Recipe Title",
            "short_description": "Valid description",
            "difficulty": "EASY",
            "cook_time_minutes": 30,
            "ingredients": ingredients,
            "tags": [{"name": "test"}],
        }

        response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert response.json()["error_key"] == "validation_error"

    @pytest.mark.parametrize(
        "tags",
        [
            [],
            [{"name": "test"}] * 16,
            [{"name": ""}],
            [{"name": "a" * 51}],
        ],
        ids=[
            "empty_tags_list",
            "too_many_tags",
            "empty_tag_name",
            "tag_name_too_long",
        ],
    )
    async def test_create_recipe_tags_validation(
        self, api_client: AsyncClient, auth_headers: dict[str, str], tags: list
    ):
        recipe_data = {
            "title": "Valid Recipe Title",
            "short_description": "Valid description",
            "difficulty": "EASY",
            "cook_time_minutes": 30,
            "ingredients": [{"name": "Test", "quantity": "1 piece"}],
            "tags": tags,
        }

        response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert response.json()["error_key"] == "validation_error"

    @pytest.mark.parametrize(
        "instructions",
        [
            [{"step_number": 1, "description": "a" * 1001}],
            [{"step_number": 0, "description": "Test"}],
            [{"step_number": 26, "description": "Test"}],
            [{"step_number": 2, "description": "Test"}],
            [{"step_number": 1, "description": "Test"}, {"step_number": 3, "description": "Test"}],
        ],
        ids=[
            "instruction_description_too_long",
            "instruction_step_zero",
            "instruction_step_too_high",
            "instruction_step_not_sequential",
            "instruction_steps_with_gaps",
        ],
    )
    async def test_create_recipe_instructions_validation(
        self, api_client: AsyncClient, auth_headers: dict[str, str], instructions: list
    ):
        recipe_data = {
            "title": "Valid Recipe Title",
            "short_description": "Valid description",
            "difficulty": "EASY",
            "cook_time_minutes": 30,
            "ingredients": [{"name": "Test", "quantity": "1 piece"}],
            "tags": [{"name": "test"}],
            "instructions": instructions,
        }

        response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert response.json()["error_key"] == "validation_error"

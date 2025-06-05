import pytest
from fastapi import status
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")

# Constants from schema validation
MAX_INGREDIENTS = 50
MAX_TAGS = 15
MAX_INSTRUCTIONS = 25
SLUG_HEX_LENGTH = 8


class TestRecipeEdgeCases:
    async def test_create_recipe_with_maximum_ingredients(self, api_client: AsyncClient, auth_headers: dict[str, str]):
        ingredients = [{"name": f"Ingredient {i}", "quantity": f"{i} pieces"} for i in range(1, 51)]
        recipe_data = {
            "title": "Recipe with Max Ingredients",
            "short_description": "Recipe with maximum allowed ingredients",
            "difficulty": "HARD",
            "cook_time_minutes": 120,
            "ingredients": ingredients,
            "tags": [{"name": "complex"}],
        }

        response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)

        assert response.status_code == status.HTTP_201_CREATED
        recipe = response.json()
        assert len(recipe["ingredients"]) == MAX_INGREDIENTS

    async def test_create_recipe_with_maximum_tags(self, api_client: AsyncClient, auth_headers: dict[str, str]):
        tags = [{"name": f"tag{i}"} for i in range(1, 16)]
        recipe_data = {
            "title": "Recipe with Max Tags",
            "short_description": "Recipe with maximum allowed tags",
            "difficulty": "MEDIUM",
            "cook_time_minutes": 60,
            "ingredients": [{"name": "Test", "quantity": "1 piece"}],
            "tags": tags,
        }

        response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)

        assert response.status_code == status.HTTP_201_CREATED
        recipe = response.json()
        assert len(recipe["tags"]) == MAX_TAGS

    async def test_create_recipe_with_maximum_instructions(self, api_client: AsyncClient, auth_headers: dict[str, str]):
        instructions = [{"step_number": i, "description": f"Step {i} description"} for i in range(1, 26)]
        recipe_data = {
            "title": "Recipe with Max Instructions",
            "short_description": "Recipe with maximum allowed instructions",
            "difficulty": "HARD",
            "cook_time_minutes": 180,
            "ingredients": [{"name": "Test", "quantity": "1 piece"}],
            "tags": [{"name": "complex"}],
            "instructions": instructions,
        }

        response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)

        assert response.status_code == status.HTTP_201_CREATED
        recipe = response.json()
        assert len(recipe["instructions"]) == MAX_INSTRUCTIONS

    async def test_get_recipe_with_authenticated_user_shows_favorites_status(
        self, api_client: AsyncClient, test_recipe: dict, auth_headers: dict[str, str]
    ):
        recipe_id = test_recipe["id"]

        response = await api_client.get(f"/v1/recipes/{recipe_id}", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        recipe = response.json()
        assert "is_on_favorites" in recipe
        assert isinstance(recipe["is_on_favorites"], bool)

    async def test_recipe_slug_generation(self, api_client: AsyncClient, auth_headers: dict[str, str]):
        recipe_data = {
            "title": "Pasta Carbonara",
            "short_description": "Traditional Italian pasta",
            "difficulty": "MEDIUM",
            "cook_time_minutes": 25,
            "ingredients": [{"name": "Pasta", "quantity": "400g"}],
            "tags": [{"name": "Italian"}],
        }

        response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)

        assert response.status_code == status.HTTP_201_CREATED
        recipe = response.json()
        slug = recipe["slug"]
        assert "-" in slug
        assert len(slug.split("-")[-1]) == SLUG_HEX_LENGTH
        assert slug.startswith("pasta-carbonara")

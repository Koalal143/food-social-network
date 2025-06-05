from io import BytesIO
from pathlib import Path

import aiofiles
import pytest_asyncio
from fastapi import status
from httpx import AsyncClient

from src.core.config import Settings


async def _create_and_publish_single_recipe(
    api_client: AsyncClient,
    auth_headers: dict[str, str],
    tmp_path: Path,
    test_settings: Settings,
    http_client: AsyncClient,
    index: int = 0,
) -> dict:
    idx = index

    dummy_image_path = tmp_path / f"recipe_image_{idx}.jpg"
    async with aiofiles.open(dummy_image_path, "wb") as f:
        await f.write(f"dummy image content for recipe {idx}".encode())

    recipe_data = {
        "title": f"Test Recipe {idx}",
        "short_description": f"Test recipe description {idx}",
        "difficulty": "EASY",
        "cook_time_minutes": 30 + idx * 5,
        "ingredients": [{"name": f"Test Ingredient {idx}", "quantity": f"{idx + 1} piece"}],
        "tags": [{"name": f"test{idx}"}],
    }

    create_response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)
    assert create_response.status_code == status.HTTP_201_CREATED
    recipe = create_response.json()
    recipe_id = recipe["id"]

    upload_url_response = await api_client.post(f"/v1/recipes/{recipe_id}/image/upload-url", headers=auth_headers)
    assert upload_url_response.status_code == status.HTTP_200_OK
    upload_info = upload_url_response.json()
    presigned_url = upload_info["url"].replace(
        f"{test_settings.server.url}/static",
        f"{test_settings.s3_storage.host}:{test_settings.s3_storage.port}",
    )
    upload_fields = upload_info.get("fields", {})
    image_path = upload_info["fields"]["key"]
    upload_fields["Content-Type"] = "image/jpg"
    async with aiofiles.open(dummy_image_path, "rb") as f:
        file_content = await f.read()

    with BytesIO(file_content) as f:
        files = {"file": (dummy_image_path.name, f, "image/jpg")}
        upload_file_response = await http_client.post(presigned_url, data=upload_fields, files=files)
    assert upload_file_response.status_code in (status.HTTP_200_OK, status.HTTP_204_NO_CONTENT)
    update_payload = {
        "image_path": image_path,
        "is_published": True,
        "instructions": [{"step_number": 1, "description": f"Test instruction for recipe {idx}"}],
    }
    update_response = await api_client.patch(f"/v1/recipes/{recipe_id}", json=update_payload, headers=auth_headers)
    assert update_response.status_code in (status.HTTP_200_OK, status.HTTP_204_NO_CONTENT)
    get_response = await api_client.get(f"/v1/recipes/{recipe_id}", headers=auth_headers)
    assert get_response.status_code == status.HTTP_200_OK

    return get_response.json()


@pytest_asyncio.fixture
async def test_recipe(
    api_client: AsyncClient,
    auth_headers: dict[str, str],
    tmp_path: Path,
    test_settings: Settings,
    http_client: AsyncClient,
) -> dict:
    return await _create_and_publish_single_recipe(
        api_client, auth_headers, tmp_path, test_settings, http_client, index=0
    )


@pytest_asyncio.fixture
async def test_recipes(
    api_client: AsyncClient,
    auth_headers: dict[str, str],
    tmp_path: Path,
    test_settings: Settings,
    http_client: AsyncClient,
) -> list[dict]:
    recipes = []
    for i in range(5):
        recipe = await _create_and_publish_single_recipe(
            api_client, auth_headers, tmp_path, test_settings, http_client, index=i
        )
        recipes.append(recipe)
    return recipes

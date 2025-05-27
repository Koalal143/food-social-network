from collections.abc import Sequence

from elasticsearch.dsl import Q

from src.adapters.search.indexes import RecipeIndex
from src.adapters.storage import S3Storage
from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions.recipe import (
    NoRecipeImageError,
    NoRecipeInstructionsError,
    RecipeNotFoundError,
    RecipeOwnershipError,
)
from src.models.recipe import Recipe
from src.models.user import User
from src.schemas.direct_upload import DirectUpload
from src.schemas.recipe import (
    Ingredient,
    RecipeCreate,
    RecipeInstruction,
    RecipeRead,
    RecipeReadFull,
    RecipeReadShort,
    RecipeSearchQuery,
    RecipeTag,
    RecipeUpdate,
)
from src.schemas.user import UserReadShort
from src.typings.recipe_with_favorite import RecipeWithFavorite
from src.utils.slug import create_recipe_slug


class RecipeService:
    def __init__(self, uow: SQLAlchemyUnitOfWork, s3_storage: S3Storage) -> None:
        self.uow = uow
        self.s3_storage = s3_storage
        self._recipe_bucket_name = "images"

    async def _to_recipe_schema(self, recipe: Recipe) -> RecipeReadFull:
        recipe_schema = RecipeReadFull.model_validate(recipe)

        if recipe.image_url:
            recipe_schema.image_url = await self.s3_storage.get_file_url(
                self._recipe_bucket_name, recipe.image_url, expires_in=3600
            )

        for i, instruction in enumerate(recipe_schema.instructions):
            if instruction.image_url:
                recipe_schema.instructions[i].image_url = await self.s3_storage.get_file_url(
                    self._recipe_bucket_name,
                    instruction.image_url,
                    expires_in=3600,
                )

        return recipe_schema

    async def _to_recipe_short_schema(self, recipe: Recipe) -> RecipeReadShort:
        if recipe.image_url:
            recipe.image_url = await self.s3_storage.get_file_url(
                self._recipe_bucket_name, recipe.image_url, expires_in=3600
            )
        return RecipeReadShort.model_validate(recipe, from_attributes=True)

    async def _to_recipe_full_schema(self, recipe: RecipeWithFavorite) -> RecipeReadFull:
        recipe_schema = await self._to_recipe_schema(recipe)
        author = UserReadShort.model_validate(recipe.author, from_attributes=True)
        if author.profile.avatar_url:
            author.profile.avatar_url = await self.s3_storage.get_file_url(
                self._recipe_bucket_name, recipe.author.profile.avatar_url, expires_in=3600
            )
        new_recipe_schema = recipe_schema.model_dump()
        new_recipe_schema["author"] = author.model_dump()
        return RecipeReadFull.model_validate(new_recipe_schema)

    async def get_by_id(self, recipe_id: int, user_id: int | None = None) -> RecipeReadFull:
        recipe = await self.uow.recipes.get_by_id(recipe_id, user_id=user_id)
        if not recipe:
            msg = f"Recipe with id {recipe_id} not found"
            raise RecipeNotFoundError(msg)

        return await self._to_recipe_full_schema(recipe)

    async def get_all(
        self, skip: int = 0, limit: int = 10, user_id: int | None = None
    ) -> tuple[int, Sequence[RecipeReadShort]]:
        count, recipes = await self.uow.recipes.get_all(user_id=user_id, skip=skip, limit=limit)
        recipe_schemas = [await self._to_recipe_short_schema(recipe) for recipe in recipes]

        return count, recipe_schemas

    async def get_all_by_author_username(
        self, author_nickname: str, skip: int = 0, limit: int = 10, user_id: int | None = None
    ) -> tuple[int, Sequence[RecipeReadShort]]:
        count, recipes = await self.uow.recipes.get_by_author_username(
            author_username=author_nickname,
            user_id=user_id,
            skip=skip,
            limit=limit,
        )
        recipe_schemas = [await self._to_recipe_short_schema(recipe) for recipe in recipes]

        return count, recipe_schemas

    async def get_all_by_author_id(
        self, author_id: int, skip: int = 0, limit: int = 10, user_id: int | None = None
    ) -> tuple[int, Sequence[RecipeReadShort]]:
        count, recipes = await self.uow.recipes.get_by_author_id(
            author_id=author_id,
            user_id=user_id,
            skip=skip,
            limit=limit,
        )
        recipe_schemas = [await self._to_recipe_short_schema(recipe) for recipe in recipes]
        return count, recipe_schemas

    async def _create_ingredients(self, recipe_id: int, ingredients: list[Ingredient]) -> None:
        ingredients_data = []
        for ingredient in ingredients:
            ingredient_dict = ingredient.model_dump()
            ingredient_dict["recipe_id"] = recipe_id
            ingredients_data.append(ingredient_dict)

        if ingredients_data:
            await self.uow.recipe_ingredients.bulk_create(ingredients_data)

    async def _create_instructions(self, recipe_id: int, instructions: list[RecipeInstruction]) -> None:
        instructions_data = []
        for instruction in instructions:
            instruction_dict = instruction.model_dump()
            instruction_dict["recipe_id"] = recipe_id
            instructions_data.append(instruction_dict)

        if instructions_data:
            await self.uow.recipe_instructions.bulk_create(instructions_data)

    async def _create_tags(self, recipe_id: int, tags: list[RecipeTag]) -> None:
        tags_data = []
        for tag in tags:
            tag_dict = tag.model_dump()
            tag_dict["recipe_id"] = recipe_id
            tags_data.append(tag_dict)

        if tags_data:
            await self.uow.recipe_tags.bulk_create(tags_data)

    async def _update_elasticsearch_index(self, recipe: Recipe) -> None:
        unprepared_schema = RecipeRead.model_validate(recipe, from_attributes=True)
        schema = unprepared_schema.model_dump(exclude={"updated_at", "instructions", "image_url"})
        schema["tags"] = [schema["tags"][i]["name"] for i in range(len(schema["tags"]))]
        schema["ingredients"] = [schema["ingredients"][i]["name"] for i in range(len(schema["ingredients"]))]
        recipe_index = RecipeIndex(**schema)
        await recipe_index.save()

    async def search(
        self,
        params: RecipeSearchQuery,
    ) -> tuple[int, list[RecipeReadShort]]:
        search = RecipeIndex.search()

        must_queries = []
        must_not_queries = []
        filter_queries = []

        if params.query:
            must_queries.append(Q("multi_match", query=params.query, fields=["title", "short_description"]))

        if params.tags:
            filter_queries.append(Q("terms", tags=params.tags))

        if params.include_ingredients:
            include_ingredients_list = [Q("match", ingredients=ingredient) for ingredient in params.include_ingredients]
            must_queries.extend(include_ingredients_list)

        if params.exclude_ingredients:
            exclude_ingredients_list = [Q("match", ingredients=ingredient) for ingredient in params.exclude_ingredients]
            must_not_queries.extend(exclude_ingredients_list)

        if params.cook_time_from is not None or params.cook_time_to is not None:
            cook_range = {}
            if params.cook_time_from is not None:
                cook_range["gte"] = params.cook_time_from
            if params.cook_time_to is not None:
                cook_range["lte"] = params.cook_time_to
            filter_queries.append(Q("range", cook_time_minutes=cook_range))

        query = Q("bool", must=must_queries, must_not=must_not_queries, filter=filter_queries)

        search = search.query(query).extra(from_=params.offset, size=params.limit)

        if params.sort_by:
            search = search.sort(params.sort_by)

        result = await search.execute()
        total = result.hits.total.value
        recipe_ids = [hit.to_dict()["id"] for hit in result]
        recipes = await self.uow.recipes.get_by_ids(recipe_ids=recipe_ids)
        recipes_short = [RecipeReadShort.model_validate(recipe, from_attributes=True) for recipe in recipes]
        return total, recipes_short

    async def create(self, user: User, recipe_create: RecipeCreate) -> RecipeRead:
        recipe_data = recipe_create.model_dump(exclude={"ingredients", "instructions", "tags"})
        recipe = await self.recipe_repository.create(
            slug=create_recipe_slug(recipe_create.title), is_published=False, author_id=user.id, **recipe_data
        )

        await self._create_ingredients(recipe.id, recipe_create.ingredients)

        if recipe_create.instructions:
            await self._create_instructions(recipe.id, recipe_create.instructions)

        await self._create_tags(recipe.id, recipe_create.tags)

        await self.uow.commit()

        created_recipe = await self.uow.recipes.get_by_id(recipe.id)
        await self._update_elasticsearch_index(created_recipe)
        return await self._to_recipe_schema(created_recipe)

    async def update(self, user: User, recipe_id: int, recipe_update: RecipeUpdate) -> RecipeReadFull:
        existing_recipe = await self.uow.recipes.get_by_id(recipe_id)
        if not existing_recipe:
            msg = f"Recipe with id {recipe_id} not found"
            raise RecipeNotFoundError(msg)

        if existing_recipe.author_id != user.id and not user.is_superuser:
            msg = f"Recipe with id {recipe_id} belongs to other user"
            raise RecipeOwnershipError(msg)

        if not existing_recipe.image_url and recipe_update.is_published:
            msg = "Recipe can not be published without image"
            raise NoRecipeImageError(msg)

        if recipe_update.is_published and not (existing_recipe.instructions or recipe_update.instructions):
            msg = "Recipe can not be published without instructions"
            raise NoRecipeInstructionsError(msg)

        recipe_data = recipe_update.model_dump(exclude={"ingredients", "instructions", "tags"}, exclude_unset=True)
        if recipe_data:
            if "title" in recipe_data:
                recipe_data["slug"] = create_recipe_slug(recipe_data["title"], recipe_id)
            await self.uow.recipes.update(recipe_id, **recipe_data)

        if recipe_update.ingredients is not None:
            await self.uow.recipe_ingredients.delete_by_recipe_id(recipe_id)
            await self._create_ingredients(recipe_id, recipe_update.ingredients)

        if recipe_update.instructions is not None:
            await self.uow.recipe_instructions.delete_by_recipe_id(recipe_id)
            await self._create_instructions(recipe_id, recipe_update.instructions)

        if recipe_update.tags is not None:
            await self.uow.recipe_tags.delete_by_recipe_id(recipe_id)
            await self._create_tags(recipe_id, recipe_update.tags)

        await self.uow.commit()

        updated_recipe = await self.uow.recipes.get_by_id(recipe_id, user_id=user.id)

        await self._update_elasticsearch_index(updated_recipe)

        return await self._to_recipe_full_schema(updated_recipe)

    async def delete(self, user: User, recipe_id: int) -> None:
        existing_recipe = await self.uow.recipes.get_by_id(recipe_id)
        if not existing_recipe:
            msg = f"Recipe with id {recipe_id} not found"
            raise RecipeNotFoundError(msg)

        if existing_recipe.author_id != user.id and not user.is_superuser:
            msg = f"Recipe with id {recipe_id} belongs to other user"
            raise RecipeOwnershipError(msg)

        await self.uow.recipe_ingredients.delete_by_recipe_id(recipe_id)
        await self.uow.recipe_instructions.delete_by_recipe_id(recipe_id)
        await self.uow.recipe_tags.delete_by_recipe_id(recipe_id)

        await self.uow.recipes.delete_by_id(recipe_id)

        await self.uow.commit()

        await RecipeIndex.delete(id=recipe_id)
        await RecipeIndex.save()

    async def get_image_upload_url(self, user: User, recipe_id: int) -> DirectUpload:
        existing_recipe = await self.uow.recipes.get_by_id(recipe_id)
        if not existing_recipe:
            msg = f"Recipe with id {recipe_id} not found"
            raise RecipeNotFoundError(msg)

        if existing_recipe.author_id != user.id and not user.is_superuser:
            msg = f"Recipe with id {recipe_id} belongs to other user"
            raise RecipeOwnershipError(msg)

        file_name = f"recipes/{recipe_id}/main.png"
        presigned_post_data = await self.s3_storage.generate_presigned_post(
            bucket_name=self._recipe_bucket_name,
            key=file_name,
            conditions=[
                {"acl": "private"},
                ["starts-with", "$Content-Type", "image/"],
                ["content-length-range", 1, 5 * 1024 * 1024],
            ],
            expires_in=300,
        )
        return DirectUpload.model_validate(presigned_post_data)

    async def get_by_slug(self, slug: str, user_id: int | None = None) -> RecipeReadFull:
        recipe = await self.uow.recipes.get_by_slug(slug, user_id)
        if not recipe:
            msg = f"Recipe with slug '{slug}' not found"
            raise RecipeNotFoundError(msg)

        return await self._to_recipe_full_schema(recipe)

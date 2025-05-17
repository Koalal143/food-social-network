from datetime import UTC, datetime
from fnmatch import fnmatch
from typing import Any, ClassVar

from elasticsearch.dsl import AsyncDocument, Date, Keyword, M, Text, async_connections, mapped_field

from src.adapters.search.recipes_search import russian_index_analyzer, russian_search_analyzer

RECIPE_ALIAS = "recipes"
PATTERN = RECIPE_ALIAS + "-*"
PRIORITY = 100


class RecipeIndex(AsyncDocument):
    title: M[str] = mapped_field(Text(analyzer=russian_index_analyzer, search_analyzer=russian_search_analyzer))
    short_description: M[str] = mapped_field(
        Text(analyzer=russian_index_analyzer, search_analyzer=russian_search_analyzer)
    )
    difficulty: M[str] = mapped_field(Keyword())
    cook_time_minutes: M[int]
    is_published: M[bool]
    ingredients: M[list[str]] = mapped_field(
        Text(analyzer=russian_index_analyzer, search_analyzer=russian_search_analyzer)
    )
    tags: M[list[str]] = mapped_field(Text(analyzer=russian_index_analyzer, search_analyzer=russian_search_analyzer))
    created_at: M[datetime] = mapped_field(Date())

    @classmethod
    def _matches(cls, hit: dict[str, Any]) -> bool:
        # override _matches to match indices in a pattern instead of just RECIPE_ALIAS
        # hit is the raw dict as returned by elasticsearch
        return fnmatch(hit["_index"], PATTERN)

    class Index:
        name = RECIPE_ALIAS
        settings: ClassVar = {
            "number_of_shards": 1,
            "number_of_replicas": 0,
        }


async def search_indexes_setup() -> None:
    """
    RecipeIndex search_indexes_setup function

    Create the index template in elasticsearch specifying the mappings and any
    settings to be used.
    """
    index_template = RecipeIndex._index.as_composable_template(RECIPE_ALIAS, PATTERN, priority=PRIORITY)  # noqa: SLF001
    await index_template.save()

    if not await RecipeIndex._index.exists():  # noqa: SLF001
        await migrate(move_data=False)


async def migrate(*, move_data: bool = True, update_alias: bool = True) -> None:
    """
    RecipeIndex index migrate function

    Upgrade function that creates a new index for the data. Optionally it also can
    (and by default will) reindex previous copy of the data into the new index
    (specify ``move_data=False`` to skip this step) and update the alias to
    point to the latest index (set ``update_alias=False`` to skip).

    Note that while this function is running the application can still perform
    any and all searches without any loss of functionality. It should, however,
    not perform any writes at this time as those might be lost.
    """
    next_index = PATTERN.replace("*", datetime.now(tz=UTC).strftime("%Y%m%d%H%M%S%f"))

    es = async_connections.get_connection()

    await es.indices.create(index=next_index)

    if move_data:
        await es.options(request_timeout=3600).reindex(
            body={"source": {"index": RECIPE_ALIAS}, "dest": {"index": next_index}}
        )
        await es.indices.refresh(index=next_index)

    if update_alias:
        await es.indices.update_aliases(
            body={
                "actions": [
                    {"remove": {"alias": RECIPE_ALIAS, "index": PATTERN}},
                    {"add": {"alias": RECIPE_ALIAS, "index": next_index}},
                ]
            }
        )

from elasticsearch.dsl import analyzer, token_filter

russian_stop = token_filter("russian_stop", type="stop", stopwords="_russian_", ignore_case=True)
russian_stemmer = token_filter("russian_stemmer", type="snowball", language="Russian", ignore_case=True)
synonym_filter = token_filter(
    "synonym_filter",
    type="synonym_graph",
    synonyms_path="analysis/recipe_synonyms.txt",
    ignore_case=True,
)
lowercase_filter = token_filter("lowercase", type="lowercase", ignore_case=True)

russian_index_analyzer = analyzer(
    "russian_index",
    type="custom",
    tokenizer="standard",
    filter=[
        lowercase_filter,
        russian_stop,
        russian_stemmer,
        synonym_filter,
    ],
)

russian_search_analyzer = analyzer(
    "russian_search",
    type="custom",
    tokenizer="standard",
    filter=[
        lowercase_filter,
        russian_stemmer,
        synonym_filter,
    ],
)

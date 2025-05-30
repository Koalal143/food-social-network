import numpy as np

from src.repositories.embeddings import EmbeddingsRepository
from src.repositories.postgres import RecipeRepository, UserFeedbackRepository, UserImpressionRepository
from src.repositories.qdrant import QdrantRepository
from src.schemas.recommendations import UserPreferences


class RecommendationAlgorithm:
    def __init__(
        self,
        feedback_repo: UserFeedbackRepository,
        impression_repo: UserImpressionRepository,
        qdrant_repo: QdrantRepository,
        embeddings_repo: EmbeddingsRepository,
        recipe_repo: RecipeRepository,
    ) -> None:
        self.feedback_repo = feedback_repo
        self.impression_repo = impression_repo
        self.qdrant_repo = qdrant_repo
        self.embeddings_repo = embeddings_repo
        self.recipe_repo = recipe_repo

    def _validate_parameters(self, user_id: int, limit: int, fetch_k: int, lambda_mult: float) -> None:
        if user_id <= 0:
            msg = "User id must be positive integer"
            raise ValueError(msg)
        if limit <= 0:
            msg = "Limit must be positive integer"
            raise ValueError(msg)
        if fetch_k < limit:
            msg = "Fetch k must be greater or equal to limit"
            raise ValueError(msg)
        if not 0 <= lambda_mult <= 1:
            msg = "Lambda mult must be in range [0, 1]"
            raise ValueError(msg)

    async def _get_user_interactions(self, user_id: int) -> UserPreferences:
        liked_ids = await self.feedback_repo.get_liked_recipe_ids(user_id)
        disliked_ids = await self.feedback_repo.get_disliked_recipe_ids(user_id)
        viewed_ids = await self.impression_repo.get_viewed_recipe_ids(user_id)
        recs_detail_ids = await self.impression_repo.get_recs_detail_recipe_ids(user_id)
        author_recipe_ids = await self.recipe_repo.get_recipe_ids_by_author(user_id)
        return UserPreferences(
            favorite_recipes_ids=liked_ids,
            disliked_recipes_ids=disliked_ids,
            viewed_recipes_ids=viewed_ids,
            recs_detail_recipes_ids=recs_detail_ids,
            author_recipes_ids=author_recipe_ids,
        )

    def _compute_component_embedding(
        self,
        recipe_ids: list[int],
        recipe_embeddings: dict[int, list[float]],
    ) -> np.ndarray | None:
        if not recipe_ids:
            return None

        valid_embeddings = [recipe_embeddings[rid] for rid in recipe_ids if rid in recipe_embeddings]

        if not valid_embeddings:
            return None

        normalized_embeddings = []
        for emb in valid_embeddings:
            emb_array = np.array(emb, dtype=np.float32)
            norm = np.linalg.norm(emb_array)
            if norm > 0:
                normalized_embeddings.append(emb_array / norm)
            else:
                normalized_embeddings.append(emb_array)

        if normalized_embeddings:
            return np.mean(normalized_embeddings, axis=0)
        return None

    async def compute_user_preference_vector(self, user_id: int) -> list[float] | None:
        user_preferences = await self._get_user_interactions(user_id)

        all_recipe_ids = list(set(user_preferences.favorite_recipes_ids + user_preferences.disliked_recipes_ids))
        if all_recipe_ids:
            recipe_embeddings = await self.qdrant_repo.get_recipe_embeddings(all_recipe_ids)
            if not recipe_embeddings:
                return None

            liked_emb = self._compute_component_embedding(user_preferences.favorite_recipes_ids, recipe_embeddings)
            disliked_emb = self._compute_component_embedding(user_preferences.disliked_recipes_ids, recipe_embeddings)
            viewed_emb = self._compute_component_embedding(user_preferences.viewed_recipes_ids, recipe_embeddings)
            recs_detail_emb = self._compute_component_embedding(
                user_preferences.recs_detail_recipes_ids, recipe_embeddings
            )
        else:
            liked_emb, disliked_emb, viewed_emb, recs_detail_emb = None, None, None, None

        user_vector = np.array([0.0] * 1024)

        if liked_emb is not None:
            user_vector = liked_emb * 2.0

        if disliked_emb is not None:
            user_vector = user_vector - disliked_emb if user_vector is not None else -disliked_emb

        if viewed_emb is not None:
            user_vector = user_vector + 0.2 * viewed_emb if user_vector is not None else 0.2 * viewed_emb

        if recs_detail_emb is not None:
            user_vector = user_vector + 0.2 * recs_detail_emb if user_vector is not None else 0.2 * recs_detail_emb

        if user_vector is None:
            return None

        norm = np.linalg.norm(user_vector)
        if norm > 0:
            user_vector = user_vector / norm
        else:
            return None

        return user_vector.tolist()

    def _calculate_cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return np.dot(vec1, vec2) / (norm1 * norm2)

    async def _apply_mmr_selection(
        self, candidates: list[dict], candidate_embeddings: dict[int, list[float]], limit: int, lambda_mult: float
    ) -> list[dict]:
        if len(candidates) <= limit:
            return candidates

        selected = [candidates[0]]
        remaining = candidates[1:]

        while len(selected) < limit and remaining:
            best_score = -np.inf
            best_idx = -1

            for i, candidate in enumerate(remaining):
                candidate_id = candidate["recipe_id"]

                if candidate_id not in candidate_embeddings:
                    continue

                relevance = 1 - candidate["score"]
                max_similarity = 0.0
                current_emb = np.array(candidate_embeddings[candidate_id], dtype=np.float32)

                for selected_candidate in selected:
                    selected_id = selected_candidate["recipe_id"]
                    if selected_id in candidate_embeddings:
                        selected_emb = np.array(candidate_embeddings[selected_id], dtype=np.float32)
                        similarity = self._calculate_cosine_similarity(current_emb, selected_emb)
                        max_similarity = max(max_similarity, similarity)

                mmr_score = lambda_mult * relevance - (1 - lambda_mult) * max_similarity

                if mmr_score > best_score:
                    best_score = mmr_score
                    best_idx = i

            if best_idx != -1:
                selected.append(remaining.pop(best_idx))
            else:
                break
        return selected

    async def get_recommendations(
        self, user_id: int, limit: int = 10, fetch_k: int = 20, lambda_mult: float = 0.5, *, exclude_viewed: bool = True
    ) -> list[dict]:
        self._validate_parameters(user_id, limit, fetch_k, lambda_mult)

        user_vector = await self.compute_user_preference_vector(user_id)
        if user_vector is None:
            return []

        exclude_ids = []
        if exclude_viewed:
            user_preferences = await self._get_user_interactions(user_id)
            exclude_ids = list(
                set(
                    user_preferences.favorite_recipes_ids
                    + user_preferences.disliked_recipes_ids
                    + user_preferences.author_recipes_ids
                )
            )
        candidates_result = await self.qdrant_repo.get_recommendations(
            query_vector=user_vector, limit=fetch_k, exclude_ids=exclude_ids
        )

        if not candidates_result.points:
            return []

        candidates = [
            {"recipe_id": point.id, "score": point.score, "payload": point.payload if hasattr(point, "payload") else {}}
            for point in candidates_result.points
        ]

        candidate_ids = [c["recipe_id"] for c in candidates]
        candidate_embeddings = await self.qdrant_repo.get_recipe_embeddings(candidate_ids)
        return await self._apply_mmr_selection(candidates, candidate_embeddings, limit, lambda_mult)

    async def get_all_recipe_ids(self) -> list[int]:
        return await self.qdrant_repo.get_all_recipe_ids()

"use client";
import { useRecipes } from "@/context/RecipeContext";
import Container from "@/components/layout/Container";
import InfiniteRecipesList from "@/components/shared/InfiniteRecipeList";
import { RecipeCardSkeletonGrid } from "@/components/ui/skeletons/RecipeCardSkeleton";
import HeaderSkeleton from "@/components/ui/skeletons/HeaderSkeleton";

export default function App() {
    const { recipes, loading, hasMore, fetchRecipes } = useRecipes();

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            fetchRecipes();
        }
    };

    if (loading && recipes.length === 0) {
        return (
            <Container className="py-6">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <HeaderSkeleton level={2} width="w-48" />
                    </div>
                    <RecipeCardSkeletonGrid count={6} />
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-6 flex-1">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Популярные рецепты</h2>
            </div>

            {recipes.length === 0 ? (
                <div className="empty-feed-placeholder flex flex-col items-center justify-center py-12 text-center">
                    <h3 className="text-xl font-medium text-gray-500 mb-2">Тут пока пусто</h3>
                    <p className="text-gray-400">Попробуйте позже или добавьте рецепт первым!</p>
                </div>
            ) : (
                <InfiniteRecipesList
                    recipes={recipes}
                    loading={loading}
                    hasMore={hasMore}
                    onLoadMore={handleLoadMore}
                    source="feed"
                />
            )}

            {hasMore && !loading && (
                <button 
                    onClick={handleLoadMore}
                    className="mx-auto block px-4 py-2 bg-primary text-white rounded-md mt-4"
                >
                    Загрузить еще рецепты
                </button>
            )}
        </Container>
    );
}
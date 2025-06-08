"use client";
import { useRecipes } from "@/context/RecipeContext";
import Container from "@/components/layout/Container";
import InfiniteRecipesList from "@/components/shared/InfiniteRecipeList";
import { RecipeCardSkeletonGrid } from "@/components/ui/skeletons/RecipeCardSkeleton";
import HeaderSkeleton from "@/components/ui/skeletons/HeaderSkeleton";
import EmptyState, { EmptyStateVariants } from "@/components/ui/EmptyState";
import { ChefHat } from "lucide-react";

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
                <EmptyState
                    icon={ChefHat}
                    {...EmptyStateVariants.noRecipes}
                    actionText="Добавить рецепт"
                    actionHref="/add-recipe"
                    variant="default"
                />
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
"use client";
import RecipeCard from "@/components/shared/RecipeCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export default function InfiniteRecipesList({ recipes, loading, hasMore, onLoadMore, source='feed', editable=false }) {
    const { loadMoreRef } = useInfiniteScroll(onLoadMore, hasMore, loading);

    return (
        <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} source={source} editable={editable}/>
            ))}
        </div>
        
        <div ref={loadMoreRef} className="w-full">
            {loading && (
                <div className="flex justify-center py-8">
                    <LoadingSpinner
                        variant="chef"
                        size="md"
                        text="Загружаем рецепты..."
                    />
                </div>
            )}
        </div>
        
        {!hasMore && recipes.length > 0 && (
            <p className="text-center text-gray-500 py-4">
                Вы просмотрели все доступные рецепты
            </p>
        )}
        </div>
    );
}


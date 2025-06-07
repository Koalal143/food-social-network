"use client";
import { useRef, useEffect } from "react";
import RecipeCard from "@/components/shared/RecipeCard";
import { InfiniteLoadingSkeleton } from "@/components/ui/skeletons";

export default function InfiniteRecipesList({ recipes, loading, hasMore, onLoadMore, source='feed', editable=false }) {
    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                onLoadMore();
            }
        },
        { threshold: 0.1, rootMargin: '100px' }
        )

        if (loadMoreRef.current && hasMore) {
            observer.observe(loadMoreRef.current);
        }

        observerRef.current = observer;

        return () => {
            if (observerRef.current && loadMoreRef.current) {
                observerRef.current.unobserve(loadMoreRef.current);
            }
        };
    }, [loading, hasMore, onLoadMore]);

    return (
        <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} source={source} editable={editable}/>
            ))}
        </div>
        
        <div ref={loadMoreRef} className="w-full">
            {loading && <InfiniteLoadingSkeleton count={3} />}
        </div>
        
        {!hasMore && recipes.length > 0 && (
            <p className="text-center text-gray-500 py-4">
                Вы просмотрели все доступные рецепты
            </p>
        )}
        </div>
    );
}


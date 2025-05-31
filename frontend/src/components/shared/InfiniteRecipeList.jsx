"use client";
import { useRef, useEffect } from "react";
import RecipeCard from "@/components/shared/RecipeCard";

export default function InfiniteRecipesList({ recipes, loading, hasMore, onLoadMore, source='feed' }) {
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          console.log('Load more element is visible, loading more recipes...');
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
          <RecipeCard key={recipe.id} recipe={recipe} source={source} />
        ))}
      </div>
      
      <div ref={loadMoreRef} className="w-full h-10 flex justify-center">
        {loading && <LoadingSpinner />}
      </div>
      
      {!hasMore && recipes.length > 0 && (
        <p className="text-center text-gray-500 py-4">
          Вы просмотрели все доступные рецепты
        </p>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center my-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
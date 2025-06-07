"use client"

import { RecipeCardSkeletonGrid } from "./RecipeCardSkeleton";
import HeaderSkeleton from "./HeaderSkeleton";

/**
 * Скелетон для результатов поиска
 */
export default function SearchSkeleton({ count = 6 }) {
    return (
        <div className="space-y-6">
            {/* Search results header skeleton */}
            <div className="space-y-2">
                <HeaderSkeleton level={2} width="w-48" />
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
            </div>

            {/* Results grid skeleton */}
            <RecipeCardSkeletonGrid count={count} />
        </div>
    );
}

/**
 * Простой скелетон для индикатора поиска
 */
export function SearchLoadingSkeleton() {
    return (
        <div className="flex justify-center py-8">
            <div className="space-y-3 text-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
            </div>
        </div>
    );
}

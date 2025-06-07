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
 * Скелетон для индикатора загрузки поиска
 * Отображает сетку карточек рецептов во время поиска
 */
export function SearchLoadingSkeleton({ count = 6 }) {
    return (
        <div className="space-y-6">
            {/* Search results header skeleton */}
            <div className="space-y-2 px-2 sm:px-0">
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
            </div>

            {/* Results grid skeleton - используем тот же компонент, что и на главной */}
            <RecipeCardSkeletonGrid count={count} />
        </div>
    );
}

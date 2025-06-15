"use client"

import AuthorCardSkeleton from "./AuthorCardSkeleton";
import HeaderSkeleton, { PageHeaderSkeleton, SectionHeaderSkeleton } from "./HeaderSkeleton";

/**
 * Скелетон для детальной страницы рецепта
 * Точно соответствует структуре страницы рецепта
 */
export default function RecipeDetailSkeleton() {
    return (
        <div className="max-w-3xl mx-auto bg-white dark:bg-secondary/100 rounded-3xl shadow-xl overflow-hidden animate-pulse">
            {/* Image with action buttons skeleton */}
            <div className="relative aspect-[16/9] w-full bg-gray-200">
                {/* Action buttons skeleton - только поделиться и удалить */}
                <div className="absolute top-3 right-3 flex gap-1.5">
                    <div className="w-8 h-8 bg-gray-300 rounded-full" />
                    <div className="w-8 h-8 bg-gray-300 rounded-full" />
                </div>

                {/* Gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
            </div>

            {/* Recipe Content skeleton */}
            <div className="p-4 space-y-4">
                {/* Title and description skeleton */}
                <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>

                {/* Action buttons skeleton */}
                <div className="flex items-center gap-2">
                    <div className="h-8 bg-gray-200 rounded px-3 w-24" />
                    <div className="h-8 bg-gray-200 rounded px-3 w-28" />
                </div>

                {/* Author card skeleton */}
                <AuthorCardSkeleton />

                {/* Recipe info cards skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Array.from({ length: 2 }, (_, i) => (
                        <div key={i} className="p-3 rounded-lg flex items-center gap-2.5 shadow-sm bg-gray-100 animate-pulse">
                            <div className="w-4 h-4 bg-gray-200 rounded" />
                            <div className="space-y-1">
                                <div className="h-4 bg-gray-200 rounded w-16" />
                                <div className="h-3 bg-gray-200 rounded w-20" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ingredients skeleton */}
                <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-32" />
                    <div className="space-y-2">
                        {Array.from({ length: 6 }, (_, i) => (
                            <div key={`ingredient-skeleton-${i}`} className="flex items-center justify-between p-3 bg-background rounded-lg shadow-sm animate-pulse">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 bg-gray-200 rounded-full flex-shrink-0" />
                                    <div className="h-4 bg-gray-200 rounded w-32" />
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-16" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Instructions skeleton */}
                <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-36" />
                    <div className="space-y-4">
                        {Array.from({ length: 5 }, (_, i) => (
                            <div key={i} className="p-4 bg-background rounded-lg shadow-sm animate-pulse">
                                <div className="flex gap-3 items-start mb-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-full" />
                                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                                    </div>
                                </div>
                                {/* Optional instruction image skeleton */}
                                {i % 2 === 0 && (
                                    <div className="mt-3 rounded-lg overflow-hidden shadow-sm">
                                        <div className="h-48 md:h-64 bg-gray-200" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

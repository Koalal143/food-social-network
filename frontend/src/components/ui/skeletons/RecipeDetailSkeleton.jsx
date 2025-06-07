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
                {/* Action buttons skeleton */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-full" />
                    <div className="w-10 h-10 bg-gray-300 rounded-full" />
                    <div className="w-10 h-10 bg-gray-300 rounded-full" />
                </div>

                {/* Gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
            </div>

            {/* Recipe Content skeleton */}
            <div className="p-8 space-y-8">
                {/* Title and description skeleton */}
                <PageHeaderSkeleton />

                {/* Author card skeleton */}
                <AuthorCardSkeleton />

                {/* Recipe info cards skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 2 }, (_, i) => (
                        <div key={i} className="p-6 rounded-xl flex items-center gap-4 shadow-sm bg-gray-100 animate-pulse">
                            <div className="w-8 h-8 bg-gray-200 rounded" />
                            <div className="space-y-2">
                                <div className="h-5 bg-gray-200 rounded w-16" />
                                <div className="h-4 bg-gray-200 rounded w-20" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ingredients skeleton */}
                <div className="space-y-4">
                    <HeaderSkeleton level={2} width="w-32" />
                    <div className="space-y-2">
                        {Array.from({ length: 6 }, (_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-background rounded-xl shadow-sm animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-gray-200 rounded-full flex-shrink-0" />
                                    <div className="h-4 bg-gray-200 rounded w-32" />
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-16" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Instructions skeleton */}
                <div className="space-y-4">
                    <HeaderSkeleton level={2} width="w-36" />
                    <div className="space-y-6">
                        {Array.from({ length: 5 }, (_, i) => (
                            <div key={i} className="p-5 bg-background rounded-xl shadow-sm animate-pulse">
                                <div className="flex gap-5 items-start mb-4">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-5 bg-gray-200 rounded w-full" />
                                        <div className="h-5 bg-gray-200 rounded w-2/3" />
                                    </div>
                                </div>
                                {/* Optional instruction image skeleton */}
                                {i % 2 === 0 && (
                                    <div className="mt-4 rounded-lg overflow-hidden shadow-sm">
                                        <div className="aspect-video bg-gray-200" />
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

"use client"

import { CardHeaderSkeleton } from "./HeaderSkeleton";

/**
 * Скелетон для карточки рецепта
 * Точно соответствует структуре RecipeCard компонента
 */
export default function RecipeCardSkeleton() {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col animate-pulse">
            {/* Image skeleton - точно как в RecipeCard */}
            <div className="relative aspect-[4/3] sm:aspect-video overflow-hidden bg-gray-200">
                {/* Save button skeleton */}
                <div className="absolute top-3 left-3 z-15">
                    <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md" />
                </div>

                {/* Time & Difficulty badges skeleton */}
                <div className="absolute bottom-0 left-0 right-0 z-10">
                    <div className="flex items-center justify-between">
                        {/* Time badge */}
                        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-tr-xl px-3 py-1.5 shadow-sm">
                            <div className="w-3.5 h-3.5 bg-gray-300 rounded" />
                            <div className="h-3 bg-gray-300 rounded w-12" />
                        </div>

                        {/* Difficulty badge */}
                        <div className="px-3 py-1.5 rounded-tl-xl bg-gray-100">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-gray-300 rounded" />
                                <div className="h-3 bg-gray-300 rounded w-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content skeleton - точно как в RecipeCard */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col gap-2.5 overflow-hidden">
                {/* Title skeleton */}
                <div className="h-6 sm:h-7 bg-gray-200 rounded w-3/4" />

                {/* Description skeleton */}
                <div className="h-4 sm:h-5 bg-gray-200 rounded w-full" />
            </div>
        </div>
    );
}

/**
 * Компонент для отображения нескольких скелетонов
 */
export function RecipeCardSkeletonGrid({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }, (_, i) => (
                <RecipeCardSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Скелетон для подгрузки дополнительных рецептов
 */
export function InfiniteLoadingSkeleton({ count = 3 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }, (_, i) => (
                <RecipeCardSkeleton key={i} />
            ))}
        </div>
    );
}

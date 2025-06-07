"use client"

/**
 * Скелетон для карточки рекомендаций (свайп-карточки)
 * Точно соответствует структуре RecipeSwipeCard компонента
 */
export function RecipeSwipeCardSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center px-2 w-full mt-4" style={{ minHeight: '60vh', height: '100%', maxWidth: '100vw' }}>
            <div className="relative w-full max-w-xs md:max-w-md aspect-[3/4] md:h-[650px] h-[70vh] min-h-[340px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-gray-200 animate-pulse">
                {/* View button skeleton */}
                <div className="absolute top-3 right-3 md:top-4 md:right-4 z-40 w-10 h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur-md border border-white/30 rounded-full" />

                {/* Badges skeleton */}
                <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-2 z-10">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5 shadow-lg w-16 h-6" />
                    <div className="bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5 shadow-lg w-20 h-6" />
                </div>

                {/* Gradient overlay skeleton */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />

                {/* Content skeleton */}
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 text-white z-10">
                    {/* Title skeleton */}
                    <div className="h-6 md:h-8 bg-white/20 rounded w-3/4 mb-2 md:mb-3" />

                    {/* Description skeleton */}
                    <div className="space-y-2 mb-4 md:mb-6">
                        <div className="h-4 bg-white/20 rounded w-full" />
                        <div className="h-4 bg-white/20 rounded w-2/3" />
                    </div>

                    {/* Swipe indicators skeleton */}
                    <div className="mt-4 md:mt-6 text-center">
                        <div className="flex justify-center items-center gap-3 md:gap-4">
                            <div className="h-3 bg-white/20 rounded w-12" />
                            <div className="w-1 h-1 bg-white/50 rounded-full" />
                            <div className="h-3 bg-white/20 rounded w-8" />
                            <div className="w-1 h-1 bg-white/50 rounded-full" />
                            <div className="h-3 bg-white/20 rounded w-16" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Скелетон для страницы рекомендаций
 * Использует новый RecipeSwipeCardSkeleton
 */
export default function RecommendationsSkeleton() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow">
                <RecipeSwipeCardSkeleton />
            </div>

            {/* Action buttons skeleton - точно как в реальном компоненте */}
            <div className="my-4">
                <div className="flex justify-center gap-4 md:gap-6">
                    {/* Dislike button skeleton */}
                    <div className="rounded-full w-14 h-14 md:w-14 md:h-14 bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg animate-pulse">
                        <div className="w-6 h-6 md:w-7 md:h-7 bg-gray-400 rounded" />
                    </div>
                    {/* Skip button skeleton */}
                    <div className="rounded-full w-16 h-16 md:w-16 md:h-16 bg-white/95 backdrop-blur-md border-2 border-white/50 flex items-center justify-center shadow-xl animate-pulse">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-400 rounded" />
                    </div>
                    {/* Like button skeleton */}
                    <div className="rounded-full w-14 h-14 md:w-14 md:h-14 bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg animate-pulse">
                        <div className="w-6 h-6 md:w-7 md:h-7 bg-gray-400 rounded" />
                    </div>
                </div>
            </div>

            {/* Tutorial button skeleton */}
            <div className="my-6">
                <div className="flex justify-center">
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm rounded-full px-6 py-3 animate-pulse">
                        <div className="flex items-center">
                            <div className="w-5 h-5 bg-gray-300 rounded mr-2" />
                            <div className="h-4 bg-gray-300 rounded w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Скелетон для пустого состояния рекомендаций
 */
export function RecommendationsEmptySkeleton() {
    return (
        <div className="mt-6 relative h-80 md:h-96 flex flex-col items-center justify-center rounded-2xl md:rounded-3xl bg-gray-100 border border-gray-200 shadow-lg overflow-hidden px-4 max-w-sm mx-auto animate-pulse">
            <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto" />
                <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-48 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
                </div>
                <div className="h-10 bg-gray-200 rounded w-32 mx-auto" />
            </div>
        </div>
    );
}

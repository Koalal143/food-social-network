"use client"

/**
 * Скелетон для карточки автора
 * Точно соответствует структуре AuthorCard компонента
 */
export default function AuthorCardSkeleton() {
    return (
        <div className="p-3 bg-background rounded-lg shadow-sm border animate-pulse">
            <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                </div>
                <div className="flex-1 min-w-0">
                    {/* "Автор рецепта" label */}
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-3 h-3 bg-gray-200 rounded" />
                        <div className="h-3 bg-gray-200 rounded w-20" />
                    </div>
                    {/* Username */}
                    <div className="h-4 bg-gray-200 rounded w-24 mb-0.5" />
                    {/* About text */}
                    <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
            </div>
        </div>
    );
}

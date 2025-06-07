"use client"

/**
 * Скелетон для карточки автора
 * Точно соответствует структуре AuthorCard компонента
 */
export default function AuthorCardSkeleton() {
    return (
        <div className="bg-gradient-to-r from-card to-card/80 border-0 shadow-sm rounded-xl overflow-hidden animate-pulse">
            <div className="p-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-0.5">
                            <div className="w-full h-full rounded-full bg-gray-200" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        {/* "Автор рецепта" label */}
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 bg-gray-200 rounded" />
                            <div className="h-4 bg-gray-200 rounded w-24" />
                        </div>
                        {/* Username */}
                        <div className="h-5 bg-gray-200 rounded w-20 mb-1" />
                        {/* About text */}
                        <div className="h-4 bg-gray-200 rounded w-32" />
                    </div>
                </div>
            </div>
        </div>
    );
}

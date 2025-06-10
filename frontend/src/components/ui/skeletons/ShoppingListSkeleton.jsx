export function ShoppingListItemSkeleton() {
    return (
        <div className="flex items-start gap-3 p-3 md:p-3 rounded-lg border bg-background border-border animate-pulse">
            <div className="flex-shrink-0 pt-0.5">
                <div className="w-5 h-5 md:w-4 md:h-4 bg-gray-200 rounded border" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 md:w-6 md:h-6 bg-gray-200 rounded" />
                </div>

                <div className="mb-2">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                </div>

                <div className="flex flex-wrap gap-1">
                    <div className="h-5 bg-gray-200 rounded w-20" />
                </div>
            </div>
        </div>
    );
}

export function ShoppingListSectionSkeleton({ count = 3 }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="pb-3 md:pb-6 p-4 md:p-6">
                <div className="flex items-center gap-2 animate-pulse mb-4">
                    <div className="w-4 h-4 md:w-5 md:h-5 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="h-5 md:h-6 bg-gray-200 rounded w-48" />
                </div>
            </div>

            <div className="px-4 md:px-6 pb-4 md:pb-6 pt-0 space-y-2 md:space-y-2">
                {Array.from({ length: count }, (_, i) => (
                    <ShoppingListItemSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export function ShoppingListEmptySkeleton() {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-pulse">
            <div className="py-8 md:py-12 px-4 md:px-6">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded mx-auto" />
                    <div className="h-5 md:h-6 bg-gray-200 rounded w-48 mx-auto" />
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
                        <div className="h-4 bg-gray-200 rounded w-56 mx-auto" />
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-32 mx-auto" />
                </div>
            </div>
        </div>
    );
}

export function ShoppingListHeaderSkeleton() {
    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-200 rounded flex-shrink-0" />
                        <div className="h-8 md:h-10 bg-gray-200 rounded w-48" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-64" />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                    <div className="h-9 bg-gray-200 rounded w-32" />
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="h-9 bg-gray-200 rounded w-28" />
                        <div className="h-9 bg-gray-200 rounded w-24" />
                    </div>
                </div>
            </div>

            <div className="relative animate-pulse">
                <div className="h-10 md:h-9 bg-gray-200 rounded pl-10" />
            </div>
        </div>
    );
}

export default function ShoppingListSkeleton({
    showHeader = true,
    unpurchasedCount = 3,
    purchasedCount = 2
}) {
    return (
        <div className="py-4 md:py-8 space-y-4 md:space-y-6">
            {showHeader && <ShoppingListHeaderSkeleton />}
            <ShoppingListSectionSkeleton count={unpurchasedCount} />
            <ShoppingListSectionSkeleton count={purchasedCount} />
        </div>
    );
}

export function ShoppingListLoadingSkeleton() {
    return (
        <div className="py-4 md:py-8 space-y-4 md:space-y-6">
            <ShoppingListHeaderSkeleton />
            <ShoppingListEmptySkeleton />
        </div>
    );
}

export function ShoppingListAuthSkeleton() {
    return (
        <div className="py-8">
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-pulse">
                    <div className="py-8 px-6">
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-gray-200 rounded mx-auto" />
                            <div className="h-6 bg-gray-200 rounded w-48 mx-auto" />
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
                                <div className="h-4 bg-gray-200 rounded w-56 mx-auto" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-10 bg-gray-200 rounded w-full" />
                                <div className="h-10 bg-gray-200 rounded w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

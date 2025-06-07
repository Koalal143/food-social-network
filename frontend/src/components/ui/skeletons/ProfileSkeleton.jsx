"use client"

import { RecipeCardSkeletonGrid } from "./RecipeCardSkeleton";
import HeaderSkeleton from "./HeaderSkeleton";

/**
 * Скелетон для страницы профиля
 */
export default function ProfileSkeleton() {
    return (
        <div className="space-y-8">
            {/* Page header skeleton */}
            <div className="flex items-start justify-between">
                <HeaderSkeleton level={1} width="w-48" />
                <div className="md:hidden">
                    <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
                </div>
            </div>

            {/* Profile content skeleton */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Profile photo skeleton */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative h-40 w-40">
                        <div className="w-full h-full bg-gray-200 rounded-full animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-24 mx-auto animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-16 mx-auto animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-20 mx-auto animate-pulse" />
                    </div>
                </div>

                {/* Profile info skeleton */}
                <div className="flex-1 min-w-[300px] space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                        </div>

                        <div className="space-y-1">
                            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
                        </div>

                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Border separator */}
            <div className="pt-4 border-t">
                {/* Tabs skeleton */}
                <div className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg animate-pulse">
                    <div className="h-10 bg-gray-200 rounded flex items-center justify-center">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-gray-300 rounded mr-2" />
                            <div className="h-4 bg-gray-300 rounded w-20" />
                        </div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded flex items-center justify-center">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-gray-300 rounded mr-2" />
                            <div className="h-4 bg-gray-300 rounded w-16" />
                        </div>
                    </div>
                </div>

                {/* Content skeleton */}
                <RecipeCardSkeletonGrid count={6} />
            </div>
        </div>
    );
}

/**
 * Скелетон для страницы профиля другого пользователя (по username)
 * Отличается от основного скелетона профиля отсутствием редактируемых элементов
 */
export function AuthorProfileSkeleton() {
    return (
        <div className="space-y-8">
            {/* Author profile card skeleton */}
            <div className="border border-gray-200 shadow-sm rounded-xl p-6 animate-pulse">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar skeleton */}
                    <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-full bg-gray-200" />
                    </div>

                    {/* User info skeleton */}
                    <div className="flex-1 space-y-4">
                        <div className="space-y-3">
                            {/* Username */}
                            <HeaderSkeleton level={1} width="w-48" />

                            {/* Description */}
                            <div className="max-w-3xl space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-full" />
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>

                        {/* Stats skeleton */}
                        <div className="flex flex-wrap gap-8 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-gray-100 p-1.5 rounded-lg">
                                    <div className="w-4 h-4 bg-gray-200 rounded" />
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-4 bg-gray-200 rounded w-8" />
                                    <div className="h-4 bg-gray-200 rounded w-16" />
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <div className="bg-gray-100 p-1.5 rounded-lg">
                                    <div className="w-4 h-4 bg-gray-200 rounded" />
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-32" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recipes section skeleton */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <HeaderSkeleton level={2} width="w-40" />
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                </div>

                <RecipeCardSkeletonGrid count={6} />
            </div>
        </div>
    );
}

/**
 * Скелетон для карточки пользователя в списке
 */
export function UserCardSkeleton() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 animate-pulse">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                    <HeaderSkeleton level={4} width="w-32" />
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
    );
}

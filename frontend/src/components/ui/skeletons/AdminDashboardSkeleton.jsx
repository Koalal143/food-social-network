"use client"

import HeaderSkeleton, { SectionHeaderSkeleton } from "./HeaderSkeleton";

/**
 * Скелетон для административной панели
 */
export default function AdminDashboardSkeleton() {
    return (
        <div className="py-8 space-y-8">
            {/* Header skeleton */}
            <SectionHeaderSkeleton withAction={true} />

            {/* Statistics cards skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-4 bg-gray-200 rounded w-24" />
                            <div className="w-4 h-4 bg-gray-200 rounded" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-8 bg-gray-200 rounded w-16" />
                            <div className="h-3 bg-gray-200 rounded w-32" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick actions skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                                <HeaderSkeleton level={4} width="w-32" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                            </div>
                            <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Activity card skeleton */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <HeaderSkeleton level={3} width="w-40" />
                        <div className="h-4 bg-gray-200 rounded w-56 animate-pulse" />
                    </div>
                    <div className="text-center py-8 space-y-4">
                        <div className="w-12 h-12 bg-gray-200 rounded mx-auto animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}

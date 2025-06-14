"use client"

export default function RecipeFormSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/30">
                <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-32" />
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-24" />
                        <div className="h-9 bg-gray-200 rounded" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-20" />
                        <div className="h-20 bg-gray-200 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-16" />
                            <div className="h-9 bg-gray-200 rounded" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-20" />
                            <div className="h-9 bg-gray-200 rounded" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-28" />
                        <div className="h-9 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>

            <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/30">
                <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-24" />
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-2 p-2 bg-gray-50/50 rounded-lg">
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-20" />
                                    <div className="h-8 bg-gray-200 rounded" />
                                </div>
                                <div className="w-24 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-16" />
                                    <div className="h-8 bg-gray-200 rounded" />
                                </div>
                                <div className="w-8 h-8 bg-gray-200 rounded mt-5" />
                            </div>
                        ))}
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-32" />
                </div>
            </div>

            <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/30">
                <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-28" />
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="p-2 bg-gray-50/50 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="h-4 bg-gray-200 rounded w-16" />
                                    <div className="w-6 h-6 bg-gray-200 rounded" />
                                </div>
                                <div className="h-16 bg-gray-200 rounded" />
                                <div className="h-8 bg-gray-200 rounded w-full" />
                            </div>
                        ))}
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-32" />
                </div>
            </div>

            <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/30">
                <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-16" />
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-7 bg-gray-200 rounded-full w-20" />
                        ))}
                    </div>
                    <div className="h-8 bg-gray-200 rounded" />
                </div>
            </div>

            <div className="flex gap-2 pt-2">
                <div className="h-9 bg-gray-200 rounded flex-1" />
                <div className="h-9 bg-gray-200 rounded w-24" />
            </div>
        </div>
    );
}

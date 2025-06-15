"use client"

export default function RecipeFormSkeleton() {
    return (
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Форма */}
            <div className="lg:col-span-8 w-full">
                <div className="space-y-4 animate-pulse">
            {/* Основная информация */}
            <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/30 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl"></div>
                <div className="relative z-10 space-y-3">
                    {/* Заголовок "Основная информация" */}
                    <div className="h-5 bg-gray-200 rounded w-44" />

                    {/* Название рецепта */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                        <div className="h-8 bg-gray-200 rounded" />
                    </div>

                    {/* Описание */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                        <div className="h-12 bg-gray-200 rounded" />
                    </div>

                    {/* Время и сложность */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-20" />
                            <div className="h-8 bg-gray-200 rounded" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-20" />
                            <div className="h-8 bg-gray-200 rounded" />
                        </div>
                    </div>

                    {/* Теги */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-4 bg-gray-200 rounded w-8" />
                            <div className="w-3 h-3 bg-gray-200 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <div className="h-10 bg-gray-200 rounded flex-1" />
                                <div className="h-10 w-10 bg-gray-200 rounded" />
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-24" />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-7 bg-gray-200 rounded-full w-16" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Фото блюда */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-4 bg-gray-200 rounded w-20" />
                            <div className="hidden md:block h-4 bg-gray-200 rounded w-32" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-8 bg-gray-200 rounded" />
                            <div className="md:hidden h-4 bg-gray-200 rounded w-32" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Ингредиенты */}
            <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/30 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl"></div>
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="h-5 bg-gray-200 rounded w-24" />
                        <div className="h-7 bg-gray-200 rounded w-20" />
                    </div>

                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-2 p-2 bg-gray-50/50 rounded-lg">
                                <div className="flex-1">
                                    <div className="h-8 bg-gray-200 rounded" />
                                </div>
                                <div className="w-24">
                                    <div className="h-8 bg-gray-200 rounded" />
                                </div>
                                <div className="w-8 h-8 bg-gray-200 rounded" />
                            </div>
                        ))}
                    </div>

                    <div className="h-3 bg-gray-200 rounded w-40" />
                </div>
            </div>

            {/* Инструкция приготовления */}
            <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/30 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl"></div>
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="h-5 bg-gray-200 rounded w-48" />
                        <div className="h-7 bg-gray-200 rounded w-24" />
                    </div>

                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="p-2 bg-gray-50/50 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full" />
                                        <div className="h-4 bg-gray-200 rounded w-12" />
                                    </div>
                                    <div className="w-6 h-6 bg-gray-200 rounded" />
                                </div>
                                <div className="h-12 bg-gray-200 rounded" />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 bg-gray-200 rounded w-32" />
                                        <div className="hidden md:block h-3 bg-gray-200 rounded w-24" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-8 bg-gray-200 rounded" />
                                        <div className="md:hidden h-3 bg-gray-200 rounded w-24" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
            </div>

                    {/* Кнопки */}
                    <div className="flex gap-2 pt-2">
                        <div className="h-9 bg-gray-200 rounded flex-1" />
                        <div className="h-9 bg-gray-200 rounded w-20" />
                    </div>

                    {/* Текст согласия */}
                    <div className="text-center">
                        <div className="space-y-1">
                            <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto" />
                            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Превью skeleton - только на десктопе */}
            <div className="hidden lg:block lg:col-span-4">
                <div className="sticky top-20">
                    <div className="space-y-3 animate-pulse">
                        <div className="bg-white/20 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/30 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl"></div>
                            <div className="relative z-10">
                                <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
                                    <div className="aspect-[4/3] sm:aspect-video bg-gray-200" />
                                    <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4 flex-1 flex flex-col gap-2">
                                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                                        <div className="h-4 bg-gray-200 rounded w-full" />
                                    </div>
                                    <div className="px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-3.5 h-3.5 bg-gray-300 rounded" />
                                                <div className="h-3 bg-gray-300 rounded w-14" />
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100">
                                                <div className="w-3.5 h-3.5 bg-gray-300 rounded" />
                                                <div className="h-3 bg-gray-300 rounded w-10" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

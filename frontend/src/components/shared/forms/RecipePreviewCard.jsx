import Image from "next/image";
import { Clock, ChefHat } from "lucide-react";
import minutesToHuman from "@/utils/minutesToHuman";
import { DIFFICULTY } from "@/constants/difficulty";

export default function RecipePreviewCard({ recipe }) {
    const getDifficultyColor = (difficulty) => {
        const colors = {
            'EASY': 'bg-green-100 text-green-700',
            'MEDIUM': 'bg-yellow-100 text-yellow-700',
            'HARD': 'bg-red-100 text-red-700',
        };
        return colors[difficulty] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="h-full">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
                {/* Image Container */}
                <div className="relative aspect-[4/3] sm:aspect-video overflow-hidden">
                    <Image 
                        src={recipe.image_url || '/images/image-dummy.svg'} 
                        alt={recipe.title}
                        fill
                        className="object-cover"
                        priority
                        unoptimized={true}
                    />
                </div>

                {/* Content */}
                <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4 flex-1 flex flex-col gap-2 overflow-hidden">
                    <h3 className="truncate font-semibold text-lg sm:text-xl leading-tight text-gray-900">
                        {recipe.title}
                    </h3>

                    <p className="truncate text-gray-600 text-sm sm:text-base leading-relaxed">
                        {recipe.short_description}
                    </p>
                </div>

                {/* Recipe Info Section - Time & Difficulty */}
                <div className="px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-xs font-medium text-gray-700">
                                {minutesToHuman(recipe.cook_time_minutes)}
                            </span>
                        </div>

                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                            <ChefHat className="w-3.5 h-3.5" />
                            <span>
                                {DIFFICULTY[recipe.difficulty]}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

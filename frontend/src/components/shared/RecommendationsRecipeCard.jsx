import Image from "next/image";
import { HeartCrack, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RecommendationsRecipeCard({ recipe, onLike, onDislike }) {
    return (
        <div
            className="bg-card/35 rounded-lg overflow-hidden max-w-96 h-full flex flex-col"
        >
            <div className="relative aspect-video">
                <Image 
                    src={recipe.preview} 
                    alt={recipe.title}
                    fill
                    className="object-cover"
                    priority
                />
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-semibold mb-3">{recipe.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{recipe.shortDescription}</p>
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-800">Основные ингредиенты:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                        {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                            <li key={index} className="flex items-center">
                                <span className="mr-2">•</span>
                                <span className="truncate">{ingredient}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="flex gap-3 p-4 border-t">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onDislike}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                    <HeartCrack className="w-4 h-4" />
                    <span>Не нравится</span>
                </motion.button>
                <Link href={`/recipe/${recipe.id}`}>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onLike}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
                    >
                        <span>Перейти</span>
                        <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </Link>
            </div>
        </div>
    );
}
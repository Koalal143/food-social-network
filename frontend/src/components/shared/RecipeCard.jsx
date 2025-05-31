import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Eye } from "lucide-react";
import minutesToHuman from "@/utils/minutesToHuman";
import { useState } from "react";
import { useFavorites } from "@/context/FavoritesContext";
import { DIFFICULTY } from "@/constants/difficulty";
import { useAuth } from "@/context/AuthContext";

export default function RecipeCard({ recipe, source='feed' }) {
    const { addFavorite, removeFavorite } = useFavorites();
    const [isSaved, setIsSaved] = useState(recipe.is_on_favorites);
    const { isAuth } = useAuth();

    const handleSave = (e) => {
        e.preventDefault()
        if (isSaved) {
            removeFavorite(recipe.id);
        } else {
            addFavorite(recipe.id);
        }
        setIsSaved(!isSaved);
    };

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="h-full"
        >
            <Link href={`/recipe/${recipe.slug}?source=${source}`}>
                <div className="bg-secondary/60 rounded-lg overflow-hidden  h-full flex flex-col">
                    <div className="relative aspect-video">
                        <Image 
                            src={recipe.image_url || '/images/image-dummy.svg'} 
                            alt={recipe.title}
                            fill
                            className="object-cover"
                            priority
                            unoptimized={true}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                            <div className="flex items-center gap-2 text-white">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{minutesToHuman(recipe.cook_time_minutes)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-xl mb-1 text-gray-800">{recipe.title}</h3>
                        <p className="text-gray-600 line-clamp-3 mb-2 flex-1">{recipe.short_description}</p>
                        
                        <div className="flex items-center justify-between ">
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                                    {DIFFICULTY[recipe.difficulty]}
                                </div>
                            </div>
                            <button 
                                className={`px-3 py-1 ${
                                    isSaved 
                                        ? 'bg-green-500 hover:bg-green-600' 
                                        : 'bg-primary hover:bg-primary/90'
                                } text-white rounded-full text-sm transition-colors ${
                                    !isAuth && 'bg-gray-500 hover:bg-gray-600 pointer-events-none opacity-50 cursor-not-allowed'
                                }`}
                                onClick={handleSave}
                                disabled={!isAuth}
                            >
                                {isSaved ? 'Сохранено' : 'Сохранить'}
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
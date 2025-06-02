import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Bookmark, BookmarkCheck, ChefHat } from "lucide-react";
import minutesToHuman from "@/utils/minutesToHuman";
import { useState } from "react";
import { useFavorites } from "@/context/FavoritesContext";
import { DIFFICULTY } from "@/constants/difficulty";
import { useAuth } from "@/context/AuthContext";
import RecipeCardActions from "@/components/shared/recipeActions/RecipeCardActions";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function RecipeCard({ recipe, source='feed', editable }) {
    const { addFavorite, removeFavorite } = useFavorites();
    const [isSaved, setIsSaved] = useState(recipe.is_on_favorites);
    const { isAuth } = useAuth();

    const handleSave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSaved) {
            removeFavorite(recipe.id);
        } else {
            addFavorite(recipe.id);
        }
        setIsSaved(!isSaved);
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            'EASY': 'bg-green-100 text-green-700',
            'MEDIUM': 'bg-yellow-100 text-yellow-700',
            'HARD': 'bg-red-100 text-red-700',
        };
        return colors[difficulty] || 'bg-gray-100 text-gray-700';
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="h-full group"
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            <Link href={`/recipe/${recipe.slug}?source=${source}`}>
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:border-gray-300 group-hover:shadow-xl">
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] sm:aspect-video overflow-hidden">
                        <Image 
                            src={recipe.image_url || '/images/image-dummy.svg'} 
                            alt={recipe.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            priority
                            unoptimized={true}
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Edit Actions */}
                        {editable && (
                            <div className="absolute top-3 right-3 z-20">
                                <RecipeCardActions recipe={recipe} />
                            </div>
                        )}
                        
                        {/* Time & Difficulty Badge */}
                        <div className="absolute bottom-0 left-0 right-0 z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-tr-xl px-3 py-1.5 shadow-sm">
                                    <Clock className="w-3.5 h-3.5 text-gray-600" />
                                    <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                                        {minutesToHuman(recipe.cook_time_minutes)}
                                    </span>
                                </div>
                                
                                <div className={`px-3 py-1.5 rounded-tl-xl text-xs font-medium whitespace-nowrap ${getDifficultyColor(recipe.difficulty)}`}>
                                    <div className="flex items-center gap-1">
                                        <ChefHat className="w-3 h-3" />
                                        <span>
                                            {DIFFICULTY[recipe.difficulty]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Save Button */}
                        <div className="absolute top-3 left-3 z-15">
                            <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <motion.button 
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className={`p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/40 ${
                                                isSaved 
                                                    ? 'bg-green-500 text-white shadow-lg hover:bg-green-600' 
                                                    : 'bg-white/90 text-gray-600 hover:bg-white hover:text-primary shadow-md backdrop-blur-sm'
                                            } ${!isAuth && 'bg-gray-100 text-gray-400 pointer-events-none opacity-50 cursor-not-allowed'}`}
                                            onClick={handleSave}
                                            disabled={!isAuth}
                                            aria-label={isSaved ? 'Удалить из сохранённых' : 'Сохранить'}
                                        >
                                            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                        </motion.button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="text-xs">
                                        {!isAuth ? 'Войдите, чтобы сохранить' : isSaved ? 'Удалить из сохранённых' : 'Сохранить рецепт'}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col gap-2.5 overflow-hidden">
                        <h3 className="truncate font-semibold text-lg sm:text-xl leading-tight text-gray-900 group-hover:text-primary transition-colors duration-200">
                            {recipe.title}
                        </h3>
  
                        <p className="truncate text-gray-600 text-sm sm:text-base leading-relaxed">
                            {recipe.short_description}
                        </p>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// import Image from "next/image";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { Clock, Eye, Bookmark, BookmarkCheck } from "lucide-react";
// import minutesToHuman from "@/utils/minutesToHuman";
// import { useState } from "react";
// import { useFavorites } from "@/context/FavoritesContext";
// import { DIFFICULTY } from "@/constants/difficulty";
// import { useAuth } from "@/context/AuthContext";
// import RecipeCardActions from "@/components/shared/recipeActions/RecipeCardActions";
// import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// export default function RecipeCard({ recipe, source='feed', editable }) {
//     const { addFavorite, removeFavorite } = useFavorites();
//     const [isSaved, setIsSaved] = useState(recipe.is_on_favorites);
//     const { isAuth } = useAuth();

//     const handleSave = (e) => {
//         e.preventDefault()
//         if (isSaved) {
//             removeFavorite(recipe.id);
//         } else {
//             addFavorite(recipe.id);
//         }
//         setIsSaved(!isSaved);
//     };

//     return (
//         <motion.div
//             whileHover={{ scale: 1.01 }}
//             whileTap={{ scale: 0.99 }}
//             className="h-full"
//         >
//             <Link href={`/recipe/${recipe.slug}?source=${source}`}>
//                 <div className="bg-white border border-muted rounded-xl shadow-sm overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
//                     <div className="relative aspect-video">
//                         <Image 
//                             src={recipe.image_url || '/images/image-dummy.svg'} 
//                             alt={recipe.title}
//                             fill
//                             className="object-cover"
//                             priority
//                             unoptimized={true}
//                         />
//                         {editable && (
//                             <div className="absolute top-2 right-2 z-50">
//                                 <RecipeCardActions recipe={recipe} />
//                             </div>
//                         )}
//                         <div className="absolute bottom-2 left-2 z-10 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
//                             <Clock className="w-4 h-4 text-muted-foreground" />
//                             <span className="text-xs text-muted-foreground font-medium">
//                                 {minutesToHuman(recipe.cook_time_minutes)}
//                             </span>
//                             <span className="mx-1 text-muted-foreground">•</span>
//                             <span className="text-xs text-muted-foreground font-medium">
//                                 {DIFFICULTY[recipe.difficulty]}
//                             </span>
//                             <div className="flex items-center justify-between">
//                             <TooltipProvider delayDuration={300}>
//                                 <Tooltip>
//                                     <TooltipTrigger asChild>
//                                         <button 
//                                             className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
//                                                 isSaved 
//                                                     ? 'bg-green-100 text-green-600 hover:bg-green-200' 
//                                                     : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
//                                             } ${!isAuth && 'bg-gray-100 text-gray-400 pointer-events-none opacity-50 cursor-not-allowed'}`}
//                                             onClick={handleSave}
//                                             disabled={!isAuth}
//                                             aria-label={isSaved ? 'Удалить из сохранённых' : 'Сохранить'}
//                                         >
//                                             {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
//                                         </button>
//                                     </TooltipTrigger>
//                                     <TooltipContent side="top">
//                                         {isSaved ? 'Удалить из сохранённых' : 'Сохранить'}
//                                     </TooltipContent>
//                                 </Tooltip>
//                             </TooltipProvider>
//                         </div>
//                         </div>
                        
//                     </div>
                    
//                     <div className="p-4 flex-1 flex flex-col gap-2">
//                         <h3 className="font-semibold text-lg mb-0.5 text-gray-900 line-clamp-2">{recipe.title}</h3>
//                         <p className="text-gray-500 text-sm line-clamp-2 flex-1">{recipe.short_description}</p>
//                     </div>
//                 </div>
//             </Link>
//         </motion.div>
//     );
// }

// import Image from "next/image";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { Clock, Eye } from "lucide-react";
// import minutesToHuman from "@/utils/minutesToHuman";
// import { useState } from "react";
// import { useFavorites } from "@/context/FavoritesContext";
// import { DIFFICULTY } from "@/constants/difficulty";
// import { useAuth } from "@/context/AuthContext";
// import RecipeCardActions from "@/components/shared/recipeActions/RecipeCardActions";

// export default function RecipeCard({ recipe, source='feed', editable }) {
//     const { addFavorite, removeFavorite } = useFavorites();
//     const [isSaved, setIsSaved] = useState(recipe.is_on_favorites);
//     const { isAuth } = useAuth();

//     const handleSave = (e) => {
//         e.preventDefault()
//         if (isSaved) {
//             removeFavorite(recipe.id);
//         } else {
//             addFavorite(recipe.id);
//         }
//         setIsSaved(!isSaved);
//     };

//     return (
//         <motion.div
//             whileHover={{ scale: 1.01 }}
//             whileTap={{ scale: 0.99 }}
//             className="h-full"
//         >
//             <Link href={`/recipe/${recipe.slug}?source=${source}`}>
//                 <div className="bg-secondary/60 rounded-lg overflow-hidden  h-full flex flex-col">
//                     <div className="relative aspect-video">
//                         <Image 
//                             src={recipe.image_url || '/images/image-dummy.svg'} 
//                             alt={recipe.title}
//                             fill
//                             className="object-cover"
//                             priority
//                             unoptimized={true}
//                         />
//                         {editable && (
//                             <div className="absolute top-2 right-2 z-50 bg-red">
//                                 <RecipeCardActions recipe={recipe} />
//                             </div>
//                         )}
//                         {/* <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 z-10">
//                             <div className="flex items-center gap-2 text-white">
//                                 <Clock className="w-4 h-4" />
//                                 <span className="text-sm">{minutesToHuman(recipe.cook_time_minutes)}</span>
//                             </div>
//                         </div> */}
//                         <div className="absolute top-0 right-0 p-2 z-10">
//                             <div className="flex items-center gap-2 bg-black/30 rounded-full px-3 py-1 w-fit text-white">
//                                 <Clock className="w-4 h-4" />
//                                 <span className="text-sm font-medium">
//                                     {minutesToHuman(recipe.cook_time_minutes)}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
                    
//                     <div className="p-4 flex-1 flex flex-col">
//                         <h3 className="font-semibold text-xl mb-1 text-gray-800">{recipe.title}</h3>
//                         <p className="text-gray-600 line-clamp-3 mb-2 flex-1">{recipe.short_description}</p>
                        
//                         <div className="flex items-center justify-between ">
//                             <div className="flex items-center gap-2">
//                                 <div className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
//                                     {DIFFICULTY[recipe.difficulty]}
//                                 </div>
//                             </div>
//                             <button 
//                                 className={`px-3 py-1 ${
//                                     isSaved 
//                                         ? 'bg-green-500 hover:bg-green-600' 
//                                         : 'bg-primary hover:bg-primary/90'
//                                 } text-white rounded-full text-sm transition-colors ${
//                                     !isAuth && 'bg-gray-500 hover:bg-gray-600 pointer-events-none opacity-50 cursor-not-allowed'
//                                 }`}
//                                 onClick={handleSave}
//                                 disabled={!isAuth}
//                             >
//                                 {isSaved ? 'Сохранено' : 'Сохранить'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </Link>
//         </motion.div>
//     );
// }
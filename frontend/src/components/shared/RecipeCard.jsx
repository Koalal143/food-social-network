import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RecipeCard({ recipe }) {
    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
        >
            <div className="h-full">
                <Link href={`/recipe/${recipe.id}`}>
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative aspect-video">
                            <Image 
                                src={recipe.preview} 
                                alt={recipe.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="p-4">
                            <h3 className="font-medium text-lg mb-2">{recipe.title}</h3>
                            <p className="text-gray-600 line-clamp-3">{recipe.shortDescription}</p>
                        </div>
                    </div>
                </Link>
            </div>
        </motion.div>
    );
}
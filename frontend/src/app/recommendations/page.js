"use client"

import Container from "@/components/Container"
import RecommendationsRecipeCard from "../../components/shared/RecommendationsRecipeCard"
import { useState } from "react"
import { useRecipes } from "@/context/RecipeContext"
import Loader from "@/components/ui/Loader"

export default function RecommendationsPage() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const { recipes, loading } = useRecipes()

    const handleDislike = () => {
        const nextIndex = currentIndex + 1
        if (nextIndex < recipes.length) {
            setCurrentIndex(nextIndex)
        } else {
            alert("Все рецепты просмотрены!")
        }
    }

    const handleLike = () => {
        console.log("LIKE!!!");
    }

    if (loading) {
        return <Loader />
    }

    return (
        <Container className="py-6 overflow-hidden min-h-screen">
            <h2 className="text-2xl font-bold mb-6">Рекомендации</h2>
            <div className="flex justify-center overflow-hidden">
                {currentIndex < recipes.length && (
                    <div className="max-w-lg w-full">
                        <RecommendationsRecipeCard 
                            recipe={recipes[currentIndex]} 
                            onLike={handleLike}
                            onDislike={handleDislike}
                        />
                    </div>
                )}
            </div>
        </Container>
    );
}
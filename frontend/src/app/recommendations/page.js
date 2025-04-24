"use client"

import Container from "@/components/Container"
import RecommendationsRecipeCard from "../../components/shared/RecommendationsRecipeCard"
import { useState, useEffect } from "react"
import RecipesService from "../../services/recipes.service"

export default function Recommendations() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [recipes, setRecipes] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const data = await RecipesService.getAllReceipts()
                setRecipes(data)
            } catch (error) {
                console.error("Ошибка при загрузке рецептов:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchRecipes()
    }, [])

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
        return <Container className="py-6">Загрузка...</Container>
    }

    return (
        <Container className="py-6 overflow-hidden">
            <h2 className="text-2xl font-bold mb-6">Рекомендации</h2>
            <div className="flex justify-center overflow-hidden">
                {currentIndex < recipes.length && (
                    <RecommendationsRecipeCard 
                        recipe={recipes[currentIndex]} 
                        onLike={handleLike}
                        onDislike={handleDislike}
                    />
                )}
            </div>
        </Container>
    );
}
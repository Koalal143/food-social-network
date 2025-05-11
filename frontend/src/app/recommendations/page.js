"use client"

import Container from "@/components/layout/Container"
import RecipeSwipeCard from "@/components/shared/RecipeSwipeCard"
import { useRouter } from 'next/navigation';
import { useState } from "react"
import { useRecipes } from "@/context/RecipeContext"
import Loader from "@/components/ui/Loader"
import { useFavorites } from "@/context/FavoritesContext"

export default function RecommendationsPage() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const { recipes, loading } = useRecipes();
    const { addFavorite, isFavorite } = useFavorites();

    const handleDislike = () => {
        showNextRecipe();
    };

    const handleLike = (recipe) => {
        if (!isFavorite(recipe.id)) {
            addFavorite(recipe);
        }
        showNextRecipe();
    };

    const showNextRecipe = () => {
        if (currentIndex < recipes.length - 1) {
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
            }, 500);
        }
    };

    const handleViewRecipe = (recipe) => {
        router.push(`/recipe/${recipe.id}`);
    };

    if (loading) {
        return <Loader />
    }

    return (
        <Container className="py-8">
            <div className="max-w-md mx-auto">
                {recipes.length > 0 && currentIndex < recipes.length && (
                    <RecipeSwipeCard
                        recipe={recipes[currentIndex]}
                        onLike={handleLike}
                        onDislike={handleDislike}
                        onViewRecipe={handleViewRecipe}
                    />
                )}
            </div>
        </Container>
    );
}
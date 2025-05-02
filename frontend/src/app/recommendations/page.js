"use client"

import Container from "@/components/Container"
import RecipeSwipeCard from "@/components/shared/RecipeSwipeCard"
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react"
import { useRecipes } from "@/context/RecipeContext"
import Loader from "@/components/ui/Loader"

export default function RecommendationsPage() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0)
    const { recipes, loading } = useRecipes()
    const [likedRecipes, setLikedRecipes] = useState([]);

    useEffect(() => {
      const savedRecipes = localStorage.getItem('favoriteRecipes');
      if (savedRecipes) {
        setLikedRecipes(JSON.parse(savedRecipes));
      }
    }, []);

    const handleDislike = () => {
        showNextRecipe();
    };

    const handleLike = (recipe) => {
        const newLikedRecipes = [...likedRecipes, recipe];
        setLikedRecipes(newLikedRecipes);
        localStorage.setItem('favoriteRecipes', JSON.stringify(newLikedRecipes));
        showNextRecipe();
    };

    const showNextRecipe = () => {
        if (currentIndex < recipes.length - 1) {
          setTimeout(() => {
            setCurrentIndex(currentIndex + 1);
          }, 300);
        }
    };

    const handleViewRecipe = (recipe) => {
        router.push(`/recipe/${recipe.id}`);
    };

    if (loading) {
        return <Loader />
    }

    return (
        <Container className="py-6 overflow-hidden min-h-screen">
            <div className="flex justify-center overflow-hidden">
                {currentIndex < recipes.length && (
                    <div className="max-w-lg w-full">
                        <RecipeSwipeCard
                            recipe={recipes[currentIndex]}
                            onLike={handleLike}
                            onDislike={handleDislike}
                            onViewRecipe={handleViewRecipe}
                        />
                    </div>
                )}
            </div>
        </Container>
    );
}
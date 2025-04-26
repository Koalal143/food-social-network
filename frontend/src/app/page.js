"use client";
import { useRecipes } from "@/context/RecipeContext"
import Container from "@/components/Container"
import RecipeCard from "../components/shared/RecipeCard"
import Loader from "@/components/ui/Loader"

export default function App() {
    const { recipes, loading } = useRecipes()

    if (loading) {
        return (
            <Loader />
        )
    }

    return (
        <Container className="py-6 flex-1">
            <h2 className="text-2xl font-bold mb-6">Популярные рецепты</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </div>
        </Container>
    )
}
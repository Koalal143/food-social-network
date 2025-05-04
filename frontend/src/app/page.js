"use client";
import { useRecipes } from "@/context/RecipeContext"
import Container from "@/components/layout/Container"
import Loader from "@/components/ui/Loader"
import RecipesList from "@/components/layout/RecipesList";

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
            <RecipesList recipes={recipes}/>
        </Container>
    )
}
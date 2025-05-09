"use client"

import { useEffect, useState } from "react"
import RecipesService from "@/services/recipes.service"
import { RecipeContext } from "@/context/RecipeContext"

export default function RecipeProvider({ children }) {
    const [recipes, setRecipes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchRecipes = async () => {
        try {
            const data = await RecipesService.getAllRecipes()
            setRecipes(data)
        } catch (error) {
            setError(error)
            console.error("Ошибка при загрузке рецептов:", error)
        } finally {
            setLoading(false)
        }
    }

    const getRecipeById = async (id) => {
        try {
            return await RecipesService.getRecipeById(id);
        } catch (error) {
            setError(error);
            console.error("Ошибка при загрузке рецепта:", error);
            return null;
        }
    };

    const addRecipe = async (newRecipe) => {
        try {
            const updatedRecipes = await RecipesService.addRecipe(newRecipe)
            setRecipes(updatedRecipes)
            return updatedRecipes
        } catch (error) {
            setError(error)
            console.error("Ошибка при добавлении рецепта:", error)
            return null
        }
    }

    const getRecipesByAuthorId = async (authorId) => {
        try {
            return await RecipesService.getRecipesByAuthorId(authorId);
        } catch (error) {
            setError(error);
            console.error("Ошибка при загрузке рецептов автора:", error);
            return [];
        }
    };

    useEffect(() => {
        fetchRecipes()
    }, [])

    return (
        <RecipeContext.Provider
            value={{
                recipes,
                loading,
                error,
                fetchRecipes,
                getRecipeById,
                addRecipe,
                getRecipesByAuthorId
            }}
        >
            {children}
        </RecipeContext.Provider>
    )
}
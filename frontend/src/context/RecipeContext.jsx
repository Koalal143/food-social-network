import { createContext, useContext } from "react"

export const RecipeContext = createContext()

export const useRecipes = () => {
    const context = useContext(RecipeContext)
    if (!context) {
        throw new Error('useRecipes must be used within an RecipesProvider')
    }
    return context
}
import { createContext, useContext } from "react"

export const RecipeContext = createContext()

export const useRecipes = () => useContext(RecipeContext)
import { createContext, useContext } from "react"

export const FavoritesContext = createContext()

export const useFavorites = () => {
    const context = useContext(FavoritesContext)
    if (!context) {
        throw new Error('useFavorites must be used within an FavoritesProvider')
    }
    return context
}
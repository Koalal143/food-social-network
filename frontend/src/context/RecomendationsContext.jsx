import { createContext, useContext } from "react"

export const RecomendationsContext = createContext()

export const useRecomendations = () => {
    const context = useContext(RecomendationsContext)
    if (!context) {
        throw new Error('useRecomendations must be used within an RecomendationsProvider')
    }
    return context
}
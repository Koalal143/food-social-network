import { createContext, useContext } from "react"

export const DislikesContext = createContext()

export const useDislikes = () => {
    const context = useContext(DislikesContext)
    if (!context) {
        throw new Error('useDislikes must be used within an DislikesProvider')
    }
    return context
}
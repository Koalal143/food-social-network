"use client"

import { DislikesContext } from "@/context/DislikesContext"
import DislikesService from "@/services/dislikes.service"

export default function DislikesProvider({ children }) {
    const addToDisliked = (recipeId) => {
        DislikesService.addToDisliked(recipeId)
    }

    return (
        <DislikesContext.Provider 
            value={{
                addToDisliked,
            }}
        >
            {children}
        </DislikesContext.Provider>
    )
}
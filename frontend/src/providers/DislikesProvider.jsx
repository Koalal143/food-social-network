"use client"

import { useState, useEffect, useCallback } from "react"
import { DislikesContext } from "@/context/DislikesContext"
import DislikesService from "@/services/dislikes.service"
import { useAuth } from '@/context/AuthContext'

export default function DislikesProvider({ children }) {
    const [dislikes, setDislikes] = useState([]) // Все дизлайкнутые рецепты
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    const addToDisliked = useCallback(async (recipeId) => {
        try {
            await DislikesService.addToDisliked(recipeId)
            setDislikes(prev => [...prev, recipeId])
        } catch (error) {
            console.error("Ошибка при добавлении в дизлайки:", error)
            throw error
        }
    }, [])

    const removeFromDisliked = useCallback(async (recipeId) => {
        try {
            await DislikesService.removeFromDisliked(recipeId)
            setDislikes(prev => prev.filter(id => id !== recipeId))
        } catch (error) {
            console.error("Ошибка при удалении из дизлайков:", error)
            throw error
        }
    }, [])

    // Загрузка дизлайков при монтировании (пока что просто пустой массив, так как нет API для получения списка)
    useEffect(() => {
        if (!user) {
            setDislikes([])
            setLoading(false)
            return
        }
        // TODO: Когда появится API для получения списка дизлайков, добавить загрузку
        setLoading(false)
    }, [user])

    return (
        <DislikesContext.Provider
            value={{
                dislikes,
                loading,
                addToDisliked,
                removeFromDisliked,
            }}
        >
            {children}
        </DislikesContext.Provider>
    )
}
"use client"

import { useEffect, useState } from "react"
import { RecomendationsContext } from "@/context/RecomendationsContext"
import RecomendationsService from "@/services/recomendations.service"
import { useAuth } from '@/context/AuthContext'

export default function RecomendationsProvider({ children }) {
    const [recipes, setRecipes] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const LIMIT = 10
    const { user } = useAuth()

    const fetchRecipes = async (append = false) => {
        try {
            if (append) {
                setLoadingMore(true)
            } else {
                setLoading(true)
            }

            const newRecipes = await RecomendationsService.getRecomendationsRecipes(LIMIT)
            setRecipes(prev =>
                append ? [...prev, ...newRecipes] : newRecipes
            )
        } catch (error) {
            setError(error)
        } finally {
            if (append) {
                setLoadingMore(false)
            } else {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        if (!user) {
            setLoading(false)
            return
        }
        fetchRecipes()
    }, [user])

    return (
        <RecomendationsContext.Provider
            value={{
                recipes,
                loading,
                loadingMore,
                error,
                fetchRecipes
            }}
        >
            {children}
        </RecomendationsContext.Provider>
    )
}
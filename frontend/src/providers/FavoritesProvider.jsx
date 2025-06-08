"use client"

import { useState,useEffect, useCallback } from "react"
import { FavoritesContext } from "@/context/FavoritesContext"
import FavoritesService from "@/services/favorites.service"
import { useAuth } from '@/context/AuthContext'

export default function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState([]) // Все избранные рецепты
    const [loading, setLoading] = useState(true) // Общий статус загрузки (для первого запроса)
    const [favoritesLoading, setFavoritesLoading] = useState({}) // Загрузка отдельных страниц
    const [favoritesError, setFavoritesError] = useState({}) // Ошибки
    const [favoritesTotalCount, setFavoritesTotalCount] = useState(0) // Общее количество избранных
    const { user } = useAuth()

    const getFavorites = useCallback(async (offset = 0, limit = 10) => {
        try {
            setFavoritesLoading(prev => ({ ...prev, [offset]: true }))
            
            const result = await FavoritesService.getPaginatedFavorites(offset, limit)

            setFavorites(prev => {
                const newData = Array.isArray(result.data) ? result.data : []
                if (offset === 0) return newData
                return Array.isArray(prev) ? [...prev, ...newData] : newData
            })

            setFavoritesTotalCount(result.totalCount)

            return {
                favorites: offset === 0 ? result.data : [...favorites, ...result.data],
                totalCount: result.totalCount,
                hasMore: (offset + limit) < result.totalCount
            }
        } catch (error) {
            setFavoritesError(prev => ({ ...prev, [offset]: error.message }))
            throw error
        } finally {
            setFavoritesLoading(prev => ({ ...prev, [offset]: false }))
        }
    }, [])

    const addFavorite = (recipe) => {
        FavoritesService.addToFavorites(recipe)
        setFavorites(prev => {
            if (!Array.isArray(prev)) return [recipe]
            // Проверяем, что рецепт еще не в избранном
            if (prev.some(fav => fav.id === recipe.id)) return prev
            return [...prev, recipe]
        })
        setFavoritesTotalCount(prev => prev + 1)
    }

    // Удаление рецепта из избранного
    const removeFavorite = (recipeId) => {
        FavoritesService.removeFromFavorites(recipeId)
        setFavorites(prev => {
            if (!Array.isArray(prev)) return []
            return prev.filter(recipe => recipe.id !== recipeId)
        })
        setFavoritesTotalCount(prev => Math.max(0, prev - 1))
    }

    const removeFromFavoritesOnDelete = (recipeId) => {
        setFavorites(prev => {
            if (!Array.isArray(prev)) return []
            return prev.filter(recipe => recipe.id !== recipeId)
        })
        setFavoritesTotalCount(prev => Math.max(0, prev - 1))
    }

    // Для примера: при монтировании компонента можно загрузить первые избранные рецепты
    useEffect(() => {
        if (!user) {
            setLoading(false)
            return
        }
        const loadInitialData = async () => {
            try {
                await getFavorites(0, 10)
            } catch (err) {
                console.error("Ошибка при загрузке избранных:", err)
            } finally {
                setLoading(false)
            }
        }
        loadInitialData()
    }, [user])

    return (
        <FavoritesContext.Provider 
            value={{ 
                favorites,
                loading,
                favoritesLoading,
                favoritesError,
                favoritesTotalCount,
                getFavorites,
                addFavorite,
                removeFavorite,
                removeFromFavoritesOnDelete
            }}
        >
            {children}
        </FavoritesContext.Provider>
    )
}

// "use client"

// import { useState, useEffect } from "react"
// import { FavoritesContext } from "@/context/FavoritesContext"
// import FavoritesService from "@/services/favorites.service"

// export default function FavoritesProvider({ children }) {
//     const [favorites, setFavorites] = useState([])
//     const [loading, setLoading] = useState(true)
//     const [favoritesLoading, setFavoritesLoading] = useState({})
//     const [favoritesError, setFavoritesError] = useState({})
//     const [favoritesTotalCount, setFavoritesTotalCount] = useState({})

//     const getFavorites = async (offset = 0, limit = 10) => {
//         try {

//         } catch (error) {
//             setRecipesError(prev => ({ ...prev, [username]: error.message }))
//             throw error
//         } finally {
//             setRecipesLoading(prev => ({ ...prev, [username]: false }))
//         }
//     }

//     const addFavorite = (recipe) => {
//         const updatedFavorites = FavoritesService.addToFavorites(recipe)
//         setFavorites(updatedFavorites)
//     }

//     const removeFavorite = (recipeId) => {
//         const updatedFavorites = FavoritesService.removeFromFavorites(recipeId)
//         setFavorites(updatedFavorites)
//     }

//     return (
//         <FavoritesContext.Provider 
//             value={{ 
//                 favorites,
//                 loading,
//                 addFavorite,
//                 removeFavorite
//             }}
//         >
//             {children}
//         </FavoritesContext.Provider>
//     )
// }
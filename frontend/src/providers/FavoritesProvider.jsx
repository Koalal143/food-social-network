"use client"

import { useState, useEffect, useCallback } from "react"
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
        // Проверяем авторизацию перед выполнением запроса
        if (!user?.id) {
            console.warn('Попытка загрузки избранных рецептов без авторизации')
            return {
                favorites: [],
                totalCount: 0,
                hasMore: false
            }
        }

        try {
            setFavoritesLoading(prev => ({ ...prev, [offset]: true }))

            const result = await FavoritesService.getPaginatedFavorites(offset, limit)

            let updatedFavorites = []
            setFavorites(prev => {
                const newData = Array.isArray(result.data) ? result.data : []
                if (offset === 0) {
                    updatedFavorites = newData
                    return newData
                }
                updatedFavorites = Array.isArray(prev) ? [...prev, ...newData] : newData
                return updatedFavorites
            })

            setFavoritesTotalCount(result.totalCount)

            return {
                favorites: updatedFavorites,
                totalCount: result.totalCount,
                hasMore: (offset + limit) < result.totalCount
            }
        } catch (error) {
            setFavoritesError(prev => ({ ...prev, [offset]: error.message }))
            throw error
        } finally {
            setFavoritesLoading(prev => ({ ...prev, [offset]: false }))
        }
    }, [user?.id])

    const addFavorite = useCallback((recipe) => {
        // Проверяем авторизацию перед добавлением в избранное
        if (!user?.id) {
            console.warn('Попытка добавления в избранное без авторизации')
            return
        }

        FavoritesService.addToFavorites(recipe)
        setFavorites(prev => {
            if (!Array.isArray(prev)) return [recipe]
            // Проверяем, что рецепт еще не в избранном
            if (prev.some(fav => fav.id === recipe.id)) return prev
            return [...prev, recipe]
        })
        setFavoritesTotalCount(prev => prev + 1)
    }, [user?.id])

    // Удаление рецепта из избранного
    const removeFavorite = useCallback((recipeId) => {
        // Проверяем авторизацию перед удалением из избранного
        if (!user?.id) {
            console.warn('Попытка удаления из избранного без авторизации')
            return
        }

        FavoritesService.removeFromFavorites(recipeId)
        setFavorites(prev => {
            if (!Array.isArray(prev)) return []
            return prev.filter(recipe => recipe.id !== recipeId)
        })
        setFavoritesTotalCount(prev => Math.max(0, prev - 1))
    }, [user?.id])

    const removeFromFavoritesOnDelete = useCallback((recipeId) => {
        setFavorites(prev => {
            if (!Array.isArray(prev)) return []
            return prev.filter(recipe => recipe.id !== recipeId)
        })
        setFavoritesTotalCount(prev => Math.max(0, prev - 1))
    }, [])

    // Загрузка избранных рецептов при авторизации и очистка при выходе
    useEffect(() => {
        if (!user?.id) {
            // Очищаем состояние при выходе пользователя
            setFavorites([])
            setFavoritesTotalCount(0)
            setFavoritesError({})
            setFavoritesLoading({})
            setLoading(false)
            return
        }

        const loadInitialData = async () => {
            try {
                // Вызываем getFavorites напрямую, не полагаясь на зависимости
                await getFavorites(0, 10)
            } catch (err) {
                console.error("Ошибка при загрузке избранных:", err)
            } finally {
                setLoading(false)
            }
        }
        loadInitialData()
    }, [user?.id]) // Убираем getFavorites из зависимостей

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


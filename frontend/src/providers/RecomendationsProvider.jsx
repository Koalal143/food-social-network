"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { RecomendationsContext } from "@/context/RecomendationsContext"
import RecomendationsService from "@/services/recomendations.service"
import { useAuth } from '@/context/AuthContext'

export default function RecomendationsProvider({ children }) {
    const [recipes, setRecipes] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0)
    const [isPreloading, setIsPreloading] = useState(false)

    // Размер батча для получения рецептов (1 = максимально актуальные рекомендации)
    const BATCH_SIZE = 1
    // Задержка для обновления модели рекомендаций после действия пользователя
    const FEEDBACK_DELAY = 300
    const { user } = useAuth()

    // Ref для отслеживания всех показанных рецептов (для предотвращения дублирования)
    const shownRecipeIds = useRef(new Set())

    // Ref для предотвращения множественных одновременных запросов
    const isLoadingRef = useRef(false)

    // Ref для отслеживания последнего времени действия пользователя
    const lastActionTime = useRef(0)

    const fetchNewRecipe = async (isPreload = false, forceRefresh = false) => {
        // Предотвращаем множественные одновременные запросы
        if (isLoadingRef.current && !isPreload) {
            return null
        }

        try {
            isLoadingRef.current = true

            if (isPreload) {
                setIsPreloading(true)
            } else {
                setLoadingMore(true)
            }

            // Если это принудительное обновление после действия пользователя,
            // добавляем небольшую задержку для обновления модели
            if (forceRefresh) {
                const timeSinceLastAction = Date.now() - lastActionTime.current
                if (timeSinceLastAction < FEEDBACK_DELAY) {
                    await new Promise(resolve => setTimeout(resolve, FEEDBACK_DELAY - timeSinceLastAction))
                }
            }

            // Пытаемся получить новый уникальный рецепт
            let attempts = 0
            const maxAttempts = forceRefresh ? 3 : 8 // Меньше попыток для принудительного обновления

            while (attempts < maxAttempts) {
                const newRecipes = await RecomendationsService.getRecomendationsRecipes(BATCH_SIZE)

                if (newRecipes.length === 0) {
                    // Если API не возвращает рецепты, ждем и пробуем еще раз
                    if (attempts < maxAttempts - 1) {
                        await new Promise(resolve => setTimeout(resolve, forceRefresh ? 200 : 500))
                        attempts++
                        continue
                    }
                    return null
                }

                const newRecipe = newRecipes[0]

                // Проверяем, не показывали ли мы уже этот рецепт
                if (!shownRecipeIds.current.has(newRecipe.id)) {
                    // Добавляем ID в множество показанных
                    shownRecipeIds.current.add(newRecipe.id)
                    return newRecipe
                }

                attempts++

                // Более короткая задержка для принудительного обновления
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, forceRefresh ? 100 : 200))
                }
            }

            // Если после всех попыток получаем дубликаты, сбрасываем историю
            if (!forceRefresh) {
                console.log('Сброс истории показанных рецептов - все рецепты уже показаны')
                shownRecipeIds.current.clear()

                const freshRecipes = await RecomendationsService.getRecomendationsRecipes(BATCH_SIZE)
                if (freshRecipes.length > 0) {
                    const freshRecipe = freshRecipes[0]
                    shownRecipeIds.current.add(freshRecipe.id)
                    return freshRecipe
                }
            }

            return null
        } catch (error) {
            console.error('Ошибка при загрузке рецепта:', error)
            setError(error)
            return null
        } finally {
            isLoadingRef.current = false
            if (isPreload) {
                setIsPreloading(false)
            } else {
                setLoadingMore(false)
            }
        }
    }

    const getNextRecipe = useCallback(async (forceRefresh = false) => {
        const newRecipe = await fetchNewRecipe(false, forceRefresh)

        if (newRecipe) {
            // Добавляем рецепт в основной массив
            setRecipes(prev => {
                const existingIds = prev.map(r => r.id)
                if (!existingIds.includes(newRecipe.id)) {
                    return [...prev, newRecipe]
                }
                return prev
            })

            return newRecipe
        }

        return null
    }, [])

    // Функция для получения актуального рецепта после действия пользователя
    const getNextRecipeAfterAction = useCallback(async () => {
        // Обновляем время последнего действия
        lastActionTime.current = Date.now()

        // Получаем новый рецепт с принудительным обновлением
        return await getNextRecipe(true)
    }, [getNextRecipe])

    const fetchRecipes = async (append = false) => {
        try {
            if (append) {
                // При append просто получаем следующий рецепт
                await getNextRecipe()
            } else {
                setLoading(true)
                setCurrentRecipeIndex(0)

                // При первой загрузке получаем первый рецепт
                const firstRecipe = await fetchNewRecipe(false, false)
                if (firstRecipe) {
                    setRecipes([firstRecipe])
                }
            }
        } catch (error) {
            setError(error)
        } finally {
            if (!append) {
                setLoading(false)
            }
        }
    }

    // Функция для перехода к следующему рецепту с актуальными рекомендациями
    const moveToNextRecipe = useCallback(async () => {
        // Всегда загружаем новый актуальный рецепт после действия пользователя
        const newRecipe = await getNextRecipeAfterAction()

        if (newRecipe) {
            const nextIndex = currentRecipeIndex + 1
            setCurrentRecipeIndex(nextIndex)
            return newRecipe
        }

        return null
    }, [currentRecipeIndex, getNextRecipeAfterAction])

    // Получить текущий рецепт
    const getCurrentRecipe = useCallback(() => {
        return recipes[currentRecipeIndex] || null
    }, [recipes, currentRecipeIndex])

    const resetRecommendations = useCallback(() => {
        shownRecipeIds.current.clear()
        isLoadingRef.current = false
        lastActionTime.current = 0
        setRecipes([])
        setCurrentRecipeIndex(0)
        setError(null)
        setIsPreloading(false)
        setLoadingMore(false)
    }, [])

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
                isPreloading,
                error,
                currentRecipeIndex,
                fetchRecipes,
                getNextRecipe,
                moveToNextRecipe,
                getCurrentRecipe,
                resetRecommendations
            }}
        >
            {children}
        </RecomendationsContext.Provider>
    )
}
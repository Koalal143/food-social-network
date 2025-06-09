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

    // Ref для debouncing запросов
    const debounceTimeoutRef = useRef(null)

    // Ref для отслеживания последнего времени API запроса
    const lastApiCallTime = useRef(0)

    // Минимальный интервал между API запросами (в миллисекундах)
    const MIN_API_INTERVAL = 1000

    const fetchNewRecipe = async (isPreload = false, forceRefresh = false) => {
        // Предотвращаем множественные одновременные запросы
        if (isLoadingRef.current && !isPreload) {
            return null
        }

        // Проверяем минимальный интервал между API запросами
        const timeSinceLastApiCall = Date.now() - lastApiCallTime.current
        if (timeSinceLastApiCall < MIN_API_INTERVAL && !forceRefresh) {
            await new Promise(resolve => setTimeout(resolve, MIN_API_INTERVAL - timeSinceLastApiCall))
        }

        try {
            isLoadingRef.current = true
            lastApiCallTime.current = Date.now()

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

            // Ограничиваем количество попыток для предотвращения бесконечных запросов
            const maxAttempts = forceRefresh ? 2 : 3 // Значительно уменьшаем количество попыток
            let attempts = 0

            while (attempts < maxAttempts) {
                try {
                    const newRecipes = await RecomendationsService.getRecomendationsRecipes(BATCH_SIZE)

                    if (newRecipes.length === 0) {
                        // Если API не возвращает рецепты, прекращаем попытки
                        break
                    }

                    const newRecipe = newRecipes[0]

                    // Проверяем, не показывали ли мы уже этот рецепт
                    if (!shownRecipeIds.current.has(newRecipe.id)) {
                        // Добавляем ID в множество показанных
                        shownRecipeIds.current.add(newRecipe.id)
                        return newRecipe
                    }

                    attempts++

                    // Добавляем задержку между попытками только если это не последняя попытка
                    if (attempts < maxAttempts) {
                        const delay = forceRefresh ? 300 : 500
                        await new Promise(resolve => setTimeout(resolve, delay))
                    }
                } catch (apiError) {
                    console.error(`Ошибка API при получении рецепта:`, apiError)
                    attempts++

                    // Если это сетевая ошибка, прекращаем попытки
                    if (apiError.name === 'TypeError' || apiError.message.includes('fetch')) {
                        break
                    }

                    // Добавляем задержку перед повторной попыткой при ошибке
                    if (attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 1000))
                    }
                }
            }

            // Если после всех попыток не получили уникальный рецепт
            // Сбрасываем историю только если это не принудительное обновление
            // и у нас есть показанные рецепты
            if (!forceRefresh && shownRecipeIds.current.size > 0) {
                shownRecipeIds.current.clear()

                // Делаем только одну попытку после сброса истории
                try {
                    const freshRecipes = await RecomendationsService.getRecomendationsRecipes(BATCH_SIZE)
                    if (freshRecipes.length > 0) {
                        const freshRecipe = freshRecipes[0]
                        shownRecipeIds.current.add(freshRecipe.id)
                        return freshRecipe
                    }
                } catch (resetError) {
                    console.error('Ошибка при получении рецепта после сброса истории:', resetError)
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
    }, []) // Пустой массив зависимостей для предотвращения пересоздания

    // Функция для получения актуального рецепта после действия пользователя
    const getNextRecipeAfterAction = useCallback(async () => {
        // Обновляем время последнего действия
        lastActionTime.current = Date.now()

        // Получаем новый рецепт с принудительным обновлением
        return await getNextRecipe(true)
    }, []) // Убираем getNextRecipe из зависимостей для предотвращения циклов

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
                } else {
                    // Устанавливаем ошибку, если не получили рецепт
                    setError(new Error('Не удалось загрузить рецепты. Попробуйте позже.'));
                }
            }
        } catch (error) {
            console.error('Ошибка при загрузке рецептов:', error);
            setError(error)
        } finally {
            if (!append) {
                setLoading(false)
            }
        }
    }

    // Функция для перехода к следующему рецепту с актуальными рекомендациями
    const moveToNextRecipe = useCallback(async () => {
        // Очищаем предыдущий debounce timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current)
        }

        // Создаем debounced версию для предотвращения частых вызовов
        return new Promise((resolve) => {
            debounceTimeoutRef.current = setTimeout(async () => {
                try {
                    // Всегда загружаем новый актуальный рецепт после действия пользователя
                    const newRecipe = await getNextRecipeAfterAction()

                    if (newRecipe) {
                        // Используем функциональное обновление для избежания зависимости от currentRecipeIndex
                        setCurrentRecipeIndex(prevIndex => prevIndex + 1)
                        resolve(newRecipe)
                    } else {
                        resolve(null)
                    }
                } catch (error) {
                    console.error('Ошибка при переходе к следующему рецепту:', error)
                    resolve(null)
                }
            }, 300) // Debounce delay 300ms
        })
    }, []) // Убираем зависимости для предотвращения пересоздания функции

    // Получить текущий рецепт
    const getCurrentRecipe = useCallback(() => {
        return recipes[currentRecipeIndex] || null
    }, [recipes, currentRecipeIndex])

    const resetRecommendations = useCallback(() => {
        // Очищаем все timeouts
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current)
            debounceTimeoutRef.current = null
        }

        shownRecipeIds.current.clear()
        isLoadingRef.current = false
        lastActionTime.current = 0
        lastApiCallTime.current = 0
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

        // Загружаем рецепты только если их еще нет
        if (recipes.length === 0) {
            fetchRecipes()
        }

        // Cleanup function для очистки timeouts при размонтировании
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
        }
    }, [user]) // Убираем recipes из зависимостей для предотвращения циклов

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
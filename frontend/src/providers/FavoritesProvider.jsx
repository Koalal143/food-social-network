"use client"

import { useState,useEffect, useCallback } from "react"
import { FavoritesContext } from "@/context/FavoritesContext"
import FavoritesService from "@/services/favorites.service"

export default function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState([]) // Все избранные рецепты
    const [loading, setLoading] = useState(true) // Общий статус загрузки (для первого запроса)
    const [favoritesLoading, setFavoritesLoading] = useState({}) // Загрузка отдельных страниц
    const [favoritesError, setFavoritesError] = useState({}) // Ошибки
    const [favoritesTotalCount, setFavoritesTotalCount] = useState(0) // Общее количество избранных

    // Получение избранных рецептов с пагинацией
    const getFavorites = useCallback(async (offset = 0, limit = 10) => {
        try {
            // Устанавливаем статус загрузки для этой порции данных
            setFavoritesLoading(prev => ({ ...prev, [offset]: true }))
            
            // Выполняем запрос на сервер
            const result = await FavoritesService.getPaginatedFavorites(offset, limit)

            // Если это первая страница — полностью заменяем список
            // Иначе — добавляем новые рецепты к уже загруженным
            setFavorites(prev => 
                offset === 0 ? result.data : [...prev, ...result.data]
            )

            // Сохраняем общее количество избранных рецептов
            setFavoritesTotalCount(result.totalCount)

            return {
                favorites: offset === 0 ? result.data : [...favorites, ...result.data],
                totalCount: result.totalCount,
                hasMore: (offset + limit) < result.totalCount
            }
        } catch (error) {
            // Устанавливаем ошибку для соответствующего offset
            setFavoritesError(prev => ({ ...prev, [offset]: error.message }))
            throw error
        } finally {
            // Сбрасываем статус загрузки для этого offset
            setFavoritesLoading(prev => ({ ...prev, [offset]: false }))
        }
    }, []) // Пустой массив зависимостей

    // Добавление рецепта в избранное
    const addFavorite = (recipe) => {
        const updatedFavorites = FavoritesService.addToFavorites(recipe)
        setFavorites(updatedFavorites)
    }

    // Удаление рецепта из избранного
    const removeFavorite = (recipeId) => {
        const updatedFavorites = FavoritesService.removeFromFavorites(recipeId)
        setFavorites(updatedFavorites)
    }

    // Для примера: при монтировании компонента можно загрузить первые избранные рецепты
    useEffect(() => {
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
    }, [])

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
                removeFavorite
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
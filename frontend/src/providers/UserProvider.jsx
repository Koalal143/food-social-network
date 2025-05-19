"use client"

import { useState } from 'react'
import { UserContext } from '@/context/UserContext'
import UsersService from '@/services/users.service'
import RecipesService from '@/services/recipes.service'

export default function UserProvider({ children }) {
    const [users, setUsers] = useState({})
    const [loading, setLoading] = useState({})
    const [error, setError] = useState(null)
    const [userRecipes, setUserRecipes] = useState({})
    const [recipesLoading, setRecipesLoading] = useState({})
    const [recipesError, setRecipesError] = useState({})
    const [recipesTotalCount, setRecipesTotalCount] = useState({})

    const getRecipesByUsername = async (username, offset = 0, limit = 10) => {
        try {
            setRecipesLoading(prev => ({ ...prev, [username]: true }))
            
            // Получаем рецепты с пагинацией
            const result = await RecipesService.getPaginatedRecipesByUsername(username, offset, limit)
            
            // Обновляем состояние с новыми рецептами
            setUserRecipes(prev => ({
                ...prev,
                [username]: offset === 0 
                    ? result.data // Если offset = 0, полностью заменяем список
                    : [...(prev[username] || []), ...result.data] // Иначе добавляем к существующему списку
            }))
            
            // Обновляем общее количество рецептов для пользователя
            setRecipesTotalCount(prev => ({
                ...prev,
                [username]: result.totalCount
            }))
            
            return {
                recipes: offset === 0 
                    ? result.data 
                    : [...(userRecipes[username] || []), ...result.data],
                totalCount: result.totalCount,
                hasMore: (offset + limit) < result.totalCount
            }
        } catch (error) {
            setRecipesError(prev => ({ ...prev, [username]: error.message }))
            throw error
        } finally {
            setRecipesLoading(prev => ({ ...prev, [username]: false }))
        }
    }

    const getUserByUsername = async (userId) => {
        try {
            setLoading(prev => ({ ...prev, [userId]: true }))
            
            // Проверяем, есть ли пользователь уже в кэше
            if (users[userId]) {
                return users[userId]
            }

            const userData = await UsersService.getUserByUsername(userId)
            setUsers(prev => ({ ...prev, [userId]: userData }))
            return userData
        } catch (error) {
            setError(error.message)
            throw error
        } finally {
            setLoading(prev => ({ ...prev, [userId]: false }))
        }
    }

    const clearUserCache = (userId) => {
        if (userId) {
            setUsers(prev => {
                const newUsers = { ...prev }
                delete newUsers[userId]
                return newUsers
            })
        } else {
            setUsers({})
        }
    }

    return (
        <UserContext.Provider
            value={{
                users,
                loading,
                error,
                getUserByUsername,
                clearUserCache,
                getRecipesByUsername,
                userRecipes,
                recipesLoading,
                recipesError,
                recipesTotalCount
            }}
        >
            {children}
        </UserContext.Provider>
    )
}
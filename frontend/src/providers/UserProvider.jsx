"use client"

import { useState } from 'react'
import { UserContext } from '@/context/UserContext'
import UsersService from '@/services/users.service'

export default function UserProvider({ children }) {
    const [users, setUsers] = useState({})
    const [loading, setLoading] = useState({})
    const [error, setError] = useState(null)

    const getUserById = async (userId) => {
        try {
            setLoading(prev => ({ ...prev, [userId]: true }))
            
            // Проверяем, есть ли пользователь уже в кэше
            if (users[userId]) {
                return users[userId]
            }

            const userData = await UsersService.getUserById(userId)
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
                getUserById,
                clearUserCache
            }}
        >
            {children}
        </UserContext.Provider>
    )
}
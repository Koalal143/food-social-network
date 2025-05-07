"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { AuthContext } from '@/context/AuthContext'
import AuthService from '@/services/auth.service'
import UsersService from '@/services/users.service'

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [errorType, setErrorType] = useState(null)

    const clearError = useCallback(() => {
        setError(null)
        setErrorType(null)
    }, [])

    const handleError = useCallback((error) => {
        if (!error) return

        clearError()
        
        if (error.name === 'NetworkError') {
            setErrorType('network')
            setError('Проблема с подключением к сети')
        } else if (error.name === 'ValidationError') {
            setErrorType('validation')
            setError(error.message)
        } else if (error.name === 'AuthError') {
            setErrorType('auth')
            setError(error.message)
        } else {
            setErrorType('unknown')
            setError('Произошла неизвестная ошибка')
        }
    }, [clearError])

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const userData = await UsersService.getCurrentUser()
                setUser(userData)
            } catch (error) {
                setError(error.message)
                // Если токен невалиден, пробуем обновить
                try {
                    await AuthService.refreshToken()
                    const userData = await UsersService.getCurrentUser()
                    setUser(userData)
                } catch (refreshError) {
                    AuthService.logout()
                    setUser(null)
                }
            } finally {
                setLoading(false)
            }
        }

        initializeAuth()
    }, [])

    const login = async (emailOrUsername, password) => {
        try {
            clearError()
            const tokens = await AuthService.login(emailOrUsername, password)
            const userData = await UsersService.getCurrentUser()
            setUser(userData)
            return userData
        } catch (error) {
            handleError(error)
            throw error
        }
    }

    const register = async (username, email, password) => {
        try {
            clearError()
            const userData = await AuthService.register(username, email, password)
            const tokens = await AuthService.login(email, password)
            const currentUser = await UsersService.getCurrentUser()
            setUser(currentUser)
            return currentUser
        } catch (error) {
            handleError(error)
            throw error
        }
    }

    const logout = () => {
        try {
            clearError()
            AuthService.logout()
            setUser(null)
        } catch (error) {
            handleError(error)
            throw error
        }
    }

    const updateProfile = async (profileData) => {
        try {
            clearError()
            const updatedUser = await UsersService.updateCurrentUser(profileData)
            setUser(updatedUser)
            return updatedUser
        } catch (error) {
            handleError(error)
            throw error
        }
    }

    const updateAvatar = async (imageFile) => {
        try {
            clearError()
            const result = await UsersService.updateAvatar(imageFile)
            const updatedUser = await UsersService.getCurrentUser()
            setUser(updatedUser)
            return result
        } catch (error) {
            handleError(error)
            throw error
        }
    }

    const deleteAvatar = async () => {
        try {
            clearError()
            await UsersService.deleteAvatar()
            const updatedUser = await UsersService.getCurrentUser()
            setUser(updatedUser)
        } catch (error) {
            handleError(error)
            throw error
        }
    }

    const contextValue = useMemo(() => ({
        user,
        loading,
        error,
        errorType,
        login,
        register,
        logout,
        updateProfile,
        updateAvatar,
        deleteAvatar,
        clearError
    }), [
        user,
        loading,
        error,
        errorType,
        login,
        register,
        logout,
        updateProfile,
        updateAvatar,
        deleteAvatar,
        clearError
    ])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}
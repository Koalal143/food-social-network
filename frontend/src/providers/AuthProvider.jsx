"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { AuthContext } from '@/context/AuthContext'
import AuthService from '@/services/auth.service'
import UsersService from '@/services/users.service'
import { ERROR_MESSAGES } from '@/constants/errors'
import { NetworkError, AuthError, ValidationError } from '@/utils/errors'
import { CookieManager } from '@/utils/cookies'

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
        
        if (error instanceof NetworkError) {
            setErrorType('network')
            setError(ERROR_MESSAGES.service_unavailable)
        } else if (error instanceof ValidationError) {
            setErrorType('validation')
            setError(error.message || ERROR_MESSAGES.validation_error)
        } else if (error instanceof AuthError) {
            setErrorType('auth')
            setError(error.message || ERROR_MESSAGES.invalid_credentials)
        } else {
            setErrorType('unknown')
            setError(ERROR_MESSAGES.default)
        }
    }, [clearError])

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setLoading(true)

                // Выполняем миграцию токенов из localStorage в cookies при инициализации
                CookieManager.migrateTokensFromLocalStorage()

                const userData = await AuthService.getCurrentUser()
                setUser(userData)
            } catch (error) {
                if (error instanceof AuthError) {
                    try {
                        await AuthService.refreshToken()
                        const userData = await AuthService.getCurrentUser()
                        setUser(userData)
                    } catch (refreshError) {
                        AuthService.logout()
                        setUser(null)
                        handleError(refreshError)
                    }
                } else {
                    handleError(error)
                }
            } finally {
                setLoading(false)
            }
        }

        initializeAuth()
    }, [handleError])

    const login = async (emailOrUsername, password) => {
        try {
            clearError()
            await AuthService.login(emailOrUsername, password)
            const currentUser = await AuthService.getCurrentUser()
            setUser(currentUser)
            return currentUser
        } catch (error) {
            handleError(error)
            throw error
        }
    }

    const register = async (username, email, password) => {
        try {
            clearError()
            await AuthService.register(username, email, password)
            await AuthService.login(email, password)
            const currentUser = await AuthService.getCurrentUser()
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
            const updatedUser = await AuthService.updateUserProfile(profileData)
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
            const result = await AuthService.updateAvatar(imageFile)
            const updatedUser = await AuthService.getCurrentUser()
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
            await AuthService.deleteAvatar()
            const updatedUser = await AuthService.getCurrentUser()
            setUser(updatedUser)
        } catch (error) {
            handleError(error)
            throw error
        }
    }

    const isAuth = useMemo(() => {
        return user !== null
    }, [user])

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
        clearError,
        isAuth
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
        clearError,
        isAuth
    ])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}
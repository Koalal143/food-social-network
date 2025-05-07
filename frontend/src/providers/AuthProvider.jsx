"use client"

import { useState, useEffect } from 'react'
import { AuthContext } from '@/context/AuthContext'
import AuthService from '@/services/auth.service'
import UsersService from '@/services/users.service'

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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
            const tokens = await AuthService.login(emailOrUsername, password)
            const userData = await UsersService.getCurrentUser()
            setUser(userData)
            return userData
        } catch (error) {
            setError(error.message)
            throw error
        }
    }

    const register = async (username, email, password) => {
        try {
            const userData = await AuthService.register(username, email, password)
            const tokens = await AuthService.login(email, password)
            const currentUser = await UsersService.getCurrentUser()
            setUser(currentUser)
            return currentUser
        } catch (error) {
            setError(error.message)
            throw error
        }
    }

    const logout = () => {
        AuthService.logout()
        setUser(null)
    }

    const updateProfile = async (profileData) => {
        try {
            const updatedUser = await UsersService.updateCurrentUser(profileData)
            setUser(updatedUser)
            return updatedUser
        } catch (error) {
            setError(error.message)
            throw error
        }
    }

    const updateAvatar = async (imageFile) => {
        try {
            const result = await UsersService.updateAvatar(imageFile)
            const updatedUser = await UsersService.getCurrentUser()
            setUser(updatedUser)
            return result
        } catch (error) {
            setError(error.message)
            throw error
        }
    }

    const deleteAvatar = async () => {
        try {
            await UsersService.deleteAvatar()
            const updatedUser = await UsersService.getCurrentUser()
            setUser(updatedUser)
        } catch (error) {
            setError(error.message)
            throw error
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                login,
                register,
                logout,
                updateProfile,
                updateAvatar,
                deleteAvatar
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
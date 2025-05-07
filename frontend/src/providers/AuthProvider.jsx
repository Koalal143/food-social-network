"use client"

import { useState, useEffect } from "react"
import AuthService from "@/services/auth.service"
import { AuthContext } from "@/context/AuthContext"

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const userData = await AuthService.getCurrentUser()
                setUser(userData)
            } catch (error) {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        fetchCurrentUser()
    }, [])

    const login = async (emailOrUsername, password) => {
        try {
            const userData = await AuthService.login(emailOrUsername, password)
            setUser(userData)
            return userData
        } catch (error) {
            throw error
        }
    }

    const register = async (username, email, password) => {
        try {
            const userData = await AuthService.register(username, email, password)
            setUser(userData)
            return userData
        } catch (error) {
            throw error
        }
    }

    const logout = () => {
        AuthService.logout()
        setUser(null)
    }

    const updateProfile = async (profileData) => {
        try {
            const updatedUser = await AuthService.updateUserProfile(profileData)
            setUser(updatedUser)
            return updatedUser
        } catch (error) {
            throw error
        }
    }

    const updateAvatar = async (imageFile) => {
        try {
            const updatedUser = await AuthService.updateAvatar(imageFile)
            setUser(updatedUser)
            return updatedUser
        } catch (error) {
            throw error
        }
    }

    const deleteAvatar = async () => {
        try {
            await AuthService.deleteAvatar()
            setUser(prev => ({ ...prev, profile: { ...prev.profile, avatar_url: null } }))
        } catch (error) {
            throw error
        }
    }

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updateAvatar,
        deleteAvatar
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
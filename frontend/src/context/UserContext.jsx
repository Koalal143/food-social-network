"use client"

import { createContext, useContext, useState, useEffect } from "react"
import UsersService from "@/services/users.service"

const UserContext = createContext()

export function UserProvider({ children }) {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchUsers = async () => {
        try {
            const data = await UsersService.getAllUsers()
            setUsers(data)
        } catch (error) {
            setError(error)
            console.error("Ошибка при загрузке пользователей:", error)
        } finally {
            setLoading(false)
        }
    }

    const getUserById = async (id) => {
        try {
            return await UsersService.getUserById(id);
        } catch (error) {
            setError(error);
            console.error("Ошибка при загрузке пользователя:", error);
            return null;
        }
    };

    useEffect(() => {
        fetchUsers()
    }, [])

    return (
        <UserContext.Provider
            value={{
                users,
                loading,
                error,
                fetchUsers,
                getUserById
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export const useUsers = () => useContext(UserContext) 
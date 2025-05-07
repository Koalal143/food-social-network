"use client"

import Container from "@/components/layout/Container"
import { useRecipes } from "@/context/RecipeContext"
import { useFavorites } from "@/context/FavoritesContext"
import Loader from "@/components/ui/Loader"
import Image from "next/image"
import { useEffect, useState } from "react"
import ProfileTabs from "@/components/shared/ProfileTabs"
import { useAuth } from "@/context/AuthContext"

export default function ProfilePage() {
    const { getRecipesByAuthorId } = useRecipes()
    const { favorites } = useFavorites()
    const [userRecipes, setUserRecipes] = useState([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const recipes = await getRecipesByAuthorId(user.id)
                setUserRecipes(recipes)
            } catch (error) {
                console.error("Ошибка при загрузке рецептов:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [getRecipesByAuthorId])

    if (loading) {
        return <Loader />
    }

    return (
        <Container className="py-6">
            <h2 className="text-2xl font-bold mb-6">Ваш профиль</h2>
            <div className="flex items-center mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mr-4">
                    <Image
                        src={user.avatar}
                        alt={user.name}
                        width={96}
                        height={96}
                        className="object-cover"
                    />
                </div>
                <div>
                    <h3 className="text-xl font-semibold">{user.name}</h3>
                    <p className="text-gray-600">Стаж в готовке: {user.experience}</p>
                </div>
            </div>
            
            <ProfileTabs userRecipes={userRecipes} favorites={favorites} />
        </Container>
    )
}
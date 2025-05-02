"use client"

import Container from "@/components/Container"
import RecipeCard from "../../components/shared/RecipeCard"
import { useRecipes } from "@/context/RecipeContext"
import Loader from "@/components/ui/Loader"
import Image from "next/image"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function ProfilePage() {
    const { getRecipesByAuthorId } = useRecipes()
    const [userRecipes, setUserRecipes] = useState([])
    const [loading, setLoading] = useState(true)

    // TODO: Create authContext
    const currentUserId = 3

    const user = {
        id: currentUserId,
        name: "Тетя Зина",
        experience: "69 лет",
        avatar: "/images/ava.jpg"
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const recipes = await getRecipesByAuthorId(currentUserId)
                setUserRecipes(recipes)
            } catch (error) {
                console.error("Ошибка при загрузке рецептов:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [currentUserId, getRecipesByAuthorId])

    if (loading) {
        return <Loader />
    }

    return (
        <Container className="py-6 h-screen">
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
            <h3 className="text-lg font-bold mb-4">Ваши рецепты</h3>
            {userRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userRecipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-600 mb-6">У вас пока нет рецептов</p>
                    <Link 
                        href="/recipe/add"
                        className="inline-block bg-muted-foreground text-white primary-500 px-6 py-2 rounded-xl hover:bg-secondary-foreground transition-colors"
                    >
                        Создать первый рецепт
                    </Link>
                </div>
            )}
        </Container>
    )
}
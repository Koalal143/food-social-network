"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useFavorites } from '@/context/FavoritesContext'
import { useRecipes } from '@/context/RecipeContext'
import Container from '@/components/layout/Container'
import { useToast } from '@/hooks/use-toast'
import EditableProfileInfo from '@/components/ui/profile/EditableProfileInfo'
import EditableProfilePhoto from '@/components/ui/profile/EditableProfilePhoto'
import ProfileTabs from '@/components/ui/profile/ProfileTabs'
import { handleApiError } from '@/utils/errorHandler'
import Loader from '@/components/ui/Loader'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function ProfilePage() {
    const { user, loading, updateProfile } = useAuth()
    const { getRecipesByAuthorId } = useRecipes()
    const router = useRouter()
    const { toast } = useToast()
    const [userRecipes, setUserRecipes] = useState([])
    const { favorites } = useFavorites()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                setError(null)
                const recipes = await getRecipesByAuthorId(user.id)
                setUserRecipes(recipes)
            } catch (error) {
                const { message } = handleApiError(error)
                setError(message)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [user, loading, router, getRecipesByAuthorId])

    const handleUpdateProfile = async (values) => {
        try {
            const formattedData = {
                username: values.username,
                profile: {
                    about: values.about
                }
            }
            
            await updateProfile(formattedData)
            toast({
                title: "Профиль обновлен",
                description: "Ваши данные успешно обновлены"
            })
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка",
                description: message
            })
        }
    }

    if (loading || isLoading) {
        return <Loader />
    }

    return (
        <ProtectedRoute>
            <Container className="py-8">
                <div className="space-y-8">
                    <div className="flex items-start justify-between">
                        <h1 className="text-3xl font-bold tracking-tight">Ваш профиль</h1>
                        <Link className='md:hidden' href='/recipe/add'>
                            <Button>
                                Добавить рецепт
                            </Button>
                        </Link>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <EditableProfilePhoto user={user} />
                        <EditableProfileInfo
                            user={user}
                            onSave={handleUpdateProfile}
                            className="flex-1 min-w-[300px]"
                        />
                    </div>

                    <div className="pt-4 border-t">
                        <ProfileTabs recipes={userRecipes} favorites={favorites} />
                    </div>
                </div>
            </Container>
        </ProtectedRoute>
    )
}
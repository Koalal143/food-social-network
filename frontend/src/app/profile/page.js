"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useFavorites } from '@/context/FavoritesContext'
import { useRecipes } from '@/context/RecipeContext'
import { Button } from '@/components/ui/button'
import Container from '@/components/layout/Container'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import EditableProfileInfo from '@/components/ui/profile/EditableProfileInfo'
import EditableProfilePhoto from '@/components/ui/profile/EditableProfilePhoto'
import ProfileTabs from '@/components/ui/profile/ProfileTabs'
import { handleApiError } from '@/utils/errorHandler'
import Loader from '@/components/ui/Loader'

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
        if (!loading && !user) {
            router.push('/login')
            return
        }

        const loadData = async () => {
            if (!user) return

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
        <Container className="py-8">
            <div className="space-y-8">
                <div className="flex items-start justify-between">
                    <h1 className="text-3xl font-bold">Ваш профиль</h1>
                    <Button asChild>
                        <Link href="/recipe/add">
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить рецепт
                        </Link>
                    </Button>
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
    )
}
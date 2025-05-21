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
import FavoritesService from '@/services/favorites.service'

const RECIPES_PER_PAGE = 9;

export default function ProfilePage() {
    const { user, loading: authLoading, updateProfile } = useAuth()
    const { getRecipesByAuthorId } = useRecipes()
    const { favorites, getFavorites, favoritesTotalCount, favoritesLoading } = useFavorites()

    const { toast } = useToast()
    const [userRecipes, setUserRecipes] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // Загружаем рецепты пользователя
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

        if (user?.id) {
            loadData()
        }
    }, [user, getRecipesByAuthorId])

    // Загружаем первые избранные рецепты при монтировании
    useEffect(() => {
        const loadInitialFavorites = async () => {
            try {
                await getFavorites(0, RECIPES_PER_PAGE)
            } catch (err) {
                console.error("Ошибка при загрузке избранных:", err)
            }
        }

        loadInitialFavorites()
    }, [])

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

    const loadMoreFavorites = () => {
        const offset = favorites.length
        if (favoritesLoading[offset]) return

        getFavorites(offset, RECIPES_PER_PAGE)
    }

    const hasMore = favorites.length < favoritesTotalCount

    if (authLoading || isLoading) {
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
                        <ProfileTabs 
                            recipes={userRecipes} 
                            favorites={favorites} 
                            loadMoreFavorites={loadMoreFavorites}
                            hasMore={hasMore}
                            isFavoritesLoading={!!favoritesLoading[favorites.length]}
                        />
                    </div>
                </div>
            </Container>
        </ProtectedRoute>
    )
}

// "use client"

// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/context/AuthContext'
// import { useFavorites } from '@/context/FavoritesContext'
// import { useRecipes } from '@/context/RecipeContext'
// import Container from '@/components/layout/Container'
// import { useToast } from '@/hooks/use-toast'
// import EditableProfileInfo from '@/components/ui/profile/EditableProfileInfo'
// import EditableProfilePhoto from '@/components/ui/profile/EditableProfilePhoto'
// import ProfileTabs from '@/components/ui/profile/ProfileTabs'
// import { handleApiError } from '@/utils/errorHandler'
// import Loader from '@/components/ui/Loader'
// import Link from 'next/link'
// import { Button } from '@/components/ui/button'
// import ProtectedRoute from '@/components/auth/ProtectedRoute'

// const RECIPES_PER_PAGE = 9;

// export default function ProfilePage() {
//     const { user, loading, updateProfile } = useAuth()
//     const { getRecipesByAuthorId } = useRecipes()
//     const router = useRouter()
//     const { toast } = useToast()
//     const [userRecipes, setUserRecipes] = useState([])
//     const { favorites } = useFavorites()
//     const [isLoading, setIsLoading] = useState(true)
//     const [error, setError] = useState(null)

//     useEffect(() => {
//         const loadData = async () => {
//             try {
//                 setError(null)
//                 const recipes = await getRecipesByAuthorId(user.id)
//                 setUserRecipes(recipes)
//             } catch (error) {
//                 const { message } = handleApiError(error)
//                 setError(message)
//             } finally {
//                 setIsLoading(false)
//             }
//         }

//         loadData()
//     }, [user, loading, router, getRecipesByAuthorId])

//     const handleUpdateProfile = async (values) => {
//         try {
//             const formattedData = {
//                 username: values.username,
//                 profile: {
//                     about: values.about
//                 }
//             }
            
//             await updateProfile(formattedData)
//             toast({
//                 title: "Профиль обновлен",
//                 description: "Ваши данные успешно обновлены"
//             })
//         } catch (error) {
//             const { message, type } = handleApiError(error)
//             toast({
//                 variant: type,
//                 title: "Ошибка",
//                 description: message
//             })
//         }
//     }

//     if (loading || isLoading) {
//         return <Loader />
//     }

//     return (
//         <ProtectedRoute>
//             <Container className="py-8">
//                 <div className="space-y-8">
//                     <div className="flex items-start justify-between">
//                         <h1 className="text-3xl font-bold tracking-tight">Ваш профиль</h1>
//                         <Link className='md:hidden' href='/recipe/add'>
//                             <Button>
//                                 Добавить рецепт
//                             </Button>
//                         </Link>
//                     </div>

//                     <div className="flex flex-col md:flex-row gap-8 items-start">
//                         <EditableProfilePhoto user={user} />
//                         <EditableProfileInfo
//                             user={user}
//                             onSave={handleUpdateProfile}
//                             className="flex-1 min-w-[300px]"
//                         />
//                     </div>

//                     <div className="pt-4 border-t">
//                         <ProfileTabs recipes={userRecipes} favorites={favorites} />
//                     </div>
//                 </div>
//             </Container>
//         </ProtectedRoute>
//     )
// }
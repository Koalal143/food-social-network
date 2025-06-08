"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useFavorites } from '@/context/FavoritesContext'
import Container from '@/components/layout/Container'
import { useToast } from '@/hooks/use-toast'
import EditableProfileInfo from '@/components/ui/profile/EditableProfileInfo'
import EditableProfilePhoto from '@/components/ui/profile/EditableProfilePhoto'
import ProfileTabs from '@/components/ui/profile/ProfileTabs'
import { handleApiError } from '@/utils/errorHandler'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AuthService from '@/services/auth.service'
// import { ProfileSkeleton } from '@/components/ui/skeletons' // Теперь используется в ProtectedRoute

const RECIPES_PER_PAGE = 9;

export default function ProfilePage() {
    const { user, authLoading, updateProfile } = useAuth()
    const { favorites, getFavorites, favoritesLoading } = useFavorites()

    const { toast } = useToast()
    const [userRecipes, setUserRecipes] = useState([])
    const [offset, setOffset] = useState(0)
    const [recipesHasMore, setRecipesHasMore] = useState(true)
    const [isInitialLoading, setIsInitialLoading] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [totalCount, setTotalCount] = useState(0)
    const [error, setError] = useState(null)
    const loadingRef = useRef(false)
    const debounceTimerRef = useRef(null)
    const favoritesLoadingRef = useRef(false)
    const favoritesDebounceTimerRef = useRef(null)
    const [favoritesOffset, setFavoritesOffset] = useState(0)
    const [favoritesHasMore, setFavoritesHasMore] = useState(true)

    useEffect(() => {
        const loadInitialRecipes = async () => {
            if (loadingRef.current) return
            try {
                loadingRef.current = true
                setIsInitialLoading(true)
                setError(null)
                const result = await AuthService.getPaginatedRecipes(0, RECIPES_PER_PAGE)
                setUserRecipes(result.data)
                setTotalCount(result.totalCount)
                setOffset(result.data.length)
                setRecipesHasMore((result.data.length || 0) < (result.totalCount || 0))
            } catch (error) {
                const { message } = handleApiError(error)
                setError(message)
            } finally {
                setIsInitialLoading(false)
                loadingRef.current = false
            }
        }
        if (user?.id) {
            loadInitialRecipes()
        }
    }, [user])

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

    const loadMoreFavorites = useCallback(() => {
        if (favoritesLoadingRef.current || !favoritesHasMore) return

        if (favoritesDebounceTimerRef.current) {
            clearTimeout(favoritesDebounceTimerRef.current)
        }

        favoritesDebounceTimerRef.current = setTimeout(async () => {
            try {
                favoritesLoadingRef.current = true
                const offset = favorites.length
                const result = await getFavorites(offset, RECIPES_PER_PAGE)
                setFavoritesOffset(offset + result.favorites.length)
                setFavoritesHasMore((offset + result.favorites.length) < result.totalCount)
            } catch (err) {
                // обработка ошибки
            } finally {
                favoritesLoadingRef.current = false
            }
        }, 300)
    }, [favorites, favoritesHasMore, getFavorites])

    const loadMoreUserRecipes = useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }
        debounceTimerRef.current = setTimeout(async () => {
            if (loadingRef.current || !recipesHasMore || userRecipes.length >= totalCount) {
                return
            }
            try {
                loadingRef.current = true
                setIsLoadingMore(true)
                const result = await AuthService.getPaginatedRecipes(offset, RECIPES_PER_PAGE)
                const newRecipes = result.data || []
                setUserRecipes(prev => {
                    const existingIds = new Set(prev.map(r => r.id))
                    const uniqueNewRecipes = newRecipes.filter(r => !existingIds.has(r.id))
                    const newRecipesList = [...prev, ...uniqueNewRecipes]

                    // Обновляем hasMore на основе нового количества рецептов
                    setRecipesHasMore(newRecipesList.length < (result.totalCount || 0) && newRecipes.length > 0)

                    return newRecipesList
                })
                setOffset(prev => prev + newRecipes.length)
            } catch (error) {
                const { message } = handleApiError(error)
                setError(message)
            } finally {
                setIsLoadingMore(false)
                loadingRef.current = false
            }
        }, 300)
    }, [offset, recipesHasMore, userRecipes.length, totalCount])

    // Скелетон теперь показывается в ProtectedRoute
    // if (authLoading || isInitialLoading) {
    //     return (
    //         <Container className="py-8">
    //             <ProfileSkeleton />
    //         </Container>
    //     )
    // }

    return (
        <ProtectedRoute skeleton="profile">
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
                            hasMoreRecipes={recipesHasMore}
                            hasMoreFavs={favoritesHasMore}
                            hasMore={recipesHasMore}
                            isFavoritesLoading={!!favoritesLoading[favorites.length]}
                            loadMoreRecipes={loadMoreUserRecipes}
                            isLoading={isLoadingMore}
                        />
                    </div>
                </div>
            </Container>
        </ProtectedRoute>
    )
}
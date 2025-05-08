"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Container from '@/components/layout/Container'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Upload, Trash2, Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'

// Временные моковые данные для рецептов
const mockRecipes = [
    {
        id: 1,
        title: "Борщ классический",
        description: "Традиционный украинский борщ с говядиной",
        image: "/images/mock/borsch.jpg",
        cookingTime: "2 часа",
        difficulty: "Средняя",
    },
    {
        id: 2,
        title: "Паста Карбонара",
        description: "Итальянская паста с беконом и сливочным соусом",
        image: "/images/mock/carbonara.jpg",
        cookingTime: "30 минут",
        difficulty: "Легкая",
    },
]

export default function ProfilePage() {
    const { user, loading, updateAvatar, deleteAvatar } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [userRecipes, setUserRecipes] = useState(mockRecipes)
    const [favorites, setFavorites] = useState([])

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
        // Здесь будет запрос за избранными рецептами
        setFavorites(mockRecipes.slice(0, 1))
    }, [user, loading, router])

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            await updateAvatar(file)
            toast({
                title: "Аватар обновлен",
                description: "Ваш аватар успешно обновлен",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: error.message,
            })
        }
    }

    const handleDeleteAvatar = async () => {
        try {
            await deleteAvatar()
            toast({
                title: "Аватар удален",
                description: "Ваш аватар успешно удален",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: error.message,
            })
        }
    }

    if (loading) {
        return (
            <Container className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </Container>
        )
    }

    if (!user) {
        return null
    }

    return (
        <Container className="py-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">Профиль</h1>
                        <p className="text-gray-500">
                            Управляйте своими личными данными и рецептами
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/recipe/add">
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить рецепт
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-[240px,1fr]">
                    <div className="space-y-6">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative h-40 w-40">
                                <Image
                                    src={user.profile?.avatar_url || '/images/default-avatar.png'}
                                    alt={user.username || 'Avatar'}
                                    className="rounded-full object-cover"
                                    fill
                                    priority
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="relative"
                                >
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                    />
                                    <Upload className="mr-2 h-4 w-4" />
                                    Загрузить
                                </Button>
                                {user.profile?.avatar_url && (
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={handleDeleteAvatar}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Удалить
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                Разрешены JPG, GIF или PNG. Максимальный размер 1MB.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Email</label>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Имя пользователя</label>
                                <p className="text-sm text-muted-foreground">{user.username}</p>
                            </div>
                            {user.profile?.about && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">О себе</label>
                                    <p className="text-sm text-muted-foreground">{user.profile.about}</p>
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Дата регистрации</label>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(user.created_at).toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Tabs defaultValue="recipes" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="recipes">Мои рецепты</TabsTrigger>
                                <TabsTrigger value="favorites">Избранное</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="recipes" className="space-y-4">
                                {userRecipes.length > 0 ? (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {userRecipes.map((recipe) => (
                                            <Link 
                                                key={recipe.id} 
                                                href={`/recipe/${recipe.id}`}
                                                className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
                                            >
                                                <Image
                                                    src={recipe.image}
                                                    alt={recipe.title}
                                                    className="object-cover transition-transform group-hover:scale-105"
                                                    fill
                                                />
                                                <div className="absolute inset-0 bg-black/40 p-4 text-white">
                                                    <div className="flex h-full flex-col justify-between">
                                                        <h3 className="text-lg font-semibold">{recipe.title}</h3>
                                                        <div className="space-y-1 text-sm">
                                                            <p>{recipe.description}</p>
                                                            <div className="flex items-center gap-4">
                                                                <span>⏱ {recipe.cookingTime}</span>
                                                                <span>📊 {recipe.difficulty}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground mb-4">
                                            У вас пока нет рецептов
                                        </p>
                                        <Button asChild>
                                            <Link href="/recipe/add">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Добавить первый рецепт
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="favorites" className="space-y-4">
                                {favorites.length > 0 ? (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {favorites.map((recipe) => (
                                            <Link 
                                                key={recipe.id} 
                                                href={`/recipe/${recipe.id}`}
                                                className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
                                            >
                                                <Image
                                                    src={recipe.image}
                                                    alt={recipe.title}
                                                    className="object-cover transition-transform group-hover:scale-105"
                                                    fill
                                                />
                                                <div className="absolute inset-0 bg-black/40 p-4 text-white">
                                                    <div className="flex h-full flex-col justify-between">
                                                        <h3 className="text-lg font-semibold">{recipe.title}</h3>
                                                        <div className="space-y-1 text-sm">
                                                            <p>{recipe.description}</p>
                                                            <div className="flex items-center gap-4">
                                                                <span>⏱ {recipe.cookingTime}</span>
                                                                <span>📊 {recipe.difficulty}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground mb-4">
                                            У вас пока нет избранных рецептов
                                        </p>
                                        <Button asChild variant="outline">
                                            <Link href="/search">
                                                Найти рецепты
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </Container>
    )
}
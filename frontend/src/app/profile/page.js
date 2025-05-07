"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Container from '@/components/layout/Container'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Upload, Trash2 } from 'lucide-react'

export default function ProfilePage() {
    const { user, loading, updateAvatar, deleteAvatar } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
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
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Профиль</h1>
                    <p className="text-gray-500">
                        Управляйте своими личными данными
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="relative h-24 w-24">
                            <Image
                                src={user.profile?.avatar_url || '/images/default-avatar.png'}
                                alt={user.username || 'Avatar'}
                                className="rounded-full object-cover"
                                fill
                            />
                        </div>
                        <div className="space-y-2">
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
                            <p className="text-xs text-muted-foreground">
                                Разрешены JPG, GIF или PNG. Максимальный размер 1MB.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 pt-4 border-t">
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
            </div>
        </Container>
    )
}
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AdminRoute from '@/components/auth/AdminRoute'
import Container from '@/components/layout/Container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    ChefHat,
    Users,
    BarChart3,
    Shield,
    FileText,
    Calendar,
    UserCog
} from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { handleApiError } from '@/utils/errorHandler'
import AdminService from '@/services/admin.service'

export default function AdminDashboard() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [statistics, setStatistics] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setLoading(true)
                const stats = await AdminService.getStatistics()
                setStatistics(stats)
            } catch (error) {
                const { message, type } = handleApiError(error)
                toast({
                    variant: type,
                    title: "Ошибка загрузки статистики",
                    description: message,
                })
            } finally {
                setLoading(false)
            }
        }

        if (user?.is_superuser) {
            fetchStatistics()
        }
    }, [user, toast])

    if (loading) {
        return (
            <AdminRoute>
                <div className="flex items-center justify-center min-h-screen">
                    <LoadingSpinner />
                </div>
            </AdminRoute>
        )
    }

    return (
        <AdminRoute>
            <Container>
                <div className="py-8 space-y-8">
                    {/* Заголовок */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Административная панель
                            </h1>
                            <p className="text-muted-foreground">
                                Добро пожаловать, {user?.username}
                            </p>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Администратор
                        </Badge>
                    </div>

                    {/* Статистические карточки */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Всего рецептов
                                </CardTitle>
                                <ChefHat className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statistics?.total_recipes || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Опубликованных рецептов
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Данные из основного API
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Пользователи
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statistics?.total_users || '—'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Зарегистрированных пользователей
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Активность
                                </CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statistics?.banned_emails_count || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Заблокированных доменов
                                </p>
                                <p className="text-xs text-red-600 mt-1">
                                    Email блокировки активны
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    За сегодня
                                </CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statistics?.new_recipes_today || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Новых рецептов сегодня
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    {statistics?.new_recipes_today > 0 ? 'Есть активность' : 'Пока нет новых'}
                                </p>
                            </CardContent>
                        </Card>


                    </div>

                    {/* Быстрые действия */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Управление пользователями
                                </CardTitle>
                                <CardDescription>
                                    Просмотр и управление аккаунтами пользователей
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/admin/users">
                                    <Button className="w-full">
                                        Перейти к пользователям
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Управление жалобами
                                </CardTitle>
                                <CardDescription>
                                    Просмотр и обработка жалоб на рецепты и пользователей
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/admin/complaints">
                                    <Button className="w-full">
                                        Перейти к жалобам
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Заблокированные Email
                                </CardTitle>
                                <CardDescription>
                                    Управление заблокированными доменами email адресов
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/admin/banned-emails">
                                    <Button className="w-full" variant="outline">
                                        Управление блокировками
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>


                    </div>

                    {/* Последняя активность */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Последняя активность</CardTitle>
                            <CardDescription>
                                Недавние действия в системе
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Данные об активности будут доступны позже</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Container>
        </AdminRoute>
    )
} 
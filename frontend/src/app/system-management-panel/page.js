"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import AdminRoute from '@/components/auth/AdminRoute'
import Container from '@/components/layout/Container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { handleApiError } from '@/utils/errorHandler'
import AdminService from '@/services/admin.service'
import RecipesService from '@/services/recipes.service'
import {
    Users,
    ChefHat,
    TrendingUp,
    Calendar,
    Settings,
    BarChart3,
    Shield
} from 'lucide-react'
import Link from 'next/link'
import Loader from '@/components/ui/Loader'

export default function AdminDashboard() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [statistics, setStatistics] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setLoading(true)

                // Получаем статистику на основе существующих endpoints
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

        fetchStatistics()
    }, [toast])

    
    if (loading) {
        return (
            <AdminRoute>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader />
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
                                    {statistics?.total_users || 0}
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
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statistics?.active_users || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Активных пользователей
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
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">
                                    Новых рецептов
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Быстрые действия */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ChefHat className="w-5 h-5" />
                                    Управление рецептами
                                </CardTitle>
                                <CardDescription>
                                    Просмотр, редактирование и удаление рецептов
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/system-management-panel/recipes">
                                    <Button className="w-full">
                                        Перейти к рецептам
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

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
                                <Link href="/system-management-panel/users">
                                    <Button className="w-full">
                                        Перейти к пользователям
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Тестирование
                                </CardTitle>
                                <CardDescription>
                                    Тестовые функции и диагностика
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/system-management-panel/test">
                                    <Button className="w-full" variant="outline">
                                        Тестирование
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
                                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Данные об активности будут доступны позже</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Container>
        </AdminRoute>
    )
}

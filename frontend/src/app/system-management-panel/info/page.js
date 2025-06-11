"use client"

import AdminRoute from '@/components/auth/AdminRoute'
import Container from '@/components/layout/Container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    ArrowLeft,
    Info,
    CheckCircle,
    AlertTriangle,
    ChefHat,
    Users,
    BarChart3,
    Shield
} from 'lucide-react'
import Link from 'next/link'

export default function AdminInfoPage() {
    return (
        <AdminRoute>
            <Container>
                <div className="py-8 space-y-6">
                    {/* Заголовок и навигация */}
                    <div className="flex items-center gap-4">
                        <Link href="/system-management-panel">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Назад к панели
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Информация об админ-панели
                            </h1>
                            <p className="text-muted-foreground">
                                Возможности и ограничения текущей реализации
                            </p>
                        </div>
                    </div>

                    {/* Доступная функциональность */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                Доступная функциональность
                            </CardTitle>
                            <CardDescription>
                                Что работает в текущей версии админ-панели
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">Статистика рецептов</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground ml-6">
                                        Отображение общего количества рецептов в системе
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <ChefHat className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">Управление рецептами</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground ml-6">
                                        Просмотр, поиск и удаление любых рецептов
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">Проверка прав доступа</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground ml-6">
                                        Доступ только для пользователей с is_superuser = true
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-red-600" />
                                        <span className="font-medium">Заблокированные домены</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground ml-6">
                                        Управление списком заблокированных email доменов
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Info className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">Тестирование API</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground ml-6">
                                        Проверка работоспособности существующих endpoints
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ограничения */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-600">
                                <AlertTriangle className="w-5 h-5" />
                                Ограничения текущей реализации
                            </CardTitle>
                            <CardDescription>
                                Функции, которые требуют дополнительных backend endpoints
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                    <Users className="w-5 h-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-amber-800">Управление пользователями</h4>
                                        <p className="text-sm text-amber-700 mt-1">
                                            Нет endpoint для получения списка всех пользователей и изменения их статуса.
                                            Требуется создание специальных админских endpoints.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                    <BarChart3 className="w-5 h-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-amber-800">Расширенная статистика</h4>
                                        <p className="text-sm text-amber-700 mt-1">
                                            Статистика по пользователям, активности и детальная аналитика
                                            требует специальных endpoints для агрегации данных.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Используемые endpoints */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="w-5 h-5" />
                                Используемые API endpoints
                            </CardTitle>
                            <CardDescription>
                                Существующие endpoints, которые использует админ-панель
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">GET /v1/recipes</code>
                                        <p className="text-sm text-muted-foreground mt-1">Получение списка рецептов</p>
                                    </div>
                                    <Badge variant="default">Работает</Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">DELETE /v1/recipes/{'{id}'}</code>
                                        <p className="text-sm text-muted-foreground mt-1">Удаление рецепта (админ может удалить любой)</p>
                                    </div>
                                    <Badge variant="default">Работает</Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">GET /v1/recipes/search</code>
                                        <p className="text-sm text-muted-foreground mt-1">Поиск рецептов</p>
                                    </div>
                                    <Badge variant="default">Работает</Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">GET /v1/users/me</code>
                                        <p className="text-sm text-muted-foreground mt-1">Получение информации о текущем пользователе</p>
                                    </div>
                                    <Badge variant="default">Работает</Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">GET /v1/banned-emails</code>
                                        <p className="text-sm text-muted-foreground mt-1">Получение списка заблокированных доменов</p>
                                    </div>
                                    <Badge variant="default">Работает</Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">POST /v1/banned-emails</code>
                                        <p className="text-sm text-muted-foreground mt-1">Добавление домена в список заблокированных</p>
                                    </div>
                                    <Badge variant="default">Работает</Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">DELETE /v1/banned-emails/{'{domain}'}</code>
                                        <p className="text-sm text-muted-foreground mt-1">Удаление домена из списка заблокированных</p>
                                    </div>
                                    <Badge variant="default">Работает</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Как пользоваться */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="w-5 h-5" />
                                Как пользоваться админ-панелью
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">1. Доступ к админ-панели</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Войдите в систему как пользователь с правами администратора (is_superuser = true).
                                        В выпадающем меню профиля появится пункт "Админ-панель".
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">2. Просмотр статистики</h4>
                                    <p className="text-sm text-muted-foreground">
                                        На главной странице админ-панели (/admin) отображается статистика по рецептам.
                                        Статистика обновляется автоматически при загрузке страницы.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">3. Управление рецептами</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Перейдите в раздел "Управление рецептами" для просмотра всех рецептов.
                                        Доступны поиск по названию и удаление рецептов.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">4. Управление заблокированными доменами</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Перейдите в раздел "Заблокированные домены" для управления списком запрещенных email доменов.
                                        Можно добавлять новые домены и удалять существующие.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">5. Тестирование</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Используйте страницу /admin/test для проверки работоспособности API endpoints.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Container>
        </AdminRoute>
    )
}

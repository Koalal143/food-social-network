"use client"

import { useState, useEffect, useCallback } from 'react'
import AdminRoute from '@/components/auth/AdminRoute'
import Container from '@/components/layout/Container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { handleApiError } from '@/utils/errorHandler'
import {
    Search,
    Users,
    ArrowLeft,
    MoreHorizontal,
    UserCheck,
    UserX,
    Shield,
    Mail,
    Calendar
} from 'lucide-react'
import Link from 'next/link'
import Loader from '@/components/ui/Loader'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import AdminService from '@/services/admin.service'

export default function AdminUsersPage() {
    const { toast } = useToast()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [statusDialogOpen, setStatusDialogOpen] = useState(false)
    const [userToToggle, setUserToToggle] = useState(null)
    const [toggling, setToggling] = useState(false)

    const ITEMS_PER_PAGE = 20

    const fetchUsers = useCallback(async (page = 0, search = '') => {
        try {
            setLoading(true)
            const offset = page * ITEMS_PER_PAGE

            const response = await AdminService.getAllUsers(offset, ITEMS_PER_PAGE, search)

            if (response.message) {
                // Показываем сообщение о том, что нужен специальный endpoint
                toast({
                    variant: "default",
                    title: "Информация",
                    description: response.message,
                })
            }

            setUsers(response.data || [])
            setTotalCount(response.totalCount || 0)
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка загрузки пользователей",
                description: message,
            })
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchUsers(currentPage, searchQuery)
    }, [fetchUsers, currentPage, searchQuery])

    const handleSearch = (e) => {
        e.preventDefault()
        setCurrentPage(0)
        fetchUsers(0, searchQuery)
    }

    const handleToggleStatus = (user) => {
        setUserToToggle(user)
        setStatusDialogOpen(true)
    }

    const handleToggleConfirm = async () => {
        if (!userToToggle) return

        try {
            setToggling(true)

            await AdminService.toggleUserStatus(userToToggle.id, !userToToggle.is_active)

            const action = userToToggle.is_active ? "заблокирован" : "разблокирован"
            toast({
                title: "Статус изменен",
                description: `Пользователь ${userToToggle.username} был ${action}.`,
            })

            // Обновляем список пользователей
            await fetchUsers(currentPage, searchQuery)
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка изменения статуса",
                description: message,
            })
        } finally {
            setToggling(false)
            setStatusDialogOpen(false)
            setUserToToggle(null)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Никогда'
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    return (
        <AdminRoute>
            <Container>
                <div className="py-8 space-y-6">
                    {/* Заголовок и навигация */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Назад к панели
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Управление пользователями
                                </h1>
                                <p className="text-muted-foreground">
                                    Всего пользователей: {totalCount}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Поиск */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Поиск пользователей
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="flex gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Поиск по имени пользователя или email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button type="submit">
                                    <Search className="w-4 h-4 mr-2" />
                                    Найти
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Список пользователей */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Пользователи
                            </CardTitle>
                            <CardDescription>
                                Страница {currentPage + 1} из {totalPages || 1}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader />
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Пользователи не найдены</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {users.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                                                    {user.profile?.avatar_url ? (
                                                        <img
                                                            src={user.profile.avatar_url}
                                                            alt={user.username}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Users className="w-6 h-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">{user.username}</h3>
                                                        {user.is_superuser && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                <Shield className="w-3 h-3 mr-1" />
                                                                Админ
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="w-4 h-4" />
                                                        {user.email}
                                                        <span>•</span>
                                                        <span>ID: {user.id}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            Последний вход: {formatDate(user.last_login)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant={user.is_active ? "default" : "secondary"}>
                                                            {user.is_active ? "Активен" : "Заблокирован"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/profile/${user.username}`}>
                                                    <Button variant="outline" size="sm">
                                                        Профиль
                                                    </Button>
                                                </Link>
                                                {!user.is_superuser && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => handleToggleStatus(user)}
                                                            >
                                                                {user.is_active ? (
                                                                    <>
                                                                        <UserX className="w-4 h-4 mr-2" />
                                                                        Заблокировать
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserCheck className="w-4 h-4 mr-2" />
                                                                        Разблокировать
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Пагинация */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                        disabled={currentPage === 0}
                                    >
                                        Предыдущая
                                    </Button>
                                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                                        {currentPage + 1} из {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                        disabled={currentPage >= totalPages - 1}
                                    >
                                        Следующая
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </Container>

            {/* Диалог подтверждения изменения статуса */}
            <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {userToToggle?.is_active ? "Заблокировать" : "Разблокировать"} пользователя?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите {userToToggle?.is_active ? "заблокировать" : "разблокировать"}
                            пользователя "{userToToggle?.username}"?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleToggleConfirm}
                            disabled={toggling}
                        >
                            {toggling ? "Изменение..." : "Подтвердить"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminRoute>
    )
}
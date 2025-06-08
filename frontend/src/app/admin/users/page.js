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
    Shield,
    ArrowLeft,
    User,
    Ban,
    CheckCircle,
    UserCog,
    XCircle
} from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import UserService from '@/services/user.service'

const ITEMS_PER_PAGE = 10

export default function AdminUsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredUsers, setFilteredUsers] = useState([])

    // Состояние для блокировки/разблокировки
    const [statusDialogOpen, setStatusDialogOpen] = useState(false)
    const [userToToggle, setUserToToggle] = useState(null)
    const [toggling, setToggling] = useState(false)

    // Состояние для изменения роли
    const [roleDialogOpen, setRoleDialogOpen] = useState(false)
    const [userToChangeRole, setUserToChangeRole] = useState(null)
    const [newRole, setNewRole] = useState('')
    const [changingRole, setChangingRole] = useState(false)

    const { toast } = useToast()

    // Заглушка для получения пользователей
    const fetchUsers = useCallback(async (page = 0) => {
        setLoading(true)
        try {
            const offset = page * ITEMS_PER_PAGE
            const response = await UserService.getAllUsers(offset, ITEMS_PER_PAGE, searchQuery)
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
    }, [searchQuery, toast])

    useEffect(() => {
        fetchUsers(currentPage)
    }, [fetchUsers, currentPage])

    useEffect(() => {
        setCurrentPage(0) // Сброс страницы при изменении запроса
    }, [searchQuery])


    const handleToggleStatusClick = (user) => {
        setUserToToggle(user)
        setStatusDialogOpen(true)
    }

    const handleToggleConfirm = async () => {
        if (!userToToggle) return

        setToggling(true)
        try {
            await UserService.toggleUserStatus(userToToggle.id, !userToToggle.is_active)
            toast({
                title: userToToggle.is_active ? "Пользователь заблокирован" : "Пользователь разблокирован",
                description: `Статус пользователя "${userToToggle.username}" успешно изменен.`,
            })
            await fetchUsers(currentPage)
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

    const handleChangeRoleClick = (user) => {
        setUserToChangeRole(user)
        setNewRole(user.is_superuser ? 'user' : 'admin') // Изначально предлагаем сменить на противоположную
        setRoleDialogOpen(true)
    }

    const handleChangeRoleConfirm = async () => {
        if (!userToChangeRole) return

        setChangingRole(true)
        try {
            await UserService.changeUserRole(userToChangeRole.id, newRole === 'admin')
            toast({
                title: "Роль изменена",
                description: `Роль пользователя "${userToChangeRole.username}" изменена на "${newRole}".`,
            })
            await fetchUsers(currentPage)
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка изменения роли",
                description: message,
            })
        } finally {
            setChangingRole(false)
            setRoleDialogOpen(false)
            setUserToChangeRole(null)
            setNewRole('')
        }
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
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Поиск по имени пользователя или email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Список пользователей */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Список пользователей</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <LoadingSpinner />
                                </div>
                            ) : filteredUsers.length === 0 && !searchQuery ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Пользователи отсутствуют.</p>
                                </div>
                            ) : filteredUsers.length === 0 && searchQuery ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>По вашему запросу пользователи не найдены.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {users.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <User className="w-5 h-5 text-gray-600" />
                                                <div>
                                                    <p className="font-semibold">{user.username}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                                {user.is_superuser && (
                                                    <Badge variant="secondary" className="flex items-center gap-1">
                                                        <Shield className="w-3 h-3" />
                                                        Админ
                                                    </Badge>
                                                )}
                                                <Badge variant={user.is_active ? "success" : "destructive"}>
                                                    {user.is_active ? "Активен" : "Заблокирован"}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggleStatusClick(user)}
                                                    className={user.is_active ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                                                >
                                                    {user.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleChangeRoleClick(user)}
                                                >
                                                    <UserCog className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Пагинация */}
                            {!searchQuery && totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                        disabled={currentPage === 0}
                                    >
                                        Предыдущая
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Страница {currentPage + 1} из {totalPages}
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

            {/* Диалог подтверждения блокировки/разблокировки */}
            <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            {userToToggle?.is_active ? <Ban className="w-5 h-5 text-red-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
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
                            className={userToToggle?.is_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                        >
                            {toggling ? (
                                <>
                                    <LoadingSpinner className="w-4 h-4 mr-2" />
                                    Изменение...
                                </>
                            ) : (
                                userToToggle?.is_active ? "Заблокировать" : "Разблокировать"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Диалог изменения роли */}
            <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserCog className="w-5 h-5" />
                            Изменить роль пользователя
                        </DialogTitle>
                        <DialogDescription>
                            Выберите новую роль для пользователя "{userToChangeRole?.username}".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Select onValueChange={setNewRole} value={newRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите роль" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Пользователь</SelectItem>
                                    <SelectItem value="admin">Администратор</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                            Отмена
                        </Button>
                        <Button onClick={handleChangeRoleConfirm} disabled={changingRole}>
                            {changingRole ? (
                                <>
                                    <LoadingSpinner className="w-4 h-4 mr-2" />
                                    Изменение...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Применить
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminRoute>
    )
}

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
    ArrowLeft,
    FileText,
    User,
    ChefHat,
    CheckCircle,
    XCircle,
    Ban,
    MoreHorizontal
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import ComplaintService from '@/services/complaint.service'

const ITEMS_PER_PAGE = 10

export default function AdminComplaintsPage() {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredComplaints, setFilteredComplaints] = useState([])
    const [filterStatus, setFilterStatus] = useState('all') // 'all', 'pending', 'resolved', 'rejected'

    // Состояние для обработки жалоб
    const [actionDialogOpen, setActionDialogOpen] = useState(false)
    const [complaintToAction, setComplaintToAction] = useState(null)
    const [actionType, setActionType] = useState(null) // 'resolve', 'reject', 'ban_user', 'ban_recipe'
    const [processingAction, setProcessingAction] = useState(false)

    const { toast } = useToast()

    // Заглушка для получения жалоб
    const fetchComplaints = useCallback(async (page = 0) => {
        setLoading(true)
        try {
            const offset = page * ITEMS_PER_PAGE
            const response = await ComplaintService.getAllComplaints(offset, ITEMS_PER_PAGE, searchQuery, filterStatus)
            setComplaints(response.data || [])
            setTotalCount(response.totalCount || 0)
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка загрузки жалоб",
                description: message,
            })
        } finally {
            setLoading(false)
        }
    }, [searchQuery, filterStatus, toast])

    useEffect(() => {
        fetchComplaints(currentPage)
    }, [fetchComplaints, currentPage])

    useEffect(() => {
        setCurrentPage(0) // Сброс страницы при изменении запроса или фильтра
    }, [searchQuery, filterStatus])


    const handleActionClick = (complaint, type) => {
        setComplaintToAction(complaint)
        setActionType(type)
        setActionDialogOpen(true)
    }

    const handleConfirmAction = async () => {
        if (!complaintToAction || !actionType) return

        setProcessingAction(true)
        try {
            let title = "";
            let description = "";
            if (actionType === 'resolve') {
                await ComplaintService.resolveComplaint(complaintToAction.id);
                title = "Жалоба разрешена";
                description = `Жалоба #${complaintToAction.id} успешно разрешена.`;
            } else if (actionType === 'reject') {
                await ComplaintService.rejectComplaint(complaintToAction.id);
                title = "Жалоба отклонена";
                description = `Жалоба #${complaintToAction.id} успешно отклонена.`;
            } else if (actionType === 'ban_user') {
                // В реальном приложении здесь должен быть вызов UserService.toggleUserStatus
                // и затем ComplaintService.resolveComplaint
                // Для демонстрации пока используем заглушку из ComplaintService
                await ComplaintService.banUserAndResolveComplaint(complaintToAction.target_id, complaintToAction.id);
                title = "Пользователь заблокирован";
                description = `Пользователь "${complaintToAction.target_name}" заблокирован, жалоба #${complaintToAction.id} разрешена.`;
            } else if (actionType === 'ban_recipe') {
                // В реальном приложении здесь должен быть вызов RecipeService.banRecipe
                // и затем ComplaintService.resolveComplaint
                // Для демонстрации пока используем заглушку из ComplaintService
                await ComplaintService.banRecipeAndResolveComplaint(complaintToAction.target_id, complaintToAction.id);
                title = "Рецепт заблокирован";
                description = `Рецепт "${complaintToAction.target_name}" заблокирован, жалоба #${complaintToAction.id} разрешена.`;
            }

            toast({
                title: title,
                description: description,
            });
            await fetchComplaints(currentPage);
        } catch (error) {
            const { message, type } = handleApiError(error);
            toast({
                variant: type,
                title: "Ошибка действия с жалобой",
                description: message,
            });
        } finally {
            setProcessingAction(false);
            setActionDialogOpen(false);
            setComplaintToAction(null);
            setActionType(null);
        }
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">В ожидании</Badge>
            case 'resolved':
                return <Badge variant="success">Разрешена</Badge>
            case 'rejected':
                return <Badge variant="destructive">Отклонена</Badge>
            default:
                return null
        }
    }

    const getComplaintTypeIcon = (type) => {
        switch (type) {
            case 'recipe':
                return <ChefHat className="w-4 h-4 text-gray-600" />
            case 'user':
                return <User className="w-4 h-4 text-gray-600" />
            default:
                return <FileText className="w-4 h-4 text-gray-600" />
        }
    }

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
                                    Управление жалобами
                                </h1>
                                <p className="text-muted-foreground">
                                    Всего жалоб: {totalCount}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Фильтры и поиск */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Поиск и фильтрация жалоб
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4">
                                <Input
                                    placeholder="Поиск по содержанию, автору или цели..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1"
                                />
                                <div className="w-full md:w-48">
                                    <Select onValueChange={setFilterStatus} value={filterStatus}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Фильтр по статусу" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Все статусы</SelectItem>
                                            <SelectItem value="pending">В ожидании</SelectItem>
                                            <SelectItem value="resolved">Разрешенные</SelectItem>
                                            <SelectItem value="rejected">Отклоненные</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Список жалоб */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Список жалоб</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {complaints.length === 0 && !searchQuery && filterStatus === 'all' ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Жалобы отсутствуют.</p>
                                </div>
                            ) : complaints.length === 0 && (searchQuery || filterStatus !== 'all') ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>По вашему запросу жалобы не найдены.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {complaints.map((complaint) => (
                                        <div
                                            key={complaint.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-start gap-3 flex-grow">
                                                {getComplaintTypeIcon(complaint.type)}
                                                <div className="flex-grow">
                                                    <p className="font-semibold">
                                                        Жалоба на {complaint.type === 'recipe' ? `рецепт "${complaint.target_name}"` : `пользователя "${complaint.target_name}"`}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        От пользователя: {complaint.reporter_username}
                                                    </p>
                                                    <p className="text-sm mt-1">
                                                        Причина: <span className="text-gray-700 font-medium">{complaint.reason}</span>
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Подана: {new Date(complaint.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(complaint.status)}
                                                {complaint.status === 'pending' && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Открыть меню</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleActionClick(complaint, 'resolve')}>
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Разрешить
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleActionClick(complaint, 'reject')}>
                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                Отклонить
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            {complaint.type === 'user' && (
                                                                <DropdownMenuItem onClick={() => handleActionClick(complaint, 'ban_user')}>
                                                                    <Ban className="mr-2 h-4 w-4 text-red-600" />
                                                                    Заблокировать пользователя
                                                                </DropdownMenuItem>
                                                            )}
                                                            {complaint.type === 'recipe' && (
                                                                <DropdownMenuItem onClick={() => handleActionClick(complaint, 'ban_recipe')}>
                                                                    <Ban className="mr-2 h-4 w-4 text-red-600" />
                                                                    Заблокировать рецепт
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
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

            {/* Диалог подтверждения действия с жалобой */}
            <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            {actionType === 'resolve' && <CheckCircle className="w-5 h-5 text-green-500" />}
                            {actionType === 'reject' && <XCircle className="w-5 h-5 text-red-500" />}
                            {actionType === 'ban_user' && <Ban className="w-5 h-5 text-red-500" />}
                            {actionType === 'ban_recipe' && <Ban className="w-5 h-5 text-red-500" />}
                            {actionType === 'resolve' && "Разрешить жалобу?"}
                            {actionType === 'reject' && "Отклонить жалобу?"}
                            {actionType === 'ban_user' && "Заблокировать пользователя?"}
                            {actionType === 'ban_recipe' && "Заблокировать рецепт?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionType === 'resolve' && `Вы уверены, что хотите разрешить жалобу #${complaintToAction?.id} на "${complaintToAction?.target_name}"?`}
                            {actionType === 'reject' && `Вы уверены, что хотите отклонить жалобу #${complaintToAction?.id} на "${complaintToAction?.target_name}"?`}
                            {actionType === 'ban_user' && `Вы уверены, что хотите заблокировать пользователя "${complaintToAction?.target_name}" и разрешить жалобу #${complaintToAction?.id}?`}
                            {actionType === 'ban_recipe' && `Вы уверены, что хотите заблокировать рецепт "${complaintToAction?.target_name}" и разрешить жалобу #${complaintToAction?.id}?`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmAction}
                            disabled={processingAction}
                            className={actionType === 'reject' || actionType === 'ban_user' || actionType === 'ban_recipe' ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                        >
                            {processingAction ? (
                                <>
                                    <LoadingSpinner className="w-4 h-4 mr-2" />
                                    Обработка...
                                </>
                            ) : (
                                <>Подтвердить</>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminRoute>
    )
} 
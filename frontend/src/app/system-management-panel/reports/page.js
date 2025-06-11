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
    MoreHorizontal,
    ExternalLink
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

import ReportsService from '@/services/reports.service'
import { REPORT_REASON_LABELS, REPORT_STATUS_LABELS, REPORT_STATUSES } from '@/lib/schemas/report.schema'

const ITEMS_PER_PAGE = 20

export default function AdminReportsPage() {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [statistics, setStatistics] = useState(null)

    // Состояние для обработки жалоб
    const [actionDialogOpen, setActionDialogOpen] = useState(false)
    const [selectedReport, setSelectedReport] = useState(null)
    const [actionType, setActionType] = useState('')
    const [updating, setUpdating] = useState(false)

    const { toast } = useToast()

    const fetchReports = useCallback(async (page = 0, status = '') => {
        try {
            setLoading(true)
            const offset = page * ITEMS_PER_PAGE

            const response = await ReportsService.getAllReports(
                offset,
                ITEMS_PER_PAGE,
                status || null
            )

            setReports(response.data || [])
            setTotalCount(response.totalCount || 0)
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка загрузки репортов",
                description: message,
            })
        } finally {
            setLoading(false)
        }
    }, [toast])

    const fetchStatistics = useCallback(async () => {
        try {
            const stats = await ReportsService.getReportsStats()
            setStatistics(stats)
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка загрузки статистики",
                description: message,
            })
        }
    }, [toast])

    useEffect(() => {
        fetchReports(currentPage, statusFilter)
        fetchStatistics()
    }, [fetchReports, fetchStatistics, currentPage, statusFilter])

    const handleStatusFilterChange = (value) => {
        setStatusFilter(value === 'all' ? '' : value)
        setCurrentPage(0)
    }

    const handleAction = (report, action) => {
        setSelectedReport(report)
        setActionType(action)
        setActionDialogOpen(true)
    }

    const handleActionConfirm = async () => {
        if (!selectedReport) return

        try {
            setUpdating(true)

            await ReportsService.updateReport(
                selectedReport.id,
                actionType,
                null
            )

            const actionLabels = {
                [REPORT_STATUSES.REVIEWED]: "рассмотрен",
                [REPORT_STATUSES.RESOLVED]: "решен",
                [REPORT_STATUSES.DISMISSED]: "отклонен"
            }

            toast({
                title: "Статус обновлен",
                description: `Репорт был ${actionLabels[actionType]}.`,
            })

            await fetchReports(currentPage, statusFilter)
            await fetchStatistics()
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка обновления статуса",
                description: message,
            })
        } finally {
            setUpdating(false)
            setActionDialogOpen(false)
            setSelectedReport(null)
            setActionType('')
        }
    }

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case REPORT_STATUSES.PENDING:
                return "secondary"
            case REPORT_STATUSES.REVIEWED:
                return "default"
            case REPORT_STATUSES.RESOLVED:
                return "default"
            case REPORT_STATUSES.DISMISSED:
                return "outline"
            default:
                return "secondary"
        }
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    if (loading && reports.length === 0) {
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
                    <div className="flex items-center gap-4">
                        <Link href="/system-management-panel">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Управление жалобами
                            </h1>
                            <p className="text-muted-foreground">
                                Просмотр и обработка жалоб пользователей
                            </p>
                        </div>
                    </div>

                    {statistics && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Всего жалоб
                                    </CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{statistics.total_reports}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        На рассмотрении
                                    </CardTitle>
                                    <FileText className="h-4 w-4 text-yellow-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-600">{statistics.pending_reports}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Решено
                                    </CardTitle>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{statistics.resolved_reports}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Отклонено
                                    </CardTitle>
                                    <XCircle className="h-4 w-4 text-gray-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-600">{statistics.dismissed_reports}</div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Жалобы</CardTitle>
                            <CardDescription>
                                Список всех жалоб с возможностью фильтрации и управления
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Select value={statusFilter || 'all'} onValueChange={handleStatusFilterChange}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Фильтр по статусу" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все статусы</SelectItem>
                                        {Object.entries(REPORT_STATUS_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <LoadingSpinner />
                                </div>
                            ) : reports.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Жалобы не найдены</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reports.map((report) => (
                                        <div
                                            key={report.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">#{report.id}</span>
                                                        <Badge variant={getStatusBadgeVariant(report.status)}>
                                                            {REPORT_STATUS_LABELS[report.status]}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {REPORT_REASON_LABELS[report.reason]}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                                                        <Link
                                                            href={`/recipe/${report.recipe.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-primary hover:text-primary/80 hover:underline transition-colors font-medium"
                                                        >
                                                            <ChefHat className="w-3 h-3" />
                                                            Рецепт #{report.recipe.id}
                                                            <ExternalLink className="w-3 h-3" />
                                                        </Link>
                                                        <span className="text-muted-foreground/60">•</span>
                                                        {report.reporter_user?.username ? (
                                                            <Link
                                                                href={`/profile/${report.reporter_user.username}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-primary hover:text-primary/80 hover:underline transition-colors font-medium"
                                                            >
                                                                <User className="w-3 h-3" />
                                                                @{report.reporter_user.username}
                                                                <ExternalLink className="w-3 h-3" />
                                                            </Link>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-muted-foreground/80">
                                                                <User className="w-3 h-3" />
                                                                Неизвестен
                                                            </span>
                                                        )}
                                                    </div>
                                                    {report.description && (
                                                        <div className="text-sm text-muted-foreground max-w-md truncate">
                                                            {report.description}
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(report.created_at).toLocaleString('ru-RU')}
                                                    </div>
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {report.status === REPORT_STATUSES.PENDING && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => handleAction(report, REPORT_STATUSES.REVIEWED)}
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                Рассмотрено
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleAction(report, REPORT_STATUSES.RESOLVED)}
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                Решено
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleAction(report, REPORT_STATUSES.DISMISSED)}
                                                            >
                                                                <XCircle className="w-4 h-4 mr-2" />
                                                                Отклонить
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {report.status !== REPORT_STATUSES.PENDING && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleAction(report, REPORT_STATUSES.PENDING)}
                                                        >
                                                            <FileText className="w-4 h-4 mr-2" />
                                                            Вернуть на рассмотрение
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Показано {reports.length} из {totalCount} жалоб
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                            disabled={currentPage === 0}
                                        >
                                            Назад
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                            disabled={currentPage >= totalPages - 1}
                                        >
                                            Далее
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Изменить статус жалобы?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Вы уверены, что хотите изменить статус жалобы #{selectedReport?.id} на
                                "{REPORT_STATUS_LABELS[actionType]}"?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleActionConfirm}
                                disabled={updating}
                            >
                                {updating ? "Изменение..." : "Подтвердить"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Container>
        </AdminRoute>
    )
} 
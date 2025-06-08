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
import BannedEmailService from '@/services/banned-email.service'
import {
    Search,
    Shield,
    Plus,
    Trash2,
    ArrowLeft,
    AlertTriangle,
    CheckCircle,
    Globe
} from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
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

export default function BannedEmailsPage() {
    const { toast } = useToast()
    const [bannedEmails, setBannedEmails] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [newEmailDomain, setNewEmailDomain] = useState('')
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [emailToDelete, setEmailToDelete] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const ITEMS_PER_PAGE = 20

    const fetchBannedEmails = useCallback(async (page = 0, search = '') => {
        try {
            setLoading(true)
            const offset = page * ITEMS_PER_PAGE

            const response = await BannedEmailService.getBannedEmails(offset, ITEMS_PER_PAGE)
            
            // Фильтруем по поиску на клиенте, если есть поисковый запрос
            let filteredEmails = response.data || []
            if (search) {
                filteredEmails = filteredEmails.filter(email => 
                    email.toLowerCase().includes(search.toLowerCase())
                )
            }

            setBannedEmails(filteredEmails)
            setTotalCount(response.totalCount || 0)
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка загрузки заблокированных email",
                description: message,
            })
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchBannedEmails(currentPage, searchQuery)
    }, [fetchBannedEmails, currentPage, searchQuery])

    const handleSearch = (e) => {
        e.preventDefault()
        setCurrentPage(0)
        fetchBannedEmails(0, searchQuery)
    }

    const handleAddEmail = async () => {
        if (!newEmailDomain.trim()) {
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: "Введите домен email для блокировки",
            })
            return
        }

        try {
            setIsSubmitting(true)
            await BannedEmailService.banEmailDomain(newEmailDomain.trim())
            
            toast({
                variant: "default",
                title: "Успешно",
                description: `Домен ${newEmailDomain} заблокирован`,
            })
            
            setNewEmailDomain('')
            setIsAddDialogOpen(false)
            fetchBannedEmails(currentPage, searchQuery)
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка блокировки домена",
                description: message,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteEmail = async () => {
        try {
            setIsSubmitting(true)
            await BannedEmailService.unbanEmailDomain(emailToDelete)
            
            toast({
                variant: "default",
                title: "Успешно",
                description: `Домен ${emailToDelete} разблокирован`,
            })
            
            setIsDeleteDialogOpen(false)
            setEmailToDelete('')
            fetchBannedEmails(currentPage, searchQuery)
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка разблокировки домена",
                description: message,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const openDeleteDialog = (email) => {
        setEmailToDelete(email)
        setIsDeleteDialogOpen(true)
    }

    if (loading && bannedEmails.length === 0) {
        return (
            <AdminRoute>
                <Container>
                    <div className="flex items-center justify-center min-h-screen">
                        <LoadingSpinner />
                    </div>
                </Container>
            </AdminRoute>
        )
    }

    return (
        <AdminRoute>
            <Container>
                <div className="py-8 space-y-8">
                    {/* Заголовок */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Назад
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Заблокированные Email
                                </h1>
                                <p className="text-muted-foreground">
                                    Управление заблокированными доменами email адресов
                                </p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            {totalCount} заблокировано
                        </Badge>
                    </div>

                    {/* Поиск и добавление */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Поиск по домену..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </form>
                        
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Заблокировать домен
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Заблокировать домен email</DialogTitle>
                                    <DialogDescription>
                                        Введите домен email адреса для блокировки регистрации пользователей с этого домена.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Input
                                            placeholder="example.com"
                                            value={newEmailDomain}
                                            onChange={(e) => setNewEmailDomain(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setIsAddDialogOpen(false)}
                                        disabled={isSubmitting}
                                    >
                                        Отмена
                                    </Button>
                                    <Button 
                                        onClick={handleAddEmail}
                                        disabled={isSubmitting}
                                        variant="destructive"
                                    >
                                        {isSubmitting ? "Блокировка..." : "Заблокировать"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Список заблокированных email */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                Заблокированные домены
                            </CardTitle>
                            <CardDescription>
                                Пользователи с email адресами из этих доменов не смогут зарегистрироваться
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {bannedEmails.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Нет заблокированных доменов</h3>
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'По вашему запросу ничего не найдено' : 'Все домены разрешены для регистрации'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {bannedEmails.map((email, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                                <span className="font-mono">{email}</span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openDeleteDialog(email)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Разблокировать
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Диалог подтверждения удаления */}
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Разблокировать домен?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Вы уверены, что хотите разблокировать домен <strong>{emailToDelete}</strong>? 
                                    После этого пользователи с email адресами из этого домена смогут регистрироваться.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isSubmitting}>Отмена</AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={handleDeleteEmail}
                                    disabled={isSubmitting}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {isSubmitting ? "Разблокировка..." : "Разблокировать"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </Container>
        </AdminRoute>
    )
}

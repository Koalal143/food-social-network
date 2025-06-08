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
import Loader from '@/components/ui/Loader'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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

const ITEMS_PER_PAGE = 20

export default function BannedDomainsPage() {
    const [domains, setDomains] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredDomains, setFilteredDomains] = useState([])
    
    // Состояние для добавления домена
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [newDomain, setNewDomain] = useState('')
    const [adding, setAdding] = useState(false)
    
    // Состояние для удаления домена
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [domainToDelete, setDomainToDelete] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const { toast } = useToast()

    const fetchDomains = useCallback(async (page = 0) => {
        try {
            setLoading(true)
            const offset = page * ITEMS_PER_PAGE

            const response = await BannedEmailService.getAllBannedDomains(offset, ITEMS_PER_PAGE)

            setDomains(response.data || [])
            setTotalCount(response.totalCount || 0)
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка загрузки доменов",
                description: message,
            })
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchDomains(currentPage)
    }, [fetchDomains, currentPage])

    // Фильтрация доменов по поисковому запросу
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredDomains(domains)
        } else {
            const filtered = domains.filter(domain =>
                domain.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredDomains(filtered)
        }
    }, [domains, searchQuery])

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
    }

    const handleAddDomain = async () => {
        const validation = BannedEmailService.validateDomain(newDomain)
        
        if (!validation.valid) {
            toast({
                variant: "destructive",
                title: "Ошибка валидации",
                description: validation.error,
            })
            return
        }

        try {
            setAdding(true)
            await BannedEmailService.addBannedDomain(validation.domain)
            
            toast({
                title: "Домен заблокирован",
                description: `Домен "${validation.domain}" добавлен в список заблокированных.`,
            })

            setNewDomain('')
            setAddDialogOpen(false)
            
            // Обновляем список доменов
            await fetchDomains(currentPage)
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка добавления домена",
                description: message,
            })
        } finally {
            setAdding(false)
        }
    }

    const handleDeleteClick = (domain) => {
        setDomainToDelete(domain)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!domainToDelete) return

        try {
            setDeleting(true)
            await BannedEmailService.deleteBannedDomain(domainToDelete)
            
            toast({
                title: "Домен разблокирован",
                description: `Домен "${domainToDelete}" удален из списка заблокированных.`,
            })

            // Обновляем список доменов
            await fetchDomains(currentPage)
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка удаления домена",
                description: message,
            })
        } finally {
            setDeleting(false)
            setDeleteDialogOpen(false)
            setDomainToDelete(null)
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
                                    Заблокированные домены
                                </h1>
                                <p className="text-muted-foreground">
                                    Всего заблокированных доменов: {totalCount}
                                </p>
                            </div>
                        </div>
                        <Button onClick={() => setAddDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Добавить домен
                        </Button>
                    </div>

                    {/* Поиск */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Поиск доменов
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Поиск по домену..."
                                        value={searchQuery}
                                        onChange={handleSearch}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Список доменов */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Заблокированные домены
                            </CardTitle>
                            <CardDescription>
                                {searchQuery ? 
                                    `Найдено доменов: ${filteredDomains.length}` :
                                    `Страница ${currentPage + 1} из ${totalPages || 1}`
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader />
                                </div>
                            ) : filteredDomains.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>{searchQuery ? 'Домены не найдены' : 'Заблокированные домены отсутствуют'}</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredDomains.map((domain, index) => (
                                        <div
                                            key={`${domain}-${index}`}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Shield className="w-4 h-4 text-red-500" />
                                                <span className="font-mono text-sm">{domain}</span>
                                                <Badge variant="destructive" className="text-xs">
                                                    Заблокирован
                                                </Badge>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteClick(domain)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
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

            {/* Диалог добавления домена */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Добавить заблокированный домен
                        </DialogTitle>
                        <DialogDescription>
                            Введите домен электронной почты, который нужно заблокировать.
                            Пользователи не смогут регистрироваться с email адресами этого домена.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Input
                                placeholder="example.com"
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddDomain()
                                    }
                                }}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Введите только домен без символа @
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                            Отмена
                        </Button>
                        <Button onClick={handleAddDomain} disabled={adding}>
                            {adding ? (
                                <>
                                    <Loader className="w-4 h-4 mr-2" />
                                    Добавление...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Добавить
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Диалог подтверждения удаления */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Подтвердите удаление
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить домен "{domainToDelete}" из списка заблокированных?
                            После этого пользователи смогут регистрироваться с email адресами этого домена.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleting ? (
                                <>
                                    <Loader className="w-4 h-4 mr-2" />
                                    Удаление...
                                </>
                            ) : (
                                'Удалить'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminRoute>
    )
}

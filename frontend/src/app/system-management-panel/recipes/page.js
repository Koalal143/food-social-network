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
    ChefHat,
    Eye,
    Trash2,
    ArrowLeft,
    MoreHorizontal,
    User
} from 'lucide-react'
import Link from 'next/link'
import { RecipeCardSkeletonGrid } from '@/components/ui/skeletons'
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

export default function AdminRecipesPage() {
    const { toast } = useToast()
    const [recipes, setRecipes] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [recipeToDelete, setRecipeToDelete] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const ITEMS_PER_PAGE = 20

    const fetchRecipes = useCallback(async (page = 0, search = '') => {
        try {
            setLoading(true)
            const offset = page * ITEMS_PER_PAGE

            // Используем AdminService который работает с существующими endpoints
            const response = await AdminService.getAllRecipes(offset, ITEMS_PER_PAGE, search)

            setRecipes(response.data || [])
            setTotalCount(response.totalCount || 0)
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка загрузки рецептов",
                description: message,
            })
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchRecipes(currentPage, searchQuery)
    }, [fetchRecipes, currentPage, searchQuery])

    const handleSearch = (e) => {
        e.preventDefault()
        setCurrentPage(0)
        fetchRecipes(0, searchQuery)
    }

    const handleDeleteClick = (recipe) => {
        setRecipeToDelete(recipe)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!recipeToDelete) return

        try {
            setDeleting(true)
            // Используем AdminService который работает с существующим endpoint
            await AdminService.deleteRecipe(recipeToDelete.id)

            toast({
                title: "Рецепт удален",
                description: `Рецепт "${recipeToDelete.title}" был успешно удален.`,
            })

            // Обновляем список рецептов
            await fetchRecipes(currentPage, searchQuery)
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка удаления",
                description: message,
            })
        } finally {
            setDeleting(false)
            setDeleteDialogOpen(false)
            setRecipeToDelete(null)
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
                            <Link href="/system-management-panel">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Назад к панели
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Управление рецептами
                                </h1>
                                <p className="text-muted-foreground">
                                    Всего рецептов: {totalCount}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Поиск и фильтры */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Поиск и фильтры
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="flex gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Поиск по названию рецепта..."
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

                    {/* Список рецептов */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ChefHat className="w-5 h-5" />
                                Рецепты
                            </CardTitle>
                            <CardDescription>
                                Страница {currentPage + 1} из {totalPages || 1}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="py-8">
                                    <RecipeCardSkeletonGrid count={6} />
                                </div>
                            ) : recipes.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Рецепты не найдены</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recipes.map((recipe) => (
                                        <div
                                            key={recipe.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                                    {recipe.image_url ? (
                                                        <img
                                                            src={recipe.image_url}
                                                            alt={recipe.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <ChefHat className="w-6 h-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{recipe.title}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <User className="w-4 h-4" />
                                                        {recipe.author?.username || 'Неизвестный автор'}
                                                        <span>•</span>
                                                        <span>ID: {recipe.id}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant={recipe.is_published ? "default" : "secondary"}>
                                                            {recipe.is_published ? "Опубликован" : "Черновик"}
                                                        </Badge>
                                                        {recipe.cooking_time && (
                                                            <Badge variant="outline">
                                                                {recipe.cooking_time} мин
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/recipe/${recipe.slug}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Просмотр
                                                    </Button>
                                                </Link>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteClick(recipe)}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Удалить
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm text-muted-foreground">
                                        Показано {recipes.length} из {totalCount} рецептов
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
            </Container>

            {/* Диалог подтверждения удаления */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить рецепт?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить рецепт "{recipeToDelete?.title}"?
                            Это действие нельзя отменить.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? "Удаление..." : "Удалить"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminRoute>
    )
}
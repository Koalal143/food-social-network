"use client"

import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useRecipes } from '@/context/RecipeContext'
import { useFavorites } from '@/context/FavoritesContext'
import { useRouter } from 'next/navigation'
import { handleApiError } from '@/utils/errorHandler'
import { getServerStatus } from '@/utils/serverHealth'
import { performNetworkDiagnostics, logDiagnostics } from '@/utils/networkDiagnostics'

export default function DeleteRecipeDialog({ recipe, className = "", trigger }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const { deleteRecipe } = useRecipes()
    const { removeFromFavoritesOnDelete } = useFavorites()
    const { toast } = useToast()
    const router = useRouter()

    const handleDelete = async () => {
        if (!recipe?.id) return

        setIsDeleting(true)
        try {
            // Удаляем рецепт
            await deleteRecipe(recipe.id)

            // Удаляем из избранного локально (без API запроса, так как рецепт уже удален)
            removeFromFavoritesOnDelete(recipe.id)

            toast({
                title: "Рецепт удален",
                description: `Рецепт "${recipe.title}" был успешно удален.`,
            })

            setIsOpen(false)

            // Перенаправляем на главную страницу
            router.push('/')

        } catch (error) {
            console.error('DeleteRecipeDialog: Ошибка при удалении рецепта:', error)

            // Выполняем полную диагностику при сетевых ошибках
            if (error.message?.includes('недоступен') || error.name === 'NetworkError' || error.message?.includes('Failed to fetch')) {
                console.log('DeleteRecipeDialog: Выполняем диагностику сети...')
                try {
                    const diagnostics = await performNetworkDiagnostics()
                    logDiagnostics(diagnostics)

                    // Дополнительная проверка состояния сервера
                    const serverStatus = await getServerStatus()
                    console.log('DeleteRecipeDialog: Состояние сервера:', serverStatus)
                } catch (diagnosticsError) {
                    console.error('DeleteRecipeDialog: Не удалось выполнить диагностику:', diagnosticsError)
                }
            }

            const { message, type } = handleApiError(error)

            toast({
                variant: type,
                title: "Ошибка при удалении",
                description: message,
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="destructive"
                        size="sm"
                        className={className}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить рецепт
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        Удалить рецепт?
                    </DialogTitle>
                    <DialogDescription className="text-left">
                        Вы уверены, что хотите удалить рецепт <strong>"{recipe?.title}"</strong>?
                        <br /><br />
                        <span className="text-destructive font-medium">
                            Это действие необратимо.
                        </span> Все данные рецепта, включая ингредиенты, инструкции и изображения, будут удалены навсегда.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isDeleting}
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Удаление...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Удалить навсегда
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

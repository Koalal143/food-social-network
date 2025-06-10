"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { ShoppingBag, Check, CheckSquare, Square, LogIn } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import ShoppingListService from '@/services/shopping-list.service'
import AuthService from '@/services/auth.service'
import { handleApiError } from '@/utils/errorHandler'
import { AuthError } from '@/utils/errors'

export default function AddToShoppingListModal({
    isOpen,
    onClose,
    recipe,
    onNavigateToShoppingList
}) {
    const { toast } = useToast()
    const router = useRouter()
    const [selectedIngredients, setSelectedIngredients] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        if (isOpen) {
            const authenticated = AuthService.isAuthenticated()
            setIsAuthenticated(authenticated)
        }
    }, [isOpen])

    useEffect(() => {
        if (recipe?.ingredients && isOpen && isAuthenticated) {
            const initialSelection = {}
            recipe.ingredients.forEach((_, index) => {
                initialSelection[index] = true
            })
            setSelectedIngredients(initialSelection)
        }
    }, [recipe, isOpen, isAuthenticated])

    useEffect(() => {
        if (!isOpen) {
            setShowConfirmation(false)
            setSelectedIngredients({})
        }
    }, [isOpen])

    const handleIngredientToggle = (index) => {
        setSelectedIngredients(prev => ({
            ...prev,
            [index]: !prev[index]
        }))
    }

    const handleSelectAll = () => {
        const newSelection = {}
        recipe.ingredients.forEach((_, index) => {
            newSelection[index] = true
        })
        setSelectedIngredients(newSelection)
    }

    const handleDeselectAll = () => {
        const newSelection = {}
        recipe.ingredients.forEach((_, index) => {
            newSelection[index] = false
        })
        setSelectedIngredients(newSelection)
    }

    const getSelectedIngredientsCount = () => {
        return Object.values(selectedIngredients).filter(Boolean).length
    }

    const getSelectedIngredients = () => {
        return recipe.ingredients.filter((_, index) => selectedIngredients[index])
    }

    const handleAddToShoppingList = async () => {
        if (!isAuthenticated) {
            return
        }

        const selectedItems = getSelectedIngredients()

        if (selectedItems.length === 0) {
            return
        }

        try {
            setIsLoading(true)
            await ShoppingListService.addIngredients(selectedItems, recipe.title)
            setShowConfirmation(true)

            toast({
                variant: "default",
                title: "Ингредиенты добавлены",
                description: `${selectedItems.length} ингредиент(ов) добавлено в список покупок`,
            })
        } catch (error) {
            if (error instanceof AuthError) {
                setIsAuthenticated(false)
            } else {
                const { message, type } = handleApiError(error)
                toast({
                    variant: type,
                    title: "Ошибка добавления",
                    description: message,
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoToShoppingList = () => {
        onNavigateToShoppingList()
        onClose()
    }

    const handleStayOnRecipe = () => {
        onClose()
    }

    const allSelected = recipe?.ingredients?.length > 0 && 
        getSelectedIngredientsCount() === recipe.ingredients.length
    const noneSelected = getSelectedIngredientsCount() === 0

    if (!recipe) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
                {!isAuthenticated ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                Требуется авторизация
                            </DialogTitle>
                            <DialogDescription>
                                Для добавления ингредиентов в список покупок необходимо войти в систему
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-6">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Войдите в систему, чтобы сохранять ингредиенты в список покупок
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="flex gap-2">
                            <Button variant="outline" onClick={onClose} className="flex-1">
                                Отмена
                            </Button>
                            <Button
                                onClick={() => {
                                    onClose()
                                    router.push('/auth/login')
                                }}
                                className="flex-1"
                            >
                                <LogIn className="w-4 h-4 mr-2" />
                                Войти в систему
                            </Button>
                        </DialogFooter>
                    </>
                ) : !showConfirmation ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                Добавить в список покупок
                            </DialogTitle>
                            <DialogDescription>
                                Выберите ингредиенты из рецепта "{recipe.title}", которые хотите добавить в список покупок
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">
                                        {getSelectedIngredientsCount()} из {recipe.ingredients.length} выбрано
                                    </Badge>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSelectAll}
                                        disabled={allSelected}
                                        className="text-xs"
                                    >
                                        <CheckSquare className="w-3 h-3 mr-1" />
                                        Все
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDeselectAll}
                                        disabled={noneSelected}
                                        className="text-xs"
                                    >
                                        <Square className="w-3 h-3 mr-1" />
                                        Ничего
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                {recipe.ingredients.map((ingredient, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                                            selectedIngredients[index] 
                                                ? 'bg-primary/5 border-primary/20' 
                                                : 'bg-background border-border'
                                        }`}
                                        onClick={() => handleIngredientToggle(index)}
                                    >
                                        <Checkbox
                                            checked={selectedIngredients[index] || false}
                                            onCheckedChange={() => handleIngredientToggle(index)}
                                            className="flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm truncate">
                                                    {ingredient.name}
                                                </span>
                                                {ingredient.quantity && (
                                                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                                        {ingredient.quantity}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter className="flex-shrink-0">
                            <Button variant="outline" onClick={onClose} disabled={isLoading}>
                                Отмена
                            </Button>
                            <Button 
                                onClick={handleAddToShoppingList} 
                                disabled={isLoading || noneSelected}
                                className="min-w-[140px]"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Добавление...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="w-4 h-4 mr-2" />
                                        Добавить ({getSelectedIngredientsCount()})
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-green-600">
                                <Check className="w-5 h-5" />
                                Ингредиенты добавлены!
                            </DialogTitle>
                            <DialogDescription>
                                {getSelectedIngredientsCount()} ингредиент(ов) успешно добавлено в ваш список покупок
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-6">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <Check className="w-8 h-8 text-green-600" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Что хотите сделать дальше?
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="flex gap-2">
                            <Button variant="outline" onClick={handleStayOnRecipe} className="flex-1">
                                Остаться на рецепте
                            </Button>
                            <Button onClick={handleGoToShoppingList} className="flex-1">
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                Перейти к списку
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

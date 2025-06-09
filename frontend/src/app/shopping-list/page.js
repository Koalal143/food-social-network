"use client"

import { useState, useEffect } from 'react'
import Container from '@/components/layout/Container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
    ShoppingCart,
    Search,
    Trash2,
    CheckCircle,
    Circle,
    AlertCircle
} from 'lucide-react'
import ShoppingListService from '@/services/shopping-list.service'
import { handleApiError } from '@/utils/errorHandler'
import IngredientActualityWarning from '@/components/shopping-list/IngredientActualityWarning'
import AddManualIngredientDialog from '@/components/shopping-list/AddManualIngredientDialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function ShoppingListPage() {
    const { toast } = useToast()
    const [items, setItems] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredItems, setFilteredItems] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadShoppingList()

        ShoppingListService.setupAutoSync()
    }, [])

    useEffect(() => {
        const filterItems = async () => {
            if (searchQuery.trim()) {
                const filtered = await ShoppingListService.searchItems(searchQuery)
                setFilteredItems(filtered)
            } else {
                setFilteredItems(items)
            }
        }
        filterItems()
    }, [searchQuery, items])

    const loadShoppingList = async () => {
        try {
            setLoading(true)
            const list = await ShoppingListService.getShoppingList()
            setItems(list)
        } catch (error) {
            console.error('Error loading shopping list:', error)
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка загрузки",
                description: message,
            })
        } finally {
            setLoading(false)
        }
    }

    const handleTogglePurchased = async (itemId) => {
        try {
            const updatedItem = await ShoppingListService.togglePurchased(itemId)
            await loadShoppingList() 

            toast({
                variant: "default",
                title: updatedItem.purchased ? "Отмечено как купленное" : "Отмечено как не купленное",
                description: updatedItem.name,
            })
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка",
                description: message,
            })
        }
    }

    const handleRemoveItem = async (itemId) => {
        try {
            await ShoppingListService.removeItem(itemId)
            await loadShoppingList()

            toast({
                variant: "default",
                title: "Элемент удален",
                description: "Ингредиент удален из списка покупок",
            })
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка удаления",
                description: message,
            })
        }
    }

    const handleClearPurchased = async () => {
        try {
            await ShoppingListService.clearPurchased()
            await loadShoppingList()

            toast({
                variant: "default",
                title: "Купленные элементы удалены",
                description: "Все купленные ингредиенты удалены из списка",
            })
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка очистки",
                description: message,
            })
        }
    }

    const handleClearAll = async () => {
        try {
            await ShoppingListService.clearAll()
            await loadShoppingList()

            toast({
                variant: "default",
                title: "Список очищен",
                description: "Все элементы удалены из списка покупок",
            })
        } catch (error) {
            const { message, type } = handleApiError(error)
            toast({
                variant: type,
                title: "Ошибка очистки",
                description: message,
            })
        }
    }

    const purchasedItems = filteredItems.filter(item => item.purchased)
    const unpurchasedItems = filteredItems.filter(item => !item.purchased)

    if (loading) {
        return (
            <Container>
                <div className="py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-muted-foreground">Загрузка списка покупок...</p>
                        </div>
                    </div>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className="py-4 md:py-8 space-y-4 md:space-y-6">
                {/* Заголовок */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
                            <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0" />
                            <span className="truncate">Список покупок</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
                            Ваши ингредиенты для приготовления рецептов
                        </p>
                    </div>

                    {/* Мобильные кнопки управления */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                        {/* Кнопка добавления ингредиента */}
                        <AddManualIngredientDialog onIngredientAdded={loadShoppingList} />

                        {items.length > 0 && (
                            <div className="flex flex-col sm:flex-row gap-2">
                                {items.some(item => item.purchased) && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span className="hidden sm:inline">Очистить купленные</span>
                                                <span className="sm:hidden">Купленные</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="mx-4 max-w-md">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Удалить купленные элементы?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Это действие удалит все отмеченные как купленные элементы из списка.
                                                    Отменить это действие будет невозможно.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                                <AlertDialogCancel className="w-full sm:w-auto">Отмена</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleClearPurchased} className="w-full sm:w-auto">
                                                    Удалить купленные
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                                            <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" />
                                            <span className="hidden sm:inline">Очистить все</span>
                                            <span className="sm:hidden">Очистить</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="mx-4 max-w-md">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Очистить весь список?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Это действие удалит все элементы из списка покупок.
                                                Отменить это действие будет невозможно.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                            <AlertDialogCancel className="w-full sm:w-auto">Отмена</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleClearAll} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                                                Очистить все
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                </div>

                {/* Поиск */}
                {items.length > 0 && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Поиск по ингредиентам или рецептам..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 md:h-9 text-base md:text-sm"
                        />
                    </div>
                )}

                {/* Список покупок */}
                {items.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 md:py-12 px-4 md:px-6">
                            <div className="text-center">
                                <ShoppingCart className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-base md:text-lg font-medium mb-2">Список покупок пуст</h3>
                                <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
                                    Добавьте ингредиенты из рецептов, чтобы создать список покупок
                                </p>
                                <Button asChild className="w-full sm:w-auto">
                                    <a href="/">Найти рецепты</a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4 md:space-y-6">
                        {/* Не купленные элементы */}
                        {unpurchasedItems.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3 md:pb-6">
                                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                        <Circle className="w-4 h-4 md:w-5 md:h-5 text-orange-500 flex-shrink-0" />
                                        <span>Нужно купить ({unpurchasedItems.length})</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-2 md:space-y-2">
                                        {unpurchasedItems.map((item) => (
                                            <ShoppingListItem
                                                key={item.id}
                                                item={item}
                                                onTogglePurchased={handleTogglePurchased}
                                                onRemove={handleRemoveItem}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Купленные элементы */}
                        {purchasedItems.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3 md:pb-6">
                                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                                        <span>Куплено ({purchasedItems.length})</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-2 md:space-y-2">
                                        {purchasedItems.map((item) => (
                                            <ShoppingListItem
                                                key={item.id}
                                                item={item}
                                                onTogglePurchased={handleTogglePurchased}
                                                onRemove={handleRemoveItem}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {filteredItems.length === 0 && searchQuery && (
                            <Card>
                                <CardContent className="py-6 md:py-8 px-4 md:px-6">
                                    <div className="text-center">
                                        <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <h3 className="text-base md:text-lg font-medium mb-2">Ничего не найдено</h3>
                                        <p className="text-muted-foreground text-sm md:text-base">
                                            По запросу "{searchQuery}" ничего не найдено
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

            </div>
        </Container>
    )
}

// Компонент элемента списка покупок
function ShoppingListItem({ item, onTogglePurchased, onRemove }) {
    return (
        <div className={`flex items-start gap-3 p-3 md:p-3 rounded-lg border transition-colors touch-manipulation ${
            item.purchased
                ? 'bg-green-50 border-green-200 opacity-75'
                : 'bg-background border-border hover:bg-muted/50 active:bg-muted/70'
        }`}>
            {/* Чекбокс с увеличенной областью касания */}
            <div className="flex-shrink-0 pt-0.5">
                <Checkbox
                    checked={item.purchased}
                    onCheckedChange={() => onTogglePurchased(item.id)}
                    className="w-5 h-5 md:w-4 md:h-4 touch-manipulation"
                />
            </div>

            <div className="flex-1 min-w-0">
                {/* Основная информация */}
                <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`font-medium text-base md:text-sm leading-tight ${
                            item.purchased ? 'line-through text-muted-foreground' : ''
                        }`}>
                            {item.name}
                        </span>

                        {/* Предупреждение об актуальности */}
                        <IngredientActualityWarning item={item} />
                    </div>

                    {/* Кнопка удаления с увеличенной областью касания */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(item.id)}
                        className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 active:bg-red-100 p-2 md:p-1 h-8 w-8 md:h-6 md:w-6 touch-manipulation"
                    >
                        <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                    </Button>
                </div>

                {/* Количество */}
                {item.quantity && (
                    <div className="mb-2">
                        <span className="text-sm md:text-xs text-muted-foreground">
                            {item.quantity}
                        </span>
                    </div>
                )}

                {/* Рецепты */}
                {item.recipes && item.recipes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {item.recipes.map((recipe, index) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs md:text-xs px-2 py-0.5 h-auto"
                            >
                                {recipe}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

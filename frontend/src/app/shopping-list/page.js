"use client"

import { useState, useEffect } from 'react'
import Container from '@/components/layout/Container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    Package,
    RotateCcw,
    AlertCircle
} from 'lucide-react'
import ShoppingListService from '@/services/shopping-list.service'
import { handleApiError } from '@/utils/errorHandler'
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
    const [statistics, setStatistics] = useState({})
    const [loading, setLoading] = useState(true)

    // Загрузка данных
    useEffect(() => {
        loadShoppingList()
    }, [])

    // Фильтрация при изменении поискового запроса
    useEffect(() => {
        if (searchQuery.trim()) {
            setFilteredItems(ShoppingListService.searchItems(searchQuery))
        } else {
            setFilteredItems(items)
        }
    }, [searchQuery, items])

    const loadShoppingList = () => {
        try {
            setLoading(true)
            const list = ShoppingListService.getShoppingList()
            const stats = ShoppingListService.getStatistics()
            
            setItems(list)
            setStatistics(stats)
        } catch (error) {
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
            const updatedItem = ShoppingListService.togglePurchased(itemId)
            loadShoppingList() // Перезагружаем список для обновления статистики
            
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
            ShoppingListService.removeItem(itemId)
            loadShoppingList()
            
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
            ShoppingListService.clearPurchased()
            loadShoppingList()
            
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
            ShoppingListService.clearAll()
            loadShoppingList()
            
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
            <div className="py-8 space-y-6">
                {/* Заголовок */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <ShoppingCart className="w-8 h-8" />
                            Список покупок
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Ваши ингредиенты для приготовления рецептов
                        </p>
                    </div>
                    
                    {items.length > 0 && (
                        <div className="flex gap-2">
                            {statistics.purchased > 0 && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Очистить купленные
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Удалить купленные элементы?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Это действие удалит все отмеченные как купленные элементы из списка. 
                                                Отменить это действие будет невозможно.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleClearPurchased}>
                                                Удалить купленные
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                            
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Очистить все
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Очистить весь список?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Это действие удалит все элементы из списка покупок. 
                                            Отменить это действие будет невозможно.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleClearAll} className="bg-red-600 hover:bg-red-700">
                                            Очистить все
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>

                {/* Статистика */}
                {items.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-2xl font-bold">{statistics.total}</p>
                                        <p className="text-xs text-muted-foreground">Всего элементов</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <div>
                                        <p className="text-2xl font-bold">{statistics.purchased}</p>
                                        <p className="text-xs text-muted-foreground">Куплено</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Circle className="w-5 h-5 text-orange-500" />
                                    <div>
                                        <p className="text-2xl font-bold">{statistics.remaining}</p>
                                        <p className="text-xs text-muted-foreground">Осталось купить</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Поиск */}
                {items.length > 0 && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Поиск по ингредиентам или рецептам..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                )}

                {/* Список покупок */}
                {items.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">Список покупок пуст</h3>
                                <p className="text-muted-foreground mb-6">
                                    Добавьте ингредиенты из рецептов, чтобы создать список покупок
                                </p>
                                <Button asChild>
                                    <a href="/">Найти рецепты</a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Не купленные элементы */}
                        {unpurchasedItems.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Circle className="w-5 h-5 text-orange-500" />
                                        Нужно купить ({unpurchasedItems.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
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
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        Куплено ({purchasedItems.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
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
                                <CardContent className="py-8">
                                    <div className="text-center">
                                        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <h3 className="text-lg font-medium mb-2">Ничего не найдено</h3>
                                        <p className="text-muted-foreground">
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
        <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
            item.purchased 
                ? 'bg-green-50 border-green-200 opacity-75' 
                : 'bg-background border-border hover:bg-muted/50'
        }`}>
            <Checkbox
                checked={item.purchased}
                onCheckedChange={() => onTogglePurchased(item.id)}
                className="flex-shrink-0"
            />
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className={`font-medium text-sm ${
                        item.purchased ? 'line-through text-muted-foreground' : ''
                    }`}>
                        {item.name}
                    </span>
                    {item.quantity && (
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {item.quantity}
                        </span>
                    )}
                </div>
                
                {item.recipes && item.recipes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {item.recipes.map((recipe, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                {recipe}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
            
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    )
}

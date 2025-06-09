"use client"

import { useState, useEffect } from 'react'
import Container from '@/components/layout/Container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import ActualityTestPanel from '@/components/shopping-list/ActualityTestPanel'
import IngredientActualityWarning from '@/components/shopping-list/IngredientActualityWarning'
import ShoppingListService from '@/services/shopping-list.service'
import { 
    TestTube, 
    Search, 
    AlertTriangle, 
    CheckCircle, 
    XCircle,
    Eye,
    Smartphone,
    Monitor
} from 'lucide-react'

export default function ShoppingListEdgeCasesPage() {
    const { toast } = useToast()
    const [testItems, setTestItems] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredItems, setFilteredItems] = useState([])
    const [viewMode, setViewMode] = useState('desktop') // desktop | mobile

    useEffect(() => {
        loadTestItems()
    }, [])

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = testItems.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.recipes && item.recipes.some(recipe => 
                    recipe.toLowerCase().includes(searchQuery.toLowerCase())
                ))
            )
            setFilteredItems(filtered)
        } else {
            setFilteredItems(testItems)
        }
    }, [searchQuery, testItems])

    const loadTestItems = () => {
        const allItems = ShoppingListService.getShoppingListFromStorage()
        const testOnlyItems = allItems.filter(item => 
            item.id.startsWith('test_') || 
            item.id.startsWith('search_test_') ||
            item.id.startsWith('invalid_') ||
            item.name.includes('Тестовый') ||
            item.name.includes('Поиск ') ||
            item.name.includes('quantity=') ||
            item.name.includes('Тест объединения')
        )
        setTestItems(testOnlyItems)
    }

    const runValidationTests = async () => {
        const results = []
        
        // Тест 1: Валидация с null quantity
        try {
            const validated = ShoppingListService.validateIngredient({ name: 'Тест', quantity: null })
            results.push({ test: 'null quantity', success: true, result: validated })
        } catch (error) {
            results.push({ test: 'null quantity', success: false, error: error.message })
        }

        // Тест 2: Валидация с пустой строкой
        try {
            const validated = ShoppingListService.validateIngredient({ name: 'Тест', quantity: '' })
            results.push({ test: 'empty quantity', success: true, result: validated })
        } catch (error) {
            results.push({ test: 'empty quantity', success: false, error: error.message })
        }

        // Тест 3: Валидация с пробелами
        try {
            const validated = ShoppingListService.validateIngredient({ name: 'Тест', quantity: '   ' })
            results.push({ test: 'spaces quantity', success: true, result: validated })
        } catch (error) {
            results.push({ test: 'spaces quantity', success: false, error: error.message })
        }

        // Тест 4: Объединение количеств
        const combineTests = [
            { existing: null, new: '100г', expected: '100г' },
            { existing: '', new: '200г', expected: '200г' },
            { existing: '100г', new: null, expected: '100г' },
            { existing: '100г', new: '', expected: '100г' },
            { existing: '   ', new: '200г', expected: '200г' },
            { existing: '100г', new: '200г', expected: '100г, 200г' }
        ]

        combineTests.forEach(test => {
            const result = ShoppingListService.combineQuantities(test.existing, test.new)
            results.push({
                test: `combine ${test.existing} + ${test.new}`,
                success: result === test.expected,
                result,
                expected: test.expected
            })
        })

        console.log('Результаты валидационных тестов:', results)
        
        const successCount = results.filter(r => r.success).length
        const totalCount = results.length
        
        toast({
            variant: successCount === totalCount ? "default" : "destructive",
            title: "Валидационные тесты завершены",
            description: `Пройдено: ${successCount}/${totalCount}`,
        })
    }

    const getItemStatusInfo = (item) => {
        if (item.is_actual === true) {
            return { status: 'Актуальный', color: 'bg-green-100 text-green-800', icon: CheckCircle }
        } else if (item.is_actual === false && item.recipe === null) {
            return { status: 'Рецепт удален', color: 'bg-red-100 text-red-800', icon: XCircle }
        } else if (item.is_actual === false && item.recipe) {
            return { status: 'Рецепт изменен', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
        }
        return { status: 'Неопределенный', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
    }

    return (
        <Container>
            <div className="py-8 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TestTube className="w-6 h-6" />
                            Комплексное тестирование Edge Cases
                            <Badge variant="outline">DEV</Badge>
                        </CardTitle>
                        <CardDescription>
                            Страница для тестирования всех edge cases системы актуальности ингредиентов
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Панель тестирования */}
                <ActualityTestPanel />

                {/* Дополнительные тесты */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            Дополнительные тесты
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Button onClick={runValidationTests} variant="outline" size="sm">
                                Тест валидации
                            </Button>
                            <Button onClick={loadTestItems} variant="outline" size="sm">
                                Обновить список
                            </Button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">Режим просмотра:</span>
                            <div className="flex gap-2">
                                <Button
                                    variant={viewMode === 'desktop' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('desktop')}
                                    className="flex items-center gap-2"
                                >
                                    <Monitor className="w-4 h-4" />
                                    Десктоп
                                </Button>
                                <Button
                                    variant={viewMode === 'mobile' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('mobile')}
                                    className="flex items-center gap-2"
                                >
                                    <Smartphone className="w-4 h-4" />
                                    Мобильный
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Поиск */}
                {testItems.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Тестирование поиска</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Поиск тестовых ингредиентов..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Результаты тестирования */}
                {testItems.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Тестовые ингредиенты ({filteredItems.length})
                            </CardTitle>
                            <CardDescription>
                                Режим: {viewMode === 'desktop' ? 'Десктоп (hover tooltip)' : 'Мобильный (click tooltip)'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={`space-y-3 ${viewMode === 'mobile' ? 'max-w-sm' : ''}`}>
                                {filteredItems.map((item) => {
                                    const statusInfo = getItemStatusInfo(item)
                                    const StatusIcon = statusInfo.icon
                                    
                                    return (
                                        <div key={item.id} className="p-4 border rounded-lg space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium">{item.name}</span>
                                                    <IngredientActualityWarning item={item} />
                                                </div>
                                                <Badge className={statusInfo.color}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {statusInfo.status}
                                                </Badge>
                                            </div>
                                            
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <div>Quantity: "{item.quantity}" (type: {typeof item.quantity})</div>
                                                <div>is_actual: {String(item.is_actual)}</div>
                                                <div>recipe: {JSON.stringify(item.recipe)}</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {testItems.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Нет тестовых данных</h3>
                            <p className="text-gray-600 mb-4">
                                Используйте панель тестирования выше для создания тестовых ингредиентов
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Container>
    )
}

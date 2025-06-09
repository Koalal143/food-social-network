"use client"

import { useState, useEffect } from 'react'
import Container from '@/components/layout/Container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
    TestTube, 
    Database, 
    Cloud, 
    RefreshCw,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react'
import ShoppingListService from '@/services/shopping-list.service'
import ShoppingListAPI from '@/services/api/shopping-list.api'
import ShoppingListMigration from '@/services/utils/shopping-list-migration'

export default function ShoppingListAPITestPage() {
    const { toast } = useToast()
    const [testResults, setTestResults] = useState([])
    const [isRunning, setIsRunning] = useState(false)
    const [testIngredientName, setTestIngredientName] = useState('Тестовый ингредиент API')
    const [testIngredientQuantity, setTestIngredientQuantity] = useState('1 шт')

    const addTestResult = (test, success, message, data = null) => {
        setTestResults(prev => [...prev, {
            id: Date.now(),
            test,
            success,
            message,
            data,
            timestamp: new Date().toISOString()
        }])
    }

    const clearResults = () => {
        setTestResults([])
    }

    const testAPIConnection = async () => {
        try {
            const isAuth = ShoppingListAPI.isAuthenticated()
            if (!isAuth) {
                addTestResult('API Connection', false, 'Пользователь не авторизован')
                return false
            }

            const { items, total } = await ShoppingListAPI.getShoppingList({ limit: 1 })
            addTestResult('API Connection', true, `Подключение успешно. Всего элементов: ${total}`, { total })
            return true
        } catch (error) {
            addTestResult('API Connection', false, `Ошибка подключения: ${error.message}`)
            return false
        }
    }

    const testCreateItem = async () => {
        try {
            const newItem = await ShoppingListAPI.createItem({
                name: testIngredientName,
                quantity: testIngredientQuantity,
                recipe_ingredient_id: null
            })
            addTestResult('Create Item', true, `Элемент создан с ID: ${newItem.id}`, newItem)
            return newItem
        } catch (error) {
            addTestResult('Create Item', false, `Ошибка создания: ${error.message}`)
            return null
        }
    }

    const testUpdateItem = async (itemId) => {
        try {
            const updatedItem = await ShoppingListAPI.updateItem(itemId, {
                quantity: '2 шт (обновлено)'
            })
            addTestResult('Update Item', true, `Элемент обновлен`, updatedItem)
            return updatedItem
        } catch (error) {
            addTestResult('Update Item', false, `Ошибка обновления: ${error.message}`)
            return null
        }
    }

    const testToggleItem = async (itemId) => {
        try {
            const toggledItem = await ShoppingListAPI.toggleItemPurchased(itemId)
            addTestResult('Toggle Item', true, `Статус изменен на: ${toggledItem.is_purchased ? 'куплено' : 'не куплено'}`, toggledItem)
            return toggledItem
        } catch (error) {
            addTestResult('Toggle Item', false, `Ошибка переключения: ${error.message}`)
            return null
        }
    }

    const testDeleteItem = async (itemId) => {
        try {
            await ShoppingListAPI.deleteItem(itemId)
            addTestResult('Delete Item', true, `Элемент удален`)
            return true
        } catch (error) {
            addTestResult('Delete Item', false, `Ошибка удаления: ${error.message}`)
            return false
        }
    }

    const testServiceIntegration = async () => {
        try {
            const items = await ShoppingListService.getShoppingList()
            addTestResult('Service Get List', true, `Получено ${items.length} элементов через сервис`, { count: items.length })

            const manualItem = await ShoppingListService.addManualIngredient('Тестовый ингредиент (сервис)', '1 кг')
            addTestResult('Service Add Manual', true, `Ручной ингредиент добавлен`, manualItem)

            const searchResults = await ShoppingListService.searchItems('Тестовый')
            addTestResult('Service Search', true, `Найдено ${searchResults.length} элементов`, { count: searchResults.length })

            return true
        } catch (error) {
            addTestResult('Service Integration', false, `Ошибка сервиса: ${error.message}`)
            return false
        }
    }

    const testMigration = async () => {
        try {
            ShoppingListMigration.resetMigrationStatus()

            const testData = [
                {
                    id: 'test_migration_1',
                    name: 'Тестовый элемент миграции 1',
                    quantity: '1 шт',
                    purchased: false,
                    recipes: ['Тестовый рецепт'],
                    addedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    recipe: { id: 1, title: 'Тестовый рецепт' },
                    is_actual: true
                },
                {
                    id: 'test_migration_2',
                    name: 'Тестовый элемент миграции 2',
                    quantity: '2 кг',
                    purchased: false,
                    recipes: [],
                    addedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    recipe: null,
                    is_actual: true
                }
            ]

            ShoppingListService.saveShoppingListToStorage(testData)
            addTestResult('Migration Setup', true, `Добавлено ${testData.length} тестовых элементов в localStorage`)

            const needsMigration = ShoppingListMigration.needsMigration()
            addTestResult('Migration Check', needsMigration, needsMigration ? 'Миграция требуется' : 'Миграция не требуется')

            if (needsMigration) {
                const result = await ShoppingListMigration.migrateToBackend()
                addTestResult('Migration Execute', result.success, 
                    `Мигрировано: ${result.migratedCount}, Ошибки: ${result.errors.length}`, result)
            }

            return true
        } catch (error) {
            addTestResult('Migration Test', false, `Ошибка миграции: ${error.message}`)
            return false
        }
    }

    const runAllTests = async () => {
        setIsRunning(true)
        clearResults()

        try {
            // 1. Тест подключения к API
            const apiConnected = await testAPIConnection()
            if (!apiConnected) {
                addTestResult('All Tests', false, 'Тесты прерваны из-за отсутствия подключения к API')
                return
            }

            // 2. Тест CRUD операций
            const createdItem = await testCreateItem()
            if (createdItem) {
                await testUpdateItem(createdItem.id)
                await testToggleItem(createdItem.id)
                await testDeleteItem(createdItem.id)
            }

            // 3. Тест интеграции сервиса
            await testServiceIntegration()

            // 4. Тест миграции
            await testMigration()

            addTestResult('All Tests', true, 'Все тесты завершены')

            toast({
                variant: "default",
                title: "Тестирование завершено",
                description: "Проверьте результаты ниже",
            })
        } catch (error) {
            addTestResult('All Tests', false, `Критическая ошибка: ${error.message}`)
            toast({
                variant: "destructive",
                title: "Ошибка тестирования",
                description: error.message,
            })
        } finally {
            setIsRunning(false)
        }
    }

    const getStatusIcon = (success) => {
        if (success) return <CheckCircle className="w-4 h-4 text-green-500" />
        return <XCircle className="w-4 h-4 text-red-500" />
    }

    return (
        <Container>
            <div className="py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <TestTube className="w-8 h-8" />
                            Тестирование API интеграции
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Тестирование интеграции списка покупок с backend API
                        </p>
                    </div>
                </div>

                {/* Панель управления */}
                <Card>
                    <CardHeader>
                        <CardTitle>Панель управления</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Название тестового ингредиента</label>
                                <Input
                                    value={testIngredientName}
                                    onChange={(e) => setTestIngredientName(e.target.value)}
                                    placeholder="Название ингредиента"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Количество</label>
                                <Input
                                    value={testIngredientQuantity}
                                    onChange={(e) => setTestIngredientQuantity(e.target.value)}
                                    placeholder="Количество"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={runAllTests}
                                disabled={isRunning}
                                className="flex items-center gap-2"
                            >
                                {isRunning ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <TestTube className="w-4 h-4" />
                                )}
                                Запустить все тесты
                            </Button>
                            <Button variant="outline" onClick={clearResults}>
                                Очистить результаты
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Результаты тестов */}
                {testResults.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Результаты тестов</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {testResults.map((result) => (
                                    <div
                                        key={result.id}
                                        className="flex items-start gap-3 p-3 border rounded-lg"
                                    >
                                        {getStatusIcon(result.success)}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{result.test}</span>
                                                <Badge variant={result.success ? "default" : "destructive"}>
                                                    {result.success ? "PASS" : "FAIL"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {result.message}
                                            </p>
                                            {result.data && (
                                                <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                                                    {JSON.stringify(result.data, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(result.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Container>
    )
}

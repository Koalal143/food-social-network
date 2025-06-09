"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import ShoppingListService from '@/services/shopping-list.service'
import { TestTube, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react'


export default function ActualityTestPanel() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const basicScenarios = [
        {
            id: 'manual',
            title: 'Ручной ингредиент',
            description: 'Ингредиент добавлен вручную (is_actual = true)',
            category: 'basic',
            action: async () => {
                await ShoppingListService.addManualIngredient('Тестовый ингредиент (ручной)', '1 шт')
            }
        },
        {
            id: 'recipe-actual',
            title: 'Актуальный рецепт',
            description: 'Ингредиент из существующего рецепта (is_actual = true)',
            category: 'basic',
            action: async () => {
                const currentList = ShoppingListService.getShoppingListFromStorage()
                const newItem = {
                    id: `test_actual_${Date.now()}`,
                    name: 'Мука (из актуального рецепта)',
                    quantity: '500г',
                    purchased: false,
                    recipes: ['Тестовый рецепт'],
                    addedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    recipe: {
                        id: 123,
                        title: 'Тестовый рецепт'
                    },
                    is_actual: true
                }
                ShoppingListService.saveShoppingListToStorage([...currentList, newItem])
            }
        },
        {
            id: 'recipe-modified',
            title: 'Измененный рецепт',
            description: 'Рецепт существует, но ингредиенты изменились (is_actual = false)',
            category: 'basic',
            action: async () => {
                const currentList = ShoppingListService.getShoppingListFromStorage()
                const newItem = {
                    id: `test_modified_${Date.now()}`,
                    name: 'Сахар (рецепт изменен)',
                    quantity: '200г',
                    purchased: false,
                    recipes: ['Измененный рецепт'],
                    addedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    recipe: {
                        id: 456,
                        title: 'Измененный рецепт'
                    },
                    is_actual: false
                }
                ShoppingListService.saveShoppingListToStorage([...currentList, newItem])
            }
        },
        {
            id: 'recipe-deleted',
            title: 'Удаленный рецепт',
            description: 'Рецепт был удален (is_actual = false, recipe = null)',
            category: 'basic',
            action: async () => {
                const currentList = ShoppingListService.getShoppingListFromStorage()
                const newItem = {
                    id: `test_deleted_${Date.now()}`,
                    name: 'Молоко (рецепт удален)',
                    quantity: '1л',
                    purchased: false,
                    recipes: ['Удаленный рецепт'],
                    addedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    recipe: null,
                    is_actual: false
                }
                ShoppingListService.saveShoppingListToStorage([...currentList, newItem])
            }
        }
    ]

    const quantityEdgeCases = [
        {
            id: 'quantity-null',
            title: 'Quantity = null',
            description: 'Тестирование поведения с quantity = null',
            category: 'quantity',
            action: async () => {
                const currentList = ShoppingListService.getShoppingListFromStorage()
                const newItem = {
                    id: `test_qty_null_${Date.now()}`,
                    name: 'Ингредиент с quantity=null',
                    quantity: null,
                    purchased: false,
                    recipes: ['Тестовый рецепт'],
                    addedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    recipe: { id: 789, title: 'Тестовый рецепт' },
                    is_actual: true
                }
                ShoppingListService.saveShoppingListToStorage([...currentList, newItem])
            }
        },
        {
            id: 'quantity-empty',
            title: 'Quantity = ""',
            description: 'Тестирование поведения с пустой строкой',
            category: 'quantity',
            action: async () => {
                const currentList = ShoppingListService.getShoppingListFromStorage()
                const newItem = {
                    id: `test_qty_empty_${Date.now()}`,
                    name: 'Ингредиент с quantity=""',
                    quantity: '',
                    purchased: false,
                    recipes: ['Тестовый рецепт'],
                    addedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    recipe: { id: 790, title: 'Тестовый рецепт' },
                    is_actual: true
                }
                ShoppingListService.saveShoppingListToStorage([...currentList, newItem])
            }
        },
        {
            id: 'quantity-spaces',
            title: 'Quantity = "   "',
            description: 'Тестирование поведения со строкой из пробелов',
            category: 'quantity',
            action: async () => {
                const currentList = ShoppingListService.getShoppingListFromStorage()
                const newItem = {
                    id: `test_qty_spaces_${Date.now()}`,
                    name: 'Ингредиент с quantity="   "',
                    quantity: '   ',
                    purchased: false,
                    recipes: ['Тестовый рецепт'],
                    addedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    recipe: { id: 791, title: 'Тестовый рецепт' },
                    is_actual: true
                }
                ShoppingListService.saveShoppingListToStorage([...currentList, newItem])
            }
        }
    ]

    const recipeChangeEdgeCases = [
        {
            id: 'recipe-change-simulation',
            title: 'Симуляция изменения рецепта',
            description: 'Создает ингредиент, затем "изменяет" рецепт (is_actual: true → false)',
            category: 'recipe-change',
            action: async () => {
                const currentList = ShoppingListService.getShoppingListFromStorage()
                const actualItem = {
                    id: `test_change_before_${Date.now()}`,
                    name: 'Ингредиент до изменения рецепта',
                    quantity: '300г',
                    purchased: false,
                    recipes: ['Рецепт который изменится'],
                    addedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    recipe: { id: 999, title: 'Рецепт который изменится' },
                    is_actual: true
                }

                const changedItem = {
                    ...actualItem,
                    id: `test_change_after_${Date.now()}`,
                    name: 'Ингредиент после изменения рецепта',
                    is_actual: false,
                    updatedAt: new Date().toISOString()
                }

                ShoppingListService.saveShoppingListToStorage([...currentList, actualItem, changedItem])
            }
        },
        {
            id: 'multiple-ingredients-one-recipe',
            title: 'Несколько ингредиентов из одного рецепта',
            description: 'Тестирует удаление рецепта с несколькими связанными ингредиентами',
            category: 'recipe-change',
            action: async () => {
                const currentList = ShoppingListService.getShoppingListFromStorage()
                const recipeId = 888
                const recipeTitle = 'Рецепт с несколькими ингредиентами'

                const ingredients = [
                    { name: 'Мука (из общего рецепта)', quantity: '500г' },
                    { name: 'Яйца (из общего рецепта)', quantity: '3 шт' },
                    { name: 'Молоко (из общего рецепта)', quantity: '250мл' }
                ]

                const newItems = ingredients.map((ing, index) => ({
                    id: `test_multi_${Date.now()}_${index}`,
                    name: ing.name,
                    quantity: ing.quantity,
                    purchased: false,
                    recipes: [recipeTitle],
                    addedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    recipe: null, 
                    is_actual: false
                }))

                ShoppingListService.saveShoppingListToStorage([...currentList, ...newItems])
            }
        }
    ]

    const additionalEdgeCases = [
        {
            id: 'combine-quantities-test',
            title: 'Тест объединения количеств',
            description: 'Тестирует combineQuantities() с различными значениями',
            category: 'additional',
            action: async () => {
                await ShoppingListService.addManualIngredient('Тест объединения', '100г')
                await ShoppingListService.addManualIngredient('Тест объединения', '200г')
            }
        },
        {
            id: 'search-with-warnings',
            title: 'Поиск с предупреждениями',
            description: 'Создает ингредиенты с разными статусами для тестирования поиска',
            category: 'additional',
            action: async () => {
                const currentList = ShoppingListService.getShoppingListFromStorage()
                const searchTestItems = [
                    {
                        id: `search_test_1_${Date.now()}`,
                        name: 'Поиск актуальный',
                        quantity: '1 шт',
                        purchased: false,
                        recipes: ['Поисковый рецепт'],
                        addedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        recipe: { id: 111, title: 'Поисковый рецепт' },
                        is_actual: true
                    },
                    {
                        id: `search_test_2_${Date.now()}`,
                        name: 'Поиск измененный',
                        quantity: '2 шт',
                        purchased: false,
                        recipes: ['Поисковый рецепт'],
                        addedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        recipe: { id: 111, title: 'Поисковый рецепт' },
                        is_actual: false
                    },
                    {
                        id: `search_test_3_${Date.now()}`,
                        name: 'Поиск удаленный',
                        quantity: '3 шт',
                        purchased: false,
                        recipes: ['Удаленный поисковый рецепт'],
                        addedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        recipe: null,
                        is_actual: false
                    }
                ]
                ShoppingListService.saveShoppingListToStorage([...currentList, ...searchTestItems])
            }
        },
        {
            id: 'invalid-data-test',
            title: 'Тест невалидных данных',
            description: 'Создает ингредиенты с потенциально проблемными данными',
            category: 'additional',
            action: async () => {
                const currentList = ShoppingListService.getShoppingListFromStorage()
                const invalidDataItems = [
                    {
                        id: `invalid_1_${Date.now()}`,
                        name: 'Ингредиент с undefined recipe',
                        quantity: '1 шт',
                        purchased: false,
                        recipes: ['Тестовый рецепт'],
                        addedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        recipe: undefined, 
                        is_actual: false
                    },
                    {
                        id: `invalid_2_${Date.now()}`,
                        name: 'Ингредиент с пустым recipe объектом',
                        quantity: '2 шт',
                        purchased: false,
                        recipes: ['Тестовый рецепт'],
                        addedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        recipe: {}, 
                        is_actual: false
                    }
                ]
                ShoppingListService.saveShoppingListToStorage([...currentList, ...invalidDataItems])
            }
        }
    ]

    const allScenarios = [
        ...basicScenarios,
        ...quantityEdgeCases,
        ...recipeChangeEdgeCases,
        ...additionalEdgeCases
    ]

    const handleTestScenario = async (scenario) => {
        try {
            setLoading(true)
            await scenario.action()
            
            toast({
                variant: "default",
                title: "Тестовый сценарий выполнен",
                description: scenario.title,
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка тестирования",
                description: error.message,
            })
        } finally {
            setLoading(false)
        }
    }

    const runAllTests = async () => {
        try {
            setLoading(true)
            let successCount = 0
            let errorCount = 0

            for (const scenario of allScenarios) {
                try {
                    await scenario.action()
                    successCount++
                    await new Promise(resolve => setTimeout(resolve, 100))
                } catch (error) {
                    console.error(`Ошибка в тесте ${scenario.title}:`, error)
                    errorCount++
                }
            }

            toast({
                variant: errorCount > 0 ? "destructive" : "default",
                title: "Все тесты выполнены",
                description: `Успешно: ${successCount}, Ошибок: ${errorCount}`,
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка выполнения тестов",
                description: error.message,
            })
        } finally {
            setLoading(false)
        }
    }

    const clearTestData = async () => {
        try {
            setLoading(true)
            const currentList = ShoppingListService.getShoppingListFromStorage()
            const filteredList = currentList.filter(item =>
                !item.id.startsWith('test_') &&
                !item.id.startsWith('search_test_') &&
                !item.id.startsWith('invalid_') &&
                !item.name.includes('Тестовый') &&
                !item.name.includes('(ручной)') &&
                !item.name.includes('(рецепт изменен)') &&
                !item.name.includes('(рецепт удален)') &&
                !item.name.includes('Поиск ') &&
                !item.name.includes('Тест объединения') &&
                !item.name.includes('quantity=') &&
                !item.name.includes('из актуального рецепта') &&
                !item.name.includes('из общего рецепта') &&
                !item.name.includes('до изменения') &&
                !item.name.includes('после изменения') &&
                !item.name.includes('с undefined') &&
                !item.name.includes('с пустым')
            )
            ShoppingListService.saveShoppingListToStorage(filteredList)

            toast({
                variant: "default",
                title: "Тестовые данные очищены",
                description: "Все тестовые ингредиенты удалены",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка очистки",
                description: error.message,
            })
        } finally {
            setLoading(false)
        }
    }

    if (process.env.NODE_ENV !== 'development') {
        return null
    }

    return (
        <Card className="border-dashed border-amber-300 bg-amber-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                    <TestTube className="w-5 h-5" />
                    Тестирование актуальности ингредиентов
                    <Badge variant="outline" className="text-xs">DEV</Badge>
                </CardTitle>
                <CardDescription className="text-amber-700">
                    Панель для тестирования различных сценариев актуальности ингредиентов
                </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
                {/* Основные сценарии */}
                <div>
                    <h4 className="font-medium text-sm mb-3 text-amber-800">Основные сценарии</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {basicScenarios.map((scenario) => (
                            <Button
                                key={scenario.id}
                                variant="outline"
                                size="sm"
                                onClick={() => handleTestScenario(scenario)}
                                disabled={loading}
                                className="h-auto p-3 text-left justify-start flex-col items-start"
                            >
                                <div className="font-medium text-sm">{scenario.title}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {scenario.description}
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Edge cases для quantity */}
                <div>
                    <h4 className="font-medium text-sm mb-3 text-amber-800">Edge Cases: Quantity</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {quantityEdgeCases.map((scenario) => (
                            <Button
                                key={scenario.id}
                                variant="outline"
                                size="sm"
                                onClick={() => handleTestScenario(scenario)}
                                disabled={loading}
                                className="h-auto p-3 text-left justify-start flex-col items-start border-orange-200 hover:border-orange-300"
                            >
                                <div className="font-medium text-sm">{scenario.title}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {scenario.description}
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Edge cases для изменения рецептов */}
                <div>
                    <h4 className="font-medium text-sm mb-3 text-amber-800">Edge Cases: Изменение рецептов</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {recipeChangeEdgeCases.map((scenario) => (
                            <Button
                                key={scenario.id}
                                variant="outline"
                                size="sm"
                                onClick={() => handleTestScenario(scenario)}
                                disabled={loading}
                                className="h-auto p-3 text-left justify-start flex-col items-start border-blue-200 hover:border-blue-300"
                            >
                                <div className="font-medium text-sm">{scenario.title}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {scenario.description}
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Дополнительные edge cases */}
                <div>
                    <h4 className="font-medium text-sm mb-3 text-amber-800">Дополнительные Edge Cases</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {additionalEdgeCases.map((scenario) => (
                            <Button
                                key={scenario.id}
                                variant="outline"
                                size="sm"
                                onClick={() => handleTestScenario(scenario)}
                                disabled={loading}
                                className="h-auto p-3 text-left justify-start flex-col items-start border-purple-200 hover:border-purple-300"
                            >
                                <div className="font-medium text-sm">{scenario.title}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {scenario.description}
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-amber-200">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={runAllTests}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <TestTube className="w-4 h-4" />
                        Запустить все тесты
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={clearTestData}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Очистить тестовые данные
                    </Button>
                </div>

                <div className="text-xs text-amber-600 bg-amber-100 p-3 rounded space-y-2">
                    <div><strong>Инструкция по тестированию:</strong></div>
                    <div>1. <strong>Основные сценарии:</strong> Проверьте базовую функциональность</div>
                    <div>2. <strong>Quantity Edge Cases:</strong> Тестируйте поведение с null, "", "   "</div>
                    <div>3. <strong>Recipe Changes:</strong> Проверьте изменение статуса is_actual</div>
                    <div>4. <strong>Дополнительные:</strong> Тестируйте поиск и невалидные данные</div>
                    <div className="mt-2 pt-2 border-t border-amber-200">
                        <strong>Проверьте на:</strong> Десктоп (hover tooltip) и мобильных (click tooltip)
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

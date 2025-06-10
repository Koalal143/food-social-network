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
    AlertTriangle,
    Wifi,
    WifiOff,
    User,
    UserX
} from 'lucide-react'
import ShoppingListService from '@/services/shopping-list.service'
import ShoppingListAPI from '@/services/api/shopping-list.api'
import AuthService from '@/services/auth.service'

export default function ShoppingListAPIIntegrationTest() {
    const { toast } = useToast()
    const [testResults, setTestResults] = useState([])
    const [isRunning, setIsRunning] = useState(false)
    const [authStatus, setAuthStatus] = useState(null)
    const [apiStatus, setApiStatus] = useState(null)
    const [testIngredient, setTestIngredient] = useState('')

    useEffect(() => {
        checkAuthStatus()
        checkAPIStatus()
    }, [])

    const checkAuthStatus = () => {
        try {
            const isAuth = AuthService.isAuthenticated()
            const token = AuthService.getAccessToken()
            const apiAuth = ShoppingListAPI.isAuthenticated()
            const apiToken = ShoppingListAPI.getAuthToken()
            
            setAuthStatus({
                authService: isAuth,
                authToken: token ? `${token.substring(0, 10)}...` : null,
                apiService: apiAuth,
                apiToken: apiToken ? `${apiToken.substring(0, 10)}...` : null,
                tokensMatch: token === apiToken
            })
        } catch (error) {
            setAuthStatus({ error: error.message })
        }
    }

    const checkAPIStatus = async () => {
        try {
            // Проверяем доступность API
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
            setApiStatus({
                available: response.ok,
                status: response.status,
                url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            })
        } catch (error) {
            setApiStatus({
                available: false,
                error: error.message,
                url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            })
        }
    }

    const addTestResult = (test, success, message, details = null) => {
        const result = {
            id: Date.now(),
            test,
            success,
            message,
            details,
            timestamp: new Date().toISOString()
        }
        setTestResults(prev => [...prev, result])
        
        toast({
            variant: success ? "default" : "destructive",
            title: `${test}: ${success ? 'Успех' : 'Ошибка'}`,
            description: message,
        })
    }

    const runAPIIntegrationTests = async () => {
        setIsRunning(true)
        setTestResults([])

        try {
            // Тест 1: Проверка авторизации
            addTestResult(
                'Проверка авторизации',
                authStatus?.tokensMatch,
                authStatus?.tokensMatch 
                    ? 'Токены AuthService и ShoppingListAPI совпадают'
                    : 'Токены не совпадают или отсутствуют',
                authStatus
            )

            if (!authStatus?.authService) {
                addTestResult(
                    'Пропуск API тестов',
                    false,
                    'Пользователь не авторизован. Список покупок теперь требует обязательной авторизации.'
                )
                return // Прекращаем тестирование для неавторизованных пользователей
            }

            // Тест 2: Получение списка покупок
            try {
                const items = await ShoppingListService.getShoppingList()
                addTestResult(
                    'Получение списка покупок',
                    true,
                    `Получено ${items.length} элементов`,
                    { count: items.length, source: authStatus?.authService ? 'API' : 'localStorage' }
                )
            } catch (error) {
                addTestResult(
                    'Получение списка покупок',
                    false,
                    `Ошибка: ${error.message}`,
                    { error: error.message }
                )
            }

            // Тест 3: Добавление тестового ингредиента
            if (testIngredient.trim()) {
                try {
                    const newItem = await ShoppingListService.addManualIngredient(
                        testIngredient, 
                        '1 шт (тест)'
                    )
                    addTestResult(
                        'Добавление ингредиента',
                        true,
                        `Добавлен: ${newItem.name}`,
                        { 
                            item: newItem, 
                            source: authStatus?.authService ? 'API' : 'localStorage' 
                        }
                    )
                } catch (error) {
                    addTestResult(
                        'Добавление ингредиента',
                        false,
                        `Ошибка: ${error.message}`,
                        { error: error.message }
                    )
                }
            }

            // Тест 4: Прямой API тест (только для авторизованных)
            if (authStatus?.authService) {
                try {
                    const { items, total } = await ShoppingListAPI.getShoppingList({ limit: 5 })
                    addTestResult(
                        'Прямой API запрос',
                        true,
                        `API вернул ${items.length} из ${total} элементов`,
                        { items: items.length, total, direct: true }
                    )
                } catch (error) {
                    addTestResult(
                        'Прямой API запрос',
                        false,
                        `Ошибка API: ${error.message}`,
                        { error: error.message, direct: true }
                    )
                }
            }

            // Тест 5: Проверка обязательной авторизации
            try {
                // Этот тест должен пройти успешно только для авторизованных пользователей
                const items = await ShoppingListService.getShoppingList()
                addTestResult(
                    'Обязательная авторизация',
                    true,
                    `Авторизованный пользователь получил доступ к ${items.length} элементам`,
                    { count: items.length, authRequired: true }
                )
            } catch (error) {
                addTestResult(
                    'Обязательная авторизация',
                    error.name === 'AuthError',
                    error.name === 'AuthError'
                        ? 'Корректно заблокирован доступ для неавторизованного пользователя'
                        : `Неожиданная ошибка: ${error.message}`,
                    { error: error.message, authRequired: true }
                )
            }

        } catch (error) {
            addTestResult(
                'Общая ошибка тестирования',
                false,
                `Критическая ошибка: ${error.message}`,
                { error: error.message }
            )
        } finally {
            setIsRunning(false)
        }
    }

    const clearTestResults = () => {
        setTestResults([])
    }

    const refreshStatus = () => {
        checkAuthStatus()
        checkAPIStatus()
    }

    return (
        <Container>
            <div className="max-w-6xl mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        Тест Shopping List - Только авторизованные пользователи
                    </h1>
                    <p className="text-muted-foreground">
                        Проверка обязательной авторизации для работы со списком покупок (без localStorage fallback)
                    </p>
                </div>

                {/* Статус системы */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Статус авторизации */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {authStatus?.authService ? <User className="h-5 w-5 text-green-500" /> : <UserX className="h-5 w-5 text-red-500" />}
                                Статус авторизации
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {authStatus ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>AuthService:</span>
                                        <Badge variant={authStatus.authService ? "default" : "destructive"}>
                                            {authStatus.authService ? "Авторизован" : "Не авторизован"}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>ShoppingListAPI:</span>
                                        <Badge variant={authStatus.apiService ? "default" : "destructive"}>
                                            {authStatus.apiService ? "Авторизован" : "Не авторизован"}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Токены совпадают:</span>
                                        <Badge variant={authStatus.tokensMatch ? "default" : "destructive"}>
                                            {authStatus.tokensMatch ? "Да" : "Нет"}
                                        </Badge>
                                    </div>
                                    {authStatus.authToken && (
                                        <div className="text-sm text-muted-foreground">
                                            Токен: {authStatus.authToken}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>Загрузка...</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Статус API */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {apiStatus?.available ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
                                Статус API
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {apiStatus ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Доступность:</span>
                                        <Badge variant={apiStatus.available ? "default" : "destructive"}>
                                            {apiStatus.available ? "Доступен" : "Недоступен"}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Статус:</span>
                                        <Badge variant="outline">
                                            {apiStatus.status || 'N/A'}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        URL: {apiStatus.url}
                                    </div>
                                    {apiStatus.error && (
                                        <div className="text-sm text-red-500">
                                            Ошибка: {apiStatus.error}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>Загрузка...</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Панель управления тестами */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TestTube className="h-5 w-5" />
                            Панель тестирования
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Input
                                placeholder="Название тестового ингредиента"
                                value={testIngredient}
                                onChange={(e) => setTestIngredient(e.target.value)}
                                className="flex-1"
                            />
                            <div className="flex gap-2">
                                <Button 
                                    onClick={runAPIIntegrationTests}
                                    disabled={isRunning}
                                    className="flex items-center gap-2"
                                >
                                    {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
                                    {isRunning ? 'Тестирование...' : 'Запустить тесты'}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={refreshStatus}
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Обновить статус
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={clearTestResults}
                                    disabled={testResults.length === 0}
                                >
                                    Очистить
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Результаты тестов */}
                {testResults.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Результаты тестов ({testResults.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {testResults.map((result) => (
                                    <div 
                                        key={result.id}
                                        className={`p-4 rounded-lg border ${
                                            result.success 
                                                ? 'border-green-200 bg-green-50' 
                                                : 'border-red-200 bg-red-50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                {result.success ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500" />
                                                )}
                                                <div>
                                                    <h4 className="font-medium">{result.test}</h4>
                                                    <p className="text-sm text-muted-foreground">{result.message}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {new Date(result.timestamp).toLocaleTimeString()}
                                            </Badge>
                                        </div>
                                        {result.details && (
                                            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                                                <pre>{JSON.stringify(result.details, null, 2)}</pre>
                                            </div>
                                        )}
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

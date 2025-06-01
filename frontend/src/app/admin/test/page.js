"use client"

import { useState } from 'react'
import AdminRoute from '@/components/auth/AdminRoute'
import Container from '@/components/layout/Container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { handleApiError } from '@/utils/errorHandler'
import AdminService from '@/services/admin.service'
import { ArrowLeft, TestTube } from 'lucide-react'
import Link from 'next/link'

export default function AdminTestPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState(null)

    const testEndpoints = async () => {
        setLoading(true)
        setResults({})

        const tests = [
            {
                name: 'Статистика',
                test: () => AdminService.getStatistics()
            },
            {
                name: 'Список пользователей',
                test: () => AdminService.getAllUsers(0, 5)
            },
            {
                name: 'Список рецептов',
                test: () => AdminService.getAllRecipes(0, 5)
            }
        ]

        const testResults = {}

        for (const test of tests) {
            try {
                const result = await test.test()
                testResults[test.name] = {
                    success: true,
                    data: result
                }
                toast({
                    title: `✅ ${test.name}`,
                    description: "Тест прошел успешно",
                })
            } catch (error) {
                const { message } = handleApiError(error)
                testResults[test.name] = {
                    success: false,
                    error: message
                }
                toast({
                    variant: "destructive",
                    title: `❌ ${test.name}`,
                    description: message,
                })
            }
        }

        setResults(testResults)
        setLoading(false)
    }

    return (
        <AdminRoute>
            <Container>
                <div className="py-8 space-y-6">
                    {/* Заголовок и навигация */}
                    <div className="flex items-center gap-4">
                        <Link href="/admin">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Назад к панели
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Тестирование API
                            </h1>
                            <p className="text-muted-foreground">
                                Проверка работоспособности админских endpoints
                            </p>
                        </div>
                    </div>

                    {/* Кнопка запуска тестов */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TestTube className="w-5 h-5" />
                                Запуск тестов
                            </CardTitle>
                            <CardDescription>
                                Нажмите кнопку для проверки работы с существующими API endpoints
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={testEndpoints}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? "Выполняется тестирование..." : "Запустить тесты"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Результаты тестов */}
                    {results && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Результаты тестирования</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(results).map(([testName, result]) => (
                                        <div
                                            key={testName}
                                            className={`p-4 rounded-lg border ${
                                                result.success
                                                    ? 'border-green-200 bg-green-50'
                                                    : 'border-red-200 bg-red-50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold">
                                                    {result.success ? '✅' : '❌'} {testName}
                                                </h3>
                                                <span className={`text-sm ${
                                                    result.success ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {result.success ? 'Успешно' : 'Ошибка'}
                                                </span>
                                            </div>
                                            {result.error && (
                                                <p className="text-sm text-red-600 mt-2">
                                                    {result.error}
                                                </p>
                                            )}
                                            {result.success && result.data && (
                                                <details className="mt-2">
                                                    <summary className="text-sm text-gray-600 cursor-pointer">
                                                        Показать данные
                                                    </summary>
                                                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                                                        {JSON.stringify(result.data, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </Container>
        </AdminRoute>
    )
}
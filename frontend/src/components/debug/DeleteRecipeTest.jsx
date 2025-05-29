"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { runDeleteRecipeDiagnostics } from '@/utils/deleteRecipeDiagnostics'
import RecipesService from '@/services/recipes.service'
import AuthService from '@/services/auth.service'

export default function DeleteRecipeTest() {
    const [recipeId, setRecipeId] = useState('')
    const [isRunning, setIsRunning] = useState(false)
    const [results, setResults] = useState(null)
    const { toast } = useToast()

    const runDiagnostics = async () => {
        if (!recipeId) {
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: "Введите ID рецепта",
            })
            return
        }

        setIsRunning(true)
        try {
            console.log('🔍 Запуск диагностики удаления рецепта...')
            const diagnosticsResults = await runDeleteRecipeDiagnostics(parseInt(recipeId))
            setResults(diagnosticsResults)
            
            toast({
                title: "Диагностика завершена",
                description: `Пройдено: ${diagnosticsResults.summary.passed}, Провалено: ${diagnosticsResults.summary.failed}`,
            })
        } catch (error) {
            console.error('Ошибка при запуске диагностики:', error)
            toast({
                variant: "destructive",
                title: "Ошибка диагностики",
                description: error.message,
            })
        } finally {
            setIsRunning(false)
        }
    }

    const testDeleteRecipe = async () => {
        if (!recipeId) {
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: "Введите ID рецепта",
            })
            return
        }

        setIsRunning(true)
        try {
            console.log('🧪 Тестирование удаления рецепта...')
            await RecipesService.deleteRecipe(parseInt(recipeId))
            
            toast({
                title: "Успех",
                description: "Рецепт успешно удален",
            })
        } catch (error) {
            console.error('Ошибка при удалении рецепта:', error)
            toast({
                variant: "destructive",
                title: "Ошибка удаления",
                description: error.message,
            })
        } finally {
            setIsRunning(false)
        }
    }

    const checkAuth = () => {
        const token = AuthService.getAccessToken()
        if (token) {
            toast({
                title: "Токен найден",
                description: `Токен: ${token.substring(0, 20)}...`,
            })
        } else {
            toast({
                variant: "destructive",
                title: "Токен не найден",
                description: "Пожалуйста, войдите в систему",
            })
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>🔧 Тестирование удаления рецептов</CardTitle>
                <CardDescription>
                    Инструмент для диагностики и тестирования функциональности удаления рецептов
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        type="number"
                        placeholder="ID рецепта"
                        value={recipeId}
                        onChange={(e) => setRecipeId(e.target.value)}
                        className="flex-1"
                    />
                    <Button onClick={checkAuth} variant="outline">
                        Проверить токен
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button 
                        onClick={runDiagnostics} 
                        disabled={isRunning}
                        className="flex-1"
                    >
                        {isRunning ? 'Выполняется...' : '🔍 Запустить диагностику'}
                    </Button>
                    <Button 
                        onClick={testDeleteRecipe} 
                        disabled={isRunning}
                        variant="destructive"
                        className="flex-1"
                    >
                        {isRunning ? 'Удаление...' : '🗑️ Тестовое удаление'}
                    </Button>
                </div>

                {results && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold mb-2">Результаты диагностики:</h3>
                        <div className="text-sm space-y-1">
                            <div>✅ Пройдено: {results.summary.passed}</div>
                            <div>❌ Провалено: {results.summary.failed}</div>
                            <div>📋 Всего тестов: {results.summary.total}</div>
                        </div>
                        
                        <details className="mt-2">
                            <summary className="cursor-pointer font-medium">Подробные результаты</summary>
                            <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-60">
                                {JSON.stringify(results, null, 2)}
                            </pre>
                        </details>
                    </div>
                )}

                <div className="text-xs text-gray-500 mt-4">
                    <p>💡 Советы:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Сначала запустите диагностику для проверки всех компонентов</li>
                        <li>Убедитесь, что вы авторизованы и имеете права на удаление рецепта</li>
                        <li>Проверьте консоль браузера для подробных логов</li>
                        <li>Тестовое удаление фактически удалит рецепт!</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}

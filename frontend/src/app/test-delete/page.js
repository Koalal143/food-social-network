"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Container from '@/components/layout/Container';
import { useToast } from '@/hooks/use-toast';

export default function TestDeletePage() {
    const [recipeId, setRecipeId] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { toast } = useToast();

    const createTestUser = async () => {
        setIsLoggingIn(true);
        try {
            const testUser = {
                username: "testuser",
                email: "test@example.com", 
                password: "testpassword123",
                first_name: "Тест",
                last_name: "Пользователь"
            };

            // Попытка регистрации
            try {
                const registerResponse = await fetch('http://localhost:8000/v1/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testUser)
                });
                
                if (registerResponse.ok) {
                    toast({
                        title: "Пользователь зарегистрирован",
                        description: "Тестовый пользователь успешно создан"
                    });
                }
            } catch (e) {
                // Игнорируем ошибки регистрации, пользователь может уже существовать
            }

            // Авторизация
            const loginResponse = await fetch('http://localhost:8000/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    username: testUser.username,
                    password: testUser.password
                })
            });

            if (!loginResponse.ok) {
                throw new Error('Ошибка авторизации');
            }

            const tokens = await loginResponse.json();
            localStorage.setItem('access_token', tokens.access_token);
            localStorage.setItem('refresh_token', tokens.refresh_token);

            toast({
                title: "Авторизация успешна",
                description: "Тестовый пользователь авторизован"
            });

            // Перезагружаем страницу для обновления состояния авторизации
            window.location.reload();

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка авторизации",
                description: error.message
            });
        } finally {
            setIsLoggingIn(false);
        }
    };

    const createTestRecipe = async () => {
        setIsCreating(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Необходимо войти в систему');
            }

            const testRecipe = {
                title: "Тестовый рецепт для удаления",
                short_description: "Простой рецепт для тестирования функциональности удаления",
                difficulty: "easy",
                cook_time_minutes: 30,
                tags: [
                    { name: "Тест" },
                    { name: "Завтрак" }
                ],
                ingredients: [
                    {
                        name: "Тестовый ингредиент 1",
                        amount: "100",
                        unit: "г"
                    },
                    {
                        name: "Тестовый ингредиент 2",
                        amount: "2", 
                        unit: "шт"
                    }
                ],
                instructions: [
                    {
                        step_number: 1,
                        description: "Первый шаг приготовления тестового рецепта"
                    },
                    {
                        step_number: 2,
                        description: "Второй шаг приготовления тестового рецепта"
                    }
                ]
            };

            const response = await fetch('http://localhost:8000/v1/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(testRecipe)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Ошибка создания рецепта');
            }

            const recipe = await response.json();
            setRecipeId(recipe.id);

            toast({
                title: "Рецепт создан",
                description: `Тестовый рецепт создан с ID: ${recipe.id}`
            });

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка создания рецепта",
                description: error.message
            });
        } finally {
            setIsCreating(false);
        }
    };

    const openRecipe = () => {
        if (recipeId) {
            window.open(`/recipe/${recipeId}`, '_blank');
        }
    };

    return (
        <Container>
            <div className="max-w-2xl mx-auto py-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Тестирование удаления рецептов</h1>
                    <p className="text-muted-foreground">
                        Используйте эту страницу для создания тестовых данных и проверки функциональности удаления
                    </p>
                </div>

                <div className="space-y-4 p-6 border rounded-lg">
                    <h2 className="text-xl font-semibold">Шаг 1: Авторизация</h2>
                    <p className="text-sm text-muted-foreground">
                        Создайте тестового пользователя и войдите в систему
                    </p>
                    <Button 
                        onClick={createTestUser}
                        disabled={isLoggingIn}
                        className="w-full"
                    >
                        {isLoggingIn ? 'Авторизация...' : 'Создать тестового пользователя и войти'}
                    </Button>
                </div>

                <div className="space-y-4 p-6 border rounded-lg">
                    <h2 className="text-xl font-semibold">Шаг 2: Создание рецепта</h2>
                    <p className="text-sm text-muted-foreground">
                        Создайте тестовый рецепт для проверки удаления
                    </p>
                    <Button 
                        onClick={createTestRecipe}
                        disabled={isCreating}
                        className="w-full"
                    >
                        {isCreating ? 'Создание...' : 'Создать тестовый рецепт'}
                    </Button>
                </div>

                {recipeId && (
                    <div className="space-y-4 p-6 border rounded-lg bg-green-50">
                        <h2 className="text-xl font-semibold text-green-800">Шаг 3: Тестирование</h2>
                        <p className="text-sm text-green-700">
                            Рецепт создан с ID: <strong>{recipeId}</strong>
                        </p>
                        <Button 
                            onClick={openRecipe}
                            className="w-full"
                        >
                            Открыть рецепт для тестирования удаления
                        </Button>
                    </div>
                )}

                <div className="space-y-4 p-6 border rounded-lg bg-blue-50">
                    <h2 className="text-xl font-semibold text-blue-800">Инструкции по тестированию</h2>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                        <li>Нажмите "Создать тестового пользователя и войти"</li>
                        <li>Нажмите "Создать тестовый рецепт"</li>
                        <li>Нажмите "Открыть рецепт для тестирования удаления"</li>
                        <li>На странице рецепта найдите кнопку удаления (🗑️)</li>
                        <li>Нажмите кнопку диагностики (🔍) для проверки</li>
                        <li>Попробуйте удалить рецепт</li>
                    </ol>
                </div>
            </div>
        </Container>
    );
}

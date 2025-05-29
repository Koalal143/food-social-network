/**
 * Диагностический скрипт для проверки функциональности удаления рецептов
 */

import RecipesService from '@/services/recipes.service';
import AuthService from '@/services/auth.service';

export const runDeleteRecipeDiagnostics = async (recipeId) => {
    const results = {
        timestamp: new Date().toISOString(),
        recipeId: recipeId,
        tests: {},
        summary: {
            passed: 0,
            failed: 0,
            total: 0
        }
    };

    console.log('🔍 Запуск диагностики удаления рецепта...');
    console.log(`📋 ID рецепта: ${recipeId}`);

    // Тест 1: Проверка авторизации
    try {
        const token = AuthService.getAccessToken();
        if (token) {
            results.tests.authentication = {
                success: true,
                message: 'Токен авторизации найден',
                token: token.substring(0, 20) + '...'
            };
            console.log('✅ Тест 1: Авторизация - ПРОЙДЕН');
        } else {
            results.tests.authentication = {
                success: false,
                message: 'Токен авторизации не найден'
            };
            console.log('❌ Тест 1: Авторизация - ПРОВАЛЕН');
        }
    } catch (error) {
        results.tests.authentication = {
            success: false,
            message: 'Ошибка при проверке авторизации',
            error: error.message
        };
        console.log('❌ Тест 1: Авторизация - ОШИБКА:', error.message);
    }

    // Тест 2: Проверка существования рецепта
    try {
        const recipe = await RecipesService.getRecipeById(recipeId);
        if (recipe) {
            results.tests.recipeExists = {
                success: true,
                message: 'Рецепт найден',
                recipe: {
                    id: recipe.id,
                    title: recipe.title,
                    author: recipe.author
                }
            };
            console.log('✅ Тест 2: Существование рецепта - ПРОЙДЕН');
            console.log(`📝 Рецепт: "${recipe.title}" (автор: ${recipe.author.username})`);
        } else {
            results.tests.recipeExists = {
                success: false,
                message: 'Рецепт не найден'
            };
            console.log('❌ Тест 2: Существование рецепта - ПРОВАЛЕН');
        }
    } catch (error) {
        results.tests.recipeExists = {
            success: false,
            message: 'Ошибка при получении рецепта',
            error: error.message
        };
        console.log('❌ Тест 2: Существование рецепта - ОШИБКА:', error.message);
    }

    // Тест 3: Проверка метода deleteRecipe
    try {
        if (typeof RecipesService.deleteRecipe === 'function') {
            results.tests.deleteMethodExists = {
                success: true,
                message: 'Метод deleteRecipe существует'
            };
            console.log('✅ Тест 3: Метод deleteRecipe - ПРОЙДЕН');
        } else {
            results.tests.deleteMethodExists = {
                success: false,
                message: 'Метод deleteRecipe не найден'
            };
            console.log('❌ Тест 3: Метод deleteRecipe - ПРОВАЛЕН');
        }
    } catch (error) {
        results.tests.deleteMethodExists = {
            success: false,
            message: 'Ошибка при проверке метода deleteRecipe',
            error: error.message
        };
        console.log('❌ Тест 3: Метод deleteRecipe - ОШИБКА:', error.message);
    }

    // Тест 4: Проверка доступности backend
    try {
        const response = await fetch('http://localhost:8000/docs');
        if (response.ok) {
            results.tests.backendAvailable = {
                success: true,
                message: 'Backend сервер доступен',
                status: response.status
            };
            console.log('✅ Тест 4: Доступность backend - ПРОЙДЕН');
        } else {
            results.tests.backendAvailable = {
                success: false,
                message: 'Backend сервер недоступен',
                status: response.status
            };
            console.log('❌ Тест 4: Доступность backend - ПРОВАЛЕН');
        }
    } catch (error) {
        results.tests.backendAvailable = {
            success: false,
            message: 'Ошибка при проверке backend',
            error: error.message
        };
        console.log('❌ Тест 4: Доступность backend - ОШИБКА:', error.message);
    }

    // Тест 5: Проверка прав доступа к рецепту
    try {
        const token = AuthService.getAccessToken();
        if (token) {
            // Получаем информацию о рецепте для проверки прав
            const recipeResponse = await fetch(`http://localhost:8000/v1/recipes/${recipeId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (recipeResponse.ok) {
                const recipeData = await recipeResponse.json();

                // Получаем информацию о текущем пользователе
                const userResponse = await fetch(`http://localhost:8000/v1/users/me`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    const canDelete = userData.id === recipeData.author.id || userData.is_superuser;

                    results.tests.deletePermissions = {
                        success: canDelete,
                        message: canDelete
                            ? 'У пользователя есть права на удаление рецепта'
                            : 'У пользователя нет прав на удаление рецепта',
                        userInfo: {
                            userId: userData.id,
                            username: userData.username,
                            isSuperuser: userData.is_superuser,
                            authorId: recipeData.author.id,
                            authorUsername: recipeData.author.username
                        }
                    };

                    if (canDelete) {
                        console.log('✅ Тест 5: Права на удаление - ПРОЙДЕН');
                        console.log(`👤 Пользователь: ${userData.username} (ID: ${userData.id})`);
                        console.log(`📝 Автор рецепта: ${recipeData.author.username} (ID: ${recipeData.author.id})`);
                        console.log(`🔑 Суперпользователь: ${userData.is_superuser ? 'Да' : 'Нет'}`);
                    } else {
                        console.log('❌ Тест 5: Права на удаление - ПРОВАЛЕН');
                        console.log(`👤 Пользователь: ${userData.username} (ID: ${userData.id})`);
                        console.log(`📝 Автор рецепта: ${recipeData.author.username} (ID: ${recipeData.author.id})`);
                        console.log(`🔑 Суперпользователь: ${userData.is_superuser ? 'Да' : 'Нет'}`);
                    }
                } else {
                    results.tests.deletePermissions = {
                        success: false,
                        message: 'Не удалось получить информацию о пользователе',
                        status: userResponse.status
                    };
                    console.log('❌ Тест 5: Права на удаление - ОШИБКА (не удалось получить пользователя)');
                }
            } else {
                results.tests.deletePermissions = {
                    success: false,
                    message: 'Не удалось получить информацию о рецепте',
                    status: recipeResponse.status
                };
                console.log('❌ Тест 5: Права на удаление - ОШИБКА (не удалось получить рецепт)');
            }
        } else {
            results.tests.deletePermissions = {
                success: false,
                message: 'Нет токена для проверки прав'
            };
            console.log('❌ Тест 5: Права на удаление - ПРОВАЛЕН (нет токена)');
        }
    } catch (error) {
        results.tests.deletePermissions = {
            success: false,
            message: 'Ошибка при проверке прав доступа',
            error: error.message
        };
        console.log('❌ Тест 5: Права на удаление - ОШИБКА:', error.message);
    }

    // Тест 6: Симуляция DELETE запроса (проверка endpoint)
    try {
        const token = AuthService.getAccessToken();
        if (token && results.tests.deletePermissions?.success) {
            console.log('🧪 Тест 6: Проверка DELETE endpoint (без фактического удаления)...');

            // Делаем OPTIONS запрос для проверки доступности метода DELETE
            const optionsResponse = await fetch(`http://localhost:8000/v1/recipes/${recipeId}`, {
                method: 'OPTIONS',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            results.tests.deleteEndpointAccessible = {
                success: optionsResponse.status === 200 || optionsResponse.status === 204,
                message: `DELETE endpoint доступен (статус OPTIONS: ${optionsResponse.status})`,
                status: optionsResponse.status,
                allowedMethods: optionsResponse.headers.get('Allow') || 'Не указано'
            };

            if (results.tests.deleteEndpointAccessible.success) {
                console.log('✅ Тест 6: DELETE endpoint - ПРОЙДЕН');
                console.log(`📡 Разрешенные методы: ${results.tests.deleteEndpointAccessible.allowedMethods}`);
            } else {
                console.log('❌ Тест 6: DELETE endpoint - ПРОВАЛЕН');
            }
        } else {
            results.tests.deleteEndpointAccessible = {
                success: false,
                message: 'Пропущен из-за отсутствия токена или прав доступа'
            };
            console.log('⏭️ Тест 6: DELETE endpoint - ПРОПУЩЕН (нет токена или прав)');
        }
    } catch (error) {
        results.tests.deleteEndpointAccessible = {
            success: false,
            message: 'Ошибка при проверке DELETE endpoint',
            error: error.message
        };
        console.log('❌ Тест 6: DELETE endpoint - ОШИБКА:', error.message);
    }

    // Подсчет результатов
    Object.values(results.tests).forEach(test => {
        results.summary.total++;
        if (test.success) {
            results.summary.passed++;
        } else {
            results.summary.failed++;
        }
    });

    console.log('\n📊 Результаты диагностики:');
    console.log(`✅ Пройдено: ${results.summary.passed}`);
    console.log(`❌ Провалено: ${results.summary.failed}`);
    console.log(`📋 Всего тестов: ${results.summary.total}`);

    if (results.summary.failed > 0) {
        console.log('\n🔧 Рекомендации по исправлению:');

        if (!results.tests.authentication?.success) {
            console.log('- Войдите в систему для получения токена авторизации');
        }

        if (!results.tests.recipeExists?.success) {
            console.log('- Проверьте, существует ли рецепт с указанным ID');
        }

        if (!results.tests.deleteMethodExists?.success) {
            console.log('- Проверьте реализацию метода deleteRecipe в RecipesService');
        }

        if (!results.tests.backendAvailable?.success) {
            console.log('- Запустите backend сервер на порту 8000');
        }

        if (!results.tests.deletePermissions?.success) {
            console.log('- Проверьте права доступа к рецепту (владелец или администратор)');
        }

        if (!results.tests.deleteEndpointAccessible?.success) {
            console.log('- Проверьте доступность DELETE endpoint на сервере');
        }
    }

    return results;
};

// Функция для быстрого запуска диагностики из консоли браузера
window.runDeleteRecipeDiagnostics = runDeleteRecipeDiagnostics;

export default runDeleteRecipeDiagnostics;
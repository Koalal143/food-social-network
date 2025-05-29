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

    // Тест 5: Симуляция DELETE запроса (без фактического удаления)
    try {
        const token = AuthService.getAccessToken();
        if (token) {
            // Делаем HEAD запрос для проверки доступности endpoint
            const response = await fetch(`http://localhost:8000/v1/recipes/${recipeId}`, {
                method: 'HEAD',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            results.tests.deleteEndpointAccessible = {
                success: response.status !== 404,
                message: `Endpoint доступен (статус: ${response.status})`,
                status: response.status
            };

            if (response.status !== 404) {
                console.log('✅ Тест 5: Доступность DELETE endpoint - ПРОЙДЕН');
            } else {
                console.log('❌ Тест 5: Доступность DELETE endpoint - ПРОВАЛЕН (404)');
            }
        } else {
            results.tests.deleteEndpointAccessible = {
                success: false,
                message: 'Нет токена для проверки endpoint'
            };
            console.log('❌ Тест 5: Доступность DELETE endpoint - ПРОВАЛЕН (нет токена)');
        }
    } catch (error) {
        results.tests.deleteEndpointAccessible = {
            success: false,
            message: 'Ошибка при проверке DELETE endpoint',
            error: error.message
        };
        console.log('❌ Тест 5: Доступность DELETE endpoint - ОШИБКА:', error.message);
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
        
        if (!results.tests.deleteEndpointAccessible?.success) {
            console.log('- Проверьте права доступа к рецепту (владелец или администратор)');
        }
    }

    return results;
};

// Функция для быстрого запуска диагностики из консоли браузера
window.runDeleteRecipeDiagnostics = runDeleteRecipeDiagnostics;

export default runDeleteRecipeDiagnostics;

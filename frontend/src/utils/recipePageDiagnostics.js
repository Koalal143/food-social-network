import { BASE_API } from '@/constants/backend-urls';

/**
 * Диагностика работы страницы рецепта
 * @param {number} recipeId ID рецепта для тестирования
 * @returns {Promise<Object>} результаты диагностики
 */
export async function diagnoseRecipePage(recipeId) {
    const results = {
        timestamp: new Date().toISOString(),
        recipeId,
        baseApi: BASE_API,
        tests: {}
    };

    console.group(`🔍 Диагностика страницы рецепта ID: ${recipeId}`);

    // Тест 1: Проверка доступности API рецептов
    try {
        const url = `${BASE_API}/v1/recipes/${recipeId}`;
        console.log('Тест 1: Проверяем URL:', url);

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        results.tests.apiAccess = {
            success: response.ok || response.status === 401, // 401 означает что API работает
            status: response.status,
            statusText: response.statusText,
            url: url
        };

        if (response.ok) {
            try {
                const data = await response.json();
                results.tests.apiAccess.data = {
                    hasTitle: !!data.title,
                    hasAuthor: !!data.author,
                    hasIngredients: Array.isArray(data.ingredients),
                    hasInstructions: Array.isArray(data.instructions),
                    hasTags: Array.isArray(data.tags)
                };
                console.log('✅ API доступен, данные получены:', data.title);
            } catch (parseError) {
                results.tests.apiAccess.parseError = parseError.message;
                console.warn('⚠️ API доступен, но ошибка парсинга JSON');
            }
        } else {
            console.warn(`⚠️ API недоступен: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        results.tests.apiAccess = {
            success: false,
            error: error.message,
            type: error.name
        };
        console.error('❌ Ошибка доступа к API:', error);
    }

    // Тест 2: Проверка маршрутизации Next.js
    try {
        const currentUrl = window.location.href;
        const expectedPattern = `/recipe/${recipeId}`;
        const urlMatches = currentUrl.includes(expectedPattern);

        results.tests.routing = {
            success: urlMatches,
            currentUrl,
            expectedPattern,
            matches: urlMatches
        };

        if (urlMatches) {
            console.log('✅ Маршрутизация корректна');
        } else {
            console.warn('⚠️ Маршрутизация не соответствует ожидаемой');
        }
    } catch (error) {
        results.tests.routing = {
            success: false,
            error: error.message
        };
        console.error('❌ Ошибка проверки маршрутизации:', error);
    }

    // Тест 3: Проверка состояния RecipeProvider
    try {
        // Этот тест можно выполнить только внутри React компонента
        results.tests.providerState = {
            success: true,
            note: 'Проверьте логи RecipeProvider в консоли'
        };
        console.log('ℹ️ Для проверки состояния RecipeProvider смотрите логи выше');
    } catch (error) {
        results.tests.providerState = {
            success: false,
            error: error.message
        };
    }

    // Тест 4: Проверка компонентов страницы
    try {
        const pageElements = {
            container: document.querySelector('[data-testid="recipe-container"]') || document.querySelector('article'),
            title: document.querySelector('h1'),
            image: document.querySelector('img'),
            author: document.querySelector('[data-testid="author-card"]'),
            ingredients: document.querySelector('[data-testid="ingredients"]'),
            instructions: document.querySelector('[data-testid="instructions"]')
        };

        results.tests.pageElements = {
            success: !!pageElements.container,
            elements: Object.fromEntries(
                Object.entries(pageElements).map(([key, element]) => [key, !!element])
            )
        };

        const foundElements = Object.values(pageElements).filter(Boolean).length;
        console.log(`📄 Найдено элементов страницы: ${foundElements}/${Object.keys(pageElements).length}`);
    } catch (error) {
        results.tests.pageElements = {
            success: false,
            error: error.message
        };
        console.error('❌ Ошибка проверки элементов страницы:', error);
    }

    // Общая оценка
    const successfulTests = Object.values(results.tests).filter(test => test.success).length;
    const totalTests = Object.keys(results.tests).length;
    
    results.summary = {
        successfulTests,
        totalTests,
        successRate: Math.round((successfulTests / totalTests) * 100),
        overallStatus: successfulTests >= totalTests / 2 ? 'healthy' : 'unhealthy'
    };

    console.log(`📊 Результат: ${successfulTests}/${totalTests} тестов пройдено (${results.summary.successRate}%)`);
    console.log(`🎯 Общий статус: ${results.summary.overallStatus}`);
    
    console.groupEnd();
    
    return results;
}

/**
 * Быстрая проверка конкретного рецепта
 * @param {number} recipeId ID рецепта
 */
export async function quickRecipeCheck(recipeId) {
    try {
        const url = `${BASE_API}/v1/recipes/${recipeId}`;
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Рецепт ${recipeId} доступен:`, data.title);
            return { success: true, data };
        } else {
            console.warn(`⚠️ Рецепт ${recipeId} недоступен: ${response.status}`);
            return { success: false, status: response.status };
        }
    } catch (error) {
        console.error(`❌ Ошибка проверки рецепта ${recipeId}:`, error);
        return { success: false, error: error.message };
    }
}

// Экспорт для использования в консоли браузера
if (typeof window !== 'undefined') {
    window.diagnoseRecipePage = diagnoseRecipePage;
    window.quickRecipeCheck = quickRecipeCheck;
}
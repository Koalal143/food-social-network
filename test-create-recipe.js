/**
 * Скрипт для создания тестового рецепта
 * Запустить в консоли браузера после авторизации
 */

async function createTestRecipe() {
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

    try {
        const response = await fetch('http://localhost:8000/v1/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify(testRecipe)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Ошибка создания рецепта:', error);
            return null;
        }

        const recipe = await response.json();
        console.log('✅ Тестовый рецепт создан:', recipe);
        console.log(`🔗 Ссылка на рецепт: http://localhost:3000/recipe/${recipe.id}`);
        return recipe;
    } catch (error) {
        console.error('❌ Ошибка при создании рецепта:', error);
        return null;
    }
}

// Функция для создания тестового пользователя
async function createTestUser() {
    const testUser = {
        username: "testuser",
        email: "test@example.com",
        password: "testpassword123",
        first_name: "Тест",
        last_name: "Пользователь"
    };

    try {
        // Регистрация
        const registerResponse = await fetch('http://localhost:8000/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });

        if (!registerResponse.ok) {
            const error = await registerResponse.json();
            console.log('Пользователь уже существует или ошибка регистрации:', error);
        } else {
            console.log('✅ Пользователь зарегистрирован');
        }

        // Авторизация
        const loginResponse = await fetch('http://localhost:8000/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                username: testUser.username,
                password: testUser.password
            })
        });

        if (!loginResponse.ok) {
            const error = await loginResponse.json();
            console.error('❌ Ошибка авторизации:', error);
            return null;
        }

        const tokens = await loginResponse.json();
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        
        console.log('✅ Пользователь авторизован');
        return tokens;
    } catch (error) {
        console.error('❌ Ошибка при создании пользователя:', error);
        return null;
    }
}

// Основная функция для настройки тестовой среды
async function setupTestEnvironment() {
    console.log('🚀 Настройка тестовой среды...');
    
    // Создаем пользователя и авторизуемся
    const tokens = await createTestUser();
    if (!tokens) {
        console.error('❌ Не удалось создать тестового пользователя');
        return;
    }

    // Создаем тестовый рецепт
    const recipe = await createTestRecipe();
    if (!recipe) {
        console.error('❌ Не удалось создать тестовый рецепт');
        return;
    }

    console.log('🎉 Тестовая среда готова!');
    console.log(`📝 ID рецепта: ${recipe.id}`);
    console.log(`🔗 Ссылка: http://localhost:3000/recipe/${recipe.id}`);
    console.log('');
    console.log('📋 Следующие шаги:');
    console.log('1. Перейдите по ссылке выше');
    console.log('2. Проверьте отображение кнопки удаления');
    console.log('3. Нажмите кнопку 🔍 для диагностики');
    console.log('4. Попробуйте удалить рецепт');

    return recipe;
}

// Экспортируем функции в глобальную область
window.createTestRecipe = createTestRecipe;
window.createTestUser = createTestUser;
window.setupTestEnvironment = setupTestEnvironment;

console.log('📋 Доступные функции:');
console.log('- setupTestEnvironment() - полная настройка тестовой среды');
console.log('- createTestUser() - создание тестового пользователя');
console.log('- createTestRecipe() - создание тестового рецепта');

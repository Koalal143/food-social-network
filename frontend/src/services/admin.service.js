import { BASE_API } from '@/constants/backend-urls';
import AuthService from './auth.service';
import RecipesService from './recipes.service';
import BannedEmailService from './banned-email.service';
import { tokenManager } from '@/utils/tokenManager';
import { AuthError, NetworkError, NotFoundError, ValidationError } from '@/utils/errors';
import { ERROR_MESSAGES } from '@/constants/errors';
import SearchService from './search.service';

class AdminService {
    /**
     * Получить статистику для админ-панели на основе существующих endpoints
     */
    static async getStatistics() {
        try {
            // Получаем статистику рецептов из существующего endpoint
            const recipesResponse = await RecipesService.getPaginatedRecipes(0, 1);

            // Получаем информацию о текущем пользователе для проверки прав
            const currentUser = await AuthService.getCurrentUser();

            // Получаем список заблокированных email для дополнительной статистики
            let bannedEmailsCount = 0;
            try {
                const bannedEmailsResponse = await BannedEmailService.getBannedEmails(0, 1);
                bannedEmailsCount = bannedEmailsResponse.totalCount || 0;
            } catch (error) {
                // Игнорируем ошибки получения заблокированных email
                console.warn('Не удалось получить статистику заблокированных email:', error);
            }

            // Получаем рецепты за сегодня для подсчета
            let recipesTodayCount = 0;
            try {
                recipesTodayCount = await this.getTodayRecipesCount();
            } catch (error) {
                console.warn('Не удалось получить статистику рецептов за сегодня:', error);
            }

            // Базовая статистика на основе доступных данных
            return {
                total_recipes: recipesResponse.totalCount || 0,
                published_recipes: recipesResponse.totalCount || 0, // Все получаемые рецепты опубликованы
                total_users: 0, // Недоступно через существующие endpoints
                active_users: 0, // Недоступно через существующие endpoints
                new_users_this_month: 0, // Недоступно
                new_recipes_this_month: 0, // Недоступно
                new_users_today: 0, // Недоступно
                new_recipes_today: recipesTodayCount, // Подсчитано на frontend
                total_recipe_views: 0, // Недоступно
                total_favorites: 0, // Недоступно
                total_searches: 0, // Недоступно
                banned_emails_count: bannedEmailsCount,
                recent_activity: [],
                current_user: currentUser,
                last_updated: new Date().toISOString(),
                note: 'Статистика основана на доступных endpoints. Для полной статистики требуются дополнительные API.'
            };
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            if (error instanceof AuthError || error instanceof NetworkError) {
                throw error;
            }
            throw new NetworkError('Ошибка получения статистики');
        }
    }

    /**
     * Подсчитать количество рецептов, созданных сегодня
     * Использует существующий endpoint с фильтрацией на frontend
     */
    static async getTodayRecipesCount() {
        try {
            // Получаем начало текущего дня в часовом поясе пользователя
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            // Получаем достаточно рецептов для анализа (последние 100)
            // В реальном приложении можно увеличить лимит или использовать пагинацию
            const recipesResponse = await RecipesService.getPaginatedRecipes(0, 100);

            if (!recipesResponse.data || !Array.isArray(recipesResponse.data)) {
                return 0;
            }

            // Фильтруем рецепты, созданные сегодня
            const todayRecipes = recipesResponse.data.filter(recipe => {
                if (!recipe.created_at) return false;

                const recipeDate = new Date(recipe.created_at);
                return recipeDate >= startOfDay;
            });

            return todayRecipes.length;
        } catch (error) {
            console.error('Ошибка при подсчете рецептов за сегодня:', error);
            return 0;
        }
    }

    /**
     * Получить список пользователей (заглушка - нет подходящего endpoint)
     * В реальной системе нужен специальный endpoint для админов
     */
    static async getAllUsers(offset = 0, limit = 20, search = '') {
        // Возвращаем заглушку, так как нет подходящего endpoint
        // В реальной системе администратор должен иметь доступ к списку всех пользователей
        return {
            data: [],
            totalCount: 0,
            message: "Для получения списка пользователей требуется специальный админский endpoint"
        };
    }

    /**
     * Получить список всех рецептов используя существующий endpoint
     */
    static async getAllRecipes(offset = 0, limit = 20, search = '', status = 'all') {
        try {
            // Используем существующий endpoint для получения рецептов
            if (search) {
                // Если есть поиск, используем search endpoint
                // const searchParams = {
                //     query: search,
                //     offset: offset,
                //     limit: limit
                // };
                return await SearchService.searchRecipes(query=search, offset=offset, limit=limit);
            } else {
                // Иначе используем обычный endpoint для получения рецептов
                return await RecipesService.getPaginatedRecipes(offset, limit);
            }
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }

    /**
     * Заблокировать/разблокировать пользователя (заглушка - нет подходящего endpoint)
     */
    static async toggleUserStatus(userId, isActive) {
        // Возвращаем заглушку, так как нет подходящего endpoint
        // В реальной системе нужен специальный endpoint для изменения статуса пользователей
        throw new Error('Для изменения статуса пользователей требуется специальный админский endpoint');
    }

    /**
     * Удалить рецепт используя существующий endpoint
     * Админ может удалить любой рецепт благодаря проверке is_superuser на бэкенде
     */
    static async deleteRecipe(recipeId) {
        // Используем существующий endpoint для удаления рецептов
        // Бэкенд уже проверяет права: владелец рецепта ИЛИ суперпользователь
        return await RecipesService.deleteRecipe(recipeId);
    }
}

export default AdminService;
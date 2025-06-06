import { BASE_API } from '@/constants/backend-urls';
import AuthService from './auth.service';
import RecipesService from './recipes.service';
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

            // Базовая статистика на основе доступных данных
            return {
                total_recipes: recipesResponse.totalCount || 0,
                total_users: 0, // Недоступно через существующие endpoints
                active_users: 0, // Недоступно через существующие endpoints
                recent_activity: [],
                current_user: currentUser
            };
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
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
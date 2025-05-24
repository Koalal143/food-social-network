import { BASE_API } from "@/constants/backend-urls";
import { tokenManager } from "@/utils/tokenManager";
import AuthService from "./auth.service";
import { AuthError, NetworkError } from "@/utils/errors";
import { ERROR_MESSAGES } from "@/constants/errors";

export default class SearchService {
    static async searchRecipes(query, filters = {}, offset = 0, limit = 10) {
        try {
            const url = new URL(`${BASE_API}/v1/recipes/search`);

            // Добавляем основной запрос
            if (query && query.trim()) {
                url.searchParams.append('query', query.trim());
            }

            // Добавляем пагинацию
            url.searchParams.append('offset', offset.toString());
            url.searchParams.append('limit', limit.toString());

            console.log('SearchService: Выполняется поиск с параметрами:', {
                query: query?.trim(),
                filters,
                offset,
                limit
            });

            // Добавляем фильтры
            if (filters.includeIngredients && Array.isArray(filters.includeIngredients) && filters.includeIngredients.length > 0) {
                filters.includeIngredients.forEach(ingredient => {
                    if (ingredient && ingredient.trim()) {
                        url.searchParams.append('include_ingredients', ingredient.trim());
                    }
                });
            }

            if (filters.excludeIngredients && Array.isArray(filters.excludeIngredients) && filters.excludeIngredients.length > 0) {
                filters.excludeIngredients.forEach(ingredient => {
                    if (ingredient && ingredient.trim()) {
                        url.searchParams.append('exclude_ingredients', ingredient.trim());
                    }
                });
            }

            // Теги
            if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
                filters.tags.forEach(tag => {
                    if (tag && tag.trim()) {
                        url.searchParams.append('tags', tag.trim());
                    }
                });
            }

            // Методы приготовления (отправляем как теги с префиксом)
            if (filters.cookingMethods && Array.isArray(filters.cookingMethods) && filters.cookingMethods.length > 0) {
                filters.cookingMethods.forEach(method => {
                    if (method && method.trim()) {
                        url.searchParams.append('tags', `method:${method.trim()}`);
                    }
                });
            }

            // Сортировка
            if (filters.sortBy && filters.sortBy.trim()) {
                url.searchParams.append('sort_by', filters.sortBy.trim());
            }

            console.log('SearchService: Итоговый URL для запроса:', url.toString());

            await tokenManager.ensureValidToken();

            const accessToken = AuthService.getAccessToken();
            if (!accessToken) {
                throw new AuthError(ERROR_MESSAGES.not_authenticated);
            }

            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(url.toString(), {
                headers: headers
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('SearchService: Ошибка ответа от сервера:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData
                });

                if (response.status === 401) {
                    throw new AuthError(ERROR_MESSAGES.not_authenticated);
                }

                if (response.status === 503) {
                    throw new NetworkError(ERROR_MESSAGES.service_unavailable);
                }

                throw new Error(errorData.detail || `Ошибка при выполнении поиска: ${response.status}`);
            }

            const data = await response.json();
            const totalCountHeader = response.headers.get('X-Total-Count');
            const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : 0;

            console.log('SearchService: Успешный ответ:', {
                recipesCount: data?.length || 0,
                totalCount,
                hasData: !!data
            });

            return {
                data: data || [], // Убеждаемся, что возвращаем массив
                totalCount: totalCount
            };
        } catch (error) {
            console.error('SearchService: Ошибка при выполнении поиска:', error);

            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }

            if (error instanceof AuthError || error instanceof NetworkError) {
                throw error;
            }

            // Для всех остальных ошибок
            throw new Error(error.message || 'Неизвестная ошибка при выполнении поиска');
        }
    }
}
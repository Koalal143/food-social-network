import { BASE_API } from "@/constants/backend-urls";
import { tokenManager } from "@/utils/tokenManager";
import AuthService from "./auth.service";
import { AuthError, NetworkError } from "@/utils/errors";
import { ERROR_MESSAGES } from "@/constants/errors";

export default class SearchService {
    static async searchRecipes(query, offset = 0, limit = 10) {
        try {
            const url = new URL(`${BASE_API}/v1/recipes/search`);
            url.searchParams.append('query', query);
            url.searchParams.append('offset', offset.toString());
            url.searchParams.append('limit', limit.toString());

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

                if (response.status === 503) {
                    throw new NetworkError(ERROR_MESSAGES.service_unavailable);
                }

                throw new Error(errorData.detail || 'Ошибка при выполнении поиска');
          }

          const data = await response.json();
          const totalCountHeader = response.headers.get('X-Total-Count');

          return {
              data: data.results, // Предполагаем, что результаты в поле 'results'
              totalCount: data.total // Предполагаем, что общее количество в поле 'total'
          };
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }

            throw error;
        }
    }
}
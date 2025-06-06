import { BASE_API } from "@/constants/backend-urls";
import { NetworkError } from "@/utils/errors";
import { ERROR_MESSAGES } from "@/constants/errors";

export default class SearchService {
    static async searchRecipes(query, filters = {}, offset = 0, limit = 10) {
        try {
            const url = new URL(`${BASE_API}/v1/recipes/search`);
            url.searchParams.append('limit', limit.toString());
            url.searchParams.append('offset', offset.toString());
            if (query) {
                url.searchParams.append('query', query);
            }
            for (const key in filters) {
                if (filters[key]) {
                    if (Array.isArray(filters[key])) {
                        filters[key].forEach(item => url.searchParams.append(key, item));
                    } else {
                        url.searchParams.append(key, filters[key]);
                    }
                }
            }

            const response = await fetch(url.toString());

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (errorData.error_key && ERROR_MESSAGES[errorData.error_key]) {
                    throw new Error(ERROR_MESSAGES[errorData.error_key]);
                } else {
                    throw new Error(errorData.detail || ERROR_MESSAGES.default);
                }
            }

            const data = await response.json();
            const totalCountHeader = response.headers.get('X-Total-Count');

            return {
                data: data,
                totalCount: parseInt(totalCountHeader, 10) || 0
            };
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }
}
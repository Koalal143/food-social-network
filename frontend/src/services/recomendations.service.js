import { BASE_API } from "@/constants/backend-urls";
import { tokenManager } from "@/utils/tokenManager";
import AuthService from "./auth.service";
import { NetworkError } from "@/utils/errors";
import { ERROR_MESSAGES } from "@/constants/errors";

export default class RecomendationsService {
    // Кэш для предотвращения дублирующих запросов
    static activeRequests = new Map()
    static lastRequestTime = 0
    static MIN_REQUEST_INTERVAL = 500 // Минимальный интервал между запросами в мс

    static async getRecomendationsRecipes(limit, options={}) {
        try {
            // Создаем уникальный ключ для запроса
            const requestKey = `recommendations_${limit}_${JSON.stringify(options)}`

            // Проверяем, есть ли уже активный запрос с такими же параметрами
            if (this.activeRequests.has(requestKey)) {
                return await this.activeRequests.get(requestKey)
            }

            // Проверяем минимальный интервал между запросами
            const now = Date.now()
            const timeSinceLastRequest = now - this.lastRequestTime
            if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
                const delay = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest
                await new Promise(resolve => setTimeout(resolve, delay))
            }

            // Создаем промис для запроса
            const requestPromise = this._makeRequest(limit, options)

            // Сохраняем активный запрос в кэше
            this.activeRequests.set(requestKey, requestPromise)
            this.lastRequestTime = Date.now()

            try {
                const result = await requestPromise
                return result
            } finally {
                // Удаляем запрос из кэша после завершения
                this.activeRequests.delete(requestKey)
            }
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }

    static async _makeRequest(limit, options = {}) {
        await tokenManager.ensureValidToken();

        const accessToken = AuthService.getAccessToken();

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            ...options.headers
        };

        const response = await fetch(`${BASE_API}/v1/recommendations?limit=${limit}`, {
            headers: headers,
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (errorData.error_key && ERROR_MESSAGES[errorData.error_key]) {
                throw new Error(ERROR_MESSAGES[errorData.error_key]);
            } else {
                throw new Error(errorData.detail || ERROR_MESSAGES.default);
            }
        }

        const data = await response.json();
        return data;
    }

    // Метод для очистки кэша
    static clearCache() {
        this.activeRequests.clear()
        this.lastRequestTime = 0
    }
}
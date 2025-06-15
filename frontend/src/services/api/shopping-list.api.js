
import { ERROR_MESSAGES } from '@/constants/errors'
import { NetworkError, AuthError, ValidationError } from '@/utils/errors'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Обработка ошибок API для списка покупок
 * @param {Response} response - ответ от API
 * @returns {Promise<never>}
 */
async function handleAPIError(response) {
    try {
        const errorData = await response.json()
        const { error_key, detail } = errorData

        // Если есть error_key, используем локализованное сообщение
        if (error_key && ERROR_MESSAGES[error_key]) {
            switch (response.status) {
                case 401:
                    throw new AuthError(ERROR_MESSAGES[error_key])
                case 422:
                    throw new ValidationError(ERROR_MESSAGES[error_key])
                default:
                    throw new Error(ERROR_MESSAGES[error_key])
            }
        }

        // Обработка по HTTP статусу
        switch (response.status) {
            case 401:
                throw new AuthError(ERROR_MESSAGES.not_authenticated)
            case 403:
                throw new AuthError(ERROR_MESSAGES.insufficient_permissions)
            case 404:
                throw new ValidationError(ERROR_MESSAGES.not_found)
            case 422:
                throw new ValidationError(ERROR_MESSAGES.validation_error)
            case 500:
                throw new NetworkError(ERROR_MESSAGES.internal_server_error)
            default:
                throw new NetworkError(ERROR_MESSAGES.default)
        }
    } catch (parseError) {
        // Если не удалось распарсить JSON, используем общую ошибку
        switch (response.status) {
            case 401:
                throw new AuthError(ERROR_MESSAGES.not_authenticated)
            case 403:
                throw new AuthError(ERROR_MESSAGES.insufficient_permissions)
            case 404:
                throw new ValidationError(ERROR_MESSAGES.not_found)
            case 422:
                throw new ValidationError(ERROR_MESSAGES.validation_error)
            case 500:
                throw new NetworkError(ERROR_MESSAGES.internal_server_error)
            default:
                throw new NetworkError(ERROR_MESSAGES.default)
        }
    }
}

class ShoppingListAPI {
    /**
     * Получить список покупок пользователя
     * @param {Object} params - параметры запроса
     * @param {number} params.skip - количество пропускаемых элементов
     * @param {number} params.limit - максимальное количество элементов
     * @param {boolean} params.only_not_purchased - только не купленные элементы
     * @returns {Promise<{items: Array, total: number}>}
     */
    static async getShoppingList({ skip = 0, limit = 100, only_not_purchased = false } = {}) {
        // Убеждаемся, что limit не превышает максимальное значение backend API
        const validLimit = Math.min(Math.max(limit, 1), 100)
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: validLimit.toString(),
            only_not_purchased: only_not_purchased.toString()
        })

        const response = await fetch(`${API_BASE_URL}/v1/shopping-list?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            credentials: 'include'
        })

        if (!response.ok) {
            await handleAPIError(response)
        }

        const items = await response.json()
        const total = parseInt(response.headers.get('X-Total-Count') || '0')

        return { items, total }
    }

    /**
     * Создать новый элемент списка покупок
     * @param {Object} itemData - данные элемента
     * @param {string} itemData.name - название ингредиента
     * @param {string|null} itemData.quantity - количество
     * @param {number|null} itemData.recipe_ingredient_id - ID ингредиента рецепта
     * @returns {Promise<Object>}
     */
    static async createItem(itemData) {
        const response = await fetch(`${API_BASE_URL}/v1/shopping-list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify(itemData),
            credentials: 'include'
        })

        if (!response.ok) {
            await handleAPIError(response)
        }

        return await response.json()
    }

    /**
     * Массовое создание элементов списка покупок
     * @param {Array} items - массив элементов для создания
     * @returns {Promise<Array>}
     */
    static async bulkCreateItems(items) {
        const response = await fetch(`${API_BASE_URL}/v1/shopping-list/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify({ items }),
            credentials: 'include'
        })

        if (!response.ok) {
            await handleAPIError(response)
        }

        return await response.json()
    }

    /**
     * Получить элемент списка покупок по ID
     * @param {number} itemId - ID элемента
     * @returns {Promise<Object>}
     */
    static async getItem(itemId) {
        const response = await fetch(`${API_BASE_URL}/v1/shopping-list/${itemId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            credentials: 'include'
        })

        if (!response.ok) {
            await handleAPIError(response)
        }

        return await response.json()
    }

    /**
     * Обновить элемент списка покупок
     * @param {number} itemId - ID элемента
     * @param {Object} updateData - данные для обновления
     * @returns {Promise<Object>}
     */
    static async updateItem(itemId, updateData) {
        const response = await fetch(`${API_BASE_URL}/v1/shopping-list/${itemId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify(updateData),
            credentials: 'include'
        })

        if (!response.ok) {
            await handleAPIError(response)
        }

        return await response.json()
    }

    /**
     * Переключить статус покупки элемента
     * @param {number} itemId - ID элемента
     * @returns {Promise<Object>}
     */
    static async toggleItemPurchased(itemId) {
        const response = await fetch(`${API_BASE_URL}/v1/shopping-list/${itemId}/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            credentials: 'include'
        })

        if (!response.ok) {
            await handleAPIError(response)
        }

        return await response.json()
    }

    /**
     * Удалить элемент списка покупок
     * @param {number} itemId - ID элемента
     * @returns {Promise<void>}
     */
    static async deleteItem(itemId) {
        const response = await fetch(`${API_BASE_URL}/v1/shopping-list/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            credentials: 'include'
        })

        if (!response.ok) {
            await handleAPIError(response)
        }
    }

    /**
     * Массовое удаление элементов списка покупок
     * @param {Array<number>} itemIds - массив ID элементов
     * @returns {Promise<void>}
     */
    static async bulkDeleteItems(itemIds) {
        // Проверяем, что передан массив ID
        if (!Array.isArray(itemIds) || itemIds.length === 0) {
            throw new ValidationError('Необходимо передать массив ID элементов для удаления')
        }

        // Формируем query-параметры из массива ID
        const params = new URLSearchParams()
        itemIds.forEach(id => {
            params.append('item_ids', id.toString())
        })

        const response = await fetch(`${API_BASE_URL}/v1/shopping-list/bulk?${params}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            credentials: 'include'
            // Убираем body - данные теперь передаются через query-параметры
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
    }

    /**
     * Очистить весь список покупок
     * @returns {Promise<void>}
     */
    static async clearShoppingList() {
        const response = await fetch(`${API_BASE_URL}/v1/shopping-list`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            credentials: 'include'
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
    }

    /**
     * Получить токен авторизации (используем тот же метод, что и AuthService)
     * @returns {string|null}
     */
    static getAuthToken() {
        if (typeof window !== 'undefined') {
            // Импортируем AuthService динамически для избежания циклических зависимостей
            try {
                // Сначала пытаемся получить токен из cookies
                const cookieToken = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('access_token='))
                    ?.split('=')[1];

                if (cookieToken) {
                    return cookieToken;
                }

                // Fallback на localStorage для совместимости
                return localStorage.getItem('access_token') ||
                       localStorage.getItem('auth_token') ||
                       sessionStorage.getItem('auth_token');
            } catch (error) {
                console.warn('Ошибка при получении токена:', error);
                return null;
            }
        }
        return null
    }

    /**
     * Проверить, авторизован ли пользователь
     * @returns {boolean}
     */
    static isAuthenticated() {
        return !!this.getAuthToken()
    }
}

export default ShoppingListAPI

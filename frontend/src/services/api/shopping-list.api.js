

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
            only_not_purchased: only_not_purchased.toString()
        })

        const response = await fetch(`${API_BASE_URL}/api/v1/shopping-list?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
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
        const response = await fetch(`${API_BASE_URL}/api/v1/shopping-list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify(itemData)
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    }

    /**
     * Массовое создание элементов списка покупок
     * @param {Array} items - массив элементов для создания
     * @returns {Promise<Array>}
     */
    static async bulkCreateItems(items) {
        const response = await fetch(`${API_BASE_URL}/api/v1/shopping-list/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify({ items })
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    }

    /**
     * Получить элемент списка покупок по ID
     * @param {number} itemId - ID элемента
     * @returns {Promise<Object>}
     */
    static async getItem(itemId) {
        const response = await fetch(`${API_BASE_URL}/api/v1/shopping-list/${itemId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
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
        const response = await fetch(`${API_BASE_URL}/api/v1/shopping-list/${itemId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify(updateData)
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    }

    /**
     * Переключить статус покупки элемента
     * @param {number} itemId - ID элемента
     * @returns {Promise<Object>}
     */
    static async toggleItemPurchased(itemId) {
        const response = await fetch(`${API_BASE_URL}/api/v1/shopping-list/${itemId}/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    }

    /**
     * Удалить элемент списка покупок
     * @param {number} itemId - ID элемента
     * @returns {Promise<void>}
     */
    static async deleteItem(itemId) {
        const response = await fetch(`${API_BASE_URL}/api/v1/shopping-list/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
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
            throw new Error('Необходимо передать массив ID элементов для удаления')
        }

        // Формируем query-параметры из массива ID
        const params = new URLSearchParams()
        itemIds.forEach(id => {
            params.append('item_ids', id.toString())
        })

        const response = await fetch(`${API_BASE_URL}/api/v1/shopping-list/bulk?${params}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
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
        const response = await fetch(`${API_BASE_URL}/api/v1/shopping-list`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
    }

    /**
     * Получить токен авторизации
     * @returns {string|null}
     */
    static getAuthToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
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

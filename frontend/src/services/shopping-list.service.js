

import ShoppingListAPI from './api/shopping-list.api.js'
import ShoppingListMigration from './utils/shopping-list-migration.js'
import ShoppingListOffline from './utils/shopping-list-offline.js'

class ShoppingListService {
    /**
     * Получить весь список покупок
     * @param {Object} options - опции запроса
     * @param {boolean} options.forceLocal - принудительно использовать localStorage
     * @returns {Promise<Array>}
     */
    static async getShoppingList(options = {}) {
        await this.performMigrationIfNeeded()

        if (options.forceLocal || !ShoppingListAPI.isAuthenticated()) {
            return this.getShoppingListFromStorage()
        }

        return await ShoppingListOffline.executeWithFallback(
            async () => {
                const { items } = await ShoppingListAPI.getShoppingList({ limit: 1000 })
                return this.transformAPIItemsToLocal(items)
            },
            () => this.getShoppingListFromStorage()
        )
    }

    /**
     * Получить список покупок из localStorage
     */
    static getShoppingListFromStorage() {
        return ShoppingListOffline.getLocalStorageData()
    }

    /**
     * Сохранить список покупок в localStorage
     */
    static saveShoppingListToStorage(items) {
        return ShoppingListOffline.saveLocalStorageData(items)
    }

    /**
     * Выполнить миграцию данных при необходимости
     */
    static async performMigrationIfNeeded() {
        if (ShoppingListMigration.needsMigration()) {
            try {
                const result = await ShoppingListMigration.migrateToBackend()
                if (result.success && result.migratedCount > 0) {
                    console.log(`Успешно мигрировано ${result.migratedCount} элементов`)
                    // Очищаем localStorage после успешной миграции
                    ShoppingListMigration.clearLocalStorageData()
                }
                if (result.errors.length > 0) {
                    console.warn('Ошибки при миграции:', result.errors)
                }
            } catch (error) {
                console.error('Ошибка при миграции:', error)
            }
        }
    }

    /**
     * Преобразовать элементы API в формат localStorage
     * @param {Array} apiItems - элементы из API
     * @returns {Array}
     */
    static transformAPIItemsToLocal(apiItems) {
        return apiItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity || '',
            purchased: item.is_purchased || false,
            recipes: item.recipe ? [item.recipe.title] : [],
            addedAt: item.created_at,
            updatedAt: item.updated_at,
            recipe: item.recipe ? { id: item.recipe.id, title: item.recipe.title } : null,
            is_actual: item.is_actual !== undefined ? item.is_actual : true
        }))
    }

    /**
     * Преобразовать элемент localStorage в формат API
     * @param {Object} localItem 
     * @returns {Object}
     */
    static transformLocalItemToAPI(localItem) {
        return {
            name: localItem.name,
            quantity: localItem.quantity || null,
            recipe_ingredient_id: null // Для ручных ингредиентов
        }
    }





    /**
     * Добавить ингредиенты в список покупок
     * @param {Array} ingredients - массив ингредиентов {name, quantity}
     * @param {string} recipeTitle - название рецепта
     * @param {number|null} recipeId - ID рецепта (опционально)
     */
    static async addIngredients(ingredients, recipeTitle, recipeId = null) {
        if (!ShoppingListAPI.isAuthenticated()) {
            return await this.addIngredientsToStorage(ingredients, recipeTitle, recipeId)
        }



        const apiItems = ingredients.map(ingredient => ({
            name: ingredient.name,
            quantity: ingredient.quantity || null,
            recipe_ingredient_id: ingredient.recipe_ingredient_id || null
        }))

        return await ShoppingListOffline.executeWithFallback(
            async () => {
                const createdItems = await ShoppingListAPI.bulkCreateItems(apiItems)
                return this.transformAPIItemsToLocal(createdItems)
            },
            () => this.addIngredientsToStorage(ingredients, recipeTitle, recipeId),
            {
                type: 'bulk_create',
                data: { ingredients, recipeTitle, recipeId }
            }
        )
    }

    /**
     * Добавить ингредиенты в localStorage (fallback)
     */
    static async addIngredientsToStorage(ingredients, recipeTitle, recipeId = null) {
        try {
            const currentList = this.getShoppingListFromStorage()
            const timestamp = new Date().toISOString()

            const newItems = ingredients.map((ingredient, index) => {
                const validatedIngredient = this.validateIngredient(ingredient)

                const existingItemIndex = currentList.findIndex(item =>
                    item.name.toLowerCase() === validatedIngredient.name.toLowerCase() && !item.purchased
                )

                if (existingItemIndex !== -1) {
                    const existingItem = currentList[existingItemIndex]
                    const updatedQuantity = this.combineQuantities(existingItem.quantity, validatedIngredient.quantity)

                    currentList[existingItemIndex] = {
                        ...existingItem,
                        quantity: updatedQuantity,
                        recipes: [...(existingItem.recipes || []), recipeTitle].filter((recipe, index, arr) =>
                            arr.indexOf(recipe) === index 
                        ),
                        updatedAt: timestamp,
                        ...(recipeId && {
                            recipe: {
                                id: recipeId,
                                title: recipeTitle
                            },
                            is_actual: true 
                        })
                    }

                    return null 
                } else {
                    return {
                        id: `${Date.now()}_${index}`,
                        name: validatedIngredient.name,
                        quantity: validatedIngredient.quantity || '',
                        purchased: false,
                        recipes: [recipeTitle],
                        addedAt: timestamp,
                        updatedAt: timestamp,
                        recipe: recipeId ? {
                            id: recipeId,
                            title: recipeTitle
                        } : null,
                        is_actual: recipeId ? true : true 
                    }
                }
            }).filter(Boolean) 

            const updatedList = [...currentList, ...newItems]

            this.saveShoppingListToStorage(updatedList)

            return {
                added: newItems.length,
                updated: ingredients.length - newItems.length,
                total: updatedList.length
            }
        } catch (error) {
            console.error('Ошибка при добавлении ингредиентов в localStorage:', error)
            throw new Error('Не удалось добавить ингредиенты в список покупок')
        }
    }

    
    static validateIngredient(ingredient) {
        if (!ingredient || typeof ingredient !== 'object') {
            throw new Error('Ингредиент должен быть объектом')
        }

        const name = ingredient.name?.trim()
        if (!name) {
            throw new Error('Название ингредиента обязательно')
        }
        if (name.length < 2) {
            throw new Error('Название ингредиента должно содержать минимум 2 символа')
        }
        if (name.length > 135) {
            throw new Error('Название ингредиента не должно превышать 135 символов')
        }

        const quantity = ingredient.quantity?.trim() || ''
        if (quantity && quantity.length > 50) {
            throw new Error('Количество не должно превышать 50 символов')
        }

        return {
            name,
            quantity
        }
    }

   
    static combineQuantities(existing, newQuantity) {
        if (existing === null || existing === undefined) existing = ''
        if (newQuantity === null || newQuantity === undefined) newQuantity = ''

        const existingTrimmed = typeof existing === 'string' ? existing.trim() : String(existing).trim()
        const newTrimmed = typeof newQuantity === 'string' ? newQuantity.trim() : String(newQuantity).trim()

        if (!existingTrimmed && !newTrimmed) return ''
        if (!existingTrimmed) return newTrimmed
        if (!newTrimmed) return existingTrimmed

        return `${existingTrimmed}, ${newTrimmed}`
    }

    
    static async togglePurchased(itemId) {
        if (!ShoppingListAPI.isAuthenticated() || ShoppingListOffline.isTempId(itemId)) {
            return await this.togglePurchasedStorage(itemId)
        }

        return await ShoppingListOffline.executeWithFallback(
            async () => {
                const updatedItem = await ShoppingListAPI.toggleItemPurchased(itemId)
                return this.transformAPIItemsToLocal([updatedItem])[0]
            },
            () => this.togglePurchasedStorage(itemId),
            {
                type: 'toggle_purchased',
                data: { itemId }
            }
        )
    }

    
    static async togglePurchasedStorage(itemId) {
        try {
            const currentList = this.getShoppingListFromStorage()

            const itemIndex = currentList.findIndex(item => item.id === itemId)

            if (itemIndex === -1) {
                console.error('Элемент не найден в localStorage:', {
                    searchId: itemId,
                    availableIds: currentList.map(item => ({ id: item.id }))
                })
                throw new Error('Элемент не найден')
            }

            currentList[itemIndex].purchased = !currentList[itemIndex].purchased
            currentList[itemIndex].updatedAt = new Date().toISOString()

            this.saveShoppingListToStorage(currentList)

            return currentList[itemIndex]
        } catch (error) {
            console.error('Ошибка при изменении статуса покупки в localStorage:', error)
            throw new Error('Не удалось обновить статус элемента')
        }
    }

    
    static async removeItem(itemId) {
        if (!ShoppingListAPI.isAuthenticated() || ShoppingListOffline.isTempId(itemId)) {
            return await this.removeItemStorage(itemId)
        }

        return await ShoppingListOffline.executeWithFallback(
            async () => {
                await ShoppingListAPI.deleteItem(itemId)
                return await this.getShoppingList()
            },
            () => this.removeItemStorage(itemId),
            {
                type: 'delete_item',
                data: { itemId }
            }
        )
    }

   
    static async removeItemStorage(itemId) {
        try {
            const currentList = this.getShoppingListFromStorage()
            const filteredList = currentList.filter(item => item.id !== itemId)

            this.saveShoppingListToStorage(filteredList)
            return filteredList
        } catch (error) {
            console.error('Ошибка при удалении элемента из localStorage:', error)
            throw new Error('Не удалось удалить элемент')
        }
    }

  
    static async clearAll() {
        if (!ShoppingListAPI.isAuthenticated()) {
            return await this.clearAllStorage()
        }

        return await ShoppingListOffline.executeWithFallback(
            async () => {
                await ShoppingListAPI.clearShoppingList()
                return []
            },
            () => this.clearAllStorage(),
            {
                type: 'clear_all',
                data: {}
            }
        )
    }

    
    static async clearAllStorage() {
        try {
            this.saveShoppingListToStorage([])
            return true
        } catch (error) {
            console.error('Ошибка при очистке списка в localStorage:', error)
            throw new Error('Не удалось очистить список покупок')
        }
    }

  
    static async clearPurchased() {
        if (!ShoppingListAPI.isAuthenticated()) {
            return await this.clearPurchasedStorage()
        }

        return await ShoppingListOffline.executeWithFallback(
            async () => {
                const { items } = await ShoppingListAPI.getShoppingList({ limit: 1000 })
                const purchasedItems = items.filter(item => item.is_purchased)

                if (purchasedItems.length > 0) {
                    const purchasedIds = purchasedItems.map(item => item.id)
                    await ShoppingListAPI.bulkDeleteItems(purchasedIds)
                }

                const remainingItems = items.filter(item => !item.is_purchased)
                return this.transformAPIItemsToLocal(remainingItems)
            },
            () => this.clearPurchasedStorage(),
            {
                type: 'clear_purchased',
                data: {}
            }
        )
    }

   
    static async clearPurchasedStorage() {
        try {
            const currentList = this.getShoppingListFromStorage()
            const unpurchasedItems = currentList.filter(item => !item.purchased)

            this.saveShoppingListToStorage(unpurchasedItems)
            return unpurchasedItems
        } catch (error) {
            console.error('Ошибка при очистке купленных элементов в localStorage:', error)
            throw new Error('Не удалось очистить купленные элементы')
        }
    }

    
    static async addManualIngredient(name, quantity = '') {
        const validatedIngredient = this.validateIngredient({ name, quantity })

        if (!ShoppingListAPI.isAuthenticated()) {
            return await this.addManualIngredientStorage(validatedIngredient.name, validatedIngredient.quantity)
        }

        return await ShoppingListOffline.executeWithFallback(
            async () => {
                const { items: existingItems } = await ShoppingListAPI.getShoppingList({ limit: 1000 })
                const existingItem = existingItems.find(item =>
                    item.name.toLowerCase() === validatedIngredient.name.toLowerCase() && !item.is_purchased
                )

                if (existingItem) {
                    const updatedQuantity = this.combineQuantities(existingItem.quantity, validatedIngredient.quantity)
                    const updatedItem = await ShoppingListAPI.updateItem(existingItem.id, {
                        quantity: updatedQuantity
                    })
                    return this.transformAPIItemsToLocal([updatedItem])[0]
                } else {
                    const newItem = await ShoppingListAPI.createItem({
                        name: validatedIngredient.name,
                        quantity: validatedIngredient.quantity,
                        recipe_ingredient_id: null
                    })
                    return this.transformAPIItemsToLocal([newItem])[0]
                }
            },
            () => this.addManualIngredientStorage(validatedIngredient.name, validatedIngredient.quantity),
            {
                type: 'add_manual_ingredient',
                data: { name: validatedIngredient.name, quantity: validatedIngredient.quantity }
            }
        )
    }

   
    static async addManualIngredientStorage(name, quantity = '') {
        try {
            const validatedIngredient = this.validateIngredient({ name, quantity })
            const currentList = this.getShoppingListFromStorage()
            const timestamp = new Date().toISOString()

            const existingItemIndex = currentList.findIndex(item =>
                item.name.toLowerCase() === validatedIngredient.name.toLowerCase() && !item.purchased
            )

            if (existingItemIndex !== -1) {
                const existingItem = currentList[existingItemIndex]
                const updatedQuantity = this.combineQuantities(existingItem.quantity, validatedIngredient.quantity)

                currentList[existingItemIndex] = {
                    ...existingItem,
                    quantity: updatedQuantity,
                    updatedAt: timestamp,
                    is_actual: true
                }

                this.saveShoppingListToStorage(currentList)
                return currentList[existingItemIndex]
            } else {
                const newItem = {
                    id: ShoppingListOffline.generateTempId(),
                    name: validatedIngredient.name,
                    quantity: validatedIngredient.quantity,
                    purchased: false,
                    recipes: [],
                    addedAt: timestamp,
                    updatedAt: timestamp,
                    recipe: null,
                    is_actual: true
                }

                const updatedList = [...currentList, newItem]
                this.saveShoppingListToStorage(updatedList)
                return newItem
            }
        } catch (error) {
            console.error('Ошибка при добавлении ингредиента вручную:', error)
            throw error
        }
    }

   
    static async searchItems(query) {
        try {
            const list = await this.getShoppingList()
            if (!query || !query.trim()) return list

            const lowercaseQuery = query.toLowerCase().trim()
            return list.filter(item => {
                const nameMatch = item.name && item.name.toLowerCase().includes(lowercaseQuery)

                const recipeMatch = item.recipes && Array.isArray(item.recipes) &&
                    item.recipes.some(recipe =>
                        recipe && recipe.toLowerCase().includes(lowercaseQuery)
                    )

                return nameMatch || recipeMatch
            })
        } catch (error) {
            console.error('Ошибка при поиске:', error)
            return []
        }
    }

    /**
     * Синхронизировать offline операции с сервером
     * @returns {Promise<Object>}
     */
    static async syncOfflineOperations() {
        if (!ShoppingListAPI.isAuthenticated()) {
            return { success: false, error: 'Пользователь не авторизован' }
        }

        return await ShoppingListOffline.syncOfflineOperations(async (operation) => {
            switch (operation.type) {
                case 'add_manual_ingredient':
                    return await this.addManualIngredient(operation.data.name, operation.data.quantity)

                case 'toggle_purchased':
                    return await ShoppingListAPI.toggleItemPurchased(operation.data.itemId)

                case 'delete_item':
                    return await ShoppingListAPI.deleteItem(operation.data.itemId)

                case 'clear_all':
                    return await ShoppingListAPI.clearShoppingList()

                case 'clear_purchased':
                    return await this.clearPurchased()

                case 'bulk_create':
                    return await this.addIngredients(
                        operation.data.ingredients,
                        operation.data.recipeTitle,
                        operation.data.recipeId
                    )

                default:
                    throw new Error(`Неизвестный тип операции: ${operation.type}`)
            }
        })
    }

    /**
     * Получить статистику offline режима
     * @returns {Object}
     */
    static getOfflineStats() {
        return ShoppingListOffline.getOfflineStats()
    }

    /**
     * Настроить автоматическую синхронизацию при восстановлении сети
     */
    static setupAutoSync() {
        ShoppingListOffline.setupNetworkListeners(
            async () => {
                // При восстановлении сети синхронизируем offline операции
                try {
                    const result = await this.syncOfflineOperations()
                    if (result.success && result.syncedCount > 0) {
                        console.log(`Синхронизировано ${result.syncedCount} операций`)
                    }
                } catch (error) {
                    console.error('Ошибка автоматической синхронизации:', error)
                }
            },
            () => {
                console.log('Переход в offline режим')
            }
        )
    }

    /**
     * Принудительно обновить данные с сервера
     * @returns {Promise<Array>}
     */
    static async forceRefreshFromServer() {
        if (!ShoppingListAPI.isAuthenticated()) {
            throw new Error('Пользователь не авторизован')
        }

        const { items } = await ShoppingListAPI.getShoppingList({ limit: 1000 })
        const localItems = this.transformAPIItemsToLocal(items)

        // Сохраняем в localStorage для offline доступа
        this.saveShoppingListToStorage(localItems)

        return localItems
    }

    /**
     * Проверить статус миграции
     * @returns {Object|null}
     */
    static getMigrationStatus() {
        return ShoppingListMigration.getMigrationStatus()
    }
}

export default ShoppingListService

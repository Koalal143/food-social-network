
import ShoppingListAPI from './api/shopping-list.api.js'
import { AuthError } from '@/utils/errors'

class ShoppingListService {
    /**
     * Проверить авторизацию пользователя
     * @throws {AuthError} если пользователь не авторизован
     */
    static ensureAuthenticated() {
        if (!ShoppingListAPI.isAuthenticated()) {
            throw new AuthError('Для работы со списком покупок необходимо войти в систему')
        }
    }

    /**
     * Получить весь список покупок (только для авторизованных пользователей)
     * @returns {Promise<Array>}
     */
    static async getShoppingList() {
        this.ensureAuthenticated()

        // Backend API поддерживает максимум 100 элементов за раз
        const limit = Math.min(parseInt(process.env.NEXT_PUBLIC_SHOPPING_LIST_LIMIT) || 100, 100)
        const { items } = await ShoppingListAPI.getShoppingList({ limit })
        return this.transformAPIItemsToLocal(items)
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
     * Добавить ингредиенты в список покупок (только для авторизованных пользователей)
     * @param {Array} ingredients - массив ингредиентов {name, quantity, id}
     * @param {string} recipeTitle - название рецепта
     * @param {number|null} recipeId - ID рецепта (опционально)
     */
    static async addIngredients(ingredients, recipeTitle, recipeId = null) {
        this.ensureAuthenticated()

        const apiItems = ingredients.map(ingredient => ({
            name: ingredient.name,
            quantity: ingredient.quantity || null,
            recipe_ingredient_id: ingredient.id || null
        }))

        const createdItems = await ShoppingListAPI.bulkCreateItems(apiItems)
        return this.transformAPIItemsToLocal(createdItems)
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

    /**
     * Переключить статус покупки элемента (только для авторизованных пользователей)
     * @param {number} itemId - ID элемента
     * @returns {Promise<Object>}
     */
    static async togglePurchased(itemId) {
        this.ensureAuthenticated()

        const updatedItem = await ShoppingListAPI.toggleItemPurchased(itemId)
        return this.transformAPIItemsToLocal([updatedItem])[0]
    }

    /**
     * Удалить элемент из списка покупок (только для авторизованных пользователей)
     * @param {number} itemId - ID элемента
     * @returns {Promise<Array>}
     */
    static async removeItem(itemId) {
        this.ensureAuthenticated()

        await ShoppingListAPI.deleteItem(itemId)
        return await this.getShoppingList()
    }

    /**
     * Очистить весь список покупок (только для авторизованных пользователей)
     * @returns {Promise<Array>}
     */
    static async clearAll() {
        this.ensureAuthenticated()

        await ShoppingListAPI.clearShoppingList()
        return []
    }

    /**
     * Очистить купленные элементы (только для авторизованных пользователей)
     * @returns {Promise<Array>}
     */
    static async clearPurchased() {
        this.ensureAuthenticated()

        const limit = Math.min(parseInt(process.env.NEXT_PUBLIC_SHOPPING_LIST_LIMIT) || 100, 100)
        const { items } = await ShoppingListAPI.getShoppingList({ limit })
        const purchasedItems = items.filter(item => item.is_purchased)

        if (purchasedItems.length > 0) {
            const purchasedIds = purchasedItems.map(item => item.id)
            await ShoppingListAPI.bulkDeleteItems(purchasedIds)
        }

        const remainingItems = items.filter(item => !item.is_purchased)
        return this.transformAPIItemsToLocal(remainingItems)
    }

    /**
     * Добавить ингредиент вручную (только для авторизованных пользователей)
     * @param {string} name - название ингредиента
     * @param {string} quantity - количество
     * @returns {Promise<Object>}
     */
    static async addManualIngredient(name, quantity = '') {
        this.ensureAuthenticated()

        const validatedIngredient = this.validateIngredient({ name, quantity })

        const limit = Math.min(parseInt(process.env.NEXT_PUBLIC_SHOPPING_LIST_LIMIT) || 100, 100)
        const { items: existingItems } = await ShoppingListAPI.getShoppingList({ limit })
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
    }



    /**
     * Поиск элементов в списке покупок (только для авторизованных пользователей)
     * @param {string} query - поисковый запрос
     * @returns {Promise<Array>}
     */
    static async searchItems(query) {
        this.ensureAuthenticated()

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
    }


}

export default ShoppingListService

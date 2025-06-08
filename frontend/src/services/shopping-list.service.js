/**
 * Сервис для управления списком покупок
 * Использует localStorage для хранения данных на frontend
 */

const STORAGE_KEY = 'vkyswapp_shopping_list'

class ShoppingListService {
    /**
     * Получить весь список покупок
     */
    static getShoppingList() {
        try {
            const data = localStorage.getItem(STORAGE_KEY)
            if (!data) return []
            
            const parsed = JSON.parse(data)
            return Array.isArray(parsed) ? parsed : []
        } catch (error) {
            console.error('Ошибка при получении списка покупок:', error)
            return []
        }
    }

    /**
     * Сохранить список покупок
     */
    static saveShoppingList(items) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
            return true
        } catch (error) {
            console.error('Ошибка при сохранении списка покупок:', error)
            throw new Error('Не удалось сохранить список покупок')
        }
    }

    /**
     * Добавить ингредиенты в список покупок
     * @param {Array} ingredients - массив ингредиентов {name, quantity}
     * @param {string} recipeTitle - название рецепта
     */
    static async addIngredients(ingredients, recipeTitle) {
        try {
            const currentList = this.getShoppingList()
            const timestamp = new Date().toISOString()

            // Создаем новые элементы списка покупок
            const newItems = ingredients.map((ingredient, index) => {
                // Проверяем, есть ли уже такой ингредиент в списке
                const existingItemIndex = currentList.findIndex(item => 
                    item.name.toLowerCase() === ingredient.name.toLowerCase() && !item.purchased
                )

                if (existingItemIndex !== -1) {
                    // Если ингредиент уже есть, обновляем количество
                    const existingItem = currentList[existingItemIndex]
                    const updatedQuantity = this.combineQuantities(existingItem.quantity, ingredient.quantity)
                    
                    currentList[existingItemIndex] = {
                        ...existingItem,
                        quantity: updatedQuantity,
                        recipes: [...(existingItem.recipes || []), recipeTitle].filter((recipe, index, arr) => 
                            arr.indexOf(recipe) === index // убираем дубликаты
                        ),
                        updatedAt: timestamp
                    }
                    
                    return null // не добавляем новый элемент
                } else {
                    // Создаем новый элемент
                    return {
                        id: `${Date.now()}_${index}`,
                        name: ingredient.name,
                        quantity: ingredient.quantity || '',
                        purchased: false,
                        recipes: [recipeTitle],
                        addedAt: timestamp,
                        updatedAt: timestamp
                    }
                }
            }).filter(Boolean) // убираем null элементы

            // Добавляем новые элементы к существующему списку
            const updatedList = [...currentList, ...newItems]
            
            this.saveShoppingList(updatedList)
            
            return {
                added: newItems.length,
                updated: ingredients.length - newItems.length,
                total: updatedList.length
            }
        } catch (error) {
            console.error('Ошибка при добавлении ингредиентов:', error)
            throw new Error('Не удалось добавить ингредиенты в список покупок')
        }
    }

    /**
     * Объединить количества ингредиентов (простая логика)
     */
    static combineQuantities(existing, newQuantity) {
        if (!existing && !newQuantity) return ''
        if (!existing) return newQuantity
        if (!newQuantity) return existing
        
        // Простое объединение через запятую
        // В будущем можно добавить более умную логику для сложения количеств
        return `${existing}, ${newQuantity}`
    }

    /**
     * Отметить элемент как купленный/не купленный
     */
    static togglePurchased(itemId) {
        try {
            const currentList = this.getShoppingList()
            const itemIndex = currentList.findIndex(item => item.id === itemId)
            
            if (itemIndex === -1) {
                throw new Error('Элемент не найден')
            }
            
            currentList[itemIndex].purchased = !currentList[itemIndex].purchased
            currentList[itemIndex].updatedAt = new Date().toISOString()
            
            this.saveShoppingList(currentList)
            return currentList[itemIndex]
        } catch (error) {
            console.error('Ошибка при изменении статуса покупки:', error)
            throw new Error('Не удалось обновить статус элемента')
        }
    }

    /**
     * Удалить элемент из списка покупок
     */
    static removeItem(itemId) {
        try {
            const currentList = this.getShoppingList()
            const filteredList = currentList.filter(item => item.id !== itemId)
            
            this.saveShoppingList(filteredList)
            return filteredList
        } catch (error) {
            console.error('Ошибка при удалении элемента:', error)
            throw new Error('Не удалось удалить элемент')
        }
    }

    /**
     * Очистить весь список покупок
     */
    static clearAll() {
        try {
            this.saveShoppingList([])
            return true
        } catch (error) {
            console.error('Ошибка при очистке списка:', error)
            throw new Error('Не удалось очистить список покупок')
        }
    }

    /**
     * Очистить только купленные элементы
     */
    static clearPurchased() {
        try {
            const currentList = this.getShoppingList()
            const unpurchasedItems = currentList.filter(item => !item.purchased)
            
            this.saveShoppingList(unpurchasedItems)
            return unpurchasedItems
        } catch (error) {
            console.error('Ошибка при очистке купленных элементов:', error)
            throw new Error('Не удалось очистить купленные элементы')
        }
    }

    /**
     * Получить статистику списка покупок
     */
    static getStatistics() {
        try {
            const list = this.getShoppingList()
            const total = list.length
            const purchased = list.filter(item => item.purchased).length
            const remaining = total - purchased
            
            return {
                total,
                purchased,
                remaining,
                completionPercentage: total > 0 ? Math.round((purchased / total) * 100) : 0
            }
        } catch (error) {
            console.error('Ошибка при получении статистики:', error)
            return {
                total: 0,
                purchased: 0,
                remaining: 0,
                completionPercentage: 0
            }
        }
    }

    /**
     * Поиск в списке покупок
     */
    static searchItems(query) {
        try {
            const list = this.getShoppingList()
            if (!query) return list
            
            const lowercaseQuery = query.toLowerCase()
            return list.filter(item => 
                item.name.toLowerCase().includes(lowercaseQuery) ||
                (item.recipes && item.recipes.some(recipe => 
                    recipe.toLowerCase().includes(lowercaseQuery)
                ))
            )
        } catch (error) {
            console.error('Ошибка при поиске:', error)
            return []
        }
    }
}

export default ShoppingListService

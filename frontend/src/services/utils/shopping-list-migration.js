
import ShoppingListAPI from '../api/shopping-list.api.js'

const STORAGE_KEY = 'vkyswapp_shopping_list'
const MIGRATION_KEY = 'vkyswapp_shopping_list_migrated'

class ShoppingListMigration {
    /**
     * Проверить, нужна ли миграция данных
     * @returns {boolean}
     */
    static needsMigration() {
        if (typeof window === 'undefined') return false
        
        const isMigrated = localStorage.getItem(MIGRATION_KEY)
        const hasLocalData = localStorage.getItem(STORAGE_KEY)
        const isAuthenticated = ShoppingListAPI.isAuthenticated()
        
        return !isMigrated && hasLocalData && isAuthenticated
    }

    /**
     * Получить данные из localStorage для миграции
     * @returns {Array}
     */
    static getLocalStorageData() {
        try {
            const data = localStorage.getItem(STORAGE_KEY)
            if (!data) return []

            const parsed = JSON.parse(data)
            return Array.isArray(parsed) ? parsed : []
        } catch (error) {
            console.error('Ошибка при получении данных для миграции:', error)
            return []
        }
    }

    /**
     * Преобразовать данные localStorage в формат backend API
     * @param {Array} localItems - элементы из localStorage
     * @returns {Array}
     */
    static transformLocalDataForAPI(localItems) {
        return localItems.map(item => {
            const apiItem = {
                name: item.name,
                quantity: item.quantity || null
            }

            if (item.recipe && item.recipe.id) {
                apiItem.recipe_ingredient_id = null 
            }

            return apiItem
        })
    }

    /**
     * Выполнить миграцию данных из localStorage в backend
     * @returns {Promise<{success: boolean, migratedCount: number, errors: Array}>}
     */
    static async migrateToBackend() {
        if (!this.needsMigration()) {
            return { success: true, migratedCount: 0, errors: [] }
        }

        const localItems = this.getLocalStorageData()
        if (localItems.length === 0) {
            this.markAsMigrated()
            return { success: true, migratedCount: 0, errors: [] }
        }

        const apiItems = this.transformLocalDataForAPI(localItems)
        const errors = []
        let migratedCount = 0

        try {
            if (apiItems.length <= 25) { 
                try {
                    await ShoppingListAPI.bulkCreateItems(apiItems)
                    migratedCount = apiItems.length
                } catch (error) {
                    console.warn('Массовая миграция не удалась, пробуем по одному:', error)
                    const singleMigrationResult = await this.migrateSingleItems(apiItems)
                    migratedCount = singleMigrationResult.migratedCount
                    errors.push(...singleMigrationResult.errors)
                }
            } else {
                const batchResult = await this.migrateBatches(apiItems)
                migratedCount = batchResult.migratedCount
                errors.push(...batchResult.errors)
            }

            this.markAsMigrated()

            this.createBackup(localItems)

            return {
                success: errors.length === 0,
                migratedCount,
                errors
            }
        } catch (error) {
            console.error('Критическая ошибка при миграции:', error)
            return {
                success: false,
                migratedCount,
                errors: [error.message]
            }
        }
    }

    /**
     * Миграция элементов по одному
     * @param {Array} apiItems - элементы для миграции
     * @returns {Promise<{migratedCount: number, errors: Array}>}
     */
    static async migrateSingleItems(apiItems) {
        let migratedCount = 0
        const errors = []

        for (const item of apiItems) {
            try {
                await ShoppingListAPI.createItem(item)
                migratedCount++
            } catch (error) {
                console.error(`Ошибка при миграции элемента "${item.name}":`, error)
                errors.push(`Не удалось мигрировать "${item.name}": ${error.message}`)
            }
        }

        return { migratedCount, errors }
    }

    /**
     * Миграция элементов батчами
     * @param {Array} apiItems - элементы для миграции
     * @returns {Promise<{migratedCount: number, errors: Array}>}
     */
    static async migrateBatches(apiItems) {
        let migratedCount = 0
        const errors = []
        const batchSize = 25

        for (let i = 0; i < apiItems.length; i += batchSize) {
            const batch = apiItems.slice(i, i + batchSize)
            
            try {
                await ShoppingListAPI.bulkCreateItems(batch)
                migratedCount += batch.length
            } catch (error) {
                console.error(`Ошибка при миграции батча ${i / batchSize + 1}:`, error)
                
                const singleResult = await this.migrateSingleItems(batch)
                migratedCount += singleResult.migratedCount
                errors.push(...singleResult.errors)
            }
        }

        return { migratedCount, errors }
    }

   
    static markAsMigrated() {
        if (typeof window !== 'undefined') {
            localStorage.setItem(MIGRATION_KEY, new Date().toISOString())
        }
    }

    /**
     * Создать резервную копию данных localStorage
     * @param {Array} localItems - данные для резервного копирования
     */
    static createBackup(localItems) {
        try {
            const backupKey = `${STORAGE_KEY}_backup_${Date.now()}`
            localStorage.setItem(backupKey, JSON.stringify({
                timestamp: new Date().toISOString(),
                items: localItems
            }))
        } catch (error) {
            console.warn('Не удалось создать резервную копию:', error)
        }
    }

    
    static clearLocalStorageData() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY)
        }
    }

   
    static resetMigrationStatus() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(MIGRATION_KEY)
        }
    }

    /**
     * Получить статус миграции
     * @returns {Object|null}
     */
    static getMigrationStatus() {
        if (typeof window === 'undefined') return null
        
        const migrationDate = localStorage.getItem(MIGRATION_KEY)
        return migrationDate ? { migrated: true, date: migrationDate } : { migrated: false }
    }
}

export default ShoppingListMigration

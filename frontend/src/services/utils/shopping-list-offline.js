

const STORAGE_KEY = 'vkyswapp_shopping_list'
const OFFLINE_QUEUE_KEY = 'vkyswapp_shopping_list_offline_queue'

class ShoppingListOffline {
    /**
     * Проверить, доступна ли сеть
     * @returns {boolean}
     */
    static isOnline() {
        return typeof navigator !== 'undefined' ? navigator.onLine : true
    }

    /**
     * Получить данные из localStorage (fallback)
     * @returns {Array}
     */
    static getLocalStorageData() {
        try {
            const data = localStorage.getItem(STORAGE_KEY)
            if (!data) return []

            const parsed = JSON.parse(data)
            return Array.isArray(parsed) ? parsed : []
        } catch (error) {
            console.error('Ошибка при получении данных из localStorage:', error)
            return []
        }
    }

    /**
     * Сохранить данные в localStorage (fallback)
     * @param {Array} items - элементы для сохранения
     */
    static saveLocalStorageData(items) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
        } catch (error) {
            console.error('Ошибка при сохранении данных в localStorage:', error)
            throw new Error('Не удалось сохранить данные локально')
        }
    }

    /**
     * Добавить операцию в очередь offline синхронизации
     * @param {Object} operation - операция для синхронизации
     */
    static addToOfflineQueue(operation) {
        try {
            const queue = this.getOfflineQueue()
            queue.push({
                ...operation,
                timestamp: new Date().toISOString(),
                id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            })
            localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
        } catch (error) {
            console.error('Ошибка при добавлении операции в offline очередь:', error)
        }
    }

    /**
     * Получить очередь offline операций
     * @returns {Array}
     */
    static getOfflineQueue() {
        try {
            const data = localStorage.getItem(OFFLINE_QUEUE_KEY)
            if (!data) return []

            const parsed = JSON.parse(data)
            return Array.isArray(parsed) ? parsed : []
        } catch (error) {
            console.error('Ошибка при получении offline очереди:', error)
            return []
        }
    }

    
    static clearOfflineQueue() {
        try {
            localStorage.removeItem(OFFLINE_QUEUE_KEY)
        } catch (error) {
            console.error('Ошибка при очистке offline очереди:', error)
        }
    }

    /**
     * Синхронизировать offline операции с сервером
     * @param {Function} apiMethod - метод API для выполнения операций
     * @returns {Promise<{success: boolean, syncedCount: number, errors: Array}>}
     */
    static async syncOfflineOperations(apiMethod) {
        const queue = this.getOfflineQueue()
        if (queue.length === 0) {
            return { success: true, syncedCount: 0, errors: [] }
        }

        let syncedCount = 0
        const errors = []
        const remainingOperations = []

        for (const operation of queue) {
            try {
                await apiMethod(operation)
                syncedCount++
            } catch (error) {
                console.error('Ошибка при синхронизации операции:', error)
                errors.push(`Операция ${operation.type}: ${error.message}`)
                remainingOperations.push(operation)
            }
        }

        if (remainingOperations.length > 0) {
            localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingOperations))
        } else {
            this.clearOfflineQueue()
        }

        return {
            success: errors.length === 0,
            syncedCount,
            errors
        }
    }

    /**
     * Проверить, является ли ошибка сетевой
     * @param {Error} error - ошибка для проверки
     * @returns {boolean}
     */
    static isNetworkError(error) {
        return (
            error.name === 'TypeError' ||
            error.message.includes('fetch') ||
            error.message.includes('network') ||
            error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError')
        )
    }

    /**
     * Обработать ошибку API с fallback на localStorage
     * @param {Error} error - ошибка API
     * @param {Function} fallbackOperation - операция fallback
     * @returns {Promise<any>}
     */
    static async handleAPIError(error, fallbackOperation) {
        console.error('Ошибка API:', error)

        if (this.isNetworkError(error) && !this.isOnline()) {
            console.warn('Сеть недоступна, используем localStorage fallback')
            return await fallbackOperation()
        }

        throw error
    }

    /**
     * Выполнить операцию с автоматическим fallback
     * @param {Function} apiOperation - операция API
     * @param {Function} fallbackOperation - операция fallback
     * @param {Object} offlineQueueData - данные для offline очереди
     * @returns {Promise<any>}
     */
    static async executeWithFallback(apiOperation, fallbackOperation, offlineQueueData = null) {
        try {
            return await apiOperation()
        } catch (error) {
            if (this.isNetworkError(error)) {
                console.warn('API недоступен, используем localStorage fallback')
                
                if (offlineQueueData) {
                    this.addToOfflineQueue(offlineQueueData)
                }
                
                return await fallbackOperation()
            }
            
            throw error
        }
    }

    /**
     * Создать уникальный временный ID для offline элементов
     * @returns {string}
     */
    static generateTempId() {
        return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    /**
     * Проверить, является ли ID временным (offline)
     * @param {string} id - ID для проверки
     * @returns {boolean}
     */
    static isTempId(id) {
        return typeof id === 'string' && (id.startsWith('temp_') || id.startsWith('manual_') || id.startsWith('offline_'))
    }

    /**
     * Получить статистику offline режима
     * @returns {Object}
     */
    static getOfflineStats() {
        const queue = this.getOfflineQueue()
        const localData = this.getLocalStorageData()
        
        return {
            isOnline: this.isOnline(),
            queueLength: queue.length,
            localItemsCount: localData.length,
            lastQueueUpdate: queue.length > 0 ? queue[queue.length - 1].timestamp : null
        }
    }

    /**
     * Настроить слушатели событий сети
     * @param {Function} onOnline - callback при восстановлении сети
     * @param {Function} onOffline - callback при потере сети
     */
    static setupNetworkListeners(onOnline, onOffline) {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                console.log('Сеть восстановлена')
                onOnline && onOnline()
            })

            window.addEventListener('offline', () => {
                console.log('Сеть потеряна')
                onOffline && onOffline()
            })
        }
    }
}

export default ShoppingListOffline

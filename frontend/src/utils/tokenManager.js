import AuthService from '@/services/auth.service'

class TokenManager {
    constructor() {
        this.refreshPromise = null
        this.requestQueue = []
    }

    // Проверяет, нужно ли обновить токен
    shouldRefreshToken() {
        const token = AuthService.getAccessToken()
        if (!token) return false

        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]))
            const expirationTime = tokenData.exp * 1000
            // Обновляем токен за 5 минут до истечения
            return Date.now() >= expirationTime - 5 * 60 * 1000
        } catch {
            return false
        }
    }

    // Обновляет токен и выполняет отложенные запросы
    async refreshToken() {
        if (this.refreshPromise) {
            return this.refreshPromise
        }

        this.refreshPromise = AuthService.refreshToken()
            .then((result) => {
                // Выполняем все отложенные запросы
                this.requestQueue.forEach(request => request.resolve())
                this.requestQueue = []
                return result
            })
            .catch((error) => {
                // В случае ошибки отклоняем все отложенные запросы
                this.requestQueue.forEach(request => request.reject(error))
                this.requestQueue = []
                throw error
            })
            .finally(() => {
                this.refreshPromise = null
            })

        return this.refreshPromise
    }

    // Добавляет запрос в очередь
    enqueueRequest() {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ resolve, reject })
        })
    }

    // Проверяет токен перед запросом
    async ensureValidToken() {
        if (this.shouldRefreshToken()) {
            if (this.refreshPromise) {
                await this.enqueueRequest()
            } else {
                await this.refreshToken()
            }
        }
    }
}

export const tokenManager = new TokenManager() 
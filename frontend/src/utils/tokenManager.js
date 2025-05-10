import AuthService from '@/services/auth.service'

class TokenManager {
    constructor() {
        this.refreshPromise = null
        this.requestQueue = []
    }

    shouldRefreshToken() {
        const token = AuthService.getAccessToken()
        if (!token) return false

        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]))
            const expirationTime = tokenData.exp * 1000
            return Date.now() >= expirationTime - 5 * 60 * 1000
        } catch {
            return false
        }
    }

    async refreshToken() {
        if (this.refreshPromise) {
            return this.refreshPromise
        }

        this.refreshPromise = AuthService.refreshToken()
            .then((result) => {
                this.requestQueue.forEach(request => request.resolve())
                this.requestQueue = []
                return result
            })
            .catch((error) => {
                this.requestQueue.forEach(request => request.reject(error))
                this.requestQueue = []
                throw error
            })
            .finally(() => {
                this.refreshPromise = null
            })

        return this.refreshPromise
    }

    enqueueRequest() {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ resolve, reject })
        })
    }

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
/**
 * Утилиты для работы с cookies
 */

export class CookieManager {
    /**
     * Установить cookie
     * @param {string} name - имя cookie
     * @param {string} value - значение cookie
     * @param {Object} options - опции cookie
     */
    static setCookie(name, value, options = {}) {
        const {
            maxAge = null,
            expires = null,
            path = '/',
            domain = null,
            secure = false,
            sameSite = 'lax'
        } = options;

        let cookieString = `${name}=${value}`;

        if (maxAge !== null) {
            cookieString += `; max-age=${maxAge}`;
        }

        if (expires !== null) {
            cookieString += `; expires=${expires}`;
        }

        cookieString += `; path=${path}`;

        if (domain) {
            cookieString += `; domain=${domain}`;
        }

        if (secure) {
            cookieString += `; secure`;
        }

        cookieString += `; samesite=${sameSite}`;

        document.cookie = cookieString;
    }

    /**
     * Получить значение cookie
     * @param {string} name - имя cookie
     * @returns {string|null} значение cookie или null
     */
    static getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    }

    /**
     * Удалить cookie
     * @param {string} name - имя cookie
     * @param {string} path - путь cookie
     */
    static deleteCookie(name, path = '/') {
        document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }

    /**
     * Установить токены аутентификации в cookies
     * @param {string} accessToken - access token
     * @param {string} refreshToken - refresh token
     */
    static setAuthTokens(accessToken, refreshToken) {
        // Access token действует 30 минут
        this.setCookie('access_token', accessToken, {
            maxAge: 30 * 60, // 30 минут
            sameSite: 'lax'
        });

        // Refresh token действует 7 дней
        this.setCookie('refresh_token', refreshToken, {
            maxAge: 7 * 24 * 60 * 60, // 7 дней
            sameSite: 'lax'
        });
    }

    /**
     * Удалить токены аутентификации из cookies
     */
    static clearAuthTokens() {
        this.deleteCookie('access_token');
        this.deleteCookie('refresh_token');
    }
}

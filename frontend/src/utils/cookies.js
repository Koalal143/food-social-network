/**
 * Утилиты для работы с cookies
 */

export class CookieManager {
    /**
     * Проверка, выполняется ли код на клиенте
     * @returns {boolean} true если код выполняется в браузере
     */
    static isClient() {
        return typeof window !== 'undefined' && typeof document !== 'undefined';
    }
    /**
     * Установить cookie
     * @param {string} name - имя cookie
     * @param {string} value - значение cookie
     * @param {Object} options - опции cookie
     */
    static setCookie(name, value, options = {}) {
        // Проверяем, что мы на клиенте
        if (!this.isClient()) {
            return;
        }

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
        // Проверяем, что мы на клиенте
        if (!this.isClient()) {
            return null;
        }

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
        // Проверяем, что мы на клиенте
        if (!this.isClient()) {
            return;
        }

        document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }

    /**
     * Установить токены аутентификации в cookies
     * @param {string} accessToken - access token
     * @param {string} refreshToken - refresh token
     */
    static setAuthTokens(accessToken, refreshToken) {
        // Access token действует 30 минут
        // Используем secure в production и sameSite: 'lax' для совместимости с middleware
        const isProduction = process.env.NODE_ENV === 'production';

        this.setCookie('access_token', accessToken, {
            maxAge: 30 * 60, // 30 минут
            secure: isProduction, // HTTPS только в production
            sameSite: 'lax' // Баланс между безопасностью и функциональностью
        });

        // Refresh token действует 7 дней
        this.setCookie('refresh_token', refreshToken, {
            maxAge: 7 * 24 * 60 * 60, // 7 дней
            secure: isProduction, // HTTPS только в production
            sameSite: 'lax' // Баланс между безопасностью и функциональностью
        });
    }

    /**
     * Получить access token из cookies
     * @returns {string|null} access token или null
     */
    static getAccessToken() {
        return this.getCookie('access_token');
    }

    /**
     * Получить refresh token из cookies
     * @returns {string|null} refresh token или null
     */
    static getRefreshToken() {
        return this.getCookie('refresh_token');
    }

    /**
     * Удалить токены аутентификации из cookies
     */
    static clearAuthTokens() {
        this.deleteCookie('access_token');
        this.deleteCookie('refresh_token');
    }

    /**
     * Получить все cookies как объект
     * @returns {Object} объект с парами ключ-значение всех cookies
     */
    static getAllCookies() {
        // Проверяем, что мы на клиенте
        if (!this.isClient()) {
            return {};
        }

        const cookies = {};
        document.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name) {
                cookies[name] = value;
            }
        });
        return cookies;
    }

    /**
     * Полная очистка всех cookies (для logout)
     */
    static clearAllCookies() {
        // Получаем все существующие cookies
        const cookies = this.getAllCookies();

        // Удаляем каждый cookie
        Object.keys(cookies).forEach(cookieName => {
            this.deleteCookie(cookieName);
            // Также пробуем удалить с разными путями на случай если cookie был установлен с другим путем
            this.deleteCookie(cookieName, '/');
            this.deleteCookie(cookieName, '');
        });

        // Дополнительно удаляем известные cookies приложения
        const knownCookies = [
            'access_token',
            'refresh_token',
            'anonymous_id',
            'analytics_allowed',
            'cookie_consent_accepted',
            'frontend_consent_accepted',
            'consent_timestamp'
        ];

        knownCookies.forEach(cookieName => {
            this.deleteCookie(cookieName);
            this.deleteCookie(cookieName, '/');
            this.deleteCookie(cookieName, '');
        });
    }

    /**
     * Очистка токенов аутентификации из localStorage (для миграции и logout)
     */
    static clearAuthTokensFromLocalStorage() {
        // Проверяем, что мы на клиенте
        if (!this.isClient()) {
            return;
        }

        // Удаляем только токены аутентификации из localStorage
        // Оставляем настройки UI и другие пользовательские предпочтения
        const authKeys = [
            'access_token',
            'refresh_token'
        ];

        authKeys.forEach(key => {
            localStorage.removeItem(key);
        });
    }

    /**
     * Полная очистка localStorage (для logout)
     * Удаляет только данные, связанные с пользовательской сессией
     */
    static clearSessionLocalStorage() {
        // Проверяем, что мы на клиенте
        if (!this.isClient()) {
            return;
        }

        // Удаляем только данные сессии, оставляем настройки UI
        const sessionKeys = [
            'access_token',
            'refresh_token'
            // НЕ удаляем 'cookie_consent_accepted' - это настройка пользователя
            // НЕ удаляем 'sidebar_collapsed' - это настройка UI
        ];

        sessionKeys.forEach(key => {
            localStorage.removeItem(key);
        });
    }

    /**
     * Установить согласие на использование cookies
     * @param {boolean} consent - согласие пользователя
     */
    static setConsentForCookies(consent) {
        // Проверяем, что мы на клиенте
        if (!this.isClient()) {
            return;
        }

        const LOCALSTORAGE_KEY = "cookie_consent_accepted";
        const value = consent ? "1" : "0";

        // Сохраняем в localStorage
        localStorage.setItem(LOCALSTORAGE_KEY, value);

        // Также сохраняем в обычном cookie для персистентности (не httpOnly)
        // Это поможет сохранить состояние между сессиями браузера
        this.setCookie('frontend_consent_accepted', value, {
            maxAge: 365 * 24 * 60 * 60, // 1 год
            sameSite: 'lax'
        });

        // Сохраняем timestamp для отслеживания когда было дано согласие
        if (consent) {
            this.setCookie('consent_timestamp', Date.now().toString(), {
                maxAge: 365 * 24 * 60 * 60, // 1 год
                sameSite: 'lax'
            });
        } else {
            this.deleteCookie('consent_timestamp');
        }
    }

    /**
     * Проверка наличия согласия на cookies с восстановлением из cookies
     * @returns {boolean} true если согласие дано
     */
    static hasConsentForCookies() {
        // Проверяем, что мы на клиенте
        if (!this.isClient()) {
            return false; // На сервере считаем, что согласия нет
        }

        const LOCALSTORAGE_KEY = "cookie_consent_accepted";

        // Сначала проверяем localStorage
        let localStorageConsent = localStorage.getItem(LOCALSTORAGE_KEY);

        // Если в localStorage нет данных, пытаемся восстановить из cookies
        if (!localStorageConsent) {
            const frontendConsent = this.getCookie('frontend_consent_accepted');
            if (frontendConsent) {
                // Восстанавливаем состояние в localStorage
                localStorage.setItem(LOCALSTORAGE_KEY, frontendConsent);
                localStorageConsent = frontendConsent;
            }
        }

        return localStorageConsent === '1';
    }

    /**
     * Получить timestamp согласия
     * @returns {number|null} timestamp или null
     */
    static getConsentTimestamp() {
        // Проверяем, что мы на клиенте
        if (!this.isClient()) {
            return null;
        }

        const timestamp = this.getCookie('consent_timestamp');
        return timestamp ? parseInt(timestamp) : null;
    }

    /**
     * Миграция токенов из localStorage в cookies
     * Вызывается автоматически при инициализации приложения
     */
    static migrateTokensFromLocalStorage() {
        // Миграция выполняется только на клиенте
        if (!this.isClient()) {
            return;
        }

        try {
            const accessToken = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');

            // Если токены есть в localStorage, но нет в cookies - мигрируем
            if (accessToken && refreshToken) {
                const cookieAccessToken = this.getAccessToken();
                const cookieRefreshToken = this.getRefreshToken();

                if (!cookieAccessToken || !cookieRefreshToken) {
                    console.log('Migrating authentication tokens from localStorage to cookies...');
                    this.setAuthTokens(accessToken, refreshToken);
                    this.clearAuthTokensFromLocalStorage();
                    console.log('Token migration completed successfully');
                }
            }
        } catch (error) {
            console.error('Error during token migration:', error);
        }
    }
}

import { BASE_API } from "../constants/backend-urls";
import { tokenManager } from "@/utils/tokenManager";
import { ERROR_MESSAGES } from "@/constants/errors";
import { ValidationError, NetworkError, AuthError } from "@/utils/errors";
import { BANNED_USERNAMES } from '@/constants/validation';
import { CookieManager } from '@/utils/cookies';

export default class AuthService {
    static getAccessToken() {
        // Теперь используем cookies как основной источник
        let token = CookieManager.getAccessToken();

        // Если токена нет в cookies, пытаемся найти в localStorage (для миграции)
        // Проверяем наличие localStorage для SSR безопасности
        if (!token && typeof localStorage !== 'undefined') {
            token = localStorage.getItem('access_token');
            // Если нашли в localStorage, мигрируем в cookies
            if (token) {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    this.setTokens(token, refreshToken);
                }
            }
        }

        return token;
    }

    static getRefreshToken() {
        // Теперь используем cookies как основной источник
        let token = CookieManager.getRefreshToken();

        // Если токена нет в cookies, пытаемся найти в localStorage (для миграции)
        // Проверяем наличие localStorage для SSR безопасности
        if (!token && typeof localStorage !== 'undefined') {
            token = localStorage.getItem('refresh_token');
            // Если нашли в localStorage, мигрируем в cookies
            if (token) {
                const accessToken = localStorage.getItem('access_token');
                if (accessToken) {
                    this.setTokens(accessToken, token);
                }
            }
        }

        return token;
    }

    static setTokens(accessToken, refreshToken) {
        // Теперь cookies - основное хранилище
        CookieManager.setAuthTokens(accessToken, refreshToken);

        // Очищаем старые токены из localStorage
        CookieManager.clearAuthTokensFromLocalStorage();
    }

    static async makeAuthenticatedRequest(url, options = {}) {
        await tokenManager.ensureValidToken();
        
        const accessToken = this.getAccessToken();
        if (!accessToken) {
            throw new AuthError(ERROR_MESSAGES.not_authenticated);
        }

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (response.status === 401) {
                    if (errorData.error_key === 'token_expired') {
                        throw new AuthError(ERROR_MESSAGES.token_expired);
                    }
                    throw new AuthError(errorData.detail || ERROR_MESSAGES.invalid_credentials);
                }
                
                if (response.status === 400) {
                    if (errorData.error_key === 'validation_error') {
                        throw new ValidationError(errorData.detail || ERROR_MESSAGES.validation_error);
                    }
                    throw new ValidationError(errorData.detail || ERROR_MESSAGES.invalid_request);
                }
                
                if (response.status === 403) {
                    throw new AuthError(ERROR_MESSAGES.insufficient_permissions);
                }
                
                if (response.status === 404) {
                    throw new Error(ERROR_MESSAGES.not_found);
                }
                
                throw new Error(errorData.detail || ERROR_MESSAGES.internal_server_error);
            }

            return response;
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }

    static async register(username, email, password) {
        try {
            if (BANNED_USERNAMES.includes(username.toLowerCase())) {
                throw new ValidationError(ERROR_MESSAGES.username_banned);
            }

            const response = await fetch(`${BASE_API}/v1/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (errorData.error_key && ERROR_MESSAGES[errorData.error_key]) {
                    throw new ValidationError(ERROR_MESSAGES[errorData.error_key]);
                } else {
                    throw new ValidationError(errorData.detail || ERROR_MESSAGES.validation_error);
                }
            }

            return await response.json();
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }

    static async login(emailOrUsername, password) {
        try {
            const isEmail = emailOrUsername.includes('@');
            const loginData = {
                password,
                ...(isEmail ? { email: emailOrUsername } : { username: emailOrUsername })
            };

            const response = await fetch(`${BASE_API}/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (errorData.error_key && ERROR_MESSAGES[errorData.error_key]) {
                    throw new Error(ERROR_MESSAGES[errorData.error_key]);
                } else {
                    throw new Error(errorData.detail || ERROR_MESSAGES.default);
                }
            }

            const data = await response.json();
            this.setTokens(data.access_token, data.refresh_token);
            return data;
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }

    static async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new AuthError(ERROR_MESSAGES.not_authenticated);
            }

            const response = await fetch(`${BASE_API}/v1/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({'refresh_token': refreshToken}),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (errorData.error_key && ERROR_MESSAGES[errorData.error_key]) {
                    throw new AuthError(ERROR_MESSAGES[errorData.error_key]);
                } else {
                    throw new Error(errorData.detail || ERROR_MESSAGES.internal_server_error);
                }
            }

            const data = await response.json();
            this.setTokens(data.access_token, data.refresh_token);
            return data;
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }

    static async getCurrentUser() {
        try {
            const response = await this.makeAuthenticatedRequest(`${BASE_API}/v1/users/me`);
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    static async updateUserProfile(profileData) {
        try {
            const response = await this.makeAuthenticatedRequest(`${BASE_API}/v1/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    static async updateAvatar(imageFile) {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await this.makeAuthenticatedRequest(`${BASE_API}/v1/users/me/avatar`, {
                method: 'PATCH',
                body: formData
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    static async deleteAvatar() {
        try {
            await this.makeAuthenticatedRequest(`${BASE_API}/v1/users/me/avatar`, {
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            throw error;
        }
    }

    static logout() {
        // Очищаем токены аутентификации из localStorage (если остались)
        CookieManager.clearAuthTokensFromLocalStorage();

        // Полная очистка всех cookies (согласно требованиям)
        CookieManager.clearAllCookies();
    }

    static async getPaginatedRecipes(offset = 0, limit = 10) {
        try {
            await tokenManager.ensureValidToken();

            const accessToken = AuthService.getAccessToken();
            if (!accessToken) {
                throw new AuthError(ERROR_MESSAGES.not_authenticated);
            }

            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };

            const url = new URL(`${BASE_API}/v1/users/me/recipes`);
            url.searchParams.append('offset', offset.toString());
            url.searchParams.append('limit', limit.toString());
            
            const response = await fetch(url.toString(), {headers: headers});
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (errorData.error_key && ERROR_MESSAGES[errorData.error_key]) {
                    throw new Error(ERROR_MESSAGES[errorData.error_key]);
                } else {
                    throw new Error(errorData.detail || ERROR_MESSAGES.default);
                }
            }

            const data = await response.json();
            const totalCountHeader = response.headers.get('X-Total-Count');
            
            return {
                data: data,
                totalCount: parseInt(totalCountHeader, 10) || 0
            };
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }
}
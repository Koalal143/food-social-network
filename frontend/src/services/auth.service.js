import { BASE_API } from "./constants";
import { tokenManager } from "@/utils/tokenManager";

class CustomError extends Error {
    constructor(message, name = 'Error') {
        super(message);
        this.name = name;
    }
}

class NetworkError extends CustomError {
    constructor(message) {
        super(message, 'NetworkError');
    }
}

class AuthError extends CustomError {
    constructor(message) {
        super(message, 'AuthError');
    }
}

class ValidationError extends CustomError {
    constructor(message) {
        super(message, 'ValidationError');
    }
}

export default class AuthService {
    static getAccessToken() {
        return localStorage.getItem('access_token');
    }

    static getRefreshToken() {
        return localStorage.getItem('refresh_token');
    }

    static setTokens(accessToken, refreshToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    }

    static async makeAuthenticatedRequest(url, options = {}) {
        await tokenManager.ensureValidToken();
        
        const accessToken = this.getAccessToken();
        if (!accessToken) {
            throw new AuthError('Пользователь не авторизован');
        }

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`
        };

        try {
            const response = await fetch(url, { ...options, headers });
            
            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401) {
                    throw new AuthError(errorData.detail || 'Ошибка авторизации');
                } else if (response.status === 400) {
                    throw new ValidationError(errorData.detail || 'Ошибка валидации');
                } else {
                    throw new Error(errorData.detail || 'Неизвестная ошибка');
                }
            }

            return response;
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError('Проблема с подключением к сети');
            }
            throw error;
        }
    }

    static async register(username, email, password) {
        try {
            const response = await fetch(`${BASE_API}/v1/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 400) {
                    throw new ValidationError(errorData.detail || 'Ошибка валидации данных');
                }
                throw new Error(errorData.detail || 'Ошибка регистрации');
            }

            return await response.json();
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError('Проблема с подключением к сети');
            }
            throw error;
        }
    }

    static async login(emailOrUsername, password) {
        try {
            const response = await fetch(`${BASE_API}/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailOrUsername.includes('@') ? emailOrUsername : null,
                    username: !emailOrUsername.includes('@') ? emailOrUsername : null,
                    password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401) {
                    throw new AuthError(errorData.detail || 'Неверные учетные данные');
                } else if (response.status === 400) {
                    throw new ValidationError(errorData.detail || 'Ошибка валидации данных');
                }
                throw new Error(errorData.detail || 'Ошибка входа');
            }

            const data = await response.json();
            this.setTokens(data.access_token, data.refresh_token);
            return data;
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError('Проблема с подключением к сети');
            }
            throw error;
        }
    }

    static async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new AuthError('Отсутствует refresh token');
            }

            const response = await fetch(`${BASE_API}/v1/auth/refresh?refresh_token=${refreshToken}`, {
                method: 'POST',
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401) {
                    throw new AuthError(errorData.detail || 'Недействительный refresh token');
                }
                throw new Error(errorData.detail || 'Ошибка обновления токена');
            }

            const data = await response.json();
            this.setTokens(data.access_token, data.refresh_token);
            return data;
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError('Проблема с подключением к сети');
            }
            throw error;
        }
    }

    static async getCurrentUser() {
        try {
            const response = await this.makeAuthenticatedRequest(`${BASE_API}/v1/users/me`);
            return await response.json();
        } catch (error) {
            console.error('Ошибка получения данных пользователя:', error);
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
            console.error('Ошибка обновления профиля:', error);
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
            console.error('Ошибка обновления аватара:', error);
            throw error;
        }
    }

    static async deleteAvatar() {
        try {
            const response = await this.makeAuthenticatedRequest(`${BASE_API}/v1/users/me/avatar`, {
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            console.error('Ошибка удаления аватара:', error);
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
}
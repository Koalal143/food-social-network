import { BASE_API } from "./constants";

class AuthService {
    static async register(username, email, password) {
        try {
            const response = await fetch(`${BASE_API}/v1/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка регистрации');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            throw error;
        }
    }

    static async login(emailOrUsername, password) {
        try {
            const body = emailOrUsername.includes('@') 
                ? { email: emailOrUsername, password }
                : { username: emailOrUsername, password };

            const response = await fetch(`${BASE_API}/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка входа');
            }

            const data = await response.json();
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);
            return data;
        } catch (error) {
            console.error('Ошибка входа:', error);
            throw error;
        }
    }

    static async refresh() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) throw new Error('Refresh token отсутствует');

            const response = await fetch(`${BASE_API}/v1/auth/refresh?refresh_token=${refreshToken}`, {
                method: 'POST'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка обновления токена');
            }

            const data = await response.json();
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);
            return data;
        } catch (error) {
            console.error('Ошибка обновления токена:', error);
            throw error;
        }
    }

    static async getCurrentUser() {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) throw new Error('Пользователь не авторизован');

            const response = await fetch(`${BASE_API}/v1/users/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка получения данных пользователя');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка получения данных пользователя:', error);
            throw error;
        }
    }

    static async updateUserProfile(profileData) {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) throw new Error('Пользователь не авторизован');

            const response = await fetch(`${BASE_API}/v1/users/me`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка обновления профиля');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            throw error;
        }
    }

    static async updateAvatar(imageFile) {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) throw new Error('Пользователь не авторизован');

            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`${BASE_API}/v1/users/me/avatar`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка обновления аватара');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка обновления аватара:', error);
            throw error;
        }
    }

    static async deleteAvatar() {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) throw new Error('Пользователь не авторизован');

            const response = await fetch(`${BASE_API}/v1/users/me/avatar`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка удаления аватара');
            }

            return true;
        } catch (error) {
            console.error('Ошибка удаления аватара:', error);
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
}

export default AuthService;
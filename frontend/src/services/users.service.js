import { BASE_API } from "./constants";

export default class UsersService {
    static async getAllUsers() {
        try {
            const response = await fetch('/users.json');
            if (!response.ok) throw new Error('Ошибка при загрузке пользователей');
            const data = await response.json();
            console.log('Users loaded:', data);
            return data;
        } catch (error) {
            console.error('Ошибка:', error);
            return [];
        }
    }

    static async getUserById(id) {
        try {
            const response = await fetch('/users.json');
            if (!response.ok) throw new Error('Ошибка при загрузке пользователей');
            const users = await response.json();
            const user = users.find(user => user.id === id);
            console.log('User found:', user);
            return user;
        } catch (error) {
            console.error('Ошибка:', error);
            return null;
        }
    }

    static async getCurrentUser() {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                throw new Error('No access token found');
            }

            const response = await fetch(`${BASE_API}/v1/users/me`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    static async updateCurrentUser(userData) {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                throw new Error('No access token found');
            }

            const response = await fetch(`${BASE_API}/v1/users/me`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    static async updateAvatar(imageFile) {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                throw new Error('No access token found');
            }

            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`${BASE_API}/v1/users/me/avatar`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    static async deleteAvatar() {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                throw new Error('No access token found');
            }

            const response = await fetch(`${BASE_API}/v1/users/me/avatar`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail);
            }
        } catch (error) {
            throw error;
        }
    }
} 
import { BASE_API } from "../constants/backend-urls";
import { ERROR_MESSAGES } from "@/constants/errors";
import { NetworkError } from "@/utils/errors";
import AuthService from "./auth.service";

export default class UsersService {
    static async getAllUsers() {
        try {
            const response = await AuthService.makeAuthenticatedRequest(`${BASE_API}/v1/users`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || ERROR_MESSAGES.internal_server_error);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
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
} 
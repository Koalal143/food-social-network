import { BASE_API } from "@/constants/backend-urls";
import { tokenManager } from "@/utils/tokenManager";
import AuthService from "./auth.service";
import { AuthError, NetworkError } from "@/utils/errors";
import { ERROR_MESSAGES } from "@/constants/errors";

export default class UserService {
    static async getAllUsers(offset = 0, limit = 10, searchQuery = '') {
        try {
            const url = new URL(`${BASE_API}/v1/users`);
            url.searchParams.append('offset', offset.toString());
            url.searchParams.append('limit', limit.toString());
            if (searchQuery) {
                url.searchParams.append('q', searchQuery);
            }

            await tokenManager.ensureValidToken();
            const accessToken = AuthService.getAccessToken();
            if (!accessToken) {
                throw new AuthError(ERROR_MESSAGES.not_authenticated);
            }

            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new NetworkError(errorData.detail || ERROR_MESSAGES.network_error, response.status, errorData.error_key);
            }

            const totalCount = parseInt(response.headers.get('X-Total-Count') || '0', 10);
            const data = await response.json();

            return { data, totalCount };
        } catch (error) {
            console.error("UserService.getAllUsers: ", error);
            throw error;
        }
    }

    static async toggleUserStatus(userId, isActive) {
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

            const response = await fetch(`${BASE_API}/v1/users/${userId}/status`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ is_active: isActive })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new NetworkError(errorData.detail || ERROR_MESSAGES.network_error, response.status, errorData.error_key);
            }

            return response.json();
        } catch (error) {
            console.error("UserService.toggleUserStatus: ", error);
            throw error;
        }
    }

    static async changeUserRole(userId, isSuperuser) {
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

            const response = await fetch(`${BASE_API}/v1/users/${userId}/role`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ is_superuser: isSuperuser })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new NetworkError(errorData.detail || ERROR_MESSAGES.network_error, response.status, errorData.error_key);
            }

            return response.json();
        } catch (error) {
            console.error("UserService.changeUserRole: ", error);
            throw error;
        }
    }
} 
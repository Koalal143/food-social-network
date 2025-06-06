import { BASE_API } from "../constants/backend-urls";
import { ERROR_MESSAGES } from "@/constants/errors";
import { NetworkError } from "@/utils/errors";
import AuthService from "./auth.service";

export default class UsersService {
    static async getAllUsers() {
        try {
            const response = await AuthService.makeAuthenticatedRequest(`${BASE_API}/v1/users`);
            
            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));

                if (errorData.error_key && ERROR_MESSAGES[errorData.error_key]) {
                    throw new Error(ERROR_MESSAGES[errorData.error_key]);
                } else {
                    throw new Error(errorData.detail || ERROR_MESSAGES.default);
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

    static async getUserByUsername(username) {
        try {
            const response = await fetch(`${BASE_API}/v1/users/${username}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (errorData.error_key && ERROR_MESSAGES[errorData.error_key]) {
                    throw new Error(ERROR_MESSAGES[errorData.error_key]);
                } else {
                    throw new Error(errorData.detail || ERROR_MESSAGES.default);
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
} 
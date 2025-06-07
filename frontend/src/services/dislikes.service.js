import { BASE_API } from "@/constants/backend-urls";
import { tokenManager } from "@/utils/tokenManager";
import AuthService from "./auth.service";
import { AuthError, NetworkError } from "@/utils/errors";
import { ERROR_MESSAGES } from "@/constants/errors";

export default class DislikesService {
    static async addToDisliked(recipeId, options={}) {
        try {
            await tokenManager.ensureValidToken();

            const accessToken = AuthService.getAccessToken();
            if (!accessToken) {
                throw new AuthError(ERROR_MESSAGES.not_authenticated);
            }
            
            const headers = {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(`${BASE_API}/v1/disliked-recipes`, {
                method: 'POST',
                body: JSON.stringify({'recipe_id': recipeId}),
                headers: headers,
                credentials: 'include'
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (errorData.error_key && ERROR_MESSAGES[errorData.error_key]) {
                    throw new Error(ERROR_MESSAGES[errorData.error_key]);
                } else {
                    throw new Error(errorData.detail || ERROR_MESSAGES.default);
                }
            }

            return await response.json()
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }

    static async removeFromDisliked(recipeId, options={}) {
        try {
            await tokenManager.ensureValidToken();

            const accessToken = AuthService.getAccessToken();
            if (!accessToken) {
                throw new AuthError(ERROR_MESSAGES.not_authenticated);
            }
            
            const headers = {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(`${BASE_API}/v1/disliked-recipes/${recipeId}`, {
                method: 'DELETE',
                headers: headers,
                credentials: 'include'
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (errorData.error_key && ERROR_MESSAGES[errorData.error_key]) {
                    throw new Error(ERROR_MESSAGES[errorData.error_key]);
                } else {
                    throw new Error(errorData.detail || ERROR_MESSAGES.default);
                }
            }
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }
}
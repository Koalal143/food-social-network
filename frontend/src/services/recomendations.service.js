import { BASE_API } from "@/constants/backend-urls";
import { tokenManager } from "@/utils/tokenManager";
import AuthService from "./auth.service";
import { NetworkError } from "@/utils/errors";
import { ERROR_MESSAGES } from "@/constants/errors";

export default class RecomendationsService {
    static async getRecomendationsRecipes(limit, options={}) {
        try {
            await tokenManager.ensureValidToken();

            const accessToken = AuthService.getAccessToken();

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                ...options.headers
            };

            const response = await fetch(`${BASE_API}/v1/recommendations?limit=${limit}`, {
                headers: headers,
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
            
            return await response.json();
        } catch (error) {            
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }
}
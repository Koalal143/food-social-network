import { BASE_API } from "@/constants/backend-urls";
import { tokenManager } from "@/utils/tokenManager";
import AuthService from "./auth.service";
import { AuthError } from "@/utils/errors";
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
                headers: headers
            })

            if (!response.ok) {
                // Обработка ошибок с бэка
            }

            return response.json()
        } catch (error) {
            // Обработка ошибок с бэка
        }
    }
}
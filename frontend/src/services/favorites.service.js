import { BASE_API } from "@/constants/backend-urls";
import { tokenManager } from "@/utils/tokenManager";
import AuthService from "./auth.service";

export default class FavoritesService {
    static async getPaginatedFavorites(offset = 0, limit = 10, options={}) {
        try {
            const url = new URL(`${BASE_API}/v1/favorite-recipes`);
            url.searchParams.append('offset', offset.toString());
            url.searchParams.append('limit', limit.toString());

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

            const response = await fetch(url.toString(), {
                headers: headers
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (response.status === 503) {
                    throw new NetworkError(ERROR_MESSAGES.service_unavailable);
                }
                
                throw new Error(errorData.detail || 'Ошибка при загрузке рецептов');
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

    static async addToFavorites(recipeId, options={}) {
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

            const response = await fetch(`${BASE_API}/v1/favorite-recipes`, {
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

    static async removeFromFavorites(recipeId, options={}) {
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

        try {
            const response = await fetch(`${BASE_API}/v1/favorite-recipes/${recipeId}`, {
                method: 'DELETE',
                headers: headers
            })

            if (!response.ok) {
            // Обработка ошибок с бэка
            }
        } catch (error) {
            // Обработка ошибок с бэка
        }
    }
}
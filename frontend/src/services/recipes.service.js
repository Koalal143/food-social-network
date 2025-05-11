import { BASE_API } from "@/constants/backend-urls";
import AuthService from "./auth.service";
import { tokenManager } from "@/utils/tokenManager";

export default class RecipesService {
    static async getAllRecipes() {
        try {
            const response = await fetch('/recipes.json');
            if (!response.ok) throw new Error('Ошибка при загрузке рецептов');
            return await response.json();
        } catch (error) {
            console.error('Ошибка:', error);
            return [];
        }
    }

    static async getRecipeById(id) {
        try {
            const response = await fetch(`${BASE_API}/v1/recipes/${id}`);
            if (!response.ok) throw new Error('Ошибка при загрузке рецептов');
            return response.json()
        } catch (error) {
            console.error('Ошибка:', error);
            return null;
        }
    }

    static async addRecipe(recipe, options = {}) {
        try {
            await tokenManager.ensureValidToken();

            const accessToken = AuthService.getAccessToken()
            const headers = {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };
            const response = await fetch(`${BASE_API}/v1/recipes`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(recipe)
            })
            if (!response.ok) {
                // Обработка ошибок бэка
            }

            return response.json()
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }

    static async getUploadImageUrl(recipeId, options = {}) {
        try {
            await tokenManager.ensureValidToken();

            const accessToken = AuthService.getAccessToken()
            const headers = {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(`${BASE_API}/v1/recipes/${recipeId}/image/upload-url`, {
                method: 'GET',
                headers: headers
            })

            if (!response.ok) {
                // Обработка ошибок бэка
            }

            return response.json()
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }

    static async getUploadInstructionsUrls(recipeId, steps, options = {}) {
        try {
            await tokenManager.ensureValidToken();
    
            const accessToken = AuthService.getAccessToken();
            const headers = {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`,
                'accept': 'application/json'
            };
    
            const url = new URL(`${BASE_API}/v1/recipes/${recipeId}/instructions/upload-urls`);
            steps.forEach(step => {
                url.searchParams.append('steps', step);
            });

            console.log(url);
            
    
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: headers
            });
    
            if (!response.ok) {
                //Обработка ошибок бэка
            }
    
            return await response.json();
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }

    static async updateRecipe(recipeData, options={}) {
        try {
            await tokenManager.ensureValidToken();
    
            const accessToken = AuthService.getAccessToken();
            const headers = {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            };

            const response = await fetch(`${BASE_API}/v1/recipes/${recipeData.id}`, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify(recipeData)
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    static async getRecipesByAuthorId(authorId) {
        try {
            const response = await fetch('/recipes.json');
            if (!response.ok) throw new Error('Ошибка при загрузке рецептов');
            const recipes = await response.json();
            return recipes.filter(recipe => recipe.authorId === authorId);
        } catch (error) {
            console.error('Ошибка:', error);
            return [];
        }
    }
}
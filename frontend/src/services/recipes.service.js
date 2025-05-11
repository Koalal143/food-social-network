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
            const response = await fetch('/recipes.json');
            if (!response.ok) throw new Error('Ошибка при загрузке рецептов');
            const receipts = await response.json();
            return receipts.find(receipt => receipt.id === id);
        } catch (error) {
            console.error('Ошибка:', error);
            return null;
        }
    }

    static async addRecipe(recipe, options = {}) {
        try {
            await tokenManager.ensureValidToken();

            console.log(recipe);

            const accessToken = AuthService.getAccessToken()
            const headers = {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`
            };
            const response = await fetch(`${BASE_API}/v1/recipes`, {
                method: 'POST',
                headers: headers
            })
            if (!response.ok) {
                // Обработка ошибок бэка
            }
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
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
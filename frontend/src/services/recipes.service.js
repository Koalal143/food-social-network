import { BASE_API } from "@/constants/backend-urls";
import AuthService from "./auth.service";
import { AuthError, NotFoundError, NetworkError, ValidationError } from "@/utils/errors";
import { tokenManager } from "@/utils/tokenManager";
import { ERROR_MESSAGES } from "@/constants/errors";

export default class RecipesService {
    static async getPaginatedRecipes(offset = 0, limit = 10, options={}) {
        try {
            await tokenManager.ensureValidToken();

            const accessToken = AuthService.getAccessToken();

            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };

            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
            }

            const url = new URL(`${BASE_API}/v1/recipes`);
            url.searchParams.append('offset', offset.toString());
            url.searchParams.append('limit', limit.toString());
            
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

    static async getRecipeBySlug(slug, source='feed', options={}) {
        try {
            await tokenManager.ensureValidToken();

            const accessToken = AuthService.getAccessToken();
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };

            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
            }

            const response = await fetch(`${BASE_API}/v1/recipes/by-slug/${slug}?source=${source}`, {
                headers: headers
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (response.status === 404) {
                    if (errorData.error_key === 'recipe_not_found') {
                        throw new NotFoundError(ERROR_MESSAGES.recipe_not_found);
                    }
                    throw new NotFoundError(errorData.detail || ERROR_MESSAGES.recipe_not_found);
                }
                
                throw new Error(errorData.detail || ERROR_MESSAGES.default);
            }
            
            return await response.json();
        } catch (error) {            
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            
            throw error;
        }
    }

    static async addRecipe(recipe, options = {}) {
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
            
            const response = await fetch(`${BASE_API}/v1/recipes`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(recipe)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (response.status === 401) {
                    if (errorData.error_key === 'token_expired') {
                        throw new AuthError(ERROR_MESSAGES.token_expired);
                    }
                    throw new AuthError(errorData.detail || ERROR_MESSAGES.invalid_credentials);
                }
                
                if (response.status === 400) {
                    throw new ValidationError(errorData.detail || ERROR_MESSAGES.validation_error);
                }
                
                throw new Error(errorData.detail || ERROR_MESSAGES.default);
            }

            return await response.json();
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

            const accessToken = AuthService.getAccessToken();
            if (!accessToken) {
                throw new AuthError(ERROR_MESSAGES.not_authenticated);
            }
            
            const headers = {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(`${BASE_API}/v1/recipes/${recipeId}/image/upload-url`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (response.status === 403) {
                    if (errorData.error_key === 'recipe_belongs_to_other_user') {
                        throw new AuthError(ERROR_MESSAGES.insufficient_permissions);
                    }
                    throw new AuthError(errorData.detail || ERROR_MESSAGES.insufficient_permissions);
                }
                
                if (response.status === 404) {
                    throw new NotFoundError(ERROR_MESSAGES.recipe_not_found);
                }
                
                if (response.status === 401) {
                    throw new AuthError(ERROR_MESSAGES.not_authenticated);
                }
                
                throw new Error(errorData.detail || ERROR_MESSAGES.default);
            }

            return await response.json();
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
            if (!accessToken) {
                throw new AuthError(ERROR_MESSAGES.not_authenticated);
            }
            
            const headers = {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`,
                'accept': 'application/json'
            };
    
            const url = new URL(`${BASE_API}/v1/recipes/${recipeId}/instructions/upload-urls`);
            steps.forEach(step => {
                url.searchParams.append('steps', step);
            });
    
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: headers
            });
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (response.status === 404) {
                    if (errorData.error_key === 'recipe_not_found') {
                        throw new NotFoundError(ERROR_MESSAGES.recipe_not_found);
                    }
                    throw new NotFoundError(errorData.detail || ERROR_MESSAGES.not_found);
                }
                
                if (response.status === 403) {
                    throw new AuthError(ERROR_MESSAGES.insufficient_permissions);
                }
                
                if (response.status === 401) {
                    throw new AuthError(ERROR_MESSAGES.not_authenticated);
                }
                
                throw new Error(errorData.detail || ERROR_MESSAGES.default);
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
            if (!accessToken) {
                throw new AuthError(ERROR_MESSAGES.not_authenticated);
            }
            
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
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (response.status === 404) {
                    throw new NotFoundError(ERROR_MESSAGES.recipe_not_found);
                }
                
                if (response.status === 403) {
                    throw new AuthError(ERROR_MESSAGES.insufficient_permissions);
                }
                
                if (response.status === 401) {
                    throw new AuthError(ERROR_MESSAGES.not_authenticated);
                }
                
                if (response.status === 400) {
                    throw new ValidationError(errorData.detail || ERROR_MESSAGES.validation_error);
                }
                
                throw new Error(errorData.detail || ERROR_MESSAGES.default);
            }
            
            return await response.json();
        } catch (error) {            
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            
            throw error;
        }
    }

    static async getPaginatedRecipesByUsername(username, offset = 0, limit = 10) {
        try {
            const url = new URL(`${BASE_API}/v1/users/${username}/recipes`);
            url.searchParams.append('offset', offset.toString());
            url.searchParams.append('limit', limit.toString());
            
            const response = await fetch(url.toString());
            
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
}
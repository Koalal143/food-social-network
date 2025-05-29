import RecipesService from '../recipes.service';
import { AuthError, NotFoundError, NetworkError } from '@/utils/errors';

// Мок для тестирования
global.fetch = jest.fn();

// Мок для tokenManager
jest.mock('@/utils/tokenManager', () => ({
    tokenManager: {
        ensureValidToken: jest.fn().mockResolvedValue(true)
    }
}));

// Мок для AuthService
jest.mock('../auth.service', () => ({
    default: {
        getAccessToken: jest.fn().mockReturnValue('mock-token')
    }
}));

describe('RecipesService.deleteRecipe', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test('должен успешно удалить рецепт', async () => {
        const mockResponse = {
            ok: true,
            status: 204
        };
        
        fetch.mockResolvedValue(mockResponse);

        const result = await RecipesService.deleteRecipe(123);

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/v1/recipes/123'),
            expect.objectContaining({
                method: 'DELETE',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer mock-token',
                    'Content-Type': 'application/json'
                })
            })
        );

        expect(result).toBe(true);
    });

    test('должен выбросить NotFoundError для несуществующего рецепта', async () => {
        const mockResponse = {
            ok: false,
            status: 404,
            json: () => Promise.resolve({
                error_key: 'recipe_not_found',
                detail: 'Recipe not found'
            })
        };
        
        fetch.mockResolvedValue(mockResponse);

        await expect(RecipesService.deleteRecipe(999))
            .rejects.toThrow(NotFoundError);
    });

    test('должен выбросить AuthError для чужого рецепта', async () => {
        const mockResponse = {
            ok: false,
            status: 403,
            json: () => Promise.resolve({
                error_key: 'recipe_belongs_to_other_user',
                detail: 'Recipe belongs to other user'
            })
        };
        
        fetch.mockResolvedValue(mockResponse);

        await expect(RecipesService.deleteRecipe(123))
            .rejects.toThrow(AuthError);
    });

    test('должен выбросить AuthError для неавторизованного пользователя', async () => {
        const mockResponse = {
            ok: false,
            status: 401,
            json: () => Promise.resolve({
                error_key: 'not_authenticated',
                detail: 'Not authenticated'
            })
        };
        
        fetch.mockResolvedValue(mockResponse);

        await expect(RecipesService.deleteRecipe(123))
            .rejects.toThrow(AuthError);
    });

    test('должен выбросить NetworkError при проблемах с сетью', async () => {
        fetch.mockRejectedValue(new TypeError('Failed to fetch'));

        await expect(RecipesService.deleteRecipe(123))
            .rejects.toThrow(NetworkError);
    });

    test('должен выбросить AuthError если нет токена', async () => {
        // Мокаем отсутствие токена
        const AuthService = require('../auth.service').default;
        AuthService.getAccessToken.mockReturnValue(null);

        await expect(RecipesService.deleteRecipe(123))
            .rejects.toThrow(AuthError);

        // Восстанавливаем мок
        AuthService.getAccessToken.mockReturnValue('mock-token');
    });
});

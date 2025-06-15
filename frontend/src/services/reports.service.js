import { BASE_API } from "@/constants/backend-urls";
import AuthService from "./auth.service";
import { tokenManager } from "@/utils/tokenManager";
import { AuthError, NetworkError, NotFoundError, ValidationError } from "@/utils/errors";
import { ERROR_MESSAGES } from "@/constants/errors";

export default class ReportsService {
    static async createRecipeReport(recipeId, reason, description = null) {
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

            const body = {
                recipe_id: recipeId,
                reason: reason,
                description: description
            };

            const response = await fetch(`${BASE_API}/v1/recipe-reports`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                
                switch (response.status) {
                    case 401:
                        throw new AuthError(errorData.detail || ERROR_MESSAGES.not_authenticated);
                    case 404:
                        throw new NotFoundError(ERROR_MESSAGES.recipe_not_found);
                    case 409:
                        if (errorData.error_key === 'recipe_report_already_exists') {
                            throw new ValidationError(ERROR_MESSAGES.recipe_report_already_exists);
                        }
                        if (errorData.error_key === 'cannot_report_own_recipe') {
                            throw new ValidationError(ERROR_MESSAGES.cannot_report_own_recipe);
                        }
                        throw new ValidationError(ERROR_MESSAGES.already_exists);
                    case 422:
                        throw new ValidationError(ERROR_MESSAGES.validation_error);
                    default:
                        throw new NetworkError(ERROR_MESSAGES.server_error);
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

    static async getMyReports(offset = 0, limit = 10) {
        try {
            await tokenManager.ensureValidToken();

            const accessToken = AuthService.getAccessToken();
            if (!accessToken) {
                throw new AuthError(ERROR_MESSAGES.not_authenticated);
            }

            const url = new URL(`${BASE_API}/v1/recipe-reports/my`);
            url.searchParams.append('offset', offset.toString());
            url.searchParams.append('limit', limit.toString());

            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(url.toString(), {
                headers: headers,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                
                switch (response.status) {
                    case 401:
                        throw new AuthError(errorData.detail || ERROR_MESSAGES.not_authenticated);
                    case 422:
                        throw new ValidationError(errorData.detail || 'Ошибка валидации параметров');
                    default:
                        throw new NetworkError(errorData.detail || ERROR_MESSAGES.server_error);
                }
            }

            const data = await response.json();
            const totalCount = parseInt(response.headers.get('X-Total-Count') || '0');

            return {
                data,
                totalCount
            };
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }

    static async getAllReports(offset = 0, limit = 10, status = null) {
        try {
            await tokenManager.ensureValidToken();

            const accessToken = AuthService.getAccessToken();
            if (!accessToken) {
                throw new AuthError(ERROR_MESSAGES.not_authenticated);
            }

            const url = new URL(`${BASE_API}/v1/recipe-reports`);
            url.searchParams.append('offset', offset.toString());
            url.searchParams.append('limit', limit.toString());
            if (status) {
                url.searchParams.append('status', status);
            }

            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(url.toString(), {
                headers: headers,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                
                switch (response.status) {
                    case 401:
                        throw new AuthError(errorData.detail || ERROR_MESSAGES.not_authenticated);
                    case 403:
                        throw new AuthError('Недостаточно прав для просмотра всех репортов');
                    case 422:
                        throw new ValidationError(errorData.detail || 'Ошибка валидации параметров');
                    default:
                        throw new NetworkError(errorData.detail || ERROR_MESSAGES.server_error);
                }
            }

            const data = await response.json();
            const totalCount = parseInt(response.headers.get('X-Total-Count') || '0');

            return {
                data,
                totalCount
            };
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }

    static async getReportsStats() {
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

            const response = await fetch(`${BASE_API}/v1/recipe-reports/stats`, {
                headers: headers,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                
                switch (response.status) {
                    case 401:
                        throw new AuthError(errorData.detail || ERROR_MESSAGES.not_authenticated);
                    case 403:
                        throw new AuthError('Недостаточно прав для просмотра статистики');
                    case 422:
                        throw new ValidationError(errorData.detail || 'Ошибка валидации');
                    default:
                        throw new NetworkError(errorData.detail || ERROR_MESSAGES.server_error);
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

    static async getReportById(reportId) {
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

            const response = await fetch(`${BASE_API}/v1/recipe-reports/${reportId}`, {
                headers: headers,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();

                switch (response.status) {
                    case 401:
                        throw new AuthError(errorData.detail || ERROR_MESSAGES.not_authenticated);
                    case 403:
                        throw new AuthError('Недостаточно прав для просмотра репорта');
                    case 404:
                        throw new NotFoundError(errorData.detail || 'Репорт не найден');
                    case 422:
                        throw new ValidationError(errorData.detail || 'Ошибка валидации');
                    default:
                        throw new NetworkError(errorData.detail || ERROR_MESSAGES.server_error);
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

    static async updateReport(reportId, status = null, adminNotes = null) {
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

            const body = {};
            if (status !== null) body.status = status;
            if (adminNotes !== null) body.admin_notes = adminNotes;

            const response = await fetch(`${BASE_API}/v1/recipe-reports/${reportId}`, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify(body),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();

                switch (response.status) {
                    case 401:
                        throw new AuthError(errorData.detail || ERROR_MESSAGES.not_authenticated);
                    case 403:
                        throw new AuthError('Недостаточно прав для обновления репорта');
                    case 404:
                        throw new NotFoundError(errorData.detail || 'Репорт не найден');
                    case 422:
                        throw new ValidationError(errorData.detail || 'Ошибка валидации данных');
                    default:
                        throw new NetworkError(errorData.detail || ERROR_MESSAGES.server_error);
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

    static async deleteReport(reportId) {
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

            const response = await fetch(`${BASE_API}/v1/recipe-reports/${reportId}`, {
                method: 'DELETE',
                headers: headers,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();

                switch (response.status) {
                    case 401:
                        throw new AuthError(errorData.detail || ERROR_MESSAGES.not_authenticated);
                    case 403:
                        throw new AuthError('Недостаточно прав для удаления репорта');
                    case 404:
                        throw new NotFoundError(errorData.detail || 'Репорт не найден');
                    case 422:
                        throw new ValidationError(errorData.detail || 'Ошибка валидации');
                    default:
                        throw new NetworkError(errorData.detail || ERROR_MESSAGES.server_error);
                }
            }

            return true;
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            throw error;
        }
    }
}

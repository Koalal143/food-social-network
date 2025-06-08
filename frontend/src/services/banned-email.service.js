import { BASE_API } from '@/constants/backend-urls';
import AuthService from './auth.service';
import { tokenManager } from '@/utils/tokenManager';
import { AuthError, NetworkError, ValidationError } from '@/utils/errors';
import { ERROR_MESSAGES } from '@/constants/errors';

class BannedEmailService {
    /**
     * Получить список заблокированных email доменов
     */
    static async getBannedEmails(offset = 0, limit = 50) {
        try {
            await tokenManager.ensureValidToken();
            const accessToken = AuthService.getAccessToken();

            if (!accessToken) {
                throw new AuthError('Требуется авторизация');
            }

            const url = new URL(`${BASE_API}/v1/banned-emails`);
            url.searchParams.append('offset', offset.toString());
            url.searchParams.append('limit', limit.toString());

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new AuthError('Недостаточно прав доступа');
                }
                if (response.status === 403) {
                    throw new AuthError('Доступ запрещен');
                }
                throw new NetworkError(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const totalCount = parseInt(response.headers.get('X-Total-Count') || '0');

            return {
                data: data,
                totalCount: totalCount
            };
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            if (error instanceof AuthError || error instanceof NetworkError) {
                throw error;
            }
            throw new NetworkError('Ошибка получения списка заблокированных email');
        }
    }

    /**
     * Заблокировать домен email
     */
    static async banEmailDomain(domain) {
        try {
            await tokenManager.ensureValidToken();
            const accessToken = AuthService.getAccessToken();

            if (!accessToken) {
                throw new AuthError('Требуется авторизация');
            }

            if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
                throw new ValidationError('Домен не может быть пустым');
            }

            const response = await fetch(`${BASE_API}/v1/banned-emails/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    domain: domain.trim().toLowerCase()
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new AuthError('Недостаточно прав доступа');
                }
                if (response.status === 403) {
                    throw new AuthError('Доступ запрещен');
                }
                if (response.status === 409) {
                    throw new ValidationError('Этот домен уже заблокирован');
                }
                if (response.status === 422) {
                    throw new ValidationError('Некорректный формат домена');
                }
                throw new NetworkError(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            if (error instanceof AuthError || error instanceof NetworkError || error instanceof ValidationError) {
                throw error;
            }
            throw new NetworkError('Ошибка блокировки домена');
        }
    }

    /**
     * Разблокировать домен email
     */
    static async unbanEmailDomain(domain) {
        try {
            await tokenManager.ensureValidToken();
            const accessToken = AuthService.getAccessToken();

            if (!accessToken) {
                throw new AuthError('Требуется авторизация');
            }

            if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
                throw new ValidationError('Домен не может быть пустым');
            }

            const response = await fetch(`${BASE_API}/v1/banned-emails/${encodeURIComponent(domain)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new AuthError('Недостаточно прав доступа');
                }
                if (response.status === 403) {
                    throw new AuthError('Доступ запрещен');
                }
                if (response.status === 404) {
                    throw new ValidationError('Домен не найден в списке заблокированных');
                }
                throw new NetworkError(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            if (error instanceof AuthError || error instanceof NetworkError || error instanceof ValidationError) {
                throw error;
            }
            throw new NetworkError('Ошибка разблокировки домена');
        }
    }

    /**
     * Проверить, заблокирован ли домен
     */
    static async checkEmailDomain(domain) {
        try {
            await tokenManager.ensureValidToken();
            const accessToken = AuthService.getAccessToken();

            if (!accessToken) {
                throw new AuthError('Требуется авторизация');
            }

            if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
                throw new ValidationError('Домен не может быть пустым');
            }

            const response = await fetch(`${BASE_API}/v1/banned-emails/check/${encodeURIComponent(domain)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new AuthError('Недостаточно прав доступа');
                }
                if (response.status === 403) {
                    throw new AuthError('Доступ запрещен');
                }
                throw new NetworkError(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.banned || false;
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError(ERROR_MESSAGES.service_unavailable);
            }
            if (error instanceof AuthError || error instanceof NetworkError || error instanceof ValidationError) {
                throw error;
            }
            throw new NetworkError('Ошибка проверки домена');
        }
    }
}

export default BannedEmailService;

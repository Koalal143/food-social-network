import { ERROR_MESSAGES } from '@/constants/errors'

/**
 * Обрабатывает ошибки API и возвращает понятное пользователю сообщение
 * @param {Error} error - Объект ошибки от API
 * @returns {{ message: string, type: 'error' | 'warning' }} Объект с сообщением и типом ошибки
 */
export const handleApiError = (error) => {
    // Если ошибка содержит response от сервера
    if (error.response?.data) {
        const { error_key, detail } = error.response.data

        // Если это ошибка валидации с деталями
        if (error_key === 'validation_error' && Array.isArray(detail)) {
            const validationMessages = detail
                .map(err => err.msg)
                .filter(Boolean)
                .join('. ')
            
            return {
                message: validationMessages || ERROR_MESSAGES.validation_error,
                type: 'error'
            }
        }

        // Если есть error_key, используем соответствующее сообщение
        if (error_key && ERROR_MESSAGES[error_key]) {
            return {
                message: ERROR_MESSAGES[error_key],
                type: error_key.includes('not_found') ? 'warning' : 'error'
            }
        }

        // Если есть detail, но нет error_key
        if (detail && typeof detail === 'string') {
            return {
                message: detail,
                type: 'error'
            }
        }
    }

    // Ошибки сети
    if (error.message === 'Network Error') {
        return {
            message: 'Ошибка соединения. Проверьте подключение к интернету',
            type: 'error'
        }
    }

    // Если не удалось определить тип ошибки
    return {
        message: ERROR_MESSAGES.default,
        type: 'error'
    }
}

/**
 * Форматирует ошибки валидации формы
 * @param {Object} errors - Объект с ошибками валидации
 * @returns {string} Отформатированное сообщение об ошибке
 */
export const formatValidationErrors = (errors) => {
    return Object.values(errors)
        .map(error => error.message)
        .join('. ')
} 
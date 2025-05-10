import { ERROR_MESSAGES } from '@/constants/errors'

/**
 * Обрабатывает ошибки API и возвращает понятное пользователю сообщение
 * @param {Error} error - Объект ошибки от API
 * @returns {{ message: string, type: 'error' | 'warning' }} Объект с сообщением и типом ошибки
 */
export const handleApiError = (error) => {
    // Если это кастомная ошибка с именем
    if (error.name) {
        switch (error.name) {
            case 'NetworkError':
                return {
                    message: 'Ошибка соединения. Проверьте подключение к интернету',
                    type: 'error'
                }
            case 'AuthError':
                return {
                    message: error.message || ERROR_MESSAGES.invalid_credentials,
                    type: 'error'
                }
            case 'ValidationError':
                return {
                    message: error.message || ERROR_MESSAGES.validation_error,
                    type: 'error'
                }
        }
    }

    // Если ошибка содержит response от сервера
    if (error.response?.data) {
        const { error_key, detail } = error.response.data

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

    // Если ошибка содержит message
    if (error.message) {
        // Проверяем, есть ли сообщение в константах
        const errorKey = Object.keys(ERROR_MESSAGES).find(key => 
            ERROR_MESSAGES[key].toLowerCase() === error.message.toLowerCase()
        )

        if (errorKey) {
            return {
                message: ERROR_MESSAGES[errorKey],
                type: errorKey.includes('not_found') ? 'warning' : 'error'
            }
        }

        // Если сообщение не найдено в константах, используем его как есть
        return {
            message: error.message,
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
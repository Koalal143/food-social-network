import { ERROR_MESSAGES } from '@/constants/errors';
import { NetworkError, AuthError, ValidationError, NotFoundError } from '@/utils/errors';

/**
 * Обрабатывает ошибки API и возвращает понятное пользователю сообщение
 * @param {Error} error - Объект ошибки от API
 * @returns {{ message: string, type: 'error' | 'warning' }} Объект с сообщением и типом ошибки
 */
export const handleApiError = (error) => {
  // Обработка кастомных ошибок
  if (error instanceof NetworkError) {
    return {
      message: error.message || ERROR_MESSAGES.service_unavailable,
      type: 'error'
    };
  } else if (error instanceof AuthError) {
    return {
      message: error.message || ERROR_MESSAGES.invalid_credentials,
      type: 'error'
    };
  } else if (error instanceof ValidationError) {
    return {
      message: error.message || ERROR_MESSAGES.validation_error,
      type: 'error'
    };
  } else if (error instanceof NotFoundError) {
    return {
      message: error.message || ERROR_MESSAGES.not_found,
      type: 'warning'
    };
  }

  // Проверка ответа API
  if (error.response?.data) {
    const { error_key, detail } = error.response.data;
    
    // Если есть error_key, используем соответствующее сообщение
    if (error_key && ERROR_MESSAGES[error_key]) {
      return {
        message: ERROR_MESSAGES[error_key],
        type: error_key.includes('not_found') ? 'warning' : 'error'
      };
    }
    
    // Если есть detail, но нет error_key
    if (detail && typeof detail === 'string') {
      return {
        message: detail,
        type: 'error'
      };
    }
  }

  // Обработка стандартного объекта Error
  if (error.message) {
    // Проверяем, есть ли сообщение в константах
    for (const key in ERROR_MESSAGES) {
      if (ERROR_MESSAGES[key].toLowerCase() === error.message.toLowerCase()) {
        return {
          message: ERROR_MESSAGES[key],
          type: key.includes('not_found') ? 'warning' : 'error'
        };
      }
    }
    
    // Если сообщение не найдено в константах, используем его как есть
    return {
      message: error.message,
      type: 'error'
    };
  }

  // Если не удалось определить тип ошибки
  return {
    message: ERROR_MESSAGES.default,
    type: 'error'
  };
};
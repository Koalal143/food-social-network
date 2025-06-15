import { ERROR_MESSAGES } from '@/constants/errors';
import { NetworkError, AuthError, ValidationError, NotFoundError } from '@/utils/errors';

/**
 * Обрабатывает ошибки API и возвращает понятное пользователю сообщение
 * @param {Error} error - Объект ошибки от API
 * @returns {{ message: string, type: 'error' | 'warning' }} Объект с сообщением и типом ошибки
 */
export const handleApiError = (error) => {
  // Добавляем логирование для отладки
  if (process.env.NODE_ENV === 'development') {
    console.log('handleApiError called with:', {
      error,
      errorType: error?.constructor?.name,
      errorMessage: error?.message,
      isAuthError: error instanceof AuthError,
      isValidationError: error instanceof ValidationError,
      isNetworkError: error instanceof NetworkError,
      isNotFoundError: error instanceof NotFoundError
    });
  }

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

    // Если есть detail, но нет error_key - НЕ показываем detail напрямую
    // Вместо этого используем общее сообщение об ошибке
    if (detail && typeof detail === 'string') {
      // Пытаемся определить тип ошибки по HTTP статусу
      const status = error.response?.status;
      const statusKey = `http_${status}`;

      if (status && ERROR_MESSAGES[statusKey]) {
        return {
          message: ERROR_MESSAGES[statusKey],
          type: status === 404 ? 'warning' : 'error'
        };
      }

      // Fallback на общее сообщение
      return {
        message: ERROR_MESSAGES.default,
        type: 'error'
      };
    }
  }

  // Обработка стандартного объекта Error
  if (error.message) {
    // Если это уже локализованное сообщение из констант, используем его напрямую
    const isLocalizedMessage = Object.values(ERROR_MESSAGES).includes(error.message);
    if (isLocalizedMessage) {
      return {
        message: error.message,
        type: 'error'
      };
    }

    // Если сообщение не найдено в константах, используем общее сообщение
    return {
      message: ERROR_MESSAGES.default,
      type: 'error'
    };
  }

  // Если не удалось определить тип ошибки
  return {
    message: ERROR_MESSAGES.default,
    type: 'error'
  };
};
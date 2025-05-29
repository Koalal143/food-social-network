export class CustomError extends Error {
    constructor(message, name = 'Error') {
        super(message);
        this.name = name;
    }
}

export class NetworkError extends CustomError {
    constructor(message) {
        super(message, 'NetworkError');
    }
}

export class AuthError extends CustomError {
    constructor(message) {
        super(message, 'AuthError');
    }
}

export class ValidationError extends CustomError {
    constructor(message) {
        super(message, 'ValidationError');
    }
}

export class NotFoundError extends CustomError {
    constructor(message) {
        super(message, 'NotFoundError')
    }
}

export const ERROR_MESSAGES = {
    not_authenticated: 'Пользователь не авторизован',
    service_unavailable: 'Сервис временно недоступен',
    network_error: 'Ошибка сети',
    validation_error: 'Ошибка валидации данных',
    not_found: 'Ресурс не найден',
    server_error: 'Внутренняя ошибка сервера'
}
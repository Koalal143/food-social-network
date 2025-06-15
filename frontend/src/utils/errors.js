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


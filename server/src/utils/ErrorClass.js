/**
 * Custom Application Error Class
 * Supports error codes, i18n keys, and operational error flagging
 */
export class AppError extends Error {
    constructor(message, statusCode, options = {}) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.code = options.code || this.getDefaultCode(statusCode);
        this.i18nKey = options.i18nKey || null;
        this.details = options.details || null;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }

    getDefaultCode(statusCode) {
        const codes = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'VALIDATION_ERROR',
            429: 'TOO_MANY_REQUESTS',
            500: 'INTERNAL_ERROR'
        };
        return codes[statusCode] || 'UNKNOWN_ERROR';
    }

    toJSON() {
        return {
            success: false,
            message: this.message,
            code: this.code,
            ...(this.details && { details: this.details })
        };
    }
}

// Error factory functions with i18n support
export const ErrorCodes = {
    // Authentication
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    
    // Validation
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    MISSING_FIELD: 'MISSING_FIELD',
    
    // Resources
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    CONFLICT: 'CONFLICT',
    
    // Server
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
    
    // Rate limiting
    TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
    
    // File upload
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
    UPLOAD_FAILED: 'UPLOAD_FAILED'
};

// Factory functions for common errors
export const badRequest = (message = 'Bad request', options = {}) => 
    new AppError(message, 400, { code: ErrorCodes.INVALID_INPUT, ...options });

export const unauthorized = (message = 'Unauthorized', options = {}) => 
    new AppError(message, 401, { code: ErrorCodes.UNAUTHORIZED, ...options });

export const forbidden = (message = 'You do not have permission to perform this action', options = {}) => 
    new AppError(message, 403, { code: ErrorCodes.FORBIDDEN, ...options });

export const notFound = (message = 'Resource not found', options = {}) => 
    new AppError(message, 404, { code: ErrorCodes.NOT_FOUND, ...options });

export const conflict = (message = 'Resource already exists', options = {}) => 
    new AppError(message, 409, { code: ErrorCodes.ALREADY_EXISTS, ...options });

export const validationError = (message = 'Validation failed', details = null) => 
    new AppError(message, 422, { code: ErrorCodes.VALIDATION_ERROR, details });

export const tooManyRequests = (message = 'Too many requests, please try again later') => 
    new AppError(message, 429, { code: ErrorCodes.TOO_MANY_REQUESTS });

export const serverError = (message = 'Internal server error') => 
    new AppError(message, 500, { code: ErrorCodes.INTERNAL_ERROR });

export const databaseError = (message = 'Database operation failed') => 
    new AppError(message, 500, { code: ErrorCodes.DATABASE_ERROR });

export const externalServiceError = (service, message = 'External service unavailable') => 
    new AppError(message, 503, { code: ErrorCodes.EXTERNAL_SERVICE_ERROR, details: { service } });

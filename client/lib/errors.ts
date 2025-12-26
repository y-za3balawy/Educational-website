/**
 * Error Codes - matches backend error codes
 */
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
    
    // Network
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    
    // Rate limiting
    TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
    
    // File upload
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
    UPLOAD_FAILED: 'UPLOAD_FAILED'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * API Error Response structure from backend
 */
export interface ApiErrorResponse {
    success: false;
    message: string;
    code: ErrorCode;
    details?: Record<string, unknown> | Array<{ field: string; message: string }>;
}

/**
 * Custom API Error class for frontend
 */
export class ApiError extends Error {
    public readonly code: ErrorCode;
    public readonly statusCode: number;
    public readonly details?: Record<string, unknown> | Array<{ field: string; message: string }>;
    public readonly isNetworkError: boolean;
    public readonly isAuthError: boolean;

    constructor(
        message: string,
        code: ErrorCode = ErrorCodes.INTERNAL_ERROR,
        statusCode: number = 500,
        details?: Record<string, unknown> | Array<{ field: string; message: string }>
    ) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.isNetworkError = code === ErrorCodes.NETWORK_ERROR || code === ErrorCodes.TIMEOUT;
        this.isAuthError = [
            ErrorCodes.UNAUTHORIZED,
            ErrorCodes.TOKEN_EXPIRED,
            ErrorCodes.TOKEN_INVALID,
            ErrorCodes.INVALID_CREDENTIALS
        ].includes(code);
    }

    /**
     * Check if error requires re-authentication
     */
    requiresReauth(): boolean {
        return this.code === ErrorCodes.TOKEN_EXPIRED || this.code === ErrorCodes.TOKEN_INVALID;
    }

    /**
     * Get field-specific errors for form validation
     */
    getFieldErrors(): Record<string, string> {
        if (!Array.isArray(this.details)) return {};
        return this.details.reduce((acc, { field, message }) => {
            acc[field] = message;
            return acc;
        }, {} as Record<string, string>);
    }
}

/**
 * i18n-ready error messages (can be replaced with actual i18n)
 */
export const errorMessages: Record<ErrorCode, string> = {
    [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password',
    [ErrorCodes.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
    [ErrorCodes.TOKEN_INVALID]: 'Invalid session. Please log in again.',
    [ErrorCodes.UNAUTHORIZED]: 'Please log in to continue',
    [ErrorCodes.FORBIDDEN]: 'You do not have permission to perform this action',
    [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again',
    [ErrorCodes.INVALID_INPUT]: 'Invalid input provided',
    [ErrorCodes.MISSING_FIELD]: 'Required field is missing',
    [ErrorCodes.NOT_FOUND]: 'The requested resource was not found',
    [ErrorCodes.ALREADY_EXISTS]: 'This resource already exists',
    [ErrorCodes.CONFLICT]: 'A conflict occurred with the current state',
    [ErrorCodes.INTERNAL_ERROR]: 'Something went wrong. Please try again later.',
    [ErrorCodes.DATABASE_ERROR]: 'A database error occurred. Please try again.',
    [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 'An external service is unavailable. Please try again.',
    [ErrorCodes.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection.',
    [ErrorCodes.TIMEOUT]: 'The request timed out. Please try again.',
    [ErrorCodes.TOO_MANY_REQUESTS]: 'Too many requests. Please wait a moment and try again.',
    [ErrorCodes.FILE_TOO_LARGE]: 'The file is too large. Please choose a smaller file.',
    [ErrorCodes.INVALID_FILE_TYPE]: 'Invalid file type. Please choose a different file.',
    [ErrorCodes.UPLOAD_FAILED]: 'File upload failed. Please try again.'
};

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        return errorMessages[error.code] || error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
}

/**
 * Parse API response into ApiError
 */
export function parseApiError(response: Response, data: ApiErrorResponse | null): ApiError {
    if (data && typeof data === 'object' && 'message' in data) {
        return new ApiError(
            data.message,
            data.code || getCodeFromStatus(response.status),
            response.status,
            data.details
        );
    }
    return new ApiError(
        'An unexpected error occurred',
        getCodeFromStatus(response.status),
        response.status
    );
}

/**
 * Get error code from HTTP status
 */
function getCodeFromStatus(status: number): ErrorCode {
    const statusMap: Record<number, ErrorCode> = {
        400: ErrorCodes.INVALID_INPUT,
        401: ErrorCodes.UNAUTHORIZED,
        403: ErrorCodes.FORBIDDEN,
        404: ErrorCodes.NOT_FOUND,
        409: ErrorCodes.CONFLICT,
        422: ErrorCodes.VALIDATION_ERROR,
        429: ErrorCodes.TOO_MANY_REQUESTS,
        500: ErrorCodes.INTERNAL_ERROR,
        503: ErrorCodes.EXTERNAL_SERVICE_ERROR
    };
    return statusMap[status] || ErrorCodes.INTERNAL_ERROR;
}

/**
 * Create network error
 */
export function createNetworkError(originalError?: Error): ApiError {
    const message = originalError?.message?.includes('fetch') 
        ? 'Unable to connect to the server'
        : originalError?.message || 'Network error occurred';
    return new ApiError(message, ErrorCodes.NETWORK_ERROR, 0);
}

/**
 * Create timeout error
 */
export function createTimeoutError(): ApiError {
    return new ApiError('Request timed out', ErrorCodes.TIMEOUT, 0);
}

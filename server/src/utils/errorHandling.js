import { AppError, ErrorCodes } from './ErrorClass.js';

/**
 * Async handler wrapper - eliminates try/catch in controllers
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Error logger - handles different environments
 */
const logError = (err, req) => {
    const logData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?._id || 'anonymous',
        errorCode: err.code || 'UNKNOWN',
        message: err.message
    };

    if (process.env.NODE_ENV === 'development') {
        console.error('🔴 ERROR:', {
            ...logData,
            stack: err.stack,
            body: req.body,
            params: req.params,
            query: req.query
        });
    } else {
        // Production: log without sensitive data
        console.error('ERROR:', JSON.stringify(logData));
    }
};

/**
 * Handle MongoDB CastError (invalid ObjectId)
 */
const handleCastError = (err) => {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400, {
        code: ErrorCodes.INVALID_INPUT,
        details: { field: err.path, value: err.value }
    });
};

/**
 * Handle MongoDB duplicate key error
 */
const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return new AppError(`${field} '${value}' already exists`, 409, {
        code: ErrorCodes.ALREADY_EXISTS,
        details: { field, value }
    });
};

/**
 * Handle Mongoose validation error
 */
const handleValidationError = (err) => {
    const details = Object.entries(err.errors).map(([field, error]) => ({
        field,
        message: error.message,
        value: error.value
    }));
    const message = details.map(d => d.message).join('. ');
    return new AppError(message, 422, {
        code: ErrorCodes.VALIDATION_ERROR,
        details
    });
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => 
    new AppError('Invalid token. Please log in again.', 401, {
        code: ErrorCodes.TOKEN_INVALID
    });

const handleJWTExpiredError = () => 
    new AppError('Your session has expired. Please log in again.', 401, {
        code: ErrorCodes.TOKEN_EXPIRED
    });

/**
 * Handle Multer file upload errors
 */
const handleMulterError = (err) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return new AppError('File too large', 400, { code: ErrorCodes.FILE_TOO_LARGE });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
        return new AppError('Too many files', 400, { code: ErrorCodes.INVALID_INPUT });
    }
    return new AppError(err.message, 400, { code: ErrorCodes.UPLOAD_FAILED });
};

/**
 * Handle Joi validation errors
 */
const handleJoiError = (err) => {
    const details = err.details?.map(d => ({
        field: d.path.join('.'),
        message: d.message.replace(/"/g, '')
    })) || [];
    const message = details.map(d => d.message).join('. ');
    return new AppError(message || err.message, 422, {
        code: ErrorCodes.VALIDATION_ERROR,
        details
    });
};

/**
 * Send error response for development
 */
const sendDevError = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        code: err.code || 'UNKNOWN_ERROR',
        details: err.details || null,
        stack: err.stack,
        error: err
    });
};

/**
 * Send error response for production
 */
const sendProdError = (err, res) => {
    // Operational errors: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code || 'UNKNOWN_ERROR',
            ...(err.details && { details: err.details })
        });
    } else {
        // Programming/unknown errors: don't leak details
        res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again later.',
            code: ErrorCodes.INTERNAL_ERROR
        });
    }
};

/**
 * Global error handling middleware
 */
export const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.code = err.code || ErrorCodes.INTERNAL_ERROR;

    // Log the error
    logError(err, req);

    // Handle specific error types
    let error = err;

    if (err.name === 'CastError') error = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateKeyError(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (err.name === 'MulterError') error = handleMulterError(err);
    if (err.isJoi) error = handleJoiError(err);
    
    // Handle string errors (like from Cloudinary)
    if (typeof err === 'string') {
        error = new AppError(err, 500, { code: ErrorCodes.EXTERNAL_SERVICE_ERROR });
    }

    // Send appropriate response based on environment
    if (process.env.NODE_ENV === 'development') {
        sendDevError(error, res);
    } else {
        sendProdError(error, res);
    }
};

/**
 * Handle 404 for undefined routes
 */
export const notFoundHandler = (req, res, next) => {
    const err = new AppError(`Route ${req.originalUrl} not found`, 404, {
        code: ErrorCodes.NOT_FOUND
    });
    next(err);
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = () => {
    process.on('uncaughtException', (err) => {
        console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
        console.error(err.name, err.message);
        console.error(err.stack);
        process.exit(1);
    });
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = (server) => {
    process.on('unhandledRejection', (err) => {
        console.error('💥 UNHANDLED REJECTION! Shutting down...');
        console.error(err.name, err.message);
        server.close(() => {
            process.exit(1);
        });
    });
};

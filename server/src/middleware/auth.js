import { verifyToken } from '../utils/GenerateAndVerifyToken.js';
import { AppError } from '../utils/ErrorClass.js';
import User from '../../DB/model/User.model.js';
import { asyncHandler } from '../utils/errorHandling.js';

export const authenticate = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('Please login to access this resource', 401));
    }
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
        return next(new AppError('User no longer exists', 401));
    }
    if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
        return next(new AppError('Password recently changed. Please login again', 401));
    }
    req.user = user;
    next();
});

/**
 * Optional authentication - sets req.user if token is valid, but doesn't require it
 * Useful for public routes that show different content for logged-in users
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        // No token - continue without user
        return next();
    }
    try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);
        if (user) {
            req.user = user;
        }
    } catch {
        // Invalid token - continue without user
    }
    next();
});

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

export const isVerified = (req, res, next) => {
    if (!req.user.isVerified) {
        return next(new AppError('Please verify your email to access this resource', 403));
    }
    next();
};

export const ROLES = {
    SUPER_ADMIN: 'superAdmin',
    ADMIN: 'admin',
    STUDENT: 'student',
    PARENT: 'parent'
};

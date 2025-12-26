import jwt from 'jsonwebtoken';

export const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

export const generateVerificationToken = (userId) => {
    return jwt.sign({ userId, purpose: 'email-verification' }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

export const generateResetToken = (userId) => {
    return jwt.sign({ userId, purpose: 'password-reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

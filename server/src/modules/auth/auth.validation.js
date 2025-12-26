import Joi from 'joi';

const email = Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
});

const password = Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
});

export const registerSchema = {
    body: Joi.object({
        email,
        password,
        confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Please confirm your password'
        }),
        firstName: Joi.string().max(50).required().messages({ 'any.required': 'First name is required' }),
        lastName: Joi.string().max(50).required().messages({ 'any.required': 'Last name is required' }),
        role: Joi.string().valid('student', 'parent').default('student'),
        phone: Joi.string().optional(),
        grade: Joi.string().valid('igcse', 'olevel', 'alevel').optional(),
        board: Joi.string().valid('cambridge', 'edexcel', 'oxford').optional()
    })
};

export const loginSchema = {
    body: Joi.object({
        email,
        password: Joi.string().required().messages({ 'any.required': 'Password is required' })
    })
};

export const forgotPasswordSchema = {
    body: Joi.object({ email })
};

export const resetPasswordSchema = {
    body: Joi.object({
        password,
        confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({ 'any.only': 'Passwords do not match' })
    }),
    params: Joi.object({ token: Joi.string().required() })
};

export const verifyEmailSchema = {
    params: Joi.object({ token: Joi.string().required() })
};

export const changePasswordSchema = {
    body: Joi.object({
        currentPassword: Joi.string().required().messages({ 'any.required': 'Current password is required' }),
        newPassword: password,
        confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({ 'any.only': 'Passwords do not match' })
    })
};

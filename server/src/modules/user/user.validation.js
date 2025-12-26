import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'Invalid ID format' });

export const getAllUsersSchema = {
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        role: Joi.string().valid('superAdmin', 'admin', 'student', 'parent'),
        isVerified: Joi.boolean(),
        isActive: Joi.boolean(),
        search: Joi.string().max(100),
        sort: Joi.string(),
        grade: Joi.string().valid('igcse', 'olevel', 'alevel'),
        board: Joi.string().valid('cambridge', 'edexcel', 'oxford')
    })
};

export const getUserByIdSchema = { params: Joi.object({ id: objectId.required() }) };

export const createUserSchema = {
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        firstName: Joi.string().max(50).required(),
        lastName: Joi.string().max(50).required(),
        role: Joi.string().valid('admin', 'student', 'parent').required(),
        phone: Joi.string().optional(),
        grade: Joi.string().valid('igcse', 'olevel', 'alevel').optional(),
        board: Joi.string().valid('cambridge', 'edexcel', 'oxford').optional(),
        isVerified: Joi.boolean().default(true)
    })
};

export const updateUserSchema = {
    params: Joi.object({ id: objectId.required() }),
    body: Joi.object({
        firstName: Joi.string().max(50),
        lastName: Joi.string().max(50),
        phone: Joi.string(),
        grade: Joi.string().valid('igcse', 'olevel', 'alevel'),
        board: Joi.string().valid('cambridge', 'edexcel', 'oxford'),
        isActive: Joi.boolean(),
        isVerified: Joi.boolean()
    }).min(1)
};

export const changeRoleSchema = {
    params: Joi.object({ id: objectId.required() }),
    body: Joi.object({ role: Joi.string().valid('admin', 'student', 'parent').required() })
};

export const deleteUserSchema = { params: Joi.object({ id: objectId.required() }) };

export const linkChildSchema = { params: Joi.object({ parentId: objectId.required(), childId: objectId.required() }) };

import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'Invalid ID format' });

export const createPostSchema = {
    body: Joi.object({
        title: Joi.string().max(200).required().messages({ 'any.required': 'Post title is required' }),
        content: Joi.string().required().messages({ 'any.required': 'Post content is required' }),
        excerpt: Joi.string().max(500).optional(),
        targetAudience: Joi.string().valid('students', 'parents', 'all').default('all'),
        board: Joi.string().valid('cambridge', 'edexcel', 'oxford', 'all').default('all'),
        level: Joi.string().valid('igcse', 'olevel', 'alevel', 'all').default('all'),
        topic: Joi.string().max(100).optional(),
        tags: Joi.alternatives().try(
            Joi.array().items(Joi.string().max(50)),
            Joi.string().max(500)
        ).optional(),
        isPublished: Joi.boolean().default(false),
        status: Joi.string().valid('draft', 'scheduled', 'published', 'archived').default('draft'),
        scheduledAt: Joi.date().iso().optional(),
        metaTitle: Joi.string().max(70).optional(),
        metaDescription: Joi.string().max(160).optional()
    })
};

export const updatePostSchema = {
    params: Joi.object({ id: objectId.required() }),
    body: Joi.object({
        title: Joi.string().max(200),
        content: Joi.string(),
        excerpt: Joi.string().max(500),
        targetAudience: Joi.string().valid('students', 'parents', 'all'),
        board: Joi.string().valid('cambridge', 'edexcel', 'oxford', 'all'),
        level: Joi.string().valid('igcse', 'olevel', 'alevel', 'all'),
        topic: Joi.string().max(100),
        tags: Joi.alternatives().try(
            Joi.array().items(Joi.string().max(50)),
            Joi.string().max(500)
        ),
        isPublished: Joi.boolean(),
        status: Joi.string().valid('draft', 'scheduled', 'published', 'archived'),
        scheduledAt: Joi.date().iso().allow(null),
        metaTitle: Joi.string().max(70).allow(''),
        metaDescription: Joi.string().max(160).allow('')
    }).min(1)
};

export const getPostsSchema = {
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(50).default(10),
        targetAudience: Joi.string().valid('students', 'parents', 'all'),
        board: Joi.string().valid('cambridge', 'edexcel', 'oxford', 'all'),
        level: Joi.string().valid('igcse', 'olevel', 'alevel', 'all'),
        status: Joi.string().valid('draft', 'scheduled', 'published', 'archived'),
        tag: Joi.string().max(50),
        search: Joi.string().max(100),
        sort: Joi.string(),
        isPublished: Joi.boolean()
    })
};

export const getPostByIdSchema = { params: Joi.object({ id: objectId.required() }) };
export const deletePostSchema = { params: Joi.object({ id: objectId.required() }) };

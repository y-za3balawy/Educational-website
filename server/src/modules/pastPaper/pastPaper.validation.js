import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'Invalid ID format' });

export const createPastPaperSchema = {
    body: Joi.object({
        title: Joi.string().required(),
        year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).required(),
        session: Joi.string().valid('may', 'january').required(),
        board: Joi.string().valid('cambridge', 'edexcel', 'oxford').required(),
        level: Joi.string().valid('olevel', 'alevel').required(),
        subLevel: Joi.string().valid('as', 'a2').allow(null, '').optional(),
        subject: Joi.string().valid('business', 'economics').required(),
        paperNumber: Joi.string().optional(),
        variant: Joi.string().optional(),
        paperType: Joi.string().valid('theory', 'practical', 'mcq', 'structured', 'essay', 'case_study', 'data_response').default('theory'),
        specimenPaper: Joi.boolean().default(false),
        topics: Joi.alternatives().try(
            Joi.array().items(Joi.string()),
            Joi.string()
        ).optional(),
        tags: Joi.alternatives().try(
            Joi.array().items(Joi.string()),
            Joi.string()
        ).optional(),
        difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
        isPublished: Joi.boolean().default(false)
    })
};

export const updatePastPaperSchema = {
    params: Joi.object({ id: objectId.required() }),
    body: Joi.object({
        title: Joi.string(),
        year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1),
        session: Joi.string().valid('may', 'january'),
        board: Joi.string().valid('cambridge', 'edexcel', 'oxford'),
        level: Joi.string().valid('olevel', 'alevel'),
        subLevel: Joi.string().valid('as', 'a2').allow(null, ''),
        subject: Joi.string().valid('business', 'economics'),
        paperNumber: Joi.string(),
        variant: Joi.string(),
        paperType: Joi.string().valid('theory', 'practical', 'mcq', 'structured', 'essay', 'case_study', 'data_response'),
        specimenPaper: Joi.boolean(),
        topics: Joi.array().items(Joi.string()),
        tags: Joi.array().items(Joi.string()),
        difficulty: Joi.string().valid('easy', 'medium', 'hard'),
        isPublished: Joi.boolean()
    }).min(1)
};

export const getPastPapersSchema = {
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        year: Joi.number().integer(),
        session: Joi.string().valid('may', 'january'),
        board: Joi.string().valid('cambridge', 'edexcel', 'oxford'),
        level: Joi.string().valid('olevel', 'alevel'),
        subLevel: Joi.string().valid('as', 'a2'),
        subject: Joi.string().valid('business', 'economics'),
        paperType: Joi.string().valid('theory', 'practical', 'mcq', 'structured', 'essay', 'case_study', 'data_response'),
        topics: Joi.string(),
        search: Joi.string(),
        sort: Joi.string()
    })
};

export const getPastPaperByIdSchema = { params: Joi.object({ id: objectId.required() }) };

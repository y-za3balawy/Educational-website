import Joi from 'joi';

export const submitContactSchema = {
    body: Joi.object({
        name: Joi.string().trim().max(100).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().trim().allow(''),
        senderType: Joi.string().valid('student', 'parent', 'school', 'teacher', 'other'),
        subject: Joi.string().trim().max(200).required(),
        message: Joi.string().max(5000).required(),
        category: Joi.string().valid('general', 'enrollment', 'technical', 'feedback', 'complaint', 'academic', 'billing'),
        level: Joi.string().valid('igcse', 'olevel', 'alevel', 'other').allow(null),
        relatedPost: Joi.string().hex().length(24),
        relatedQuiz: Joi.string().hex().length(24),
        relatedPaper: Joi.string().hex().length(24)
    })
};

export const updateContactSchema = {
    body: Joi.object({
        status: Joi.string().valid('new', 'in_progress', 'awaiting_reply', 'resolved', 'closed', 'spam'),
        assignedTo: Joi.string().hex().length(24).allow(null, ''),
        priority: Joi.string().valid('low', 'normal', 'high', 'urgent'),
        category: Joi.string().valid('general', 'enrollment', 'technical', 'feedback', 'complaint', 'academic', 'billing'),
        isSpam: Joi.boolean()
    }),
    params: Joi.object({
        id: Joi.string().hex().length(24).required()
    })
};

export const addResponseSchema = {
    body: Joi.object({
        message: Joi.string().required(),
        isInternal: Joi.boolean(),
        sendEmail: Joi.boolean()
    }),
    params: Joi.object({
        id: Joi.string().hex().length(24).required()
    })
};

export const addNoteSchema = {
    body: Joi.object({
        note: Joi.string().required()
    }),
    params: Joi.object({
        id: Joi.string().hex().length(24).required()
    })
};

export const bulkUpdateSchema = {
    body: Joi.object({
        ids: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
        status: Joi.string().valid('new', 'in_progress', 'awaiting_reply', 'resolved', 'closed', 'spam'),
        assignedTo: Joi.string().hex().length(24).allow(null, ''),
        isSpam: Joi.boolean()
    })
};

export const idParamSchema = {
    params: Joi.object({
        id: Joi.string().hex().length(24).required()
    })
};

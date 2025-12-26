import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'Invalid ID format' });

export const createQuizSchema = {
    body: Joi.object({
        title: Joi.string().max(200).required(),
        description: Joi.string().optional(),
        instructions: Joi.string().optional(),
        board: Joi.string().valid('cambridge', 'edexcel', 'oxford', 'all').required(),
        level: Joi.string().valid('igcse', 'olevel', 'alevel').required(),
        topic: Joi.string().required(),
        chapter: Joi.string().optional(),
        duration: Joi.number().min(1).required().messages({ 'number.min': 'Duration must be at least 1 minute' }),
        passingScore: Joi.number().min(0).max(100).default(50),
        shuffleQuestions: Joi.boolean().default(false),
        shuffleOptions: Joi.boolean().default(false),
        showResults: Joi.boolean().default(true),
        showCorrectAnswers: Joi.boolean().default(false),
        maxAttempts: Joi.number().min(1).default(1),
        startDate: Joi.date().optional(),
        endDate: Joi.date().greater(Joi.ref('startDate')).optional()
    })
};

export const updateQuizSchema = {
    params: Joi.object({ id: objectId.required() }),
    body: Joi.object({
        title: Joi.string().max(200),
        description: Joi.string(),
        instructions: Joi.string(),
        board: Joi.string().valid('cambridge', 'edexcel', 'oxford', 'all'),
        level: Joi.string().valid('igcse', 'olevel', 'alevel'),
        topic: Joi.string(),
        chapter: Joi.string(),
        duration: Joi.number().min(1),
        passingScore: Joi.number().min(0).max(100),
        shuffleQuestions: Joi.boolean(),
        shuffleOptions: Joi.boolean(),
        showResults: Joi.boolean(),
        showCorrectAnswers: Joi.boolean(),
        maxAttempts: Joi.number().min(1),
        startDate: Joi.date(),
        endDate: Joi.date(),
        isPublished: Joi.boolean()
    }).min(1)
};

export const addQuestionSchema = {
    params: Joi.object({ id: objectId.required() }),
    body: Joi.object({
        type: Joi.string().valid('mcq', 'multiSelect', 'trueFalse', 'shortAnswer', 'essay', 'fillBlank').required(),
        text: Joi.string().required(),
        options: Joi.array().items(Joi.object({ text: Joi.string().required(), isCorrect: Joi.boolean().default(false) })).when('type', { is: Joi.string().valid('mcq', 'multiSelect', 'trueFalse'), then: Joi.array().min(2).required() }),
        correctAnswer: Joi.string().when('type', { is: Joi.string().valid('shortAnswer', 'fillBlank'), then: Joi.required() }),
        alternativeAnswers: Joi.array().items(Joi.string()),
        points: Joi.number().min(0).default(1),
        negativePoints: Joi.number().min(0).default(0),
        explanation: Joi.string().optional(),
        hint: Joi.string().optional(),
        difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
        isRequired: Joi.boolean().default(true)
    })
};

export const updateQuestionSchema = {
    params: Joi.object({ id: objectId.required(), questionId: objectId.required() }),
    body: Joi.object({
        text: Joi.string(),
        options: Joi.array().items(Joi.object({ text: Joi.string().required(), isCorrect: Joi.boolean().default(false) })),
        correctAnswer: Joi.string(),
        alternativeAnswers: Joi.array().items(Joi.string()),
        points: Joi.number().min(0),
        negativePoints: Joi.number().min(0),
        explanation: Joi.string(),
        hint: Joi.string(),
        difficulty: Joi.string().valid('easy', 'medium', 'hard'),
        isRequired: Joi.boolean()
    }).min(1)
};

export const startQuizSchema = { params: Joi.object({ id: objectId.required() }) };

export const submitQuizSchema = {
    params: Joi.object({ id: objectId.required() }),
    body: Joi.object({
        answers: Joi.array().items(Joi.object({
            question: objectId.required(),
            selectedOptionIndex: Joi.number().integer().min(0),
            selectedOptionIndices: Joi.array().items(Joi.number().integer().min(0)),
            textAnswer: Joi.string()
        })).required()
    })
};

export const gradeEssaySchema = {
    params: Joi.object({ submissionId: objectId.required(), answerId: objectId.required() }),
    body: Joi.object({ pointsAwarded: Joi.number().min(0).required(), feedback: Joi.string().optional() })
};

export const getQuizzesSchema = {
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(50).default(10),
        board: Joi.string().valid('cambridge', 'edexcel', 'oxford', 'all'),
        level: Joi.string().valid('igcse', 'olevel', 'alevel'),
        topic: Joi.string(),
        isPublished: Joi.boolean(),
        search: Joi.string(),
        sort: Joi.string()
    })
};

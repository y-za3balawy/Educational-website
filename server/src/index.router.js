import { Router } from 'express';
import authRouter from './modules/auth/auth.router.js';
import userRouter from './modules/user/user.router.js';
import postRouter from './modules/post/post.router.js';
import quizRouter, { submissionsRouter } from './modules/quiz/quiz.router.js';
import pastPaperRouter from './modules/pastPaper/pastPaper.router.js';
import analyticsRouter from './modules/analytics/analytics.router.js';
import contactRouter from './modules/contact/contact.router.js';
import settingsRouter from './modules/settings/settings.router.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

// Mount routes
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/posts', postRouter);
router.use('/quizzes', quizRouter);
router.use('/submissions', submissionsRouter);
router.use('/past-papers', pastPaperRouter);
router.use('/analytics', analyticsRouter);
router.use('/contacts', contactRouter);
router.use('/settings', settingsRouter);

// API info
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Biology Education Platform API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/v1/auth',
            users: '/api/v1/users',
            posts: '/api/v1/posts',
            quizzes: '/api/v1/quizzes',
            submissions: '/api/v1/submissions',
            pastPapers: '/api/v1/past-papers',
            analytics: '/api/v1/analytics',
            contacts: '/api/v1/contacts',
            settings: '/api/v1/settings'
        },
        documentation: 'See README.md for API documentation'
    });
});

export default router;

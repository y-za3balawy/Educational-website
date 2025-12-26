import { Router } from 'express';
import * as analyticsController from './analytics.controller.js';
import { authenticate, authorize, ROLES } from '../../middleware/auth.js';

const router = Router();

// All analytics routes require admin authentication
router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN));

// Overview stats
router.get('/overview', analyticsController.getOverviewStats);

// Traffic data for charts
router.get('/traffic', analyticsController.getTrafficData);

// Top performing content
router.get('/top-content', analyticsController.getTopContent);

// Recent activity feed
router.get('/activity', analyticsController.getRecentActivity);

// User analytics
router.get('/users', analyticsController.getUserAnalytics);

// Quiz analytics
router.get('/quizzes', analyticsController.getQuizAnalytics);

// Content analytics
router.get('/content', analyticsController.getContentAnalytics);

export default router;

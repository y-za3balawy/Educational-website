import { Router } from 'express';
import * as quizController from './quiz.controller.js';
import { validate } from '../../middleware/validation.js';
import { authenticate, authorize, optionalAuth, ROLES } from '../../middleware/auth.js';
import * as quizValidation from './quiz.validation.js';

const router = Router();

// Public routes (no authentication required)
router.get('/', optionalAuth, validate(quizValidation.getQuizzesSchema), quizController.getAllQuizzes);
router.get('/:id', optionalAuth, quizController.getQuizById);

// Protected routes (authentication required)
router.use(authenticate);

router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), validate(quizValidation.createQuizSchema), quizController.createQuiz);
router.patch('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), validate(quizValidation.updateQuizSchema), quizController.updateQuiz);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), quizController.deleteQuiz);
router.patch('/:id/publish', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), quizController.publishQuiz);

// Questions management (admin only)
router.post('/:id/questions', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), validate(quizValidation.addQuestionSchema), quizController.addQuestion);
router.patch('/:id/questions/:questionId', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), validate(quizValidation.updateQuestionSchema), quizController.updateQuestion);
router.delete('/:id/questions/:questionId', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), quizController.deleteQuestion);

// Student quiz taking (requires login)
router.post('/:id/start', authorize(ROLES.STUDENT), validate(quizValidation.startQuizSchema), quizController.startQuiz);
router.post('/:id/submit', authorize(ROLES.STUDENT), validate(quizValidation.submitQuizSchema), quizController.submitQuiz);
router.get('/:id/results', quizController.getQuizResults);
router.get('/:id/submissions', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), quizController.getSubmissions);

export default router;

export const submissionsRouter = Router();
submissionsRouter.use(authenticate);
submissionsRouter.patch('/:submissionId/answers/:answerId/grade', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), validate(quizValidation.gradeEssaySchema), quizController.gradeEssay);

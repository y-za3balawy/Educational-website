import { Router } from 'express';
import * as pastPaperController from './pastPaper.controller.js';
import { validate } from '../../middleware/validation.js';
import { authenticate, authorize, optionalAuth, ROLES } from '../../middleware/auth.js';
import { uploadSingleDocument } from '../../middleware/upload.js';
import * as pastPaperValidation from './pastPaper.validation.js';

const router = Router();

// Public routes (no authentication required)
router.get('/', optionalAuth, validate(pastPaperValidation.getPastPapersSchema), pastPaperController.getAllPastPapers);
router.get('/:id', optionalAuth, validate(pastPaperValidation.getPastPaperByIdSchema), pastPaperController.getPastPaperById);
router.post('/:id/download', optionalAuth, pastPaperController.trackDownload);

// Protected routes (authentication required)
router.use(authenticate);

// Admin only routes
router.get('/stats', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), pastPaperController.getPastPapersStats);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), uploadSingleDocument, validate(pastPaperValidation.createPastPaperSchema), pastPaperController.createPastPaper);
router.patch('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), uploadSingleDocument, validate(pastPaperValidation.updatePastPaperSchema), pastPaperController.updatePastPaper);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), pastPaperController.deletePastPaper);
router.post('/:id/mark-scheme', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), uploadSingleDocument, pastPaperController.uploadMarkScheme);
router.post('/:id/examiner-report', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), uploadSingleDocument, pastPaperController.uploadExaminerReport);

export default router;

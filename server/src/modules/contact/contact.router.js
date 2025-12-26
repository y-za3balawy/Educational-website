import { Router } from 'express';
import * as contactController from './contact.controller.js';
import { authenticate, optionalAuth, authorize, ROLES } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import * as schemas from './contact.validation.js';

const router = Router();

// Public routes
router.post('/', optionalAuth, validate(schemas.submitContactSchema), contactController.submitContact);

// Admin routes
router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), contactController.getAllContacts);
router.get('/stats', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), contactController.getContactStats);
router.get('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(schemas.idParamSchema), contactController.getContactById);
router.patch('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(schemas.updateContactSchema), contactController.updateContact);
router.post('/:id/response', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(schemas.addResponseSchema), contactController.addResponse);
router.post('/:id/note', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(schemas.addNoteSchema), contactController.addInternalNote);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(schemas.idParamSchema), contactController.deleteContact);

// Bulk operations
router.patch('/bulk/update', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(schemas.bulkUpdateSchema), contactController.bulkUpdateContacts);

export default router;

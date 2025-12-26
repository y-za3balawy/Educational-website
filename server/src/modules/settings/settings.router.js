import { Router } from 'express';
import * as settingsController from './settings.controller.js';
import { authenticate, authorize, ROLES } from '../../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../../middleware/upload.js';

const router = Router();

// Public routes
router.get('/public', settingsController.getPublicSettings);
router.get('/about', settingsController.getAboutContent);

// Admin routes
router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), settingsController.getAllSettings);
router.patch('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), settingsController.updateSettings);
router.patch('/about', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), uploadSingle('profileImage'), handleUploadError, settingsController.updateAboutContent);
router.patch('/contact', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), settingsController.updateContactInfo);
router.patch('/social', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), settingsController.updateSocialLinks);
router.post('/logo', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), uploadSingle('logo'), handleUploadError, settingsController.uploadLogo);

export default router;

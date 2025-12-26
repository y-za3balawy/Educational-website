import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validate } from '../../middleware/validation.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { uploadSingleImage } from '../../middleware/upload.js';
import * as authValidation from './auth.validation.js';
import { authEndpoints } from './auth.endPoint.js';

const router = Router();

router.post('/register', validate(authValidation.registerSchema), authController.register);
router.post('/login', validate(authValidation.loginSchema), authController.login);
router.get('/verify/:token', validate(authValidation.verifyEmailSchema), authController.verifyEmail);
router.post('/forgot-password', validate(authValidation.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', validate(authValidation.resetPasswordSchema), authController.resetPassword);

router.use(authenticate);
router.get('/me', authController.getMe);
router.patch('/me', uploadSingleImage, authController.updateMe);
router.post('/change-password', validate(authValidation.changePasswordSchema), authController.changePassword);
router.post('/logout', authController.logout);

export default router;

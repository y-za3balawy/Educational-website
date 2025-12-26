import { Router } from 'express';
import * as userController from './user.controller.js';
import { validate } from '../../middleware/validation.js';
import { authenticate, authorize, ROLES } from '../../middleware/auth.js';
import * as userValidation from './user.validation.js';

const router = Router();

router.use(authenticate);

router.get('/stats', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), userController.getDashboardStats);
router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), validate(userValidation.getAllUsersSchema), userController.getAllUsers);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), validate(userValidation.createUserSchema), userController.createUser);
router.get('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), validate(userValidation.getUserByIdSchema), userController.getUserById);
router.patch('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), validate(userValidation.updateUserSchema), userController.updateUser);
router.patch('/:id/role', authorize(ROLES.SUPER_ADMIN), validate(userValidation.changeRoleSchema), userController.changeRole);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN), validate(userValidation.deleteUserSchema), userController.deleteUser);
router.post('/:parentId/link/:childId', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), validate(userValidation.linkChildSchema), userController.linkChild);
router.delete('/:parentId/unlink/:childId', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), validate(userValidation.linkChildSchema), userController.unlinkChild);

export default router;

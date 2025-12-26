import { Router } from 'express';
import * as postController from './post.controller.js';
import { validate } from '../../middleware/validation.js';
import { authenticate, authorize, optionalAuth, ROLES } from '../../middleware/auth.js';
import { uploadPostMedia, handleUploadError } from '../../middleware/upload.js';
import * as postValidation from './post.validation.js';

const router = Router();

// Public routes (no authentication required)
router.get('/', optionalAuth, validate(postValidation.getPostsSchema), postController.getAllPosts);
router.get('/slug/:slug', optionalAuth, postController.getPostBySlug);
router.get('/:id', optionalAuth, validate(postValidation.getPostByIdSchema), postController.getPostById);

// Protected routes (authentication required)
router.use(authenticate);

// Publish scheduled posts (can be triggered by cron)
router.post('/publish-scheduled',
    authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    postController.publishScheduledPosts
);

router.post('/',
    authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    uploadPostMedia, handleUploadError,
    validate(postValidation.createPostSchema),
    postController.createPost
);

router.patch('/:id',
    authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    uploadPostMedia, handleUploadError,
    validate(postValidation.updatePostSchema),
    postController.updatePost
);

router.patch('/:id/archive',
    authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    postController.archivePost
);

router.delete('/:id',
    authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    validate(postValidation.deletePostSchema),
    postController.deletePost
);

router.delete('/:id/media/:mediaId',
    authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    postController.removeMedia
);

export default router;

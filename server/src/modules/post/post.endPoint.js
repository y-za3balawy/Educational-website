import { ROLES } from '../../middleware/auth.js';

export const postEndpoints = {
    getAllPosts: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT],
    getPostById: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT],
    createPost: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    updatePost: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    deletePost: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
};

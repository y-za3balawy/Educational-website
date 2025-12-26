import { ROLES } from '../../middleware/auth.js';

export const authEndpoints = {
    register: [],
    login: [],
    verifyEmail: [],
    forgotPassword: [],
    resetPassword: [],
    logout: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT],
    getMe: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT],
    updateMe: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT],
    changePassword: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT],
    deleteMe: [ROLES.STUDENT, ROLES.PARENT]
};

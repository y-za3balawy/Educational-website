import { ROLES } from '../../middleware/auth.js';

export const userEndpoints = {
    getAllUsers: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    getUserById: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    createUser: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    updateUser: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    deleteUser: [ROLES.SUPER_ADMIN],
    changeRole: [ROLES.SUPER_ADMIN],
    getDashboardStats: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    linkChild: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    unlinkChild: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
};

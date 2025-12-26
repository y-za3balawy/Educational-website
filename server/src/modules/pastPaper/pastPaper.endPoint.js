import { ROLES } from '../../middleware/auth.js';

export const pastPaperEndpoints = {
    getAllPastPapers: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT],
    getPastPaperById: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT],
    downloadPaper: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT],
    createPastPaper: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    updatePastPaper: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    deletePastPaper: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    uploadMarkScheme: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
};

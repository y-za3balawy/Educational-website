import { ROLES } from '../../middleware/auth.js';

export const quizEndpoints = {
    getAllQuizzes: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT],
    getQuizById: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT],
    getQuizResults: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT],
    createQuiz: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    updateQuiz: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    deleteQuiz: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    publishQuiz: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    addQuestion: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    updateQuestion: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    deleteQuestion: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    reorderQuestions: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    startQuiz: [ROLES.STUDENT],
    submitQuiz: [ROLES.STUDENT],
    gradeEssay: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    getSubmissions: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
};

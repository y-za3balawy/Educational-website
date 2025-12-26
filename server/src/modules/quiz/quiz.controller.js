import Quiz from '../../../DB/model/Quiz.model.js';
import Question from '../../../DB/model/Question.model.js';
import Submission from '../../../DB/model/Submission.model.js';
import { asyncHandler } from '../../utils/errorHandling.js';
import { AppError } from '../../utils/ErrorClass.js';
import { ApiFeatures, getPaginationInfo } from '../../utils/api.features.js';

export const getAllQuizzes = asyncHandler(async (req, res) => {
    let filter = { isPublished: true, isDraft: false };
    
    // If user is logged in, apply role-based filtering
    if (req.user) {
        if (req.user.role === 'student') {
            if (req.user.board) filter.$or = [{ board: req.user.board }, { board: 'all' }];
            if (req.user.grade) filter.level = req.user.grade;
        } else if (['superAdmin', 'admin'].includes(req.user.role)) {
            // Admins can see all quizzes
            delete filter.isPublished;
            delete filter.isDraft;
            if (req.query.isPublished !== undefined) {
                filter.isPublished = req.query.isPublished === 'true';
            }
        }
    }
    
    if (req.query.board) filter.board = req.query.board;
    if (req.query.level) filter.level = req.query.level;
    if (req.query.topic) filter.topic = new RegExp(req.query.topic, 'i');
    
    const query = Quiz.find(filter).populate('createdBy', 'firstName lastName').select('-questions');
    const features = new ApiFeatures(query, req.query).sort().paginate().search(['title', 'topic', 'chapter']);
    const quizzes = await features.query;
    const total = await Quiz.countDocuments(filter);
    res.status(200).json({ success: true, data: { quizzes, pagination: getPaginationInfo(total, features.pagination.page, features.pagination.limit) } });
});

export const getQuizById = asyncHandler(async (req, res, next) => {
    let quiz = await Quiz.findById(req.params.id).populate('createdBy', 'firstName lastName').populate('questions');
    if (!quiz) return next(new AppError('Quiz not found', 404));
    
    const isAdmin = req.user && ['superAdmin', 'admin'].includes(req.user.role);
    
    // For non-admin users (including guests), check availability
    if (!isAdmin) {
        if (!quiz.isPublished || quiz.isDraft) return next(new AppError('Quiz not available', 404));
        const now = new Date();
        if (quiz.startDate && now < quiz.startDate) return next(new AppError('Quiz has not started yet', 403));
        if (quiz.endDate && now > quiz.endDate) return next(new AppError('Quiz has ended', 403));
        
        // Hide correct answers for non-admin users
        quiz = quiz.toObject();
        quiz.questions = quiz.questions.map(q => {
            const { correctAnswer, alternativeAnswers, ...questionData } = q;
            if (questionData.options) questionData.options = questionData.options.map(({ text, media }) => ({ text, media }));
            return questionData;
        });
    }
    res.status(200).json({ success: true, data: { quiz } });
});

export const createQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.create({ ...req.body, createdBy: req.user._id, isDraft: true, isPublished: false });
    res.status(201).json({ success: true, message: 'Quiz created successfully', data: { quiz } });
});

export const updateQuiz = asyncHandler(async (req, res, next) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return next(new AppError('Quiz not found', 404));
    if (quiz.isPublished) {
        const submissions = await Submission.countDocuments({ quiz: quiz._id });
        if (submissions > 0 && !['title', 'description', 'instructions', 'endDate'].every(key => !req.body[key] || req.body[key] === quiz[key])) {
            return next(new AppError('Cannot modify quiz structure after students have submitted', 400));
        }
    }
    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: 'Quiz updated successfully', data: { quiz: updatedQuiz } });
});

export const deleteQuiz = asyncHandler(async (req, res, next) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return next(new AppError('Quiz not found', 404));
    await Question.deleteMany({ quiz: quiz._id });
    await Submission.deleteMany({ quiz: quiz._id });
    await Quiz.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Quiz and all associated data deleted successfully' });
});

export const publishQuiz = asyncHandler(async (req, res, next) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return next(new AppError('Quiz not found', 404));
    if (!quiz.isPublished && quiz.questions.length === 0) return next(new AppError('Cannot publish quiz without questions', 400));
    await quiz.calculateTotalPoints();
    quiz.isPublished = !quiz.isPublished;
    quiz.isDraft = quiz.isPublished ? false : quiz.isDraft;
    await quiz.save();
    res.status(200).json({ success: true, message: quiz.isPublished ? 'Quiz published successfully' : 'Quiz unpublished', data: { quiz } });
});

export const addQuestion = asyncHandler(async (req, res, next) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return next(new AppError('Quiz not found', 404));
    const order = quiz.questions.length;
    const question = await Question.create({ ...req.body, quiz: quiz._id, order });
    quiz.questions.push(question._id);
    await quiz.calculateTotalPoints();
    await quiz.save();
    res.status(201).json({ success: true, message: 'Question added successfully', data: { question } });
});

export const updateQuestion = asyncHandler(async (req, res, next) => {
    const { id, questionId } = req.params;
    const quiz = await Quiz.findById(id);
    if (!quiz) return next(new AppError('Quiz not found', 404));
    const question = await Question.findOne({ _id: questionId, quiz: id });
    if (!question) return next(new AppError('Question not found', 404));
    const updatedQuestion = await Question.findByIdAndUpdate(questionId, req.body, { new: true, runValidators: true });
    await quiz.calculateTotalPoints();
    await quiz.save();
    res.status(200).json({ success: true, message: 'Question updated successfully', data: { question: updatedQuestion } });
});

export const deleteQuestion = asyncHandler(async (req, res, next) => {
    const { id, questionId } = req.params;
    const quiz = await Quiz.findById(id);
    if (!quiz) return next(new AppError('Quiz not found', 404));
    const question = await Question.findOne({ _id: questionId, quiz: id });
    if (!question) return next(new AppError('Question not found', 404));
    await Question.findByIdAndDelete(questionId);
    quiz.questions = quiz.questions.filter(q => q.toString() !== questionId);
    await quiz.calculateTotalPoints();
    await quiz.save();
    res.status(200).json({ success: true, message: 'Question deleted successfully' });
});

export const startQuiz = asyncHandler(async (req, res, next) => {
    const quiz = await Quiz.findById(req.params.id).populate('questions');
    if (!quiz) return next(new AppError('Quiz not found', 404));
    if (!quiz.isPublished) return next(new AppError('Quiz is not available', 403));
    const now = new Date();
    if (quiz.startDate && now < quiz.startDate) return next(new AppError('Quiz has not started yet', 403));
    if (quiz.endDate && now > quiz.endDate) return next(new AppError('Quiz has ended', 403));
    const previousAttempts = await Submission.countDocuments({ quiz: quiz._id, student: req.user._id, status: { $in: ['submitted', 'graded'] } });
    if (previousAttempts >= quiz.maxAttempts) return next(new AppError(`Maximum attempts (${quiz.maxAttempts}) reached`, 403));
    let submission = await Submission.findOne({ quiz: quiz._id, student: req.user._id, status: 'inProgress' });
    if (submission) {
        const timePassed = (now - submission.startedAt) / 1000 / 60;
        if (timePassed > quiz.duration) { submission.status = 'expired'; await submission.save(); submission = null; }
    }
    if (!submission) {
        submission = await Submission.create({ quiz: quiz._id, student: req.user._id, attemptNumber: previousAttempts + 1, answers: [], startedAt: new Date() });
    }
    let questions = quiz.questions.map(q => {
        const questionObj = q.toObject();
        delete questionObj.correctAnswer;
        delete questionObj.alternativeAnswers;
        if (questionObj.options) questionObj.options = questionObj.options.map(({ text, media, _id }) => ({ text, media, _id }));
        return questionObj;
    });
    if (quiz.shuffleQuestions) questions = questions.sort(() => Math.random() - 0.5);
    res.status(200).json({ success: true, data: { submission: { id: submission._id, startedAt: submission.startedAt, attemptNumber: submission.attemptNumber }, quiz: { id: quiz._id, title: quiz.title, duration: quiz.duration, totalPoints: quiz.totalPoints, instructions: quiz.instructions }, questions } });
});

export const submitQuiz = asyncHandler(async (req, res, next) => {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return next(new AppError('Quiz not found', 404));
    const submission = await Submission.findOne({ quiz: quiz._id, student: req.user._id, status: 'inProgress' });
    if (!submission) return next(new AppError('No active quiz attempt found', 400));
    const timePassed = (new Date() - submission.startedAt) / 1000 / 60;
    if (timePassed > quiz.duration + 1) { submission.status = 'expired'; await submission.save(); return next(new AppError('Quiz time has expired', 403)); }
    submission.answers = answers;
    submission.submittedAt = new Date();
    submission.timeSpent = Math.round((submission.submittedAt - submission.startedAt) / 1000);
    submission.status = 'submitted';
    submission.maxScore = quiz.totalPoints;
    await submission.autoGrade();
    await submission.save();
    const response = { success: true, message: 'Quiz submitted successfully', data: { submissionId: submission._id, totalScore: submission.totalScore, maxScore: submission.maxScore, percentage: submission.percentage, passed: submission.passed, timeSpent: submission.timeSpent } };
    if (quiz.showResults) { response.data.status = submission.status; if (quiz.showCorrectAnswers) response.data.answers = submission.answers; }
    res.status(200).json(response);
});

export const getQuizResults = asyncHandler(async (req, res, next) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return next(new AppError('Quiz not found', 404));
    let filter = { quiz: quiz._id };
    if (req.user.role === 'student') filter.student = req.user._id;
    if (req.user.role === 'parent') filter.student = { $in: req.user.children };
    const submissions = await Submission.find(filter).populate('student', 'firstName lastName email').populate('gradedBy', 'firstName lastName').sort('-submittedAt');
    res.status(200).json({ success: true, data: { submissions } });
});

export const gradeEssay = asyncHandler(async (req, res, next) => {
    const { submissionId, answerId } = req.params;
    const { pointsAwarded, feedback } = req.body;
    const submission = await Submission.findById(submissionId);
    if (!submission) return next(new AppError('Submission not found', 404));
    const answerIndex = submission.answers.findIndex(a => a._id.toString() === answerId);
    if (answerIndex === -1) return next(new AppError('Answer not found', 404));
    submission.answers[answerIndex].pointsAwarded = pointsAwarded;
    submission.answers[answerIndex].feedback = feedback;
    submission.totalScore = submission.answers.reduce((sum, a) => sum + (a.pointsAwarded || 0), 0);
    submission.percentage = submission.maxScore > 0 ? Math.round((submission.totalScore / submission.maxScore) * 100) : 0;
    const quiz = await Quiz.findById(submission.quiz).populate('questions');
    const essayQuestions = quiz.questions.filter(q => q.type === 'essay').map(q => q._id.toString());
    const ungradedEssays = submission.answers.filter(a => essayQuestions.includes(a.question.toString()) && a.pointsAwarded === undefined);
    if (ungradedEssays.length === 0) { submission.status = 'graded'; submission.gradedAt = new Date(); submission.gradedBy = req.user._id; }
    await submission.save();
    res.status(200).json({ success: true, message: 'Answer graded successfully', data: { submission } });
});

export const getSubmissions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    let filter = { quiz: req.params.id };
    if (status) filter.status = status;
    const submissions = await Submission.find(filter).populate('student', 'firstName lastName email grade').sort('-submittedAt').skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Submission.countDocuments(filter);
    res.status(200).json({ success: true, data: { submissions, pagination: getPaginationInfo(total, parseInt(page), parseInt(limit)) } });
});

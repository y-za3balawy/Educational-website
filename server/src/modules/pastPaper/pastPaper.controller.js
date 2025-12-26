import PastPaper from '../../../DB/model/PastPaper.model.js';
import { asyncHandler } from '../../utils/errorHandling.js';
import { AppError } from '../../utils/ErrorClass.js';
import { ApiFeatures, getPaginationInfo } from '../../utils/api.features.js';
import { deleteFromCloudinary } from '../../utils/cloudinary.js';

export const getAllPastPapers = asyncHandler(async (req, res) => {
    let filter = { isPublished: true };
    if (req.query.year) filter.year = parseInt(req.query.year);
    if (req.query.session) filter.session = req.query.session;
    if (req.query.board) filter.board = req.query.board;
    if (req.query.level) filter.level = req.query.level;
    if (req.query.subLevel) filter.subLevel = req.query.subLevel;
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.paperType) filter.paperType = req.query.paperType;
    if (req.query.topics) {
        const topicsArray = req.query.topics.split(',').map(t => t.trim());
        filter.topics = { $in: topicsArray };
    }
    // Admin users can see unpublished papers
    if (req.user && ['superAdmin', 'admin'].includes(req.user.role)) {
        delete filter.isPublished;
        if (req.query.isPublished !== undefined) filter.isPublished = req.query.isPublished === 'true';
    }
    const query = PastPaper.find(filter).populate('uploadedBy', 'firstName lastName');
    const features = new ApiFeatures(query, req.query).sort().paginate().search(['title', 'topics', 'tags']);
    const papers = await features.query;
    const total = await PastPaper.countDocuments(filter);
    const availableFilters = await getAvailableFilters();
    res.status(200).json({ success: true, data: { papers, pagination: getPaginationInfo(total, features.pagination.page, features.pagination.limit), filters: availableFilters } });
});

export const getPastPaperById = asyncHandler(async (req, res, next) => {
    const paper = await PastPaper.findById(req.params.id).populate('uploadedBy', 'firstName lastName');
    if (!paper) return next(new AppError('Past paper not found', 404));
    // Only admins can see unpublished papers
    const isAdmin = req.user && ['superAdmin', 'admin'].includes(req.user.role);
    if (!paper.isPublished && !isAdmin) return next(new AppError('Past paper not found', 404));
    paper.viewCount += 1;
    await paper.save();
    res.status(200).json({ success: true, data: { paper } });
});

export const createPastPaper = asyncHandler(async (req, res, next) => {
    if (!req.file) return next(new AppError('Paper file is required', 400));
    
    // Handle subLevel - only set if level is alevel
    const paperData = { ...req.body };
    if (paperData.level !== 'alevel') {
        paperData.subLevel = null;
    }
    
    const paper = await PastPaper.create({ 
        ...paperData, 
        paperUrl: req.file.path, 
        paperPublicId: req.file.filename, 
        uploadedBy: req.user._id 
    });
    res.status(201).json({ success: true, message: 'Past paper uploaded successfully', data: { paper } });
});

export const updatePastPaper = asyncHandler(async (req, res, next) => {
    let paper = await PastPaper.findById(req.params.id);
    if (!paper) return next(new AppError('Past paper not found', 404));
    const updates = { ...req.body };
    
    // Handle subLevel - only set if level is alevel
    if (updates.level && updates.level !== 'alevel') {
        updates.subLevel = null;
    }
    
    if (req.file) {
        if (paper.paperPublicId) await deleteFromCloudinary(paper.paperPublicId, 'raw');
        updates.paperUrl = req.file.path;
        updates.paperPublicId = req.file.filename;
    }
    paper = await PastPaper.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: 'Past paper updated successfully', data: { paper } });
});

export const deletePastPaper = asyncHandler(async (req, res, next) => {
    const paper = await PastPaper.findById(req.params.id);
    if (!paper) return next(new AppError('Past paper not found', 404));
    if (paper.paperPublicId) await deleteFromCloudinary(paper.paperPublicId, 'raw');
    if (paper.markSchemePublicId) await deleteFromCloudinary(paper.markSchemePublicId, 'raw');
    if (paper.examinerReportPublicId) await deleteFromCloudinary(paper.examinerReportPublicId, 'raw');
    await PastPaper.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Past paper deleted successfully' });
});

export const uploadMarkScheme = asyncHandler(async (req, res, next) => {
    const paper = await PastPaper.findById(req.params.id);
    if (!paper) return next(new AppError('Past paper not found', 404));
    if (!req.file) return next(new AppError('Mark scheme file is required', 400));
    if (paper.markSchemePublicId) await deleteFromCloudinary(paper.markSchemePublicId, 'raw');
    paper.markSchemeUrl = req.file.path;
    paper.markSchemePublicId = req.file.filename;
    await paper.save();
    res.status(200).json({ success: true, message: 'Mark scheme uploaded successfully', data: { paper } });
});

export const uploadExaminerReport = asyncHandler(async (req, res, next) => {
    const paper = await PastPaper.findById(req.params.id);
    if (!paper) return next(new AppError('Past paper not found', 404));
    if (!req.file) return next(new AppError('Examiner report file is required', 400));
    if (paper.examinerReportPublicId) await deleteFromCloudinary(paper.examinerReportPublicId, 'raw');
    paper.examinerReportUrl = req.file.path;
    paper.examinerReportPublicId = req.file.filename;
    await paper.save();
    res.status(200).json({ success: true, message: 'Examiner report uploaded successfully', data: { paper } });
});

export const trackDownload = asyncHandler(async (req, res, next) => {
    const paper = await PastPaper.findById(req.params.id);
    if (!paper) return next(new AppError('Past paper not found', 404));
    paper.downloadCount += 1;
    await paper.save();
    res.status(200).json({ success: true, data: { downloadUrl: paper.paperUrl } });
});

const getAvailableFilters = async () => {
    const [years, boards, levels, subLevels, sessions, subjects, paperTypes] = await Promise.all([
        PastPaper.distinct('year', { isPublished: true }),
        PastPaper.distinct('board', { isPublished: true }),
        PastPaper.distinct('level', { isPublished: true }),
        PastPaper.distinct('subLevel', { isPublished: true, subLevel: { $ne: null } }),
        PastPaper.distinct('session', { isPublished: true }),
        PastPaper.distinct('subject', { isPublished: true }),
        PastPaper.distinct('paperType', { isPublished: true })
    ]);
    return { years: years.sort((a, b) => b - a), boards, levels, subLevels, sessions, subjects, paperTypes };
};

export const getPastPapersStats = asyncHandler(async (req, res) => {
    const [totalPapers, byBoard, byLevel, bySubject, byYear, recentUploads] = await Promise.all([
        PastPaper.countDocuments(),
        PastPaper.aggregate([{ $group: { _id: '$board', count: { $sum: 1 } } }]),
        PastPaper.aggregate([{ $group: { _id: '$level', count: { $sum: 1 } } }]),
        PastPaper.aggregate([{ $group: { _id: '$subject', count: { $sum: 1 } } }]),
        PastPaper.aggregate([{ $group: { _id: '$year', count: { $sum: 1 } } }, { $sort: { _id: -1 } }, { $limit: 10 }]),
        PastPaper.find().sort('-createdAt').limit(5).select('title year board level subject createdAt')
    ]);
    res.status(200).json({ success: true, data: { total: totalPapers, byBoard, byLevel, bySubject, byYear, recentUploads } });
});

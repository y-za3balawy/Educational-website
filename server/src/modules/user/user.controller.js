import User from '../../../DB/model/User.model.js';
import Post from '../../../DB/model/Post.model.js';
import Quiz from '../../../DB/model/Quiz.model.js';
import Submission from '../../../DB/model/Submission.model.js';
import { asyncHandler } from '../../utils/errorHandling.js';
import { AppError } from '../../utils/ErrorClass.js';
import { hashPassword } from '../../utils/HashAndCompare.js';
import { ApiFeatures, getPaginationInfo } from '../../utils/api.features.js';

export const getAllUsers = asyncHandler(async (req, res) => {
    const query = User.find();
    const features = new ApiFeatures(query, req.query).filter().sort().limitFields().paginate().search(['firstName', 'lastName', 'email']);
    const users = await features.query;
    const total = await User.countDocuments(features.query.getFilter());
    res.status(200).json({ success: true, data: { users, pagination: getPaginationInfo(total, features.pagination.page, features.pagination.limit) } });
});

export const getUserById = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).populate('children', 'firstName lastName email grade');
    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({ success: true, data: { user } });
});

export const createUser = asyncHandler(async (req, res, next) => {
    const { email, password, firstName, lastName, role, phone, grade, board, isVerified } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new AppError('Email already registered', 409));
    if (role === 'superAdmin' && req.user.role !== 'superAdmin') return next(new AppError('You cannot create a superAdmin account', 403));
    const hashedPassword = await hashPassword(password);
    const user = await User.create({ email, password: hashedPassword, firstName, lastName, role, phone, grade, board, isVerified: isVerified !== undefined ? isVerified : true });
    res.status(201).json({ success: true, message: 'User created successfully', data: { user } });
});

export const updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    if (user.role === 'superAdmin' && req.user.role !== 'superAdmin') return next(new AppError('You cannot modify a superAdmin account', 403));
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'grade', 'board', 'isActive', 'isVerified'];
    const updates = {};
    allowedUpdates.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: 'User updated successfully', data: { user: updatedUser } });
});

export const changeRole = asyncHandler(async (req, res, next) => {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    if (user._id.toString() === req.user._id.toString()) return next(new AppError('You cannot change your own role', 400));
    if (user.role === 'superAdmin') return next(new AppError('Cannot change superAdmin role', 403));
    user.role = role;
    await user.save();
    res.status(200).json({ success: true, message: `User role changed to ${role}`, data: { user } });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    if (user._id.toString() === req.user._id.toString()) return next(new AppError('You cannot delete your own account', 400));
    if (user.role === 'superAdmin') return next(new AppError('Cannot delete superAdmin account', 403));
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
    const [totalUsers, totalStudents, totalParents, totalAdmins, verifiedUsers, activeUsers, totalPosts, totalQuizzes, totalSubmissions] = await Promise.all([
        User.countDocuments(), User.countDocuments({ role: 'student' }), User.countDocuments({ role: 'parent' }), User.countDocuments({ role: 'admin' }),
        User.countDocuments({ isVerified: true }), User.countDocuments({ isActive: true }), Post.countDocuments(), Quiz.countDocuments(), Submission.countDocuments()
    ]);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const usersByGrade = await User.aggregate([{ $match: { role: 'student', grade: { $exists: true } } }, { $group: { _id: '$grade', count: { $sum: 1 } } }]);
    const usersByBoard = await User.aggregate([{ $match: { role: 'student', board: { $exists: true } } }, { $group: { _id: '$board', count: { $sum: 1 } } }]);
    res.status(200).json({ success: true, data: { users: { total: totalUsers, students: totalStudents, parents: totalParents, admins: totalAdmins, verified: verifiedUsers, active: activeUsers, recentRegistrations }, content: { posts: totalPosts, quizzes: totalQuizzes, submissions: totalSubmissions }, breakdown: { byGrade: usersByGrade, byBoard: usersByBoard } } });
});

export const linkChild = asyncHandler(async (req, res, next) => {
    const { parentId, childId } = req.params;
    const parent = await User.findById(parentId);
    const child = await User.findById(childId);
    if (!parent || !child) return next(new AppError('Parent or child not found', 404));
    if (parent.role !== 'parent') return next(new AppError('User is not a parent', 400));
    if (child.role !== 'student') return next(new AppError('Child must be a student', 400));
    if (parent.children.includes(childId)) return next(new AppError('Child already linked to this parent', 400));
    parent.children.push(childId);
    await parent.save();
    res.status(200).json({ success: true, message: 'Child linked to parent successfully', data: { parent } });
});

export const unlinkChild = asyncHandler(async (req, res, next) => {
    const { parentId, childId } = req.params;
    const parent = await User.findById(parentId);
    if (!parent) return next(new AppError('Parent not found', 404));
    parent.children = parent.children.filter(id => id.toString() !== childId);
    await parent.save();
    res.status(200).json({ success: true, message: 'Child unlinked from parent successfully', data: { parent } });
});

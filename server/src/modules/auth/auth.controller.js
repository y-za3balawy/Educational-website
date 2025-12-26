import User from '../../../DB/model/User.model.js';
import { asyncHandler } from '../../utils/errorHandling.js';
import { AppError } from '../../utils/ErrorClass.js';
import { hashPassword, comparePassword } from '../../utils/HashAndCompare.js';
import { generateToken, verifyToken, generateVerificationToken, generateResetToken } from '../../utils/GenerateAndVerifyToken.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../utils/email.js';

export const register = asyncHandler(async (req, res, next) => {
    const { email, password, firstName, lastName, role, phone, grade, board } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Email already registered', 409));
    }
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
        email, password: hashedPassword, firstName, lastName,
        role: role || 'student', phone, grade, board
    });
    const verificationToken = generateVerificationToken(user._id);
    user.verificationToken = verificationToken;
    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    try {
        await sendVerificationEmail(email, verificationToken);
    } catch (error) {
        console.error('Failed to send verification email:', error);
    }
    const token = generateToken({ userId: user._id });
    res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
            user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, isVerified: user.isVerified },
            token
        }
    });
});

export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return next(new AppError('Invalid email or password', 401));
    if (!user.isActive) return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) return next(new AppError('Invalid email or password', 401));
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken({ userId: user._id });
    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, isVerified: user.isVerified, avatar: user.avatar },
            token
        }
    });
});

export const verifyEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    try {
        const decoded = verifyToken(token);
        if (decoded.purpose !== 'email-verification') return next(new AppError('Invalid verification token', 400));
        const user = await User.findById(decoded.userId);
        if (!user) return next(new AppError('User not found', 404));
        if (user.isVerified) return res.status(200).json({ success: true, message: 'Email already verified' });
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();
        res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        return next(new AppError('Invalid or expired verification token', 400));
    }
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ success: true, message: 'If an account exists with that email, a password reset link has been sent.' });
    const resetToken = generateResetToken(user._id);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save();
    try {
        await sendPasswordResetEmail(email, resetToken);
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return next(new AppError('Failed to send reset email. Please try again.', 500));
    }
    res.status(200).json({ success: true, message: 'If an account exists with that email, a password reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const decoded = verifyToken(token);
        if (decoded.purpose !== 'password-reset') return next(new AppError('Invalid reset token', 400));
        const user = await User.findById(decoded.userId);
        if (!user) return next(new AppError('User not found', 404));
        user.password = await hashPassword(password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.passwordChangedAt = new Date();
        await user.save();
        res.status(200).json({ success: true, message: 'Password reset successful. Please login with your new password.' });
    } catch (error) {
        return next(new AppError('Invalid or expired reset token', 400));
    }
});

export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('children', 'firstName lastName email grade');
    res.status(200).json({ success: true, data: { user } });
});

export const updateMe = asyncHandler(async (req, res, next) => {
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'grade', 'board'];
    const updates = {};
    allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    if (req.file) {
        updates.avatar = { url: req.file.path, publicId: req.file.filename };
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: { user } });
});

export const changePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) return next(new AppError('Current password is incorrect', 401));
    user.password = await hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await user.save();
    const token = generateToken({ userId: user._id });
    res.status(200).json({ success: true, message: 'Password changed successfully', data: { token } });
});

export const logout = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});

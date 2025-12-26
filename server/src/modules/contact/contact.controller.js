import Contact from '../../../DB/model/Contact.model.js';
import User from '../../../DB/model/User.model.js';
import { asyncHandler } from '../../utils/errorHandling.js';
import { AppError } from '../../utils/ErrorClass.js';
import { ApiFeatures, getPaginationInfo } from '../../utils/api.features.js';
import { sendEmail } from '../../utils/email.js';

/**
 * Submit a contact form (public)
 */
export const submitContact = asyncHandler(async (req, res, next) => {
    const { 
        name, email, phone, senderType, subject, message, 
        category, level, relatedPost, relatedQuiz, relatedPaper 
    } = req.body;

    // Check rate limiting (max 5 submissions per hour per IP)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSubmissions = await Contact.countDocuments({
        ipAddress: req.ip,
        createdAt: { $gte: oneHourAgo }
    });

    if (recentSubmissions >= 5) {
        return next(new AppError('Too many submissions. Please try again later.', 429));
    }

    // Auto-detect priority based on keywords
    let priority = 'normal';
    const urgentKeywords = ['urgent', 'emergency', 'asap', 'immediately', 'critical'];
    const messageLC = message.toLowerCase();
    if (urgentKeywords.some(kw => messageLC.includes(kw))) {
        priority = 'high';
    }

    // Check if user is logged in
    const userId = req.user?._id;

    const contact = await Contact.create({
        name,
        email,
        phone,
        senderType: senderType || 'other',
        subject,
        message,
        category: category || 'general',
        priority,
        level,
        relatedPost,
        relatedQuiz,
        relatedPaper,
        user: userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Send confirmation email to user
    try {
        await sendEmail({
            to: email,
            subject: `We received your message: ${subject}`,
            html: `
                <h2>Thank you for contacting us, ${name}!</h2>
                <p>We have received your message and will respond as soon as possible.</p>
                <p><strong>Reference ID:</strong> ${contact._id}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr>
                <p><em>This is an automated confirmation. Please do not reply to this email.</em></p>
            `
        });
    } catch (error) {
        console.error('Failed to send confirmation email:', error);
    }

    // Notify admins of new message
    try {
        const admins = await User.find({ role: { $in: ['admin', 'superAdmin'] } }).select('email');
        for (const admin of admins) {
            await sendEmail({
                to: admin.email,
                subject: `New Contact: ${subject}`,
                html: `
                    <h2>New Contact Message</h2>
                    <p><strong>From:</strong> ${name} (${email})</p>
                    <p><strong>Type:</strong> ${senderType}</p>
                    <p><strong>Category:</strong> ${category}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <hr>
                    <p>${message}</p>
                    <hr>
                    <p><a href="${process.env.CLIENT_URL}/dashboard/messages/${contact._id}">View in Dashboard</a></p>
                `
            });
        }
    } catch (error) {
        console.error('Failed to notify admins:', error);
    }

    res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully. We will respond soon.',
        data: { referenceId: contact._id }
    });
});

/**
 * Get all contacts (admin)
 */
export const getAllContacts = asyncHandler(async (req, res) => {
    let filter = {};

    // Apply filters
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.senderType) filter.senderType = req.query.senderType;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.isSpam !== undefined) filter.isSpam = req.query.isSpam === 'true';

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {};
        if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
        if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }

    const query = Contact.find(filter)
        .populate('assignedTo', 'firstName lastName')
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 });

    const features = new ApiFeatures(query, req.query)
        .paginate()
        .search(['subject', 'message', 'name', 'email']);

    const contacts = await features.query;
    const total = await Contact.countDocuments(filter);

    // Get status counts
    const statusCounts = await Contact.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            contacts,
            pagination: getPaginationInfo(total, features.pagination.page, features.pagination.limit),
            statusCounts: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {})
        }
    });
});

/**
 * Get single contact (admin)
 */
export const getContactById = asyncHandler(async (req, res, next) => {
    const contact = await Contact.findById(req.params.id)
        .populate('assignedTo', 'firstName lastName email')
        .populate('user', 'firstName lastName email')
        .populate('relatedPost', 'title')
        .populate('relatedQuiz', 'title')
        .populate('relatedPaper', 'title')
        .populate('responses.respondedBy', 'firstName lastName')
        .populate('internalNotes.addedBy', 'firstName lastName');

    if (!contact) {
        return next(new AppError('Contact not found', 404));
    }

    res.status(200).json({ success: true, data: { contact } });
});

/**
 * Update contact status/assignment (admin)
 */
export const updateContact = asyncHandler(async (req, res, next) => {
    const { status, assignedTo, priority, category, isSpam } = req.body;
    
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
        return next(new AppError('Contact not found', 404));
    }

    // Update fields
    if (status) {
        contact.status = status;
        if (status === 'resolved' && !contact.resolvedAt) {
            contact.resolvedAt = new Date();
        }
        if (status === 'closed' && !contact.closedAt) {
            contact.closedAt = new Date();
        }
    }
    if (assignedTo !== undefined) contact.assignedTo = assignedTo || null;
    if (priority) contact.priority = priority;
    if (category) contact.category = category;
    if (isSpam !== undefined) {
        contact.isSpam = isSpam;
        if (isSpam) contact.status = 'spam';
    }

    await contact.save();

    res.status(200).json({
        success: true,
        message: 'Contact updated successfully',
        data: { contact }
    });
});

/**
 * Add response to contact (admin)
 */
export const addResponse = asyncHandler(async (req, res, next) => {
    const { message, isInternal, sendEmail: shouldSendEmail } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
        return next(new AppError('Contact not found', 404));
    }

    const response = {
        message,
        respondedBy: req.user._id,
        isInternal: isInternal || false,
        sentViaEmail: false
    };

    // Track first response time
    if (!contact.firstResponseAt && !isInternal) {
        contact.firstResponseAt = new Date();
    }

    // Send email if requested and not internal
    if (shouldSendEmail && !isInternal) {
        try {
            await sendEmail({
                to: contact.email,
                subject: `Re: ${contact.subject}`,
                html: `
                    <p>Dear ${contact.name},</p>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                    <hr>
                    <p><em>Reference ID: ${contact._id}</em></p>
                    <p><em>Original message: ${contact.message.substring(0, 200)}...</em></p>
                `
            });
            response.sentViaEmail = true;
        } catch (error) {
            console.error('Failed to send response email:', error);
        }
    }

    contact.responses.push(response);
    
    // Update status if it was new
    if (contact.status === 'new') {
        contact.status = 'in_progress';
    }

    await contact.save();

    res.status(200).json({
        success: true,
        message: isInternal ? 'Internal note added' : 'Response sent successfully',
        data: { contact }
    });
});

/**
 * Add internal note (admin)
 */
export const addInternalNote = asyncHandler(async (req, res, next) => {
    const { note } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
        return next(new AppError('Contact not found', 404));
    }

    contact.internalNotes.push({
        note,
        addedBy: req.user._id
    });

    await contact.save();

    res.status(200).json({
        success: true,
        message: 'Note added successfully',
        data: { contact }
    });
});

/**
 * Bulk update contacts (admin)
 */
export const bulkUpdateContacts = asyncHandler(async (req, res, next) => {
    const { ids, status, assignedTo, isSpam } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return next(new AppError('Please provide contact IDs', 400));
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;
    if (isSpam !== undefined) {
        updateData.isSpam = isSpam;
        if (isSpam) updateData.status = 'spam';
    }

    const result = await Contact.updateMany(
        { _id: { $in: ids } },
        { $set: updateData }
    );

    res.status(200).json({
        success: true,
        message: `${result.modifiedCount} contacts updated`,
        data: { modifiedCount: result.modifiedCount }
    });
});

/**
 * Delete contact (admin)
 */
export const deleteContact = asyncHandler(async (req, res, next) => {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
        return next(new AppError('Contact not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Contact deleted successfully'
    });
});

/**
 * Get contact stats (admin)
 */
export const getContactStats = asyncHandler(async (req, res) => {
    const [
        totalContacts,
        statusCounts,
        categoryCounts,
        avgResponseTime,
        todayCount,
        unresolvedCount
    ] = await Promise.all([
        Contact.countDocuments({ isSpam: false }),
        Contact.aggregate([
            { $match: { isSpam: false } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Contact.aggregate([
            { $match: { isSpam: false } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]),
        Contact.aggregate([
            { $match: { firstResponseAt: { $exists: true } } },
            { $project: { responseTime: { $subtract: ['$firstResponseAt', '$createdAt'] } } },
            { $group: { _id: null, avg: { $avg: '$responseTime' } } }
        ]),
        Contact.countDocuments({
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            isSpam: false
        }),
        Contact.countDocuments({
            status: { $in: ['new', 'in_progress', 'awaiting_reply'] },
            isSpam: false
        })
    ]);

    res.status(200).json({
        success: true,
        data: {
            total: totalContacts,
            today: todayCount,
            unresolved: unresolvedCount,
            avgResponseTime: avgResponseTime[0]?.avg || 0,
            byStatus: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
            byCategory: categoryCounts.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {})
        }
    });
});

import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    // Sender Information
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    
    // Sender Type
    senderType: {
        type: String,
        enum: ['student', 'parent', 'school', 'teacher', 'other'],
        default: 'other'
    },
    
    // Message Details
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        maxlength: 5000
    },
    
    // Categorization
    category: {
        type: String,
        enum: ['general', 'enrollment', 'technical', 'feedback', 'complaint', 'academic', 'billing'],
        default: 'general'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    
    // Educational Context
    level: {
        type: String,
        enum: ['igcse', 'olevel', 'alevel', 'other', null],
        default: null
    },
    
    // Content References
    relatedPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    relatedQuiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    relatedPaper: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PastPaper'
    },
    
    // Attachments
    attachments: [{
        url: String,
        publicId: String,
        filename: String,
        size: Number,
        type: String
    }],
    
    // Status & Workflow
    status: {
        type: String,
        enum: ['new', 'in_progress', 'awaiting_reply', 'resolved', 'closed', 'spam'],
        default: 'new'
    },
    
    // Assignment
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Response Tracking
    responses: [{
        message: { type: String, required: true },
        respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        respondedAt: { type: Date, default: Date.now },
        isInternal: { type: Boolean, default: false }, // Internal notes vs actual response
        sentViaEmail: { type: Boolean, default: false }
    }],
    
    // Internal Notes
    internalNotes: [{
        note: String,
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now }
    }],
    
    // Timestamps
    firstResponseAt: Date,
    resolvedAt: Date,
    closedAt: Date,
    
    // Linked User (if sender is registered)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Spam Prevention
    ipAddress: String,
    userAgent: String,
    isSpam: { type: Boolean, default: false },
    
    // Satisfaction
    satisfactionRating: {
        type: Number,
        min: 1,
        max: 5
    },
    satisfactionFeedback: String

}, { timestamps: true });

// Indexes
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ category: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ assignedTo: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ user: 1 });
contactSchema.index({ subject: 'text', message: 'text' });

// Virtual for response time
contactSchema.virtual('responseTime').get(function() {
    if (this.firstResponseAt && this.createdAt) {
        return this.firstResponseAt - this.createdAt;
    }
    return null;
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;

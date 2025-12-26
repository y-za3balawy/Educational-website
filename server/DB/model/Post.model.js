import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Post title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        sparse: true
    },
    content: {
        type: String,
        required: [true, 'Post content is required']
    },
    excerpt: {
        type: String,
        maxlength: 500
    },
    media: [{
        url: { type: String, required: true },
        publicId: String,
        type: { type: String, enum: ['image', 'video', 'document'], required: true },
        filename: String,
        size: Number,
        alt: String,
        caption: String
    }],
    featuredImage: {
        url: String,
        publicId: String,
        alt: String
    },
    targetAudience: {
        type: String,
        enum: ['students', 'parents', 'all'],
        default: 'all'
    },
    board: {
        type: String,
        enum: ['cambridge', 'edexcel', 'oxford', 'all'],
        default: 'all'
    },
    level: {
        type: String,
        enum: ['igcse', 'olevel', 'alevel', 'all'],
        default: 'all'
    },
    topic: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    
    // Publishing & Scheduling
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'published', 'archived'],
        default: 'draft'
    },
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
    scheduledAt: Date,
    
    // SEO
    metaTitle: { type: String, maxlength: 70 },
    metaDescription: { type: String, maxlength: 160 },
    canonicalUrl: String,
    
    // Reading & Engagement
    readingTime: { type: Number, default: 0 }, // in minutes
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    
    // Content Lifecycle
    lastEditedAt: Date,
    lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Generate slug from title
postSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    }
    
    // Calculate reading time (avg 200 words per minute)
    if (this.isModified('content')) {
        const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        this.readingTime = Math.ceil(wordCount / 200);
    }
    
    // Auto-generate excerpt if not provided
    if (this.isModified('content') && !this.excerpt) {
        const plainText = this.content.replace(/<[^>]*>/g, '');
        this.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
    }
    
    next();
});

// Indexes
postSchema.index({ slug: 1 });
postSchema.index({ status: 1 });
postSchema.index({ targetAudience: 1 });
postSchema.index({ board: 1, level: 1 });
postSchema.index({ isPublished: 1 });
postSchema.index({ scheduledAt: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Post = mongoose.model('Post', postSchema);

export default Post;

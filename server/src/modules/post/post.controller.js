import Post from '../../../DB/model/Post.model.js';
import { asyncHandler } from '../../utils/errorHandling.js';
import { AppError } from '../../utils/ErrorClass.js';
import { ApiFeatures, getPaginationInfo } from '../../utils/api.features.js';
import { deleteFromCloudinary } from '../../utils/cloudinary.js';

export const getAllPosts = asyncHandler(async (req, res) => {
    let filter = { isPublished: true };
    
    // If user is logged in, apply role-based filtering
    if (req.user) {
        if (req.user.role === 'student') {
            filter.$or = [{ targetAudience: 'students' }, { targetAudience: 'all' }];
            if (req.user.board) filter.$or = filter.$or.map(cond => ({ ...cond, $or: [{ board: req.user.board }, { board: 'all' }] }));
            if (req.user.grade) filter.$or = filter.$or.map(cond => ({ ...cond, $or: [{ level: req.user.grade }, { level: 'all' }] }));
        } else if (req.user.role === 'parent') {
            filter.$or = [{ targetAudience: 'parents' }, { targetAudience: 'all' }];
        } else if (['superAdmin', 'admin'].includes(req.user.role)) {
            // Admins can see all posts
            delete filter.isPublished;
            if (req.query.isPublished !== undefined) {
                filter.isPublished = req.query.isPublished === 'true';
            }
            if (req.query.status) {
                filter.status = req.query.status;
            }
        }
    }
    
    if (req.query.targetAudience) filter.targetAudience = req.query.targetAudience;
    if (req.query.board) filter.board = req.query.board;
    if (req.query.level) filter.level = req.query.level;
    if (req.query.tag) filter.tags = req.query.tag;
    
    const query = Post.find(filter).populate('createdBy', 'firstName lastName');
    const features = new ApiFeatures(query, req.query).sort().limitFields().paginate().search(['title', 'content', 'topic', 'tags']);
    const posts = await features.query;
    const total = await Post.countDocuments(filter);
    res.status(200).json({ success: true, data: { posts, pagination: getPaginationInfo(total, features.pagination.page, features.pagination.limit) } });
});

export const getPostById = asyncHandler(async (req, res, next) => {
    // Support both ID and slug
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) 
        ? { _id: req.params.id } 
        : { slug: req.params.id };
    
    const post = await Post.findOne(query).populate('createdBy', 'firstName lastName avatar');
    if (!post) return next(new AppError('Post not found', 404));
    
    const isAdmin = req.user && ['superAdmin', 'admin'].includes(req.user.role);
    
    // Check if post is accessible
    if (!isAdmin) {
        if (!post.isPublished) return next(new AppError('Post not found', 404));
        if (req.user) {
            if (req.user.role === 'student' && post.targetAudience === 'parents') return next(new AppError('You do not have access to this post', 403));
            if (req.user.role === 'parent' && post.targetAudience === 'students') return next(new AppError('You do not have access to this post', 403));
        }
    }
    
    post.views += 1;
    await post.save();
    res.status(200).json({ success: true, data: { post } });
});

export const createPost = asyncHandler(async (req, res) => {
    const { 
        title, content, excerpt, targetAudience, board, level, topic, tags,
        isPublished, scheduledAt, metaTitle, metaDescription, status
    } = req.body;
    
    let media = [];
    let featuredImage = null;
    
    if (req.files) {
        // Handle multiple file fields
        if (req.files.media && req.files.media.length > 0) {
            media = req.files.media.map(file => ({
                url: file.path, publicId: file.filename,
                type: file.mimetype.startsWith('image/') ? 'image' : file.mimetype.startsWith('video/') ? 'video' : 'document',
                filename: file.originalname, size: file.size
            }));
        }
        if (req.files.featuredImage && req.files.featuredImage[0]) {
            const file = req.files.featuredImage[0];
            featuredImage = { url: file.path, publicId: file.filename };
        }
    } else if (req.file) {
        // Single file upload fallback
        media = [{
            url: req.file.path, publicId: req.file.filename,
            type: req.file.mimetype.startsWith('image/') ? 'image' : req.file.mimetype.startsWith('video/') ? 'video' : 'document',
            filename: req.file.originalname, size: req.file.size
        }];
    }
    
    // Determine status and publish state
    let postStatus = status || 'draft';
    let shouldPublish = isPublished;
    let publishDate = null;
    
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
        postStatus = 'scheduled';
        shouldPublish = false;
    } else if (shouldPublish) {
        postStatus = 'published';
        publishDate = new Date();
    }
    
    const post = await Post.create({
        title, content, excerpt, media, featuredImage, targetAudience, board, level, topic,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
        status: postStatus, isPublished: shouldPublish, publishedAt: publishDate, scheduledAt,
        metaTitle, metaDescription, createdBy: req.user._id
    });
    
    res.status(201).json({ success: true, message: 'Post created successfully', data: { post } });
});

export const updatePost = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError('Post not found', 404));
    
    const allowedUpdates = [
        'title', 'content', 'excerpt', 'targetAudience', 'board', 'level', 'topic', 'tags',
        'isPublished', 'status', 'scheduledAt', 'metaTitle', 'metaDescription'
    ];
    const updates = {};
    
    allowedUpdates.forEach(field => { 
        if (req.body[field] !== undefined) {
            if (field === 'tags' && typeof req.body[field] === 'string') {
                updates[field] = req.body[field].split(',').map(t => t.trim());
            } else {
                updates[field] = req.body[field];
            }
        }
    });
    
    if (req.files) {
        if (req.files.media && req.files.media.length > 0) {
            const newMedia = req.files.media.map(file => ({
                url: file.path, publicId: file.filename,
                type: file.mimetype.startsWith('image/') ? 'image' : file.mimetype.startsWith('video/') ? 'video' : 'document',
                filename: file.originalname, size: file.size
            }));
            updates.media = [...post.media, ...newMedia];
        }
        if (req.files.featuredImage && req.files.featuredImage[0]) {
            // Delete old featured image
            if (post.featuredImage?.publicId) {
                try { await deleteFromCloudinary(post.featuredImage.publicId); } catch (e) { console.error(e); }
            }
            const file = req.files.featuredImage[0];
            updates.featuredImage = { url: file.path, publicId: file.filename };
        }
    } else if (req.file) {
        const newMedia = [{
            url: req.file.path, publicId: req.file.filename,
            type: req.file.mimetype.startsWith('image/') ? 'image' : req.file.mimetype.startsWith('video/') ? 'video' : 'document',
            filename: req.file.originalname, size: req.file.size
        }];
        updates.media = [...post.media, ...newMedia];
    }
    
    // Handle publishing logic
    if (updates.isPublished && !post.isPublished) {
        updates.publishedAt = new Date();
        updates.status = 'published';
    }
    if (updates.scheduledAt && new Date(updates.scheduledAt) > new Date()) {
        updates.status = 'scheduled';
        updates.isPublished = false;
    }
    
    updates.lastEditedAt = new Date();
    updates.lastEditedBy = req.user._id;
    
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: 'Post updated successfully', data: { post: updatedPost } });
});

export const deletePost = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError('Post not found', 404));
    
    // Delete media from Cloudinary
    for (const media of post.media) {
        if (media.publicId) {
            try {
                const resourceType = media.type === 'video' ? 'video' : media.type === 'document' ? 'raw' : 'image';
                await deleteFromCloudinary(media.publicId, resourceType);
            } catch (error) { console.error('Failed to delete media from Cloudinary:', error); }
        }
    }
    
    // Delete featured image
    if (post.featuredImage?.publicId) {
        try { await deleteFromCloudinary(post.featuredImage.publicId); } catch (e) { console.error(e); }
    }
    
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Post deleted successfully' });
});

export const removeMedia = asyncHandler(async (req, res, next) => {
    const { id, mediaId } = req.params;
    const post = await Post.findById(id);
    if (!post) return next(new AppError('Post not found', 404));
    const mediaIndex = post.media.findIndex(m => m._id.toString() === mediaId);
    if (mediaIndex === -1) return next(new AppError('Media not found', 404));
    const media = post.media[mediaIndex];
    if (media.publicId) {
        try {
            const resourceType = media.type === 'video' ? 'video' : media.type === 'document' ? 'raw' : 'image';
            await deleteFromCloudinary(media.publicId, resourceType);
        } catch (error) { console.error('Failed to delete media from Cloudinary:', error); }
    }
    post.media.splice(mediaIndex, 1);
    await post.save();
    res.status(200).json({ success: true, message: 'Media removed successfully', data: { post } });
});

// Publish scheduled posts (can be called by cron job)
export const publishScheduledPosts = asyncHandler(async (req, res) => {
    const now = new Date();
    const result = await Post.updateMany(
        { status: 'scheduled', scheduledAt: { $lte: now }, isPublished: false },
        { $set: { status: 'published', isPublished: true, publishedAt: now } }
    );
    res.status(200).json({ success: true, message: `${result.modifiedCount} posts published`, data: { count: result.modifiedCount } });
});

// Get post by slug
export const getPostBySlug = asyncHandler(async (req, res, next) => {
    const post = await Post.findOne({ slug: req.params.slug }).populate('createdBy', 'firstName lastName avatar');
    if (!post) return next(new AppError('Post not found', 404));
    
    const isAdmin = req.user && ['superAdmin', 'admin'].includes(req.user.role);
    if (!isAdmin && !post.isPublished) return next(new AppError('Post not found', 404));
    
    post.views += 1;
    await post.save();
    res.status(200).json({ success: true, data: { post } });
});

// Archive post
export const archivePost = asyncHandler(async (req, res, next) => {
    const post = await Post.findByIdAndUpdate(
        req.params.id,
        { status: 'archived', isPublished: false },
        { new: true }
    );
    if (!post) return next(new AppError('Post not found', 404));
    res.status(200).json({ success: true, message: 'Post archived', data: { post } });
});

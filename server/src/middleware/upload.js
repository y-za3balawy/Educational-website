import multer from 'multer';
import { AppError } from '../utils/ErrorClass.js';
import { uploadImage, uploadVideo, uploadDocument, uploadMixed, sliderImageStorage } from '../utils/cloudinary.js';

// Create multer instance for slider images with optimization
const uploadSlider = multer({
    storage: sliderImageStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB for high-res images
});

const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new AppError('Only image files are allowed', 400), false);
    }
};

const videoFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new AppError('Only video files are allowed', 400), false);
    }
};

const documentFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Only PDF, Word, and PowerPoint files are allowed', 400), false);
    }
};

export const uploadSingleImage = uploadImage.single('image');
export const uploadMultipleImages = uploadImage.array('images', 10);
export const uploadSingleVideo = uploadVideo.single('video');
export const uploadSingleDocument = uploadDocument.single('document');
export const uploadMultipleDocuments = uploadDocument.array('documents', 5);
export const uploadPostMedia = uploadMixed.array('media', 10);

// Generic single file upload with custom field name
export const uploadSingle = (fieldName) => {
    // Use optimized slider storage for slider images
    if (fieldName === 'sliderImage') {
        return uploadSlider.single(fieldName);
    }
    return uploadImage.single(fieldName);
};

export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('File too large', 400));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new AppError('Too many files', 400));
        }
        return next(new AppError(err.message, 400));
    }
    next(err);
};

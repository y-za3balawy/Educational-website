import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// Load env vars here to ensure they're available before cloudinary config
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary configured with cloud:', process.env.CLOUDINARY_CLOUD_NAME);

const createCloudinaryStorage = (folder, allowedFormats, resourceType = 'auto', transformation = null) => {
    return new CloudinaryStorage({
        cloudinary,
        params: {
            folder: `biology-education/${folder}`,
            allowed_formats: allowedFormats,
            resource_type: resourceType,
            ...(transformation && { transformation })
        }
    });
};

// Slider images - auto optimized for web, preserve aspect ratio
export const sliderImageStorage = createCloudinaryStorage(
    'slider', 
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic', 'heif'], 
    'image',
    [{ width: 1920, quality: 'auto', fetch_format: 'auto' }]
);

export const imageStorage = createCloudinaryStorage('images', ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic', 'heif'], 'image');
export const videoStorage = createCloudinaryStorage('videos', ['mp4', 'mov', 'avi', 'webm'], 'video');
export const documentStorage = createCloudinaryStorage('documents', ['pdf', 'doc', 'docx', 'ppt', 'pptx'], 'raw');

export const uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadVideo = multer({
    storage: videoStorage,
    limits: { fileSize: 100 * 1024 * 1024 }
});

export const uploadDocument = multer({
    storage: documentStorage,
    limits: { fileSize: 20 * 1024 * 1024 }
});

const mixedStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let folder = 'biology-education/mixed';
        let resourceType = 'auto';
        if (file.mimetype.startsWith('image/')) {
            folder = 'biology-education/images';
            resourceType = 'image';
        } else if (file.mimetype.startsWith('video/')) {
            folder = 'biology-education/videos';
            resourceType = 'video';
        } else {
            folder = 'biology-education/documents';
            resourceType = 'raw';
        }
        return { folder, resource_type: resourceType };
    }
});

export const uploadMixed = multer({
    storage: mixedStorage,
    limits: { fileSize: 100 * 1024 * 1024 }
});

export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
};

export const uploadToCloudinary = async (filePath, folder, resourceType = 'auto') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `biology-education/${folder}`,
            resource_type: resourceType
        });
        return result;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

export { cloudinary };

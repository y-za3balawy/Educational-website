import SiteSettings from '../../../DB/model/SiteSettings.model.js';
import { asyncHandler } from '../../utils/errorHandling.js';
import { deleteFromCloudinary } from '../../utils/cloudinary.js';

/**
 * Get site settings (public - returns only public fields)
 */
export const getPublicSettings = asyncHandler(async (req, res) => {
    const settings = await SiteSettings.getSettings();
    
    // Filter active reviews only for public
    const activeReviews = settings.reviews?.items?.filter(r => r.isActive) || [];
    
    // Return only public-facing data
    res.status(200).json({
        success: true,
        data: {
            siteName: settings.siteName,
            siteDescription: settings.siteDescription,
            logo: settings.logo,
            hero: settings.hero,
            about: settings.about,
            contact: settings.contact,
            socialLinks: settings.socialLinks,
            reviews: {
                sectionTitle: settings.reviews?.sectionTitle,
                sectionSubtitle: settings.reviews?.sectionSubtitle,
                showSection: settings.reviews?.showSection,
                items: activeReviews.sort((a, b) => a.order - b.order)
            },
            footer: settings.footer,
            seo: settings.seo,
            features: settings.features
        }
    });
});

/**
 * Get about page content (public)
 */
export const getAboutContent = asyncHandler(async (req, res) => {
    const settings = await SiteSettings.getSettings();
    
    res.status(200).json({
        success: true,
        data: {
            about: settings.about,
            contact: settings.contact,
            socialLinks: settings.socialLinks
        }
    });
});

/**
 * Get all settings (admin only)
 */
export const getAllSettings = asyncHandler(async (req, res) => {
    const settings = await SiteSettings.getSettings();
    
    res.status(200).json({
        success: true,
        data: { settings }
    });
});

/**
 * Update site settings (admin only)
 */
export const updateSettings = asyncHandler(async (req, res) => {
    const settings = await SiteSettings.getSettings();
    
    const allowedFields = [
        'siteName', 'siteDescription', 'about', 'contact', 
        'socialLinks', 'footer', 'seo', 'features', 'hero'
    ];
    
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            if (typeof req.body[field] === 'object' && !Array.isArray(req.body[field])) {
                // Merge nested objects
                settings[field] = { ...settings[field]?.toObject?.() || settings[field], ...req.body[field] };
            } else {
                settings[field] = req.body[field];
            }
        }
    });
    
    settings.lastUpdatedBy = req.user._id;
    await settings.save();
    
    res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: { settings }
    });
});

/**
 * Update about page content (admin only)
 */
export const updateAboutContent = asyncHandler(async (req, res) => {
    const settings = await SiteSettings.getSettings();
    
    // Handle file uploads
    if (req.file) {
        // Delete old image if exists
        if (settings.about.profileImage?.publicId) {
            try {
                await deleteFromCloudinary(settings.about.profileImage.publicId);
            } catch (e) {
                console.error('Failed to delete old profile image:', e);
            }
        }
        settings.about.profileImage = {
            url: req.file.path,
            publicId: req.file.filename
        };
    }
    
    // Update about fields
    const aboutFields = [
        'name', 'title', 'shortBio', 'email', 'phone', 'location',
        'mainHeading', 'mainContent', 'qualifications',
        'philosophyHeading', 'philosophyQuote', 'ctaText', 'ctaLink'
    ];
    
    aboutFields.forEach(field => {
        if (req.body[field] !== undefined) {
            settings.about[field] = req.body[field];
        }
    });
    
    settings.lastUpdatedBy = req.user._id;
    await settings.save();
    
    res.status(200).json({
        success: true,
        message: 'About page updated successfully',
        data: { about: settings.about }
    });
});

/**
 * Update contact info (admin only)
 */
export const updateContactInfo = asyncHandler(async (req, res) => {
    const settings = await SiteSettings.getSettings();
    
    const contactFields = ['email', 'phone', 'address', 'workingHours', 'responseTime'];
    
    contactFields.forEach(field => {
        if (req.body[field] !== undefined) {
            settings.contact[field] = req.body[field];
        }
    });
    
    settings.lastUpdatedBy = req.user._id;
    await settings.save();
    
    res.status(200).json({
        success: true,
        message: 'Contact info updated successfully',
        data: { contact: settings.contact }
    });
});

/**
 * Update social links (admin only)
 */
export const updateSocialLinks = asyncHandler(async (req, res) => {
    const settings = await SiteSettings.getSettings();
    
    if (req.body.socialLinks) {
        settings.socialLinks = req.body.socialLinks;
    }
    
    settings.lastUpdatedBy = req.user._id;
    await settings.save();
    
    res.status(200).json({
        success: true,
        message: 'Social links updated successfully',
        data: { socialLinks: settings.socialLinks }
    });
});

/**
 * Upload logo (admin only)
 */
export const uploadLogo = asyncHandler(async (req, res) => {
    const settings = await SiteSettings.getSettings();
    
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Delete old logo if exists
    if (settings.logo?.publicId) {
        try {
            await deleteFromCloudinary(settings.logo.publicId);
        } catch (e) {
            console.error('Failed to delete old logo:', e);
        }
    }
    
    settings.logo = {
        url: req.file.path,
        publicId: req.file.filename
    };
    settings.lastUpdatedBy = req.user._id;
    await settings.save();
    
    res.status(200).json({
        success: true,
        message: 'Logo uploaded successfully',
        data: { logo: settings.logo }
    });
});

/**
 * Update hero section (admin only)
 */
export const updateHeroSection = asyncHandler(async (req, res) => {
    const settings = await SiteSettings.getSettings();
    
    // Handle file upload for background image
    if (req.file) {
        // Delete old image if exists
        if (settings.hero?.backgroundImage?.publicId) {
            try {
                await deleteFromCloudinary(settings.hero.backgroundImage.publicId);
            } catch (e) {
                console.error('Failed to delete old hero image:', e);
            }
        }
        if (!settings.hero) settings.hero = {};
        settings.hero.backgroundImage = {
            url: req.file.path,
            publicId: req.file.filename
        };
    }
    
    // Update hero text fields
    const heroFields = [
        'headline', 'subheadline', 'description', 'badge',
        'ctaText', 'ctaLink', 'secondaryCtaText', 'secondaryCtaLink',
        'statsNumber', 'statsLabel',
        'imagePosition', 'imageSize', 'overlayOpacity', 'overlayDirection', 'showFeatureCards'
    ];
    
    if (!settings.hero) settings.hero = {};
    
    heroFields.forEach(field => {
        if (req.body[field] !== undefined) {
            // Handle numeric fields
            if (field === 'overlayOpacity') {
                settings.hero[field] = parseInt(req.body[field], 10);
            } else if (field === 'showFeatureCards') {
                settings.hero[field] = req.body[field] === 'true' || req.body[field] === true;
            } else {
                settings.hero[field] = req.body[field];
            }
        }
    });
    
    settings.lastUpdatedBy = req.user._id;
    await settings.save();
    
    res.status(200).json({
        success: true,
        message: 'Hero section updated successfully',
        data: { hero: settings.hero }
    });
});


/**
 * Get reviews (admin only - includes inactive)
 */
export const getReviews = asyncHandler(async (req, res) => {
    const settings = await SiteSettings.getSettings();
    
    res.status(200).json({
        success: true,
        data: { reviews: settings.reviews }
    });
});

/**
 * Update reviews section settings (admin only)
 */
export const updateReviewsSection = asyncHandler(async (req, res) => {
    const settings = await SiteSettings.getSettings();
    
    if (!settings.reviews) {
        settings.reviews = { items: [] };
    }
    
    if (req.body.sectionTitle !== undefined) {
        settings.reviews.sectionTitle = req.body.sectionTitle;
    }
    if (req.body.sectionSubtitle !== undefined) {
        settings.reviews.sectionSubtitle = req.body.sectionSubtitle;
    }
    if (req.body.showSection !== undefined) {
        settings.reviews.showSection = req.body.showSection === 'true' || req.body.showSection === true;
    }
    
    settings.lastUpdatedBy = req.user._id;
    await settings.save();
    
    res.status(200).json({
        success: true,
        message: 'Reviews section updated successfully',
        data: { reviews: settings.reviews }
    });
});

/**
 * Add a review image (admin only)
 */
export const addReview = asyncHandler(async (req, res) => {
    const settings = await SiteSettings.getSettings();
    
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    
    if (!settings.reviews) {
        settings.reviews = { items: [] };
    }
    
    const newReview = {
        image: {
            url: req.file.path,
            publicId: req.file.filename
        },
        studentName: req.body.studentName || '',
        caption: req.body.caption || '',
        order: settings.reviews.items.length,
        isActive: true
    };
    
    settings.reviews.items.push(newReview);
    settings.lastUpdatedBy = req.user._id;
    await settings.save();
    
    res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: { review: settings.reviews.items[settings.reviews.items.length - 1] }
    });
});

/**
 * Update a review (admin only)
 */
export const updateReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const settings = await SiteSettings.getSettings();
    
    const reviewIndex = settings.reviews?.items?.findIndex(r => r._id.toString() === reviewId);
    
    if (reviewIndex === -1 || reviewIndex === undefined) {
        return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    // Update fields
    if (req.body.studentName !== undefined) {
        settings.reviews.items[reviewIndex].studentName = req.body.studentName;
    }
    if (req.body.caption !== undefined) {
        settings.reviews.items[reviewIndex].caption = req.body.caption;
    }
    if (req.body.order !== undefined) {
        settings.reviews.items[reviewIndex].order = parseInt(req.body.order, 10);
    }
    if (req.body.isActive !== undefined) {
        settings.reviews.items[reviewIndex].isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }
    
    // Handle new image upload
    if (req.file) {
        // Delete old image
        if (settings.reviews.items[reviewIndex].image?.publicId) {
            try {
                await deleteFromCloudinary(settings.reviews.items[reviewIndex].image.publicId);
            } catch (e) {
                console.error('Failed to delete old review image:', e);
            }
        }
        settings.reviews.items[reviewIndex].image = {
            url: req.file.path,
            publicId: req.file.filename
        };
    }
    
    settings.lastUpdatedBy = req.user._id;
    await settings.save();
    
    res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: { review: settings.reviews.items[reviewIndex] }
    });
});

/**
 * Delete a review (admin only)
 */
export const deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const settings = await SiteSettings.getSettings();
    
    const reviewIndex = settings.reviews?.items?.findIndex(r => r._id.toString() === reviewId);
    
    if (reviewIndex === -1 || reviewIndex === undefined) {
        return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    // Delete image from cloudinary
    if (settings.reviews.items[reviewIndex].image?.publicId) {
        try {
            await deleteFromCloudinary(settings.reviews.items[reviewIndex].image.publicId);
        } catch (e) {
            console.error('Failed to delete review image:', e);
        }
    }
    
    settings.reviews.items.splice(reviewIndex, 1);
    settings.lastUpdatedBy = req.user._id;
    await settings.save();
    
    res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
    });
});

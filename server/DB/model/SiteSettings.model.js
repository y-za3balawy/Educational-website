import mongoose from 'mongoose';

const qualificationSchema = new mongoose.Schema({
    icon: { type: String, default: 'Award' }, // Icon name from lucide-react
    title: { type: String, required: true },
    description: { type: String }
}, { _id: true });

const socialLinkSchema = new mongoose.Schema({
    platform: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String }
}, { _id: true });

const reviewSchema = new mongoose.Schema({
    image: {
        url: { type: String, required: true },
        publicId: String
    },
    studentName: { type: String },
    caption: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { _id: true, timestamps: true });

const siteSettingsSchema = new mongoose.Schema({
    // Singleton identifier
    key: {
        type: String,
        default: 'main',
        unique: true
    },
    
    // Site Info
    siteName: { type: String, default: 'BioIGCSE' },
    siteDescription: { type: String, default: 'Your Biology Learning Platform' },
    logo: {
        url: String,
        publicId: String
    },
    favicon: {
        url: String,
        publicId: String
    },
    
    // Hero Section
    hero: {
        backgroundImage: {
            url: String,
            publicId: String
        },
        // Image display options
        imagePosition: { type: String, default: 'right', enum: ['left', 'center', 'right'] },
        imageSize: { type: String, default: 'cover', enum: ['cover', 'contain', 'auto'] },
        overlayOpacity: { type: Number, default: 70, min: 0, max: 100 },
        overlayDirection: { type: String, default: 'left-to-right', enum: ['left-to-right', 'right-to-left', 'top-to-bottom', 'full'] },
        showFeatureCards: { type: Boolean, default: false },
        // Text content
        headline: { type: String, default: 'Master Business & Economics' },
        subheadline: { type: String, default: 'with Mr. Mahmoud Said' },
        description: { type: String, default: 'Access comprehensive study materials, past papers with mark schemes, and personalized teaching for Cambridge, Edexcel, and Oxford O-Level & A-Level examinations.' },
        badge: { type: String, default: 'Now accepting new students' },
        ctaText: { type: String, default: 'Browse Past Papers' },
        ctaLink: { type: String, default: '/past-papers' },
        secondaryCtaText: { type: String, default: 'Learn More' },
        secondaryCtaLink: { type: String, default: '/about' },
        statsNumber: { type: String, default: '500+' },
        statsLabel: { type: String, default: 'Students taught successfully' }
    },
    
    // About Page Content
    about: {
        // Profile Section
        name: { type: String, default: 'Your Name' },
        title: { type: String, default: 'Biology IGCSE Teacher' },
        shortBio: { type: String, default: 'Passionate about making biology accessible and engaging for all students.' },
        profileImage: {
            url: String,
            publicId: String
        },
        email: { type: String, default: 'contact@bioigcse.com' },
        phone: String,
        location: { type: String, default: 'Available Online Worldwide' },
        
        // Main Content
        mainHeading: { type: String, default: 'About Me' },
        mainContent: { type: String, default: '' },
        
        // Qualifications
        qualifications: [qualificationSchema],
        
        // Teaching Philosophy
        philosophyHeading: { type: String, default: 'Teaching Philosophy' },
        philosophyQuote: { type: String, default: '' },
        
        // Call to Action
        ctaText: { type: String, default: 'Book a Session' },
        ctaLink: { type: String, default: '/contact' }
    },
    
    // Contact Info (used across site)
    contact: {
        email: { type: String, default: 'support@bioigcse.com' },
        phone: String,
        address: String,
        workingHours: { type: String, default: 'Mon-Fri: 9AM-5PM' },
        responseTime: { type: String, default: 'Within 24 hours' }
    },
    
    // Social Links
    socialLinks: [socialLinkSchema],
    
    // Reviews/Testimonials Section
    reviews: {
        sectionTitle: { type: String, default: 'Student Reviews' },
        sectionSubtitle: { type: String, default: 'What our students say about us' },
        showSection: { type: Boolean, default: true },
        items: [reviewSchema]
    },
    
    // Footer Content
    footer: {
        copyright: { type: String, default: '© 2024 BioIGCSE. All rights reserved.' },
        tagline: String
    },
    
    // SEO Defaults
    seo: {
        defaultTitle: { type: String, default: 'BioIGCSE - Biology Learning Platform' },
        defaultDescription: { type: String, default: 'Master IGCSE Biology with expert resources, quizzes, and past papers.' },
        keywords: [String]
    },
    
    // Feature Flags
    features: {
        enableQuizzes: { type: Boolean, default: true },
        enablePastPapers: { type: Boolean, default: true },
        enableBlog: { type: Boolean, default: true },
        enableContact: { type: Boolean, default: true },
        maintenanceMode: { type: Boolean, default: false }
    },
    
    // Last updated tracking
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Ensure only one settings document exists
siteSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne({ key: 'main' });
    if (!settings) {
        settings = await this.create({ key: 'main' });
    }
    return settings;
};

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings;

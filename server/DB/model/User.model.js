import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['superAdmin', 'admin', 'student', 'parent'],
        default: 'student'
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        url: String,
        publicId: String
    },
    grade: {
        type: String,
        enum: ['igcse', 'olevel', 'alevel'],
    },
    board: {
        type: String,
        enum: ['cambridge', 'edexcel', 'oxford']
    },
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    passwordChangedAt: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });

const User = mongoose.model('User', userSchema);

export default User;

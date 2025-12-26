import mongoose from 'mongoose';

const pastPaperSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Paper title is required'], trim: true },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: [2000, 'Year must be 2000 or later'],
        max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
    },
    session: { type: String, enum: ['may', 'january'], required: true },
    board: { type: String, enum: ['cambridge', 'edexcel', 'oxford'], required: true },
    level: { type: String, enum: ['olevel', 'alevel'], required: true },
    // A-Level sub-level (AS or A2)
    subLevel: { type: String, enum: ['as', 'a2', null], default: null },
    subject: { 
        type: String, 
        enum: ['business', 'economics'],
        required: [true, 'Subject is required']
    },
    paperNumber: { type: String, trim: true },
    variant: { type: String, trim: true },
    paperType: { type: String, enum: ['theory', 'practical', 'mcq', 'structured', 'essay', 'case_study', 'data_response'], default: 'theory' },
    paperUrl: { type: String, required: [true, 'Paper URL is required'] },
    paperPublicId: String,
    markSchemeUrl: String,
    markSchemePublicId: String,
    examinerReportUrl: String,
    examinerReportPublicId: String,
    specimenPaper: { type: Boolean, default: false },
    topics: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    downloadCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true }
}, { timestamps: true });

pastPaperSchema.virtual('displayName').get(function () {
    const subLevelStr = this.subLevel ? ` ${this.subLevel.toUpperCase()}` : '';
    return `${this.board.toUpperCase()} ${this.level.toUpperCase()}${subLevelStr} ${this.subject} ${this.year} ${this.session} ${this.paperNumber || ''}`.trim();
});

pastPaperSchema.index({ board: 1, level: 1, year: -1 });
pastPaperSchema.index({ subject: 1 });
pastPaperSchema.index({ year: -1, session: 1 });
pastPaperSchema.index({ topics: 1 });
pastPaperSchema.index({ isPublished: 1 });
pastPaperSchema.index({ title: 'text', topics: 'text', tags: 'text' });

const PastPaper = mongoose.model('PastPaper', pastPaperSchema);

export default PastPaper;

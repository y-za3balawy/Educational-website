import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    type: {
        type: String,
        enum: ['mcq', 'multiSelect', 'trueFalse', 'shortAnswer', 'essay', 'fillBlank'],
        required: true
    },
    text: {
        type: String,
        required: [true, 'Question text is required']
    },
    media: {
        url: String,
        publicId: String,
        type: { type: String, enum: ['image', 'video', 'audio'] }
    },
    options: [{
        text: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
        media: { url: String, type: String }
    }],
    correctAnswer: { type: String },
    alternativeAnswers: [{ type: String }],
    points: {
        type: Number,
        required: true,
        default: 1,
        min: [0, 'Points cannot be negative']
    },
    negativePoints: { type: Number, default: 0 },
    explanation: { type: String },
    hint: { type: String },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    order: { type: Number, default: 0 },
    isRequired: { type: Boolean, default: true }
}, { timestamps: true });

questionSchema.pre('save', function (next) {
    if (['mcq', 'multiSelect', 'trueFalse'].includes(this.type)) {
        if (!this.options || this.options.length < 2) {
            return next(new Error('Multiple choice questions must have at least 2 options'));
        }
        const correctCount = this.options.filter(o => o.isCorrect).length;
        if (correctCount === 0) {
            return next(new Error('At least one option must be marked as correct'));
        }
        if (this.type === 'mcq' && correctCount > 1) {
            return next(new Error('MCQ can only have one correct answer. Use multiSelect for multiple correct answers'));
        }
    }
    if (this.type === 'trueFalse' && this.options.length !== 2) {
        this.options = [
            { text: 'True', isCorrect: this.correctAnswer === 'true' },
            { text: 'False', isCorrect: this.correctAnswer === 'false' }
        ];
    }
    next();
});

questionSchema.index({ quiz: 1, order: 1 });

const Question = mongoose.model('Question', questionSchema);

export default Question;

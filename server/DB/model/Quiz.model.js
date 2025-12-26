import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Quiz title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: { type: String, trim: true },
    instructions: { type: String, trim: true },
    board: {
        type: String,
        enum: ['cambridge', 'edexcel', 'oxford', 'all'],
        required: true
    },
    level: {
        type: String,
        enum: ['igcse', 'olevel', 'alevel'],
        required: true
    },
    topic: { type: String, required: true, trim: true },
    chapter: { type: String, trim: true },
    duration: {
        type: Number,
        required: true,
        min: [1, 'Duration must be at least 1 minute']
    },
    totalPoints: { type: Number, default: 0 },
    passingScore: { type: Number, default: 50 },
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    showResults: { type: Boolean, default: true },
    showCorrectAnswers: { type: Boolean, default: false },
    maxAttempts: { type: Number, default: 1 },
    startDate: { type: Date },
    endDate: { type: Date },
    isPublished: { type: Boolean, default: false },
    isDraft: { type: Boolean, default: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

quizSchema.methods.calculateTotalPoints = async function () {
    const Question = mongoose.model('Question');
    const questions = await Question.find({ _id: { $in: this.questions } });
    this.totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    return this.totalPoints;
};

quizSchema.virtual('isActive').get(function () {
    const now = new Date();
    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;
    return this.isPublished;
});

quizSchema.index({ board: 1, level: 1 });
quizSchema.index({ isPublished: 1 });
quizSchema.index({ startDate: 1, endDate: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;

import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attemptNumber: { type: Number, default: 1 },
    answers: [{
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
        selectedOptionIndex: Number,
        selectedOptionIndices: [Number],
        textAnswer: String,
        isCorrect: Boolean,
        pointsAwarded: { type: Number, default: 0 },
        feedback: String
    }],
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['inProgress', 'submitted', 'graded', 'expired'],
        default: 'inProgress'
    },
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
    timeSpent: Number,
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gradedAt: Date,
    overallFeedback: String,
    tabSwitchCount: { type: Number, default: 0 },
    browserInfo: String
}, { timestamps: true });

submissionSchema.methods.autoGrade = async function () {
    const Question = mongoose.model('Question');
    const Quiz = mongoose.model('Quiz');
    const quiz = await Quiz.findById(this.quiz);
    let totalScore = 0;
    let maxScore = 0;
    let allGraded = true;

    for (let answer of this.answers) {
        const question = await Question.findById(answer.question);
        if (!question) continue;
        maxScore += question.points;

        switch (question.type) {
            case 'mcq':
            case 'trueFalse':
                const correctIndex = question.options.findIndex(o => o.isCorrect);
                answer.isCorrect = answer.selectedOptionIndex === correctIndex;
                answer.pointsAwarded = answer.isCorrect ? question.points : 0;
                break;
            case 'multiSelect':
                const correctIndices = question.options.map((o, i) => o.isCorrect ? i : -1).filter(i => i !== -1);
                const selectedIndices = answer.selectedOptionIndices || [];
                answer.isCorrect = correctIndices.length === selectedIndices.length && correctIndices.every(i => selectedIndices.includes(i));
                answer.pointsAwarded = answer.isCorrect ? question.points : 0;
                break;
            case 'shortAnswer':
            case 'fillBlank':
                const correctAnswers = [question.correctAnswer?.toLowerCase().trim(), ...(question.alternativeAnswers || []).map(a => a.toLowerCase().trim())];
                answer.isCorrect = correctAnswers.includes(answer.textAnswer?.toLowerCase().trim());
                answer.pointsAwarded = answer.isCorrect ? question.points : 0;
                break;
            case 'essay':
                allGraded = false;
                break;
        }
        totalScore += answer.pointsAwarded || 0;
    }

    this.totalScore = totalScore;
    this.maxScore = maxScore;
    this.percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    this.passed = this.percentage >= (quiz?.passingScore || 50);
    if (allGraded) {
        this.status = 'graded';
        this.gradedAt = new Date();
    }
    return this;
};

submissionSchema.index({ quiz: 1, student: 1 });
submissionSchema.index({ student: 1, status: 1 });
submissionSchema.index({ quiz: 1, status: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;

import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    userAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number
  }],
  score: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  totalPossibleScore: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number,
    default: 0
  },
  categoryScores: {
    type: Map,
    of: Number
  },
  weakAreas: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Attempt', attemptSchema);
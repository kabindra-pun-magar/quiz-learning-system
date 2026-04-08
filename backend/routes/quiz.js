import express from 'express';
import mongoose from 'mongoose';
import Question from '../models/Question.js';
import Attempt from '../models/Attempt.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/quiz/questions
router.get('/questions', protect, async (req, res) => {
  try {
    console.log('Fetching questions for user:', req.userId);
    
    const questions = await Question.find({ isActive: true })
      .select('-correctAnswer -explanation -__v');
    
    console.log(`Found ${questions.length} questions`);
    
    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('Error in /questions:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   POST /api/quiz/submit
router.post('/submit', protect, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    
    if (!answers || answers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No answers provided' 
      });
    }
    
    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    
    let score = 0;
    let totalPossibleScore = 0;
    const questionResults = [];
    const categoryCorrect = {};
    const categoryTotal = {};
    
    answers.forEach(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      if (!question) return;
      
      const isCorrect = question.correctAnswer === answer.userAnswer;
      
      if (isCorrect) {
        score += question.points || 10;
      }
      totalPossibleScore += question.points || 10;
      
      questionResults.push({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isCorrect,
        timeSpent: answer.timeSpent || 0
      });
      
      if (!categoryCorrect[question.category]) categoryCorrect[question.category] = 0;
      if (!categoryTotal[question.category]) categoryTotal[question.category] = 0;
      if (isCorrect) categoryCorrect[question.category] += (question.points || 10);
      categoryTotal[question.category] += (question.points || 10);
    });
    
    const percentage = totalPossibleScore > 0 ? (score / totalPossibleScore) * 100 : 0;
    
    const categoryScores = new Map();
    const weakAreas = [];
    
    for (const category in categoryTotal) {
      const catScore = (categoryCorrect[category] / categoryTotal[category]) * 100;
      categoryScores.set(category, catScore);
      if (catScore < 50) weakAreas.push(category);
    }
    
    const attempt = await Attempt.create({
      userId: req.userId,
      questions: questionResults,
      score,
      percentage,
      totalQuestions: answers.length,
      totalPossibleScore,
      timeTaken: timeTaken || 0,
      categoryScores,
      weakAreas
    });
    
    res.status(201).json({
      success: true,
      data: {
        attemptId: attempt._id,
        score,
        percentage,
        totalQuestions: answers.length,
        weakAreas
      }
    });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/quiz/attempts
router.get('/attempts', protect, async (req, res) => {
  try {
    const attempts = await Attempt.find({ userId: req.userId })
      .sort('-createdAt')
      .limit(10);
    
    res.json({
      success: true,
      data: attempts
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/quiz/attempt/:id
router.get('/attempt/:id', protect, async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('questions.questionId', 'question options correctAnswer explanation category');
    
    if (!attempt) {
      return res.status(404).json({ 
        success: false, 
        message: 'Attempt not found' 
      });
    }
    
    const detailedResults = attempt.questions.map(q => ({
      question: q.questionId?.question,
      options: q.questionId?.options,
      userAnswer: q.userAnswer,
      correctAnswer: q.questionId?.correctAnswer,
      isCorrect: q.isCorrect,
      explanation: q.questionId?.explanation,
      category: q.questionId?.category
    }));
    
    res.json({
      success: true,
      data: {
        ...attempt.toObject(),
        detailedResults
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;
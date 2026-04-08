import express from 'express';
import Attempt from '../models/Attempt.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Leaderboard endpoint
router.get('/leaderboard', protect, async (req, res) => {
  try {
    console.log('=== LEADERBOARD API CALLED ===');
    console.log('User ID:', req.userId);
    
    // Get all attempts grouped by user
    const leaderboardData = await Attempt.aggregate([
      {
        $group: {
          _id: '$userId',
          bestScore: { $max: '$percentage' },
          averageScore: { $avg: '$percentage' },
          totalAttempts: { $sum: 1 }
        }
      },
      { $sort: { bestScore: -1 } }
    ]);
    
    console.log('Leaderboard data count:', leaderboardData.length);
    
    if (leaderboardData.length === 0) {
      return res.json({
        success: true,
        data: {
          leaderboard: [],
          userRank: null
        }
      });
    }
    
    // Get user details
    const userIds = leaderboardData.map(item => item._id);
    const users = await User.find({ _id: { $in: userIds } }).select('name email');
    
    // Build leaderboard
    const leaderboard = leaderboardData.map((item, index) => {
      const user = users.find(u => u._id.toString() === item._id.toString());
      return {
        rank: index + 1,
        userId: item._id,
        name: user ? user.name : 'Unknown',
        email: user ? user.email : '',
        bestScore: Math.round(item.bestScore),
        averageScore: Math.round(item.averageScore),
        totalAttempts: item.totalAttempts
      };
    });
    
    // Find current user's rank
    const userRank = leaderboard.find(item => item.userId.toString() === req.userId)?.rank || null;
    
    console.log('Sending leaderboard response with', leaderboard.length, 'entries');
    
    res.json({
      success: true,
      data: {
        leaderboard: leaderboard,
        userRank: userRank
      }
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Insights endpoint
router.get('/insights', protect, async (req, res) => {
  try {
    console.log('=== INSIGHTS API CALLED ===');
    console.log('User ID:', req.userId);
    
    // Get user's attempts
    const attempts = await Attempt.find({ userId: req.userId }).sort('createdAt');
    
    console.log('User attempts count:', attempts.length);
    
    // Default response for no attempts
    if (attempts.length === 0) {
      return res.json({
        success: true,
        data: {
          insights: ['✨ Take your first quiz to get personalized insights!'],
          studyTips: [
            '📚 Start with easy questions',
            '🎯 Practice daily for 15 minutes',
            '💡 Review explanations carefully'
          ],
          predictedScore: 0
        }
      });
    }
    
    // Calculate metrics
    const scores = attempts.map(a => a.percentage);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const lastScore = scores[scores.length - 1];
    
    // Generate insights
    const insights = [];
    
    // Performance insight
    if (lastScore > averageScore + 10) {
      insights.push(`🎉 Amazing! Your last score (${Math.round(lastScore)}%) is ${Math.round(lastScore - averageScore)}% above your average!`);
    } else if (lastScore < averageScore - 10) {
      insights.push(`📈 Your last score (${Math.round(lastScore)}%) is lower than your average (${Math.round(averageScore)}%). Keep practicing!`);
    } else {
      insights.push(`📊 You're consistent! Your average score is ${Math.round(averageScore)}%`);
    }
    
    // Best score insight
    if (bestScore >= 90) {
      insights.push(`🏆 Excellent! Your best score is ${Math.round(bestScore)}% - Master level!`);
    } else if (bestScore >= 75) {
      insights.push(`🎯 Great job! Your best score is ${Math.round(bestScore)}% - Keep going for Master!`);
    } else if (bestScore >= 60) {
      insights.push(`💪 Good progress! Your best score is ${Math.round(bestScore)}%`);
    } else {
      insights.push(`🚀 You're on the right track! Keep practicing to improve your scores.`);
    }
    
    // Consistency insight
    if (attempts.length >= 3) {
      insights.push(`💪 Great consistency! You've completed ${attempts.length} quizzes.`);
    }
    
    // Study tips based on performance
    const studyTips = [];
    if (averageScore < 50) {
      studyTips.push("📖 Start with easier questions to build confidence");
      studyTips.push("🎯 Focus on one topic at a time");
      studyTips.push("⏰ Take shorter quizzes more frequently");
    } else if (averageScore < 70) {
      studyTips.push("📝 Review your wrong answers before next quiz");
      studyTips.push("🎯 Focus on your weak areas first");
      studyTips.push("💪 Take 2-3 quizzes per week for better retention");
    } else {
      studyTips.push("🚀 Challenge yourself with harder difficulty levels");
      studyTips.push("🏆 Try to beat your best score by 5% each week");
      studyTips.push("📚 Help others by sharing what you've learned");
    }
    
    // Calculate predicted next score
    let predictedScore = lastScore;
    if (attempts.length >= 3) {
      const lastThree = attempts.slice(-3).map(a => a.percentage);
      const trend = (lastThree[2] - lastThree[0]) / 2;
      predictedScore = Math.min(100, Math.max(0, lastScore + trend));
    }
    
    console.log('Sending insights response');
    
    res.json({
      success: true,
      data: {
        insights: insights.slice(0, 4),
        studyTips: studyTips.slice(0, 3),
        predictedScore: Math.round(predictedScore)
      }
    });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Dashboard endpoint
router.get('/dashboard', protect, async (req, res) => {
  try {
    console.log('=== DASHBOARD API CALLED ===');
    
    const attempts = await Attempt.find({ userId: req.userId }).sort('createdAt');
    
    if (attempts.length === 0) {
      return res.json({
        success: true,
        data: {
          totalAttempts: 0,
          averageScore: 0,
          bestScore: 0,
          improvement: 0,
          weakAreas: [],
          scoreHistory: [],
          recommendedTopics: ['DBMS', 'OS', 'Networks', 'DSA', 'Web Dev'],
          accuracyRate: 0
        }
      });
    }
    
    const totalAttempts = attempts.length;
    const averageScore = attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts;
    const bestScore = Math.max(...attempts.map(a => a.percentage));
    
    let improvement = 0;
    if (attempts.length >= 2) {
      const firstAvg = attempts[0].percentage;
      const lastAvg = attempts[attempts.length - 1].percentage;
      improvement = lastAvg - firstAvg;
    }
    
    const scoreHistory = attempts.map(a => ({
      date: a.createdAt.toISOString().split('T')[0],
      score: Math.round(a.percentage)
    }));
    
    // Calculate weak areas
    const weakAreaCount = {};
    attempts.forEach(attempt => {
      if (attempt.weakAreas && attempt.weakAreas.length > 0) {
        attempt.weakAreas.forEach(area => {
          weakAreaCount[area] = (weakAreaCount[area] || 0) + 1;
        });
      }
    });
    
    const weakAreas = Object.entries(weakAreaCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([area]) => area);
    
    // Calculate accuracy
    let totalQuestions = 0;
    let correctAnswers = 0;
    attempts.forEach(attempt => {
      totalQuestions += attempt.questions.length;
      correctAnswers += attempt.questions.filter(q => q.isCorrect).length;
    });
    const accuracyRate = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        totalAttempts,
        averageScore: Math.round(averageScore),
        bestScore: Math.round(bestScore),
        improvement: Math.round(improvement),
        weakAreas,
        scoreHistory,
        recommendedTopics: weakAreas.length ? weakAreas : ['DBMS', 'OS', 'Networks', 'DSA', 'Web Dev'],
        accuracyRate
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;
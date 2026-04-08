import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiHome, FiRotateCcw, FiAward, FiTrendingUp } from 'react-icons/fi';

const Result = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAttempt();
  }, [id]);
  
  const fetchAttempt = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5001/api/quiz/attempt/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttempt(res.data.data);
    } catch (error) {
      toast.error('Failed to load results');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };
  
  const getScoreColor = useCallback((percentage) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <div className="text-white text-xl">Loading results...</div>
        </div>
      </div>
    );
  }
  
  if (!attempt) return null;
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Score Summary */}
      <GlassCard className="text-center mb-8">
        <div className="text-6xl mb-4">📊</div>
        <h1 className="text-3xl font-bold text-white mb-4">Quiz Completed!</h1>
        <div className={`text-6xl font-bold mb-2 ${getScoreColor(attempt.percentage)}`}>
          {Math.round(attempt.percentage)}%
        </div>
        <div className="text-white/70 mb-6">
          Score: {attempt.score} / {attempt.totalPossibleScore}
        </div>
        
        <div className="flex justify-center gap-4">
          <button onClick={() => navigate('/quiz')} className="btn-primary flex items-center gap-2">
            <FiRotateCcw /> Take Another Quiz
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary flex items-center gap-2">
            <FiHome /> Dashboard
          </button>
        </div>
      </GlassCard>
      
      {/* Weak Areas */}
      {attempt.weakAreas?.length > 0 && (
        <GlassCard className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiTrendingUp /> Areas to Improve
          </h3>
          <div className="flex flex-wrap gap-2">
            {attempt.weakAreas.map((area, i) => (
              <span key={i} className="bg-yellow-500/20 px-4 py-2 rounded-full text-yellow-300">
                📚 {area}
              </span>
            ))}
          </div>
        </GlassCard>
      )}
      
      {/* Recommendations */}
      {attempt.recommendations?.length > 0 && (
        <GlassCard className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiAward /> Personalized Recommendations
          </h3>
          <ul className="space-y-2">
            {attempt.recommendations.map((rec, i) => (
              <li key={i} className="text-white/80 flex items-start gap-2">
                <span className="text-purple-400">💡</span>
                {rec}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}
      
      {/* Detailed Answers */}
      <h2 className="text-2xl font-bold text-white mb-4">Detailed Review</h2>
      <div className="space-y-4">
        {attempt.detailedResults?.map((result, idx) => (
          <GlassCard key={idx} className="overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {result.isCorrect ? (
                  <FiCheckCircle className="text-green-400 text-2xl" />
                ) : (
                  <FiXCircle className="text-red-400 text-2xl" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex gap-2 mb-2">
                  <span className="glass px-2 py-1 text-xs text-white/80">Q{idx + 1}</span>
                  <span className="glass px-2 py-1 text-xs text-white/80">{result.category}</span>
                </div>
                <p className="text-white font-medium mb-3">{result.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <div className="text-white/60 mb-1">Your Answer:</div>
                    <div className={`font-semibold ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {result.userAnswer}
                    </div>
                  </div>
                  {!result.isCorrect && (
                    <div className="bg-green-500/10 p-3 rounded-xl">
                      <div className="text-white/60 mb-1">Correct Answer:</div>
                      <div className="text-green-400 font-semibold">{result.correctAnswer}</div>
                    </div>
                  )}
                </div>
                <div className="mt-3 p-3 bg-purple-500/10 rounded-xl">
                  <div className="text-white/60 mb-1">📖 Explanation:</div>
                  <div className="text-white/90">{result.explanation}</div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default Result;
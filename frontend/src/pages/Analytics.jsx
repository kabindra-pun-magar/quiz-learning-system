import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import toast from 'react-hot-toast';
import { FiLightbulb, FiTarget, FiTrendingUp } from 'react-icons/fi';

const API_URL = 'http://localhost:5001/api';

const Analytics = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view analytics');
        setLoading(false);
        return;
      }

      console.log('Fetching insights...');
      const response = await axios.get(`${API_URL}/analytics/insights`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Insights response:', response.data);
      
      if (response.data.success) {
        setInsights(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load insights');
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError('Failed to load analytics. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 text-center">
          <div className="animate-spin text-4xl mb-4">📊</div>
          <div className="text-white text-xl">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button onClick={fetchInsights} className="btn-primary">
            Try Again
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🧠</div>
        <h1 className="text-4xl font-bold text-white mb-2">Learning Analytics</h1>
        <p className="text-white/70">AI-powered insights for your learning journey</p>
      </div>

      {/* Predicted Score */}
      {insights && insights.predictedScore > 0 && (
        <GlassCard className="mb-8 text-center bg-gradient-to-r from-purple-600/30 to-pink-600/30">
          <div className="flex items-center justify-center gap-4">
            <FiTrendingUp className="text-white text-3xl" />
            <div>
              <div className="text-white/70 text-sm">Predicted Next Score</div>
              <div className="text-5xl font-bold text-white">{insights.predictedScore}%</div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* No Data State */}
      {(!insights || insights.predictedScore === 0) && (
        <GlassCard className="text-center py-12">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Data Yet</h3>
          <p className="text-white/70 mb-6">
            Take your first quiz to get personalized insights and track your progress!
          </p>
          <button onClick={() => window.location.href = '/quiz'} className="btn-primary">
            Take First Quiz
          </button>
        </GlassCard>
      )}

      {/* Insights */}
      {insights && insights.insights && insights.insights.length > 0 && insights.predictedScore > 0 && (
        <GlassCard className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiLightbulb /> Personalized Insights
          </h3>
          <div className="space-y-3">
            {insights.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <span className="text-2xl">
                  {insight.includes('🎉') ? '🎉' : 
                   insight.includes('⚠️') ? '⚠️' : 
                   insight.includes('🏆') ? '🏆' : 
                   insight.includes('💪') ? '💪' : '📈'}
                </span>
                <p className="text-white/90 flex-1">{insight}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Study Tips */}
      {insights && insights.studyTips && insights.studyTips.length > 0 && insights.predictedScore > 0 && (
        <GlassCard>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiTarget /> Study Tips
          </h3>
          <div className="space-y-3">
            {insights.studyTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <span className="text-2xl">
                  {i === 0 ? '📖' : i === 1 ? '🎯' : '💡'}
                </span>
                <p className="text-white/80">{tip}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default Analytics;
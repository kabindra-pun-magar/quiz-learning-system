import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '../components/GlassCard';
import toast from 'react-hot-toast';
import { FiTrendingUp, FiAward, FiBarChart2, FiTarget, FiZap } from 'react-icons/fi';

// API URL - Change this to match your backend port
const API_URL = 'http://localhost:5001/api';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    accuracyRate: 0,
    weakAreas: [],
    scoreHistory: [],
    recommendedTopics: ['DBMS', 'OS', 'Networks', 'DSA']
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success && response.data.data) {
        setAnalytics({
          totalAttempts: response.data.data.totalAttempts || 0,
          averageScore: response.data.data.averageScore || 0,
          bestScore: response.data.data.bestScore || 0,
          accuracyRate: response.data.data.accuracyRate || 0,
          weakAreas: response.data.data.weakAreas || [],
          scoreHistory: response.data.data.scoreHistory || [],
          recommendedTopics: response.data.data.recommendedTopics || ['DBMS', 'OS', 'Networks', 'DSA']
        });
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to backend server. Make sure backend is running on port 5000');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const statsCards = useMemo(() => {
    return [
      { icon: FiBarChart2, label: 'Total Quizzes', value: analytics.totalAttempts, color: 'from-blue-500 to-cyan-500' },
      { icon: FiTrendingUp, label: 'Avg Score', value: `${analytics.averageScore}%`, color: 'from-green-500 to-emerald-500' },
      { icon: FiAward, label: 'Best Score', value: `${analytics.bestScore}%`, color: 'from-purple-500 to-pink-500' },
      { icon: FiTarget, label: 'Accuracy', value: `${analytics.accuracyRate}%`, color: 'from-orange-500 to-red-500' },
    ];
  }, [analytics]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <div className="text-white text-xl">Loading dashboard...</div>
          <div className="text-white/50 text-sm mt-2">Connecting to backend at {API_URL}</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <div className="space-y-3">
            <button onClick={fetchDashboardData} className="btn-primary w-full">
              Retry Connection
            </button>
            <div className="text-left text-white/60 text-sm p-3 bg-white/5 rounded-lg">
              <p className="font-semibold mb-2">Troubleshooting Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Make sure backend is running: cd backend && npm run dev</li>
                <li>Check backend URL: {API_URL}</li>
                <li>Verify MongoDB is running</li>
                <li>Check if you're logged in</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Learning Dashboard</h1>
        <p className="text-white/70">Track your progress and improve your skills</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={i} className="text-center">
              <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${stat.color} mb-4`}>
                <Icon className="text-white text-2xl" />
              </div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-white/70 mt-1">{stat.label}</div>
            </GlassCard>
          );
        })}
      </div>
      
      {/* Score Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <GlassCard>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiTrendingUp /> Score Progress
          </h3>
          {analytics.scoreHistory && analytics.scoreHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.scoreHistory}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="score" stroke="#667eea" fill="url(#scoreGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-white/60">
              <div className="text-5xl mb-3">📊</div>
              <p>No quiz attempts yet</p>
              <p className="text-sm mt-2">Take your first quiz to see your progress!</p>
              <button 
                onClick={() => window.location.href = '/quiz'} 
                className="btn-primary mt-4 text-sm"
              >
                Take a Quiz
              </button>
            </div>
          )}
        </GlassCard>
        
        <GlassCard>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiZap /> Areas Needing Improvement
          </h3>
          {analytics.weakAreas && analytics.weakAreas.length > 0 ? (
            <div className="space-y-3">
              {analytics.weakAreas.map((area, i) => (
                <div key={i} className="bg-red-500/20 p-4 rounded-xl border border-red-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">{area}</span>
                    <span className="text-red-300 text-sm">Needs Focus</span>
                  </div>
                  <div className="mt-2 w-full bg-red-500/20 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-white">No weak areas detected!</p>
              <p className="text-white/60 text-sm mt-2">Take a quiz to identify areas for improvement</p>
            </div>
          )}
          
          <h3 className="text-xl font-bold text-white mt-6 mb-4 flex items-center gap-2">
            <FiTarget /> Recommended Topics
          </h3>
          <div className="flex flex-wrap gap-3">
            {analytics.recommendedTopics && analytics.recommendedTopics.map((topic, i) => (
              <div key={i} className="glass px-5 py-3 rounded-xl hover:scale-105 transition-transform cursor-pointer">
                <div className="text-white font-semibold">📚 {topic}</div>
                <div className="text-white/60 text-sm">Recommended for you</div>
              </div>
            ))}
          </div>
          
          {analytics.totalAttempts === 0 && (
            <div className="mt-6 p-4 bg-purple-500/20 rounded-xl">
              <p className="text-white text-center text-sm">
                💡 Tip: Take your first quiz to get personalized recommendations!
              </p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
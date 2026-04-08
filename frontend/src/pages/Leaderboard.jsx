import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import toast from 'react-hot-toast';
import { FiTrophy, FiMedal, FiAward, FiStar } from 'react-icons/fi';

const API_URL = 'http://localhost:5001/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view leaderboard');
        setLoading(false);
        return;
      }

      console.log('Fetching leaderboard...');
      const response = await axios.get(`${API_URL}/analytics/leaderboard`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Leaderboard response:', response.data);
      
      if (response.data.success) {
        setLeaderboard(response.data.data.leaderboard || []);
        setUserRank(response.data.data.userRank);
      } else {
        setError(response.data.message || 'Failed to load leaderboard');
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError('Failed to load leaderboard. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getBadge = (score) => {
    if (score >= 90) return { icon: <FiMedal className="text-yellow-400 text-2xl" />, label: 'Master' };
    if (score >= 75) return { icon: <FiAward className="text-blue-400 text-2xl" />, label: 'Expert' };
    if (score >= 60) return { icon: <FiStar className="text-green-400 text-2xl" />, label: 'Learner' };
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 text-center">
          <div className="animate-spin text-4xl mb-4">🏆</div>
          <div className="text-white text-xl">Loading leaderboard...</div>
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
          <button onClick={fetchLeaderboard} className="btn-primary">
            Try Again
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-4xl font-bold text-white mb-2">Global Leaderboard</h1>
        <p className="text-white/70">Top performers worldwide</p>
      </div>

      {/* User's Rank Card */}
      {userRank && (
        <GlassCard className="mb-8 text-center bg-gradient-to-r from-purple-600/30 to-pink-600/30">
          <div className="text-white/70 text-sm">Your Global Rank</div>
          <div className="text-5xl font-bold text-white mt-2">#{userRank}</div>
          <div className="text-white/60 text-sm mt-2">
            {leaderboard.find(u => u.userId === JSON.parse(localStorage.getItem('user') || '{}')._id)?.totalAttempts || 0} quizzes completed
          </div>
        </GlassCard>
      )}

      {/* Leaderboard Table */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-6">
          <FiTrophy className="text-yellow-400 text-2xl" />
          <h2 className="text-2xl font-bold text-white">Rankings</h2>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-white/70">No rankings yet.</p>
            <p className="text-white/50 text-sm mt-2">Take a quiz to appear on the leaderboard!</p>
            <button 
              onClick={() => window.location.href = '/quiz'} 
              className="btn-primary mt-4"
            >
              Take First Quiz
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/20">
                <tr className="text-left text-white/70">
                  <th className="pb-4 w-16">Rank</th>
                  <th className="pb-4">User</th>
                  <th className="pb-4 text-center">Best Score</th>
                  <th className="pb-4 text-center">Avg Score</th>
                  <th className="pb-4 text-center">Quizzes</th>
                  <th className="pb-4 text-center">Badge</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user) => {
                  const badge = getBadge(user.bestScore);
                  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')._id;
                  const isCurrentUser = user.userId === currentUserId;
                  
                  return (
                    <tr 
                      key={user.userId} 
                      className={`border-b border-white/10 hover:bg-white/5 transition-all ${
                        isCurrentUser ? 'bg-purple-500/20' : ''
                      }`}
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {user.rank === 1 && <span className="text-2xl">👑</span>}
                          {user.rank === 2 && <span className="text-2xl">🥈</span>}
                          {user.rank === 3 && <span className="text-2xl">🥉</span>}
                          {user.rank > 3 && <span className="text-white font-bold">#{user.rank}</span>}
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-white/40 text-sm">{user.email}</div>
                        </div>
                       </td>
                      <td className="py-4 text-center">
                        <div className="text-2xl font-bold text-white">{user.bestScore}%</div>
                      </td>
                      <td className="py-4 text-center">
                        <div className="text-white">{user.averageScore}%</div>
                      </td>
                      <td className="py-4 text-center">
                        <div className="text-white">{user.totalAttempts}</div>
                      </td>
                      <td className="py-4 text-center">
                        {badge && (
                          <div className="flex justify-center" title={badge.label}>
                            {badge.icon}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Leaderboard;
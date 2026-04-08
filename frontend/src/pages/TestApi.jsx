import React, { useState } from 'react';
import axios from 'axios';
import GlassCard from '../components/GlassCard';

const API_URL = 'http://localhost:5001/api';

const TestApi = () => {
  const [leaderboard, setLeaderboard] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLeaderboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/analytics/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaderboard(res.data);
      console.log('Leaderboard:', res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testInsights = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/analytics/insights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInsights(res.data);
      console.log('Insights:', res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-6">API Test Page</h1>
      
      <div className="flex gap-4 mb-8">
        <button onClick={testLeaderboard} className="btn-primary">Test Leaderboard API</button>
        <button onClick={testInsights} className="btn-primary">Test Insights API</button>
      </div>
      
      {leaderboard && (
        <GlassCard className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Leaderboard Response:</h2>
          <pre className="text-white/80 text-sm overflow-auto">
            {JSON.stringify(leaderboard, null, 2)}
          </pre>
        </GlassCard>
      )}
      
      {insights && (
        <GlassCard>
          <h2 className="text-xl font-bold text-white mb-4">Insights Response:</h2>
          <pre className="text-white/80 text-sm overflow-auto">
            {JSON.stringify(insights, null, 2)}
          </pre>
        </GlassCard>
      )}
    </div>
  );
};

export default TestApi;
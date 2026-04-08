import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';

const Admin = () => {
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    category: 'DBMS',
    difficulty: 'Medium'
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [questionsRes, usersRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/questions', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5001/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5001/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setQuestions(questionsRes.data.data);
      setUsers(usersRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/admin/questions', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Question added successfully');
      setShowAddForm(false);
      setFormData({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        category: 'DBMS',
        difficulty: 'Medium'
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add question');
    }
  };
  
  const handleUpdateQuestion = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/admin/questions/${editingQuestion._id}`, editingQuestion, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Question updated successfully');
      setEditingQuestion(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to update question');
    }
  };
  
  const handleDeleteQuestion = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/admin/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Question deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };
  
  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <div className="text-white text-xl">Loading admin panel...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-white mb-8">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard className="text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</div>
          <div className="text-white/70">Total Users</div>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-3xl font-bold text-white">{stats?.totalQuestions || 0}</div>
          <div className="text-white/70">Total Questions</div>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-3xl font-bold text-white">{stats?.totalAttempts || 0}</div>
          <div className="text-white/70">Total Attempts</div>
        </GlassCard>
      </div>
      
      {/* Add Question Button */}
      <div className="mb-6">
        <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add New Question
        </button>
      </div>
      
      {/* Add Question Form */}
      {showAddForm && (
        <GlassCard className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Add New Question</h2>
            <button onClick={() => setShowAddForm(false)} className="text-white/60 hover:text-white">
              <FiX className="text-2xl" />
            </button>
          </div>
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <textarea
              placeholder="Question"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="input-glass"
              rows="3"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.options.map((opt, idx) => (
                <input
                  key={idx}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="input-glass"
                  required
                />
              ))}
            </div>
            <select
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              className="input-glass"
              required
            >
              <option value="">Select Correct Answer</option>
              {formData.options.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
              ))}
            </select>
            <textarea
              placeholder="Explanation"
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="input-glass"
              rows="2"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-glass"
              >
                <option>DBMS</option>
                <option>OS</option>
                <option>Networks</option>
                <option>DSA</option>
                <option>Web Dev</option>
                <option>Python</option>
                <option>Java</option>
              </select>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="input-glass"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">Save Question</button>
          </form>
        </GlassCard>
      )}
      
      {/* Questions List */}
      <GlassCard>
        <h2 className="text-xl font-bold text-white mb-4">Manage Questions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead className="border-b border-white/20">
              <tr className="text-left">
                <th className="pb-3">Question</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Difficulty</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q._id} className="border-b border-white/10">
                  <td className="py-3">{q.question.substring(0, 50)}...</td>
                  <td className="py-3">{q.category}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      q.difficulty === 'Easy' ? 'bg-green-500/20' :
                      q.difficulty === 'Medium' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditingQuestion(q)} className="text-blue-400 hover:text-blue-300">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDeleteQuestion(q._id)} className="text-red-400 hover:text-red-300">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
      
      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <GlassCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Edit Question</h2>
              <button onClick={() => setEditingQuestion(null)} className="text-white/60 hover:text-white">
                <FiX className="text-2xl" />
              </button>
            </div>
            <div className="space-y-4">
              <textarea
                value={editingQuestion.question}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                className="input-glass"
                rows="3"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {editingQuestion.options?.map((opt, idx) => (
                  <input
                    key={idx}
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...editingQuestion.options];
                      newOptions[idx] = e.target.value;
                      setEditingQuestion({ ...editingQuestion, options: newOptions });
                    }}
                    className="input-glass"
                  />
                ))}
              </div>
              <select
                value={editingQuestion.correctAnswer}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                className="input-glass"
              >
                {editingQuestion.options?.map((opt, idx) => (
                  <option key={idx} value={opt}>{opt}</option>
                ))}
              </select>
              <textarea
                value={editingQuestion.explanation}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                className="input-glass"
                rows="2"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={editingQuestion.category}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                  className="input-glass"
                >
                  <option>DBMS</option>
                  <option>OS</option>
                  <option>Networks</option>
                  <option>DSA</option>
                  <option>Web Dev</option>
                </select>
                <select
                  value={editingQuestion.difficulty}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })}
                  className="input-glass"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <button onClick={handleUpdateQuestion} className="btn-primary w-full flex items-center justify-center gap-2">
                <FiSave /> Save Changes
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Admin;
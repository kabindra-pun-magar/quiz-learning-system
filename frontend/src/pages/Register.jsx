import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';

const API_URL = 'http://localhost:5001/api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const handleChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post(`${API_URL}/auth/register`, formData);
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data));
      toast.success('Account created successfully! 🎉');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }, [formData, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`glass w-full max-w-md p-8 transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-3xl font-bold text-white">Get Started</h2>
          <p className="text-white/70 mt-2">Join thousands of learners</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FiUser className="text-white/60" />
              <label className="text-white/80">Full Name</label>
            </div>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="input-glass w-full"
              required
            />
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FiMail className="text-white/60" />
              <label className="text-white/80">Email</label>
            </div>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              className="input-glass w-full"
              required
            />
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FiLock className="text-white/60" />
              <label className="text-white/80">Password</label>
            </div>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="input-glass w-full"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FiUserPlus />
                Create Account
              </>
            )}
          </button>
        </form>
        
        <p className="text-white/80 text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import GlassCard from '../components/GlassCard';
import QuizTimer from '../components/QuizTimer';
import { FiChevronLeft, FiChevronRight, FiSend, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchQuestions();
  }, []);
  
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      console.log('Fetching questions from API...');
      const res = await axios.get('http://localhost:5001/api/quiz/questions', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response:', res.data);
      
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        setQuestions(res.data.data);
        toast.success(`Loaded ${res.data.data.length} questions!`);
      } else {
        setError('No questions available. Please add questions to the database.');
        toast.error('No questions found');
      }
    } catch (error) {
      console.error('Error details:', error);
      console.error('Response:', error.response);
      
      let errorMessage = 'Failed to load questions. ';
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        navigate('/login');
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please check if backend is running.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Make sure backend is running on port 5000.';
      } else {
        errorMessage += error.response?.data?.message || 'Please try again.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAnswer = useCallback((questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);
  
  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, questions.length]);
  
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);
  
  const handleSubmit = useCallback(async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast.error(`Please answer all ${questions.length} questions`);
      return;
    }
    
    setSubmitting(true);
    
    const formattedAnswers = Object.entries(answers).map(([questionId, userAnswer]) => ({
      questionId,
      userAnswer,
      timeSpent: 0
    }));
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5001/api/quiz/submit', {
        answers: formattedAnswers,
        timeTaken: 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Quiz submitted successfully!');
      navigate(`/result/${res.data.data.attemptId}`);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  }, [answers, questions.length, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <div className="text-white text-xl">Loading your quiz...</div>
          <div className="text-white/50 text-sm mt-2">Fetching questions from database</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Cannot Load Quiz</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <div className="space-y-3">
            <button onClick={fetchQuestions} className="btn-primary w-full flex items-center justify-center gap-2">
              <FiRefreshCw /> Try Again
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary w-full">
              Go to Dashboard
            </button>
          </div>
          <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
            <p className="text-yellow-300 text-sm">💡 Need help?</p>
            <p className="text-white/60 text-xs mt-1">
              Make sure MongoDB is running and has questions.<br/>
              Run: <code className="bg-black/30 px-1 rounded">mongosh</code> then <code className="bg-black/30 px-1 rounded">use quizdb; db.questions.count()</code>
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }
  
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="text-center max-w-md">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Questions Available</h2>
          <p className="text-white/70 mb-6">
            The quiz database is empty. Please add questions to get started.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary w-full">
            Go to Dashboard
          </button>
        </GlassCard>
      </div>
    );
  }
  
  const currentQuestion = questions[currentIndex];
  const isAnswered = answers[currentQuestion?._id];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div className="glass px-6 py-3">
          <span className="text-white font-semibold">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <QuizTimer duration={1800} onTimeout={handleSubmit} />
      </div>
      
      <div className="progress-bar mb-8">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      
      <GlassCard className="mb-6">
        <div className="mb-4 flex gap-2 flex-wrap">
          <span className="glass px-3 py-1 text-sm text-white">
            {currentQuestion.category}
          </span>
          <span className={`glass px-3 py-1 text-sm text-white ${
            currentQuestion.difficulty === 'Easy' ? 'bg-green-500/20' :
            currentQuestion.difficulty === 'Medium' ? 'bg-yellow-500/20' : 'bg-red-500/20'
          }`}>
            {currentQuestion.difficulty}
          </span>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-6">
          {currentQuestion.question}
        </h2>
        
        <div className="space-y-3">
          {currentQuestion.options?.map((option, idx) => (
            <div
              key={idx}
              onClick={() => handleAnswer(currentQuestion._id, option)}
              className={`option-card ${answers[currentQuestion._id] === option ? 'selected' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  answers[currentQuestion._id] === option 
                    ? 'border-purple-500 bg-purple-500/20' 
                    : 'border-white/30'
                }`}>
                  {answers[currentQuestion._id] === option && (
                    <FiCheckCircle className="text-purple-400 text-sm" />
                  )}
                </div>
                <span className="text-white text-lg">{String.fromCharCode(65 + idx)}. {option}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
      
      <div className="flex justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`btn-secondary flex items-center gap-2 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FiChevronLeft /> Previous
        </button>
        
        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length !== questions.length}
            className="btn-primary flex items-center gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FiSend /> Submit Quiz
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className={`btn-primary flex items-center gap-2 ${!isAnswered ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next <FiChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
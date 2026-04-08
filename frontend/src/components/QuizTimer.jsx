import React, { useState, useEffect, memo } from 'react';
import { FiClock } from 'react-icons/fi';

const QuizTimer = memo(({ duration, onTimeout }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout?.();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, onTimeout]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getTimerColor = () => {
    if (timeLeft < 60) return 'text-red-400';
    if (timeLeft < 180) return 'text-yellow-400';
    return 'text-green-400';
  };
  
  return (
    <div className={`timer flex items-center gap-2 ${getTimerColor()}`}>
      <FiClock className="text-xl" />
      <span className="font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
    </div>
  );
});

QuizTimer.displayName = 'QuizTimer';

export default QuizTimer;
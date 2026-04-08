import React, { memo } from 'react';

const GlassCard = memo(({ children, className = '', onClick, hover = true }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card p-6 ${hover ? 'hover:translate-y-[-8px]' : ''} ${className}`}
    >
      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard;
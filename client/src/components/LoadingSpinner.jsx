import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  };

  const colors = {
    primary: 'border-primary-500 border-t-transparent dark:border-primary-400 dark:border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`animate-spin rounded-full ${sizes[size]} ${colors[color]}`}></div>
    </div>
  );
};

export default LoadingSpinner;

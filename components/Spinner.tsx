
import React from 'react';

const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-16 w-16',
  };
  return (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent`}
    ></div>
  );
};

export default Spinner;

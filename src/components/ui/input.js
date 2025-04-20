import React from 'react';

const Input = ({ 
  className = '', 
  type = 'text', 
  error = false,
  ...props 
}) => {
  return (
    <input
      type={type}
      className={`
        w-full px-3 py-2 border rounded-md
        ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'}
        focus:outline-none focus:ring-2 focus:ring-opacity-50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  );
};

export { Input };

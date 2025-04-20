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
        w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400
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

import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-md overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-xl font-bold text-gray-800 dark:text-gray-100 ${className}`} {...props}>
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`mt-1 text-sm text-gray-600 dark:text-gray-400 ${className}`} {...props}>
      {children}
    </p>
  );
};

const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 ${className}`} {...props}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };

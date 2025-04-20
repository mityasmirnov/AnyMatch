import React from 'react';

const Select = React.forwardRef(({ className = '', error = false, children, ...props }, ref) => (
  <select
    ref={ref}
    className={
      `w-full px-3 py-2 border rounded-md bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100
      ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'}
      focus:outline-none hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed ${className}`
    }
    {...props}
  >
    {children}
  </select>
));

Select.displayName = 'Select';

export { Select };

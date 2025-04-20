import React from 'react';

const Toast = ({ 
  title, 
  description, 
  variant = 'default', 
  onClose,
  duration = 5000,
  className = '',
  ...props 
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  if (!isVisible) return null;
  
  const variants = {
    default: 'bg-white border-gray-200',
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };
  
  const variantStyles = variants[variant] || variants.default;
  
  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-md
        border rounded-md shadow-md
        ${variantStyles}
        ${className}
      `}
      {...props}
    >
      <div className="flex items-start p-4">
        <div className="flex-1">
          {title && <h3 className="font-medium">{title}</h3>}
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="ml-4 text-gray-400 hover:text-gray-500"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

const useToast = () => {
  const [toasts, setToasts] = React.useState([]);
  
  const toast = ({ title, description, variant, duration }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant, duration }]);
    return id;
  };
  
  const dismiss = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };
  
  return {
    toast,
    dismiss,
    toasts,
  };
};

export { Toast, useToast };

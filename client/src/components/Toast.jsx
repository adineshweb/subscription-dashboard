import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-white dark:bg-gray-800 border-green-500/30 text-gray-800 dark:text-gray-200 shadow-green-500/5',
    error: 'bg-white dark:bg-gray-800 border-red-500/30 text-gray-800 dark:text-gray-200 shadow-red-500/5',
    info: 'bg-white dark:bg-gray-800 border-blue-500/30 text-gray-800 dark:text-gray-200 shadow-blue-500/5',
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 shadow-2xl max-w-md bg-white dark:bg-gray-800 border ${bgStyles[type]} transition-all duration-300 transform translate-y-0`}>
      {icons[type]}
      <div className="text-sm font-medium mr-2">{message}</div>
      <button 
        onClick={onClose} 
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-0.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;

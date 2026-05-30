import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full mb-6">
        <HelpCircle className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-850 dark:text-white mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">Page Not Found</h2>
      <p className="text-sm text-gray-555 text-gray-500 dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
        The page you are looking for does not exist or has been moved. Check the URL or return to dashboard.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-primary-500/10 active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
};

export default NotFound;

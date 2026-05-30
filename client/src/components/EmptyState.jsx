import React from 'react';
import { HelpCircle } from 'lucide-react';

const EmptyState = ({ icon: Icon = HelpCircle, title, description, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm max-w-md mx-auto">
      <div className="p-4 bg-primary-50 dark:bg-primary-950/20 text-primary-500 dark:text-primary-400 rounded-full mb-4">
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg shadow-primary-500/10 active:scale-95 text-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

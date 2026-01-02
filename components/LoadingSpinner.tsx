import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-indigo-600 animate-in fade-in duration-300">
      <Loader2 className="w-12 h-12 animate-spin" />
      <p className="text-lg font-medium text-slate-600">Analyzing image & extracting LaTeX...</p>
    </div>
  );
};
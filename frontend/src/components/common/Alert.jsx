import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null;

  const config = {
    success: {
      bg: 'bg-emerald-50/90 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
    },
    error: {
      bg: 'bg-rose-50/90 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-50/90 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
    },
    info: {
      bg: 'bg-brand-50/90 border-brand-200 text-brand-900',
      icon: <Info className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />,
    },
  }[type] || {
    bg: 'bg-slate-50 border-slate-200 text-slate-800',
    icon: <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />,
  };

  return (
    <div
      className={`flex items-start justify-between p-4 border rounded-2xl shadow-soft-sm text-sm backdrop-blur-sm transition-all animate-in fade-in slide-in-from-top-1 ${config.bg} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {config.icon}
        <span className="font-medium leading-relaxed">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="ml-3 p-1 rounded-lg hover:bg-black/5 transition-colors text-current opacity-60 hover:opacity-100 cursor-pointer"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;

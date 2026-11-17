import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const sizeClasses = {
    xs: 'px-2.5 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5 shadow-md',
  }[size] || 'px-4 py-2.5 text-sm gap-2';

  const variantClasses = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand focus:ring-brand-500 hover:shadow-lg hover:shadow-brand-500/30',
    secondary: 'bg-white hover:bg-slate-50 text-midnight-900 border border-slate-200 shadow-soft-sm focus:ring-slate-300',
    cyan: 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-cyan focus:ring-cyan-500 hover:shadow-lg hover:shadow-cyan-500/30',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20 focus:ring-rose-500',
    outline: 'border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-brand-500',
    ghost: 'hover:bg-slate-100/70 text-slate-600 hover:text-midnight-900 focus:ring-slate-200',
    dark: 'bg-midnight-900 hover:bg-midnight-800 text-white shadow-soft focus:ring-midnight-700',
  }[variant] || '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 text-current shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;

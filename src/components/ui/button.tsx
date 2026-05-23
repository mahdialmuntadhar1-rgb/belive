import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'destructive';
  size?: 'default' | 'sm' | 'icon' | 'icon-sm';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-slate-900 text-white hover:bg-slate-800',
      ghost: 'hover:bg-slate-100 text-slate-700',
      outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 px-3 text-xs',
      icon: 'h-10 w-10',
      'icon-sm': 'h-8 w-8',
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return <button ref={ref} className={combinedClassName} {...props} />;
  }
);

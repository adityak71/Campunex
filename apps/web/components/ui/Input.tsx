'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="space-y-1.5 w-full text-left">
        {label && (
          <label htmlFor={inputId} className="block text-[12px] font-[900] text-white/72">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-black/[0.18] border text-[13px] text-white/90 placeholder:text-muted rounded-[14px] transition duration-150 focus:outline-none focus:ring-2 focus:ring-accent1/50 ${
              leftIcon ? 'pl-10' : 'px-[12px]'
            } ${rightIcon ? 'pr-10' : 'px-[12px]'} py-[12px] ${
              error
                ? 'border-danger/50 focus:ring-danger/50'
                : 'border-white/16'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

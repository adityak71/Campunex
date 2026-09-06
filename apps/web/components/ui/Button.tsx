'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'teal';
  size?: 'sm' | 'md' | 'lg';
  square?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  square = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center leading-none font-[800] tracking-[0.1px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none text-ink whitespace-nowrap border';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-[12px] gap-2',
    md: 'px-[14px] py-[11px] text-[13.5px] gap-[10px]',
    lg: 'px-6 py-3.5 text-[15px] gap-3',
  };

  const radiusStyles = square ? 'rounded-[14px]' : 'rounded-full';

  const variantStyles = {
    primary:
      'border-accent1/45 bg-gradient-to-br from-accent1/[0.95] to-accent2/[0.95] shadow-[0_14px_40px_rgba(76,125,255,0.25)] focus:ring-accent2',
    secondary:
      'border-stroke bg-white/[0.08] hover:bg-white/[0.10] focus:ring-white/20',
    outline:
      'border-stroke bg-transparent hover:bg-white/[0.10] focus:ring-white/20',
    ghost:
      'border-white/20 bg-transparent hover:bg-white/[0.10] focus:ring-white/20',
    danger:
      'border-danger/45 bg-danger/90 text-white shadow-md focus:ring-danger',
    teal:
      'border-accent3/45 bg-accent3/90 text-white shadow-md focus:ring-accent3',
  };

  return (
    <motion.button
      whileHover={disabled || isLoading ? {} : { y: -1, boxShadow: '0 10px 26px rgba(0,0,0,0.24)' }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98, y: 0 }}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${radiusStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon}
          <span>{children}</span>
          {rightIcon}
        </>
      )}
    </motion.button>
  );
}

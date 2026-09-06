'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
  noPadding?: boolean;
}

export function CardHead({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 border-b border-white/10 flex items-center justify-between gap-3 flex-wrap ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export default function Card({
  children,
  hoverable = false,
  className = '',
  noPadding = false,
  ...props
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hoverable ? { y: -2, boxShadow: '0 26px 80px rgba(0,0,0,0.45)' } : undefined}
      className={`rounded-glass-lg border border-stroke bg-gradient-to-b from-white/[0.08] to-white/[0.05] shadow-glass-lg backdrop-blur-[14px] overflow-hidden ${
        hoverable ? 'transition-all duration-200' : ''
      } ${!noPadding ? 'p-5' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

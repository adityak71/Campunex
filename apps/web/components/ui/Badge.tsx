'use client';

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'verified' | 'pending' | 'success' | 'warning' | 'info' | 'danger' | 'default';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  const isStatus = ['verified', 'success', 'pending', 'warning', 'danger'].includes(variant);

  const baseTag = 'inline-flex items-center leading-none gap-[8px] px-[10px] py-[6px] text-[12px] rounded-full border border-white/16 bg-white/[0.07] text-white/82';
  const baseStatus = 'inline-flex items-center leading-none gap-[7px] px-[10px] py-[6px] rounded-full border font-[900] text-[12px] text-white/[0.86] whitespace-nowrap';

  const statusStyles = {
    verified: 'bg-accent3/[0.12] border-accent3/[0.18]',
    success: 'bg-accent3/[0.12] border-accent3/[0.18]',
    pending: 'bg-warn/[0.14] border-warn/[0.22]',
    warning: 'bg-warn/[0.14] border-warn/[0.22]',
    danger: 'bg-danger/[0.12] border-danger/[0.20]',
    info: 'bg-accent2/[0.12] border-accent2/[0.18]',
    default: '',
  };

  const dotStyles = {
    verified: 'bg-accent3',
    success: 'bg-accent3',
    pending: 'bg-warn',
    warning: 'bg-warn',
    danger: 'bg-danger',
    info: 'bg-accent2',
    default: 'bg-white/28',
  };

  if (!isStatus) {
    return (
      <span className={`${baseTag} ${className}`}>
        {children}
      </span>
    );
  }

  return (
    <span className={`${baseStatus} ${statusStyles[variant]} ${className}`}>
      {variant !== 'verified' && (
        <span className={`w-[8px] h-[8px] rounded-full ${dotStyles[variant]}`}></span>
      )}
      {children}
    </span>
  );
}

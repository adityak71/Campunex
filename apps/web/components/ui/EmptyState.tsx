'use client';

import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`bg-white/5 border border-white/10 rounded-[26px] p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-sm backdrop-blur-md ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white/5 text-white/50 flex items-center justify-center">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-sm font-bold text-white/90">{title}</h3>
      {description && (
        <p className="text-xs text-white/50 max-w-sm">{description}</p>
      )}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

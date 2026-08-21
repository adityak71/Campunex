'use client';

import React from 'react';

export default function MatchBar({ matchScore }: { matchScore: number }) {
  const percentage = Math.min(100, Math.max(0, matchScore));

  const getColor = (score: number) => {
    if (score >= 80) return 'bg-teal-500 text-teal-700 dark:text-teal-400';
    if (score >= 60) return 'bg-blue-500 text-blue-700 dark:text-blue-400';
    return 'bg-amber-500 text-amber-700 dark:text-amber-400';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs font-bold">
        <span className="text-slate-600 dark:text-slate-300">Route Compatibility Match</span>
        <span className={`font-mono ${getColor(percentage)}`}>{percentage}% Match</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            percentage >= 80 ? 'bg-teal-500' : percentage >= 60 ? 'bg-blue-500' : 'bg-amber-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Mail, LogOut, ArrowRight } from 'lucide-react';
import Button from './ui/Button';

export default function BlockedUserModal() {
  const pathname = usePathname();
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState(
    'You have been blocked by Campunex. Please contact customer care.'
  );

  useEffect(() => {
    const handleBlockedEvent = (e: any) => {
      const msg = e.detail?.message || 'You have been blocked by Campunex. Please contact customer care.';
      setBlockedMessage(msg);
      setIsBlocked(true);
    };

    window.addEventListener('campunex_account_blocked', handleBlockedEvent);

    return () => {
      window.removeEventListener('campunex_account_blocked', handleBlockedEvent);
    };
  }, []);

  const handleContactSupport = () => {
    setIsBlocked(false);
    window.location.href = '/contact?issue=blocked';
  };

  const handleLogout = () => {
    localStorage.removeItem('campunex_token');
    setIsBlocked(false);
    window.location.href = '/login';
  };

  // Do not block the view if user is already on the contact support page
  if (!isBlocked || pathname === '/contact') return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="blocked-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-md bg-slate-900/95 border border-red-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-red-950/50 space-y-6">
        {/* Glow indicator */}
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 id="blocked-title" className="text-2xl font-black text-white tracking-tight">
            Account Suspended
          </h2>
          <p className="text-sm text-red-200/90 leading-relaxed font-medium">
            {blockedMessage}
          </p>
        </div>

        {/* Support Helpdesk Notice */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1 text-xs text-slate-300">
          <p className="text-slate-300 font-medium">
            If you believe this is an error or wish to submit an appeal to reactivate your account, please open a support ticket.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2.5 pt-1">
          <Button
            onClick={handleContactSupport}
            variant="primary"
            className="w-full !rounded-xl !bg-red-600 hover:!bg-red-700 !text-white !font-bold py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
          >
            <Mail className="w-4 h-4" />
            Contact Customer Care
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>

          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full !rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 py-2.5 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { apiRequest } from '../lib/api';
import { User } from '@campunex/shared';
import { Navigation2, LogOut, Shield, Menu, X, Car, Search, PlusCircle, Bell, UserCheck } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import Button from './ui/Button';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('campunex_token');
    if (token) {
      apiRequest('/auth/me')
        .then((res) => setUser(res.user))
        .catch(() => {
          localStorage.removeItem('campunex_token');
          setUser(null);
        });
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('campunex_token');
    setUser(null);
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const isDriverRole = user?.role === 'DRIVER';

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-[14px] border-b border-white/10 bg-gradient-to-b from-[#0c0b17]/70 to-[#0c0b17]/35">
      <div className="max-w-[1180px] mx-auto px-4 md:px-6 h-[64px] flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link
          href={user ? (isDriverRole ? '/driver' : '/dashboard') : '/'}
          className="flex items-center gap-2.5 font-[900] tracking-[-0.02em] whitespace-nowrap"
        >
          <div className="w-[34px] h-[34px] rounded-[10px] bg-gradient-to-br from-accent1 to-accent2 shadow-[0_16px_40px_rgba(181,108,255,0.20)] border border-white/18 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_55%)] pointer-events-none"></div>
            <Navigation2 className="w-4 h-4 text-white relative z-10" />
          </div>
          <span>Campunex</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2 flex-wrap justify-end">
          <Link href="/how-it-works" className="px-2.5 py-2 rounded-full text-white/74 font-[700] text-[13px] hover:bg-white/5 hover:text-white/92 transition-colors">How it works</Link>
          <Link href="/help" className="px-2.5 py-2 rounded-full text-white/74 font-[700] text-[13px] hover:bg-white/5 hover:text-white/92 transition-colors">Help</Link>
          <Link href="/safety" className="px-2.5 py-2 rounded-full text-white/74 font-[700] text-[13px] hover:bg-white/5 hover:text-white/92 transition-colors">Safety</Link>
          <Link href="/contact" className="px-2.5 py-2 rounded-full text-white/74 font-[700] text-[13px] hover:bg-white/5 hover:text-white/92 transition-colors">Contact</Link>
          
          <div className="ml-2 flex items-center gap-2 border-l border-white/10 pl-4">
            {user ? (
              <>
                <NotificationCenter />
                <Link href={isDriverRole ? '/driver/profile' : '/profile'} className="flex items-center gap-2 hover:bg-white/5 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-white/10">
                  <div className="w-8 h-8 rounded-full bg-accent1/20 text-accent1 flex items-center justify-center font-bold text-xs border border-accent1/30">
                    {getInitials(user.name)}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-[12px] font-bold text-white/90 leading-tight">{user.name}</div>
                    <div className="text-[10px] text-white/50">{user.role}</div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/50 hover:text-danger hover:bg-danger/10 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3.5 py-2 rounded-full text-white/90 font-[800] text-[13.5px] border border-white/20 hover:bg-white/10 transition-colors">Sign in</Link>
                <Link href="/register" className="px-3.5 py-2 rounded-full text-white font-[800] text-[13.5px] border border-accent1/45 bg-gradient-to-br from-accent1/[0.95] to-accent2/[0.95] shadow-[0_14px_40px_rgba(76,125,255,0.25)] hover:-translate-y-px transition-transform">Get started</Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-2 md:hidden">
          {user && <NotificationCenter />}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-bg0 px-4 py-4 space-y-2 shadow-xl absolute w-full">
          {user ? (
            <>
              <div className="p-3 bg-white/5 border border-white/10 rounded-glass-md flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent1/20 text-accent1 flex items-center justify-center font-bold text-sm border border-accent1/30">
                  {getInitials(user.name)}
                </div>
                <div>
                  <div className="text-sm font-bold text-white/90">{user.name}</div>
                  <div className="text-xs text-white/50">{user.role} Account</div>
                </div>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-danger hover:bg-danger/10 rounded-glass-md transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center py-2.5 border border-white/20 rounded-full text-[13.5px] font-[800] text-white/90 mb-2"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center py-2.5 bg-gradient-to-br from-accent1/[0.95] to-accent2/[0.95] text-white rounded-full text-[13.5px] font-[800] border border-accent1/45 shadow-[0_14px_40px_rgba(76,125,255,0.25)]"
              >
                Get started
              </Link>
            </>
          )}
          <div className="h-px bg-white/10 my-4"></div>
          <Link href="/how-it-works" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/5 rounded-glass-md">How It Works</Link>
          <Link href="/safety" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/5 rounded-glass-md">Safety</Link>
          <Link href="/help" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/5 rounded-glass-md">Help Center</Link>
        </div>
      )}
    </nav>
  );
}

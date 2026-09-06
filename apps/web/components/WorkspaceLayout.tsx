'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Search, 
  Car, 
  List, 
  FileText, 
  Bell, 
  User, 
  Settings, 
  Shield, 
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Card, { CardHead, CardBody } from './ui/Card';
import Badge from './ui/Badge';

export type WorkspaceMode = 'rider' | 'driver' | 'admin';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  mode: WorkspaceMode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function WorkspaceLayout({ children, mode, title, subtitle, actions }: WorkspaceLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const token = localStorage.getItem('campunex_token');
        if (!token) {
          router.replace('/login');
          return;
        }
        
        // Dynamic import to avoid circular dependencies if any
        const { apiRequest } = await import('../lib/api');
        const res = await apiRequest('/auth/me');
        if (res?.user) {
          const role = res.user.role || 'RIDER';
          
          if (mode === 'admin' && role !== 'ADMIN') {
            router.replace('/dashboard');
          } else if (mode === 'driver' && role !== 'DRIVER') {
            router.replace('/dashboard');
          } else if (mode === 'rider' && role === 'DRIVER') {
            router.replace('/driver');
          } else if (mode === 'rider' && role === 'ADMIN') {
            router.replace('/admin');
          }
        }
      } catch (err) {
        // Ignored, let page handle auth failure
      }
    };
    checkRole();
  }, [mode, router]);

  const handleLogout = () => {
    localStorage.removeItem('campunex_token');
    router.push('/login');
  };

  const getLinks = () => {
    switch (mode) {
      case 'admin':
        return [
          { href: '/admin', label: 'Overview', icon: Home },
          { href: '/admin/reports', label: 'Reports', icon: FileText },
          { href: '/admin/rides', label: 'Rides', icon: Car },
          { href: '/admin/users', label: 'Users', icon: User },
          { href: '/admin/verification', label: 'Verification', icon: Shield },
          { href: '/admin/settings', label: 'Settings', icon: Settings }
        ];
      case 'driver':
        return [
          { href: '/driver', label: 'Driver Home', icon: Home },
          { href: '/driver/offer', label: 'Offer a ride', icon: Car },
          { href: '/driver/requests', label: 'Requests', icon: List },
          { href: '/driver/rides', label: 'Active rides', icon: Car },
          { href: '/driver/history', label: 'History', icon: FileText },
          { href: '/driver/profile', label: 'Profile', icon: User },
          { href: '/driver/safety', label: 'Safety', icon: Shield }
        ];
      default:
        return [
          { href: '/dashboard', label: 'Dashboard', icon: Home },
          { href: '/rides/find', label: 'Find rides', icon: Search },
          { href: '/rides/requests', label: 'Requests', icon: List },
          { href: '/trips', label: 'Trips', icon: FileText },
          { href: '/history', label: 'History', icon: FileText },
          { href: '/notifications', label: 'Notifications', icon: Bell },
          { href: '/profile', label: 'Profile', icon: User },
          { href: '/settings/notifications', label: 'Settings', icon: Settings }
        ];
    }
  };

  const modeLabel = mode === 'admin' ? 'Administration' : mode === 'driver' ? 'Driver tools' : 'Rider tools';
  const links = getLinks();

  return (
    <div className="max-w-[1180px] mx-auto px-4 md:px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[12px] font-[800] text-white/70 mb-4">
            <span className="w-2 h-2 rounded-full bg-accent1"></span>
            {modeLabel}
          </div>
          <h1 className="text-[32px] md:text-[40px] font-[900] tracking-[-0.03em] leading-tight text-white mb-2">{title}</h1>
          {subtitle && <div className="text-[16px] text-white/60 font-[500] max-w-2xl">{subtitle}</div>}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3 flex-wrap">
            {actions}
          </div>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent mb-8"></div>

      {/* Workspace Grid */}
      <div className={`grid gap-8 items-start transition-all duration-300 ${collapsed ? 'grid-cols-1 lg:grid-cols-[80px_1fr]' : 'grid-cols-1 lg:grid-cols-[260px_1fr]'}`}>
        
        {/* Sidebar */}
        <aside className="hidden lg:block relative sticky top-[88px]">
          <Card>
            <CardHead>
              {!collapsed && <strong className="text-white/90">Navigation</strong>}
              {!collapsed && <Badge variant="info">{mode}</Badge>}
              <button 
                onClick={() => setCollapsed(!collapsed)}
                className={`p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors ${collapsed ? 'mx-auto w-full flex justify-center' : ''}`}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </CardHead>
            <CardBody className={collapsed ? 'px-2' : ''}>
              <nav className="flex flex-col gap-1">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-[12px] transition-colors ${
                        isActive 
                          ? 'bg-white/10 text-white font-[800]' 
                          : 'text-white/60 hover:bg-white/5 hover:text-white/90 font-[700]'
                      } ${collapsed ? 'justify-center' : ''}`}
                      title={collapsed ? link.label : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <link.icon className={`w-[18px] h-[18px] ${isActive ? 'text-accent1' : ''}`} />
                        {!collapsed && <span className="text-[13.5px]">{link.label}</span>}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {!collapsed && (
                <>
                  <div className="h-px bg-white/10 my-4"></div>
                  <div className="px-3 text-[11px] font-[900] tracking-wider text-white/30 uppercase mb-2">Quick</div>
                  <nav className="flex flex-col gap-1">
                    <Link href="/help" className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-white/60 hover:bg-white/5 hover:text-white/90 font-[700]">
                      <MessageSquare className="w-[18px] h-[18px]" />
                      <span className="text-[13.5px]">Help center</span>
                    </Link>
                    <Link href="/safety" className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-white/60 hover:bg-white/5 hover:text-white/90 font-[700]">
                      <Shield className="w-[18px] h-[18px]" />
                      <span className="text-[13.5px]">Safety</span>
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-danger hover:bg-danger/10 font-[700] w-full text-left transition-colors">
                      <LogOut className="w-[18px] h-[18px]" />
                      <span className="text-[13.5px]">Sign out</span>
                    </button>
                  </nav>
                </>
              )}
            </CardBody>
          </Card>
        </aside>

        {/* Main Content Area */}
        <section className="min-w-0 w-full">
          {children}
        </section>
      </div>
    </div>
  );
}

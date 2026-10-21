'use client';

import React from 'react';
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
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { apiRequest } from '../../lib/api';
import { getSocketClient } from '../../lib/socket';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  mode?: 'rider' | 'driver' | 'admin';
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function WorkspaceLayout({
  children,
  mode = 'rider',
  title,
  subtitle,
  actions,
}: WorkspaceLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // Dynamic real counts for badges (zero mock/fake numbers)
  const [counts, setCounts] = React.useState({
    unreadNotifications: 0,
    riderRequests: 0,
    driverRequests: 0,
    driverActiveRides: 0,
    pendingVerifications: 0,
  });

  const fetchRealCounts = React.useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('campunex_token') : null;
    if (!token) return;

    try {
      // 1. Unread notifications count
      const notifRes = await apiRequest('/notifications?limit=1').catch(() => null);
      const unreadCount = notifRes?.unread_count ?? 0;

      let riderReqCount = 0;
      let driverReqCount = 0;
      let driverRidesCount = 0;
      let verifCount = 0;

      if (mode === 'rider') {
        const reqRes = await apiRequest('/rides/requests/my-requests').catch(() => null);
        const reqs = reqRes?.requests || [];
        riderReqCount = reqs.filter((r: any) => r.status === 'REQUESTED' || r.status === 'PENDING').length;
      } else if (mode === 'driver') {
        const [driverReqRes, driverRidesRes] = await Promise.all([
          apiRequest('/rides/driver-requests').catch(() => null),
          apiRequest('/rides/my-rides').catch(() => null),
        ]);
        const dReqs = driverReqRes?.requests || [];
        driverReqCount = dReqs.filter((r: any) => r.status === 'REQUESTED' || r.status === 'PENDING').length;

        const dRides = driverRidesRes?.rides || [];
        driverRidesCount = dRides.filter((r: any) =>
          r.status === 'OPEN' || r.status === 'ACTIVE' || r.status === 'SCHEDULED' || r.status === 'SEAT_FULL'
        ).length;
      } else if (mode === 'admin') {
        const sysRes = await apiRequest('/admin/system').catch(() => null);
        verifCount = sysRes?.system?.pendingVerifications ?? 0;
      }

      setCounts({
        unreadNotifications: unreadCount,
        riderRequests: riderReqCount,
        driverRequests: driverReqCount,
        driverActiveRides: driverRidesCount,
        pendingVerifications: verifCount,
      });
    } catch (err) {
      // Fallback gracefully without throwing
    }
  }, [mode]);

  React.useEffect(() => {
    fetchRealCounts();
  }, [fetchRealCounts, pathname]);

  // Real-time badge counter synchronization
  React.useEffect(() => {
    const socket = getSocketClient();
    const handleNewNotif = () => {
      setCounts((prev) => ({ ...prev, unreadNotifications: prev.unreadNotifications + 1 }));
    };
    const handleRefreshCounts = () => {
      fetchRealCounts();
    };

    socket.on('notification:new', handleNewNotif);
    socket.on('ride:request_created', handleRefreshCounts);
    socket.on('ride:request_status', handleRefreshCounts);

    return () => {
      socket.off('notification:new', handleNewNotif);
      socket.off('ride:request_created', handleRefreshCounts);
      socket.off('ride:request_status', handleRefreshCounts);
    };
  }, [fetchRealCounts]);

  const getLinks = () => {
    const notifBadge =
      counts.unreadNotifications > 0
        ? counts.unreadNotifications > 9
          ? '9+'
          : String(counts.unreadNotifications)
        : undefined;

    if (mode === 'admin') {
      return [
        { href: '/admin', label: 'Overview', icon: Home },
        { href: '/admin/reports', label: 'Reports', icon: FileText },
        { href: '/admin/rides', label: 'Rides', icon: Car },
        { href: '/admin/users', label: 'Users', icon: User },
        { href: '/admin/universities', label: 'Universities', icon: List },
        {
          href: '/admin/verification',
          label: 'Verification',
          icon: Shield,
          badge: counts.pendingVerifications > 0 ? String(counts.pendingVerifications) : undefined,
        },
        { href: '/notifications', label: 'Notifications', icon: Bell, badge: notifBadge },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
      ];
    }
    if (mode === 'driver') {
      return [
        { href: '/driver', label: 'Driver Home', icon: Home },
        { href: '/driver/offer', label: 'Offer a ride', icon: Car },
        {
          href: '/driver/requests',
          label: 'Requests',
          icon: List,
          badge: counts.driverRequests > 0 ? String(counts.driverRequests) : undefined,
        },
        {
          href: '/driver/rides',
          label: 'Active rides',
          icon: Car,
          badge: counts.driverActiveRides > 0 ? String(counts.driverActiveRides) : undefined,
        },
        { href: '/driver/history', label: 'History', icon: FileText },
        { href: '/notifications', label: 'Notifications', icon: Bell, badge: notifBadge },
        { href: '/driver/profile', label: 'Profile', icon: User },
        { href: '/driver/safety', label: 'Safety', icon: Shield },
      ];
    }
    return [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/rides/find', label: 'Find rides', icon: Search },
      {
        href: '/rides/requests',
        label: 'Requests',
        icon: List,
        badge: counts.riderRequests > 0 ? String(counts.riderRequests) : undefined,
      },
      { href: '/trips', label: 'Trips', icon: FileText },
      { href: '/history', label: 'History', icon: FileText },
      { href: '/notifications', label: 'Notifications', icon: Bell, badge: notifBadge },
      { href: '/profile', label: 'Profile', icon: User },
      { href: '/settings/notifications', label: 'Settings', icon: Settings },
    ];
  };

  const links = getLinks();
  const modeLabel = mode === 'admin' ? 'Administration' : mode === 'driver' ? 'Driver tools' : 'Rider tools';

  const handleLogout = () => {
    localStorage.removeItem('campunex_token');
    localStorage.removeItem('campunex_driver_online');
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col transition-all">
      <Navbar />

      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 md:px-6 pt-6 lg:pt-10 pb-28 lg:pb-20">
        
        {/* Page Head */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[12px] font-[600] text-white/80 mb-4">
              <span className="w-2 h-2 rounded-full bg-accent1 shadow-[0_0_8px_rgba(181,108,255,0.6)]"></span>
              {modeLabel} • Updated Just now
            </div>
            <h1 className="text-4xl font-[900] tracking-tight text-white mb-2">{title}</h1>
            {subtitle && <p className="text-white/60">{subtitle}</p>}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
            <div className="relative group flex-1 sm:flex-shrink-0 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search rides, trips, users..."
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-16 py-2 text-sm text-white focus:outline-none focus:border-accent1/50 transition-colors placeholder:text-white/30 w-full sm:w-[240px]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 border border-white/20 bg-white/10 rounded px-1.5 py-0.5 text-[10px] text-white/60 font-mono">
                ⌘ K
              </div>
            </div>
            {actions}
          </div>
        </div>

        {/* Workspace Layout */}
        <div className={`grid grid-cols-1 transition-all duration-300 gap-8 ${isSidebarCollapsed ? 'lg:grid-cols-[80px_1fr]' : 'lg:grid-cols-[240px_1fr]'}`}>
          
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block relative self-start sticky top-24">
            <div className="bg-gradient-to-b from-[#12121e]/95 to-[#181829]/95 border border-white/10 rounded-[24px] shadow-2xl shadow-purple-950/30 backdrop-blur-2xl overflow-hidden transition-all duration-300">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                {!isSidebarCollapsed && (
                  <strong className="text-xs font-[900] uppercase tracking-wider text-white/70 whitespace-nowrap">Navigation</strong>
                )}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors ml-auto flex items-center justify-center border border-white/5"
                  title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="p-3 space-y-1">
                {links.map((link) => {
                  const isActive = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== '/dashboard' && link.href !== '/driver' && link.href !== '/admin');
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      title={isSidebarCollapsed ? link.label : undefined}
                      className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-3.5 py-2.5 rounded-xl text-[13px] font-[700] transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-accent1/20 to-purple-600/10 text-white border-l-2 border-l-accent1 shadow-sm'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <link.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-accent1' : ''}`} />
                        {!isSidebarCollapsed && <span className="whitespace-nowrap">{link.label}</span>}
                      </div>
                      {!isSidebarCollapsed && link.badge && (
                        <span className="bg-accent1/15 text-accent1 border border-accent1/25 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {!isSidebarCollapsed && (
                  <div className="pt-6 pb-2 px-3 text-[11px] font-[800] text-white/40 uppercase tracking-wider whitespace-nowrap">Quick</div>
                )}
                {isSidebarCollapsed && <div className="h-6" />}
                
                <Link href="/help" title={isSidebarCollapsed ? "Help Center" : undefined} className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl text-[13.5px] font-[600] text-white/60 hover:text-white hover:bg-white/5 transition-colors`}>
                  <HelpCircle className="w-[20px] h-[20px] flex-shrink-0" /> {!isSidebarCollapsed && <span className="whitespace-nowrap">Help center</span>}
                </Link>
                <Link href="/safety" title={isSidebarCollapsed ? "Safety" : undefined} className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl text-[13.5px] font-[600] text-white/60 hover:text-white hover:bg-white/5 transition-colors`}>
                  <Shield className="w-[20px] h-[20px] flex-shrink-0" /> {!isSidebarCollapsed && <span className="whitespace-nowrap">Safety</span>}
                </Link>
                <button
                  onClick={handleLogout}
                  title={isSidebarCollapsed ? "Sign Out" : undefined}
                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl text-[13.5px] font-[600] text-danger/80 hover:text-danger hover:bg-danger/10 transition-colors text-left`}
                >
                  <LogOut className="w-[20px] h-[20px] flex-shrink-0" /> {!isSidebarCollapsed && <span className="whitespace-nowrap">Sign out</span>}
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <section className="min-w-0 transition-all duration-300">
            {children}
          </section>
        </div>
      </main>
      
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c0b17]/90 backdrop-blur-xl border-t border-white/10 px-1 py-2 overflow-x-auto flex items-center gap-1">
        {links.map((link) => {
          const isActive = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== '/dashboard' && link.href !== '/driver' && link.href !== '/admin');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center min-w-[72px] h-12 rounded-xl transition-colors relative ${isActive ? 'text-accent1 bg-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <link.icon className={`w-5 h-5 mb-1 ${isActive ? 'text-accent1' : ''}`} />
              <span className="text-[10px] font-bold tracking-tight truncate w-full text-center px-1">{link.label}</span>
              {link.badge && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-danger border border-[#0c0b17]"></span>
              )}
            </Link>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}

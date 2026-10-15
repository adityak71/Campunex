'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiRequest } from '../lib/api';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { ShieldAlert, ArrowRight, LogOut } from 'lucide-react';

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/verify',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/how-it-works',
  '/contact',
  '/help',
  '/safety',
];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [unauthorizedMessage, setUnauthorizedMessage] = useState<string | null>(null);
  const [targetDashboard, setTargetDashboard] = useState<string>('/dashboard');
  const [targetLabel, setTargetLabel] = useState<string>('Go to My Dashboard');
  const [authorized, setAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // 1. If public route, render immediately without blocking
    const isPublic = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/verify');
    if (isPublic) {
      setAuthorized(true);
      return;
    }

    const checkAccess = async () => {
      const token = localStorage.getItem('campunex_token');
      if (!token) {
        // Redirect to login if unauthenticated on a private route
        router.push('/login');
        return;
      }

      setLoading(true);
      try {
        const { user } = await apiRequest('/auth/me');
        if (!user) throw new Error('No user data');

        if (user.is_blocked) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('campunex_account_blocked', {
                detail: { message: 'You have been blocked by Campunex. Please contact customer care.' },
              })
            );
          }
          setAuthorized(false);
          setLoading(false);
          return;
        }

        const role = (user.role || 'RIDER').toUpperCase();
        setUserRole(role);

        // Determine home dashboard based on authoritative role
        const roleHome = role === 'DRIVER' ? '/driver' : role === 'ADMIN' ? '/admin' : '/dashboard';
        const roleHomeLabel = role === 'DRIVER' ? 'Go to Driver Portal' : role === 'ADMIN' ? 'Go to Admin Console' : 'Go to Rider Dashboard';
        setTargetDashboard(roleHome);
        setTargetLabel(roleHomeLabel);

        // 2. Seamless role-specific shortcuts
        if (role === 'DRIVER') {
          if (pathname === '/rides/create') {
            router.replace('/driver/offer');
            return;
          }
          if (pathname === '/profile') {
            router.replace('/driver/profile');
            return;
          }
        }

        // 3. Strict RBAC URL validations
        if (role === 'RIDER') {
          if (pathname.startsWith('/driver')) {
            setUnauthorizedMessage("You can't access this option. You are logged in with a Rider account, and Driver tools are restricted to verified drivers.");
            setAuthorized(false);
            setLoading(false);
            return;
          }
          if (pathname.startsWith('/trip/') && (pathname.endsWith('/start') || pathname.endsWith('/complete'))) {
            setUnauthorizedMessage("You can't access OTP verification controls. Starting and completing trips via OTP is strictly restricted to the vehicle's driver.");
            setTargetDashboard(pathname.replace(/\/start$|\/complete$/, ''));
            setTargetLabel('Return to Trip Tracking');
            setAuthorized(false);
            setLoading(false);
            return;
          }
          if (pathname.startsWith('/admin')) {
            setUnauthorizedMessage("You can't access this option. Campus administration and platform oversight tools are restricted to Administrators only.");
            setAuthorized(false);
            setLoading(false);
            return;
          }
        } else if (role === 'DRIVER') {
          if (pathname === '/dashboard') {
            setUnauthorizedMessage("You can't access the Rider Dashboard. You are logged in as a Driver with dedicated ride publishing, requests, and route management portals.");
            setAuthorized(false);
            setLoading(false);
            return;
          }
          if (pathname.startsWith('/rides') && !pathname.startsWith('/rides/alerts')) {
            setUnauthorizedMessage("You can't access Rider ride search and seat request options. Drivers publish routes and manage passenger requests from the Driver portal.");
            setAuthorized(false);
            setLoading(false);
            return;
          }
          if (pathname === '/trips') {
            setUnauthorizedMessage("The '/trips' view is configured for riders. As a driver, you can track and manage your journeys in 'My Rides'.");
            setTargetDashboard('/driver/rides');
            setTargetLabel('Go to My Rides');
            setAuthorized(false);
            setLoading(false);
            return;
          }
          if (pathname === '/history') {
            setUnauthorizedMessage("The '/history' view is for rider commutes. As a driver, your trip history is tracked in 'Driver History'.");
            setTargetDashboard('/driver/history');
            setTargetLabel('Go to Driver History');
            setAuthorized(false);
            setLoading(false);
            return;
          }
          if (pathname.startsWith('/admin')) {
            setUnauthorizedMessage("You can't access this option. Campus administration is restricted to Administrators only.");
            setAuthorized(false);
            setLoading(false);
            return;
          }
        } else if (role === 'ADMIN') {
          if (pathname === '/dashboard' || pathname.startsWith('/driver') || pathname.startsWith('/rides') || pathname === '/trips' || pathname === '/history') {
            setUnauthorizedMessage("You are logged in as a Campus Administrator. Standard commuter operations are separated from platform administration.");
            setAuthorized(false);
            setLoading(false);
            return;
          }
        }

        // Access authorized
        setUnauthorizedMessage(null);
        setAuthorized(true);
      } catch (error) {
        console.error('AuthGuard check failed:', error);
        localStorage.removeItem('campunex_token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [pathname, router]);

  const handleDismissModal = () => {
    setUnauthorizedMessage(null);
    router.push(targetDashboard);
  };

  const handleSwitchAccount = () => {
    localStorage.removeItem('campunex_token');
    setUnauthorizedMessage(null);
    router.push('/login');
  };

  if (unauthorizedMessage) {
    return (
      <div className="min-h-screen bg-[#0c0b17] flex items-center justify-center p-4">
        <Modal
          isOpen={true}
          onClose={handleDismissModal}
          title="Access Restricted (RBAC Policy)"
        >
          <div className="space-y-6 text-center py-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center text-danger">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-[800] text-white">Unauthorized Option</h3>
              <p className="text-white/70 text-sm leading-relaxed max-w-md mx-auto">
                {unauthorizedMessage}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Button
                variant="primary"
                onClick={handleDismissModal}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                {targetLabel}
              </Button>
              <Button
                variant="secondary"
                onClick={handleSwitchAccount}
                leftIcon={<LogOut className="w-4 h-4" />}
                className="w-full sm:w-auto text-white/70 hover:text-white"
              >
                Sign In with Different Role
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  if (!authorized && !PUBLIC_ROUTES.includes(pathname) && !pathname.startsWith('/verify')) {
    return (
      <div className="min-h-screen bg-[#0c0b17] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent1"></div>
      </div>
    );
  }

  return <>{children}</>;
}

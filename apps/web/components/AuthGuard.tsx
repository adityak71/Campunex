'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiRequest } from '../lib/api';
import Modal from './ui/Modal';
import Button from './ui/Button';

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
  const [authorized, setAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // If we're on a public route, just render children immediately
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
        // We fetch /me to ensure token is valid and get the absolute source of truth for the role
        const { user } = await apiRequest('/auth/me');
        if (!user) throw new Error('No user data');
        
        const role = user.role.toUpperCase();
        setUserRole(role);

        // RBAC Check
        if (pathname.startsWith('/driver')) {
          if (role !== 'DRIVER') {
            setUnauthorizedMessage("You can't access this option. You are not authorized to use this feature. Only Drivers can access this area.");
            setLoading(false);
            return;
          }
        } else if (pathname.startsWith('/rides')) {
          if (role !== 'RIDER') {
            setUnauthorizedMessage("You can't access this option. You are not authorized to use this feature. Only Riders can access this area.");
            setLoading(false);
            return;
          }
        } else if (pathname.startsWith('/admin')) {
          if (role !== 'ADMIN') {
            setUnauthorizedMessage("You can't access this option. You are not authorized to use this feature. Only Administrators can access this area.");
            setLoading(false);
            return;
          }
        } else if (pathname === '/dashboard') {
          if (role === 'DRIVER') {
            router.replace('/driver');
            return;
          } else if (role === 'ADMIN') {
            router.replace('/admin');
            return;
          }
        }

        setAuthorized(true);
      } catch (error) {
        console.error("AuthGuard check failed:", error);
        localStorage.removeItem('campunex_token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [pathname, router]);

  if (unauthorizedMessage) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
        <Modal
          isOpen={true}
          onClose={() => {
            setUnauthorizedMessage(null);
            router.push('/');
          }}
          title="Unauthorized Access"
        >
          <div className="space-y-4 text-center">
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              {unauthorizedMessage}
            </p>
            <div className="flex justify-center pt-4">
              <Button
                variant="primary"
                onClick={() => {
                  setUnauthorizedMessage(null);
                  router.push('/');
                }}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  if (!authorized && !PUBLIC_ROUTES.includes(pathname) && !pathname.startsWith('/verify')) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent3"></div>
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
}

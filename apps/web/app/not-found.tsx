'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Navigation2, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-16">
        <Card className="max-w-md w-full text-center space-y-6 p-8">
          <div className="w-16 h-16 bg-[#1e3a8a] dark:bg-cyan-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
            <Navigation2 className="w-8 h-8 text-white rotate-45" />
          </div>

          <div className="space-y-2">
            <Badge variant="warning">404 — PAGE NOT FOUND</Badge>
            <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
              Route Off Course
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              The campus page or ride route you were looking for does not exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/dashboard" className="flex-1">
              <Button variant="primary" size="md" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/rides/find" className="flex-1">
              <Button variant="teal" size="md" className="w-full" leftIcon={<Search className="w-4 h-4" />}>
                Find Rides
              </Button>
            </Link>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

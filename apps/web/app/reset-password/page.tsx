'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast('Password updated successfully! You can now log in.', 'success');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
              Create New Password
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set a strong new password for your Campunex account
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Your password has been reset successfully.
              </p>
              <Link href="/login">
                <Button variant="teal" size="md" className="w-full">
                  Sign In with New Password
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                required
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Reset Password
              </Button>
            </form>
          )}
        </Card>
      </div>

      <Footer />
    </div>
  );
}

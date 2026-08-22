'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { Mail, Send, CheckCircle2, User } from 'lucide-react';
import { apiRequest } from '../../lib/api';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [issueType, setIssueType] = useState('Verification');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest('/support/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, issueType, message }),
      });

      setSubmitted(true);
      showToast('Support message submitted successfully!', 'success');
    } catch (error) {
      showToast('Error submitting support request', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-8 w-full">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
            Contact Support
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Have questions about university domain verification or technical queries? Send us a message.
          </p>
        </div>

        {submitted ? (
          <Card className="p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Message Received!</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Thank you for contacting Campunex support. Our team will review your query and respond to <strong>{email}</strong> shortly.
            </p>
            <Button
              onClick={() => { setSubmitted(false); setMessage(''); }}
              variant="primary"
              size="sm"
            >
              Send Another Message
            </Button>
          </Card>
        ) : (
          <Card className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Your Name"
                required
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
              />

              <Input
                label="Campus Email Address"
                type="email"
                required
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@lpu.in"
              />

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Issue Category</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="Verification">University Email Verification</option>
                  <option value="Matching">Route Proximity Matching</option>
                  <option value="OTP">Dual OTP Verification</option>
                  <option value="WebSockets">Real-Time Map & Tracking</option>
                  <option value="Other">General Inquiry</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Message Details</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your issue or feedback in detail..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send Support Message
              </Button>
            </form>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}

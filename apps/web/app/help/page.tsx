'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Search, ChevronDown, HelpCircle, Shield, KeyRound, MapPin } from 'lucide-react';

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const categories = [
    { icon: Shield, title: 'Account Verification', desc: 'University email domain & 6-digit OTP' },
    { icon: MapPin, title: '500m Route Matching', desc: 'Spatial route line overlap & scoring matrix' },
    { icon: KeyRound, title: 'Dual OTP Security', desc: 'Start and completion 4-digit verification' },
    { icon: HelpCircle, title: 'Technical Issues', desc: 'WebSocket reconnection & map queries' },
  ];

  const faqs = [
    {
      q: 'How does university email verification work?',
      a: 'We send a 6-digit OTP code to your official campus email (.edu or .in domain). Once verified, your account receives the Verified campus badge.',
    },
    {
      q: 'Why am I not seeing matching rides?',
      a: 'The engine filters rides where the driver route passes within 500 meters of your pickup landmark. Check your pickup location or adjust departure times.',
    },
    {
      q: 'What should I do if the driver WebSocket disconnects?',
      a: 'The trip remains active and last-known GPS coordinates are retained in Redis. The app automatically reconnects when network restores.',
    },
    {
      q: 'Where do I find my ride initiation OTP code?',
      a: 'When the driver arrives at your pickup point, your live trip screen displays a 4-digit code to share with the driver to start the trip.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-12 w-full">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <Badge variant="info">SUPPORT & HELP</Badge>
          <h1 className="text-4xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
            Help Center
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Search support articles or explore topics below
          </p>

          <Input
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help topics, OTP verification, or route matching..."
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map(({ icon: Icon, title, desc }, idx) => (
            <Card key={idx} hoverable className="p-6 space-y-2">
              <div className="w-10 h-10 bg-teal-50 dark:bg-cyan-950/80 text-teal-600 dark:text-cyan-400 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">{title}</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{desc}</p>
            </Card>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1e3a8a] dark:text-cyan-300">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => (
              <Card key={idx} className="p-0 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left font-bold text-slate-900 dark:text-slate-100 text-sm flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

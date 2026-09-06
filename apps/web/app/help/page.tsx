'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Search, ChevronDown, HelpCircle, Shield, KeyRound, MapPin, MessageSquare, AlertCircle } from 'lucide-react';

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
      cat: 'Verification',
      q: 'How does university email verification work?',
      a: 'We send a 6-digit OTP code to your official campus email (.edu or .in domain). Once verified, your account receives the Verified campus badge.',
    },
    {
      cat: 'Ride Problems',
      q: 'Why am I not seeing matching rides?',
      a: 'The engine filters rides where the driver route passes within 500 meters of your pickup landmark. Check your pickup location or adjust departure times.',
    },
    {
      cat: 'Technical Issues',
      q: 'What should I do if the driver WebSocket disconnects?',
      a: 'The trip remains active and last-known GPS coordinates are retained in Redis. The app automatically reconnects when network restores.',
    },
    {
      cat: 'Trip Problems',
      q: 'Where do I find my ride initiation OTP code?',
      a: 'When the driver arrives at your pickup point, your live trip screen displays a 4-digit code to share with the driver to start the trip.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()) ||
      f.cat.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen text-white flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-12 w-full">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <Badge variant="info">SUPPORT & HELP</Badge>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Help Center
          </h1>
          <p className="text-sm text-white/60">
            Search support articles or explore topics below
          </p>

          <Input
            leftIcon={<Search className="w-4 h-4 text-white/40" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help topics, OTP verification, or route matching..."
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map(({ icon: Icon, title, desc }, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-[22px] space-y-2 transition-all hover:border-accent3/30 hover:shadow-[0_0_20px_rgba(14,165,233,0.15)]">
              <div className="w-10 h-10 bg-white/10 border border-white/20 text-accent3 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-sm text-white">{title}</h2>
              <p className="text-[11px] text-white/60 leading-normal">{desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-[22px] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left font-bold text-white text-sm flex justify-between items-center hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{faq.cat}</Badge>
                    <span>{faq.q}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-white/40 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-xs text-white/60 border-t border-white/10 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support CTA Card */}
        <div className="bg-white/5 border border-white/10 rounded-[22px] p-8 text-center space-y-3 mt-12">
          <h2 className="text-xl font-bold text-white">Still Need Help?</h2>
          <p className="text-xs text-white/60 max-w-md mx-auto">
            Our campus support team is available to assist with account verification, trip issues, or platform questions.
          </p>
          <div className="pt-2 flex justify-center">
            <Link href="/contact">
              <Button variant="primary" size="md" leftIcon={<MessageSquare className="w-4 h-4" />}>
                Contact Support Team
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Smartphone,
  Laptop,
  CheckCircle2,
  X,
  Share2,
  PlusSquare,
  Sparkles,
  WifiOff,
  Zap,
  HardDrive,
  ShieldCheck,
  Star,
  Download
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlatform?: 'android' | 'ios' | 'mac';
}

export default function InstallAppModal({
  isOpen,
  onClose,
  initialPlatform = 'mac'
}: InstallAppModalProps) {
  const [platform, setPlatform] = useState<'android' | 'ios' | 'mac'>(initialPlatform);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPlatform(initialPlatform);
  }, [initialPlatform]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      ) {
        setIsInstalled(true);
      }

      if ((window as any).__campunexDeferredPrompt) {
        setDeferredPrompt((window as any).__campunexDeferredPrompt);
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).__campunexDeferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleNativePrompt = async () => {
    const prompt = deferredPrompt || (typeof window !== 'undefined' && (window as any).__campunexDeferredPrompt);
    if (prompt) {
      try {
        prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          (window as any).__campunexDeferredPrompt = null;
          onClose();
        }
      } catch (e) {
        // user dismissed
      }
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#121422] border border-white/14 p-5 sm:p-6 shadow-2xl space-y-4 text-on-surface my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent1 to-accent2 border border-white/20 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5">
                <path d="M 256 110 L 390 390 L 256 320 L 122 390 Z" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-headline-md text-base font-bold text-white">
                  Install Campunex App
                </h3>
                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[10px] font-bold bg-primary/20 text-primary">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-white/60">
                Choose your device to install or follow quick steps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DEVICE SELECTOR BUTTONS (Mac & PC | Android | iPhone / iOS) */}
        <div className="flex rounded-xl bg-surface-container-lowest p-1.5 gap-1.5 border border-white/10">
          <button
            type="button"
            onClick={() => setPlatform('mac')}
            className={`flex-1 py-2.5 px-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              platform === 'mac'
                ? 'bg-gradient-to-r from-primary to-accent1 text-on-primary shadow-[0_0_15px_rgba(139,92,246,0.35)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Laptop className="w-4 h-4 shrink-0" />
            <span>Mac &amp; PC</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatform('android')}
            className={`flex-1 py-2.5 px-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              platform === 'android'
                ? 'bg-gradient-to-r from-primary to-accent1 text-on-primary shadow-[0_0_15px_rgba(139,92,246,0.35)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>Android</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatform('ios')}
            className={`flex-1 py-2.5 px-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              platform === 'ios'
                ? 'bg-gradient-to-r from-primary to-accent1 text-on-primary shadow-[0_0_15px_rgba(139,92,246,0.35)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>iPhone / iOS</span>
          </button>
        </div>

        {/* NATIVE DEVICE POPUP TRIGGER (Picture 2 Dialog) */}
        {deferredPrompt && (platform === 'mac' || platform === 'android') && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-primary-container/25 to-secondary-container/25 border border-primary/35 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                Device Native Popup Ready
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">● 1-Click Install</span>
            </div>
            <button
              onClick={handleNativePrompt}
              className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-fixed-dim text-on-primary font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(139,92,246,0.35)] flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Open Device Install Popup</span>
            </button>
          </div>
        )}

        {/* PLATFORM INSTRUCTIONS */}
        <div className="p-4 rounded-xl bg-surface-container/50 border border-white/8 space-y-3">
          <div className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/8 pb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>
              {platform === 'mac'
                ? 'Simple steps for Mac & PC'
                : platform === 'android'
                ? 'Simple steps for Android'
                : 'Simple steps for iPhone / iPad'}
            </span>
          </div>

          {/* Mac & PC Steps */}
          {platform === 'mac' && (
            <ol className="space-y-2.5 text-xs text-on-surface-variant leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  In Chrome / Edge, look at the <strong className="text-white">right side of your address bar</strong> at the top.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Click the <strong className="text-primary">&quot;Install app&quot; icon</strong> (computer monitor with download arrow).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Click <strong className="text-emerald-400">&quot;Install&quot;</strong>. Campunex will launch in its own standalone window!
                </span>
              </li>
            </ol>
          )}

          {/* Android Steps */}
          {platform === 'android' && (
            <ol className="space-y-2.5 text-xs text-on-surface-variant leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Look at your browser bar at the top and tap the <strong className="text-white">three dots ⋮</strong> menu.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Select <strong className="text-primary">&quot;Install app&quot;</strong> or <strong className="text-primary">&quot;Add to Home screen&quot;</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Tap <strong className="text-emerald-400">&quot;Install&quot;</strong> to add Campunex to your phone app drawer.
                </span>
              </li>
            </ol>
          )}

          {/* iPhone / iOS Steps */}
          {platform === 'ios' && (
            <ol className="space-y-2.5 text-xs text-on-surface-variant leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-secondary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span className="flex-1">
                  At the bottom of Safari, tap the <strong className="text-white inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container-high"><Share2 className="w-3 h-3 text-primary" /> Share</strong> icon.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-secondary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span className="flex-1">
                  Scroll down the share sheet and tap <strong className="text-secondary inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container-high"><PlusSquare className="w-3 h-3 text-secondary" /> Add to Home Screen</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-secondary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span className="flex-1">
                  Tap <strong className="text-emerald-400">&quot;Add&quot;</strong> in the top-right corner. The app will launch in borderless fullscreen!
                </span>
              </li>
            </ol>
          )}
        </div>

        {/* Benefits Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/8 text-[11px] text-on-surface-variant">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-primary" /> Instant startup
          </span>
          <span className="flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-secondary" /> Under 2MB cache
          </span>
          <span className="flex items-center gap-1">
            <WifiOff className="w-3.5 h-3.5 text-emerald-400" /> Offline route view
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-white/60">
            {isInstalled ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Already installed
              </span>
            ) : (
              <span>Safe • Verified • Offline Ready</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-highest text-white font-semibold text-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

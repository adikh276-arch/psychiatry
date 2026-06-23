'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { handlePlatformExit } from '../../lib/navigation';

function ActivityTrackerInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const upaId = searchParams.get('upa_id');
      console.log('[ActivityTracker] Extracted upa_id from URL:', upaId);
      if (upaId) {
        sessionStorage.setItem('upa_id', upaId);
        console.log('[ActivityTracker] Saved upa_id to sessionStorage:', upaId);
      }

      const uid = searchParams.get('uid');
      console.log('[ActivityTracker] Extracted uid from URL:', uid);
      if (uid) {
        sessionStorage.setItem('uid', uid);
        console.log('[ActivityTracker] Saved uid to sessionStorage:', uid);
      }
    }
  }, [searchParams]);

  return null;
}

function ActivityTracker() {
  return (
    <Suspense fallback={null}>
      <ActivityTrackerInner />
    </Suspense>
  );
}

interface PremiumLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onReset?: () => void;
  showBack?: boolean;
  icon?: React.ReactNode;
  exitOnBack?: boolean;
}

import { useRouter } from 'next/navigation';

export const PremiumLayout: React.FC<PremiumLayoutProps> = ({
  children,
  title,
  subtitle,
  onBack,
  onReset,
  showBack = true,
  icon,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden relative"
      style={{ background: '#F6F7F9', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      <ActivityTracker />
      {/* ── Very subtle ambient orbs — neutral, calming ── */}
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -14, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }}
      />
      <motion.div
        animate={{ x: [0, -16, 0], y: [0, 18, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        className="fixed bottom-[-80px] left-[-80px] w-[440px] h-[440px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,179,237,0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }}
      />

      {/* ── Header ── */}
      <header
        className="w-full sticky top-0 z-50"
        style={{
          background: 'rgba(246,247,249,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
        }}
      >
        <div className="max-w-2xl mx-auto px-6 h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {showBack && (
              <button
                onClick={handleBack}
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white transition-all duration-200 shadow-sm border border-transparent hover:border-slate-200"
                aria-label="Back"
              >
                <ChevronLeft size={22} strokeWidth={2.5} />
              </button>
            )}
            {icon && (
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-primary"
                style={{ background: 'rgba(14,165,233,0.1)' }}
              >
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-[17px] font-bold text-slate-800 truncate leading-tight" style={{ letterSpacing: '-0.02em' }}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-[11.5px] font-semibold text-slate-400 uppercase tracking-widest leading-none mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {onReset && (
            <button
              onClick={onReset}
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white transition-all duration-200 shadow-sm border border-transparent hover:border-slate-200"
              title="Reset"
              aria-label="Reset"
            >
              <RotateCcw size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-10 pb-20 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

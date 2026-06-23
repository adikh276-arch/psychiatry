'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, RotateCcw, Share2, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSound } from '@/lib/hooks/useSound';
import { handlePlatformExit } from '@/lib/navigation';
import ShareModal from './ShareModal';

interface PremiumCompleteProps {
  title?: string;
  message?: string;
  onRestart?: () => void;
  onHome?: () => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  /** If true, hides the Share button entirely */
  hideShare?: boolean;
  /** Custom share message — shown inside the ShareModal for this activity */
  shareContent?: string;
  /** Emoji or Icon to show in the ShareModal activity card. Falls back to main icon. */
  shareEmoji?: React.ReactNode;
  /** Replaces the entire action row with custom buttons */
  customActions?: React.ReactNode;
}

// Soft pastel confetti
const CONFETTI = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  x: 8 + (i * 5.3) % 84,
  color: [
    'rgba(14,165,233,0.7)',
    'rgba(56,189,248,0.65)',
    'rgba(125,211,252,0.6)',
    'rgba(186,230,255,0.8)',
    'rgba(52,211,153,0.65)',
    'rgba(167,243,208,0.75)',
  ][i % 6],
  size: 5 + (i % 4) * 2,
  delay: i * 0.07,
  duration: 1.4 + (i % 5) * 0.2,
}));

// Sparkle ring
const RING_DOTS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * 2 * Math.PI;
  const r = 52;
  return { id: i, cx: Math.cos(angle) * r, cy: Math.sin(angle) * r, delay: i * 0.12 };
});

export const PremiumComplete: React.FC<PremiumCompleteProps> = ({
  title,
  message,
  onRestart,
  onHome,
  children,
  icon,
  hideShare = false,
  shareContent,
  shareEmoji,
  customActions,
}) => {
  const { t } = useTranslation();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const { playComplete } = useSound();

  useEffect(() => {
    playComplete();
    const timer = setTimeout(() => setShowConfetti(false), 3200);

    // Trigger global activity completion webhook
    if (typeof window !== 'undefined') {
      const upaId = sessionStorage.getItem('upa_id');
      const uid = sessionStorage.getItem('uid');
      
      console.log('[PremiumComplete] Attempting to trigger webhook. Extracted from sessionStorage -> upa_id:', upaId, 'uid:', uid);
      
      if (upaId) {
        console.log('[PremiumComplete] Executing POST request to pathway webhook...');
        fetch('https://api.mantracare.com/webhook/pathway', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            intent: 'complete_activity',
            upa_id: Number(upaId),
            ...(uid && { uid: isNaN(Number(uid)) ? uid : Number(uid) }),
          }),
        }).then(res => {
          console.log('[PremiumComplete] Webhook response HTTP status:', res.status);
          return res.text();
        }).then(text => {
          console.log('[PremiumComplete] Webhook response body:', text);
        }).catch((err) => console.error('[PremiumComplete] Webhook execution error:', err));
      } else {
        console.log('[PremiumComplete] WARNING: No upa_id found in sessionStorage! Webhook was skipped.');
      }
    }

    return () => clearTimeout(timer);
  }, [playComplete]);

  const displayTitle = title || t('common.well_done', 'Well Done!');
  const displayMessage =
    message ||
    t('common.completion_message', "You've successfully completed this activity. Take a moment to appreciate your progress.");

  const handleHome = () => {
    handlePlatformExit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="w-full max-w-md mx-auto space-y-5 pb-8 px-2"
    >
      {/* ── Success card ── */}
      <div
        className="relative rounded-3xl bg-white overflow-hidden"
        style={{
          border: '1.5px solid rgba(226,232,240,0.7)',
          boxShadow: '0 8px 32px -4px rgba(14,165,233,0.10), 0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* Confetti burst */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl" style={{ zIndex: 10 }}>
          <AnimatePresence>
            {showConfetti && CONFETTI.map(c => (
              <motion.div
                key={c.id}
                initial={{ opacity: 1, y: '90%', x: `${c.x}%`, rotate: 0, scale: 1 }}
                animate={{
                  opacity: 0,
                  y: '-20%',
                  x: `calc(${c.x}% + ${(c.id % 2 === 0 ? 1 : -1) * 18}px)`,
                  rotate: (c.id % 2 === 0 ? 1 : -1) * 200,
                  scale: 0.5,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: c.duration, delay: c.delay, ease: [0.22, 1, 0.36, 1] }}
                className="absolute rounded-sm"
                style={{ width: c.size, height: c.size, backgroundColor: c.color, bottom: 0 }}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="px-8 py-10 flex flex-col items-center text-center gap-5 relative z-20">
          {/* Icon + rings */}
          <div className="relative flex items-center justify-center w-24 h-24">
            {[0, 1].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.85], opacity: [0.22, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: i * 1.0, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full"
                style={{ border: '2px solid rgba(14,165,233,0.35)' }}
              />
            ))}
            {RING_DOTS.map(dot => (
              <motion.div
                key={dot.id}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.1, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: dot.delay, ease: 'easeInOut' }}
                className="absolute w-1.5 h-1.5 rounded-full bg-sky-400"
                style={{ transform: `translate(${dot.cx}px, ${dot.cy}px)` }}
              />
            ))}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 14, stiffness: 220 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-primary relative z-10"
              style={{ background: 'linear-gradient(135deg, rgba(224,242,255,0.95), rgba(186,230,255,0.75))' }}
            >
              {icon || <CheckCircle2 size={32} strokeWidth={1.5} />}
            </motion.div>
          </div>

          {/* Title + message */}
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.18 }}
            className="space-y-2"
          >
            <h2
              className="text-[22px] font-bold text-slate-900"
              style={{ letterSpacing: '-0.025em' }}
            >
              {displayTitle}
            </h2>
            <p className="text-[15px] text-slate-500 leading-relaxed max-w-xs mx-auto">
              {displayMessage}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Optional extra content (e.g. mission statement card) ── */}
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {children}
        </motion.div>
      )}

      {/* ── Action buttons ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {customActions ? customActions : (
          <>
            {/* Primary: Finish & Exit */}
            <button
              onClick={handleHome}
              className="relative w-full h-[56px] rounded-2xl text-white font-bold text-[16px] flex items-center justify-center gap-2.5 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 60%, #0284c7 100%)',
                boxShadow: '0 6px 22px -4px rgba(14,165,233,0.4), 0 2px 6px rgba(0,0,0,0.07)',
                letterSpacing: '-0.015em',
              }}
            >
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.2) 50%, transparent 80%)' }}
              />
              <Home size={17} strokeWidth={2} className="relative z-10" />
              <span className="relative z-10">{t('common.finish_exit', 'Finish & Exit')}</span>
            </button>

            {/* Secondary row: Share + Start Over (or just one if neither/both absent) */}
            {(!hideShare || onRestart) && (
              <div className={`grid gap-3 ${(!hideShare && onRestart) ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {!hideShare && (
                  <button
                    onClick={() => setIsShareOpen(true)}
                    className="h-[50px] rounded-2xl flex items-center justify-center gap-2 font-semibold text-[14px] text-sky-600 transition-all duration-200 hover:bg-sky-50"
                    style={{
                      background: '#f0f9ff',
                      border: '1.5px solid rgba(186,230,255,0.8)',
                      boxShadow: '0 1px 4px rgba(14,165,233,0.06)',
                    }}
                  >
                    <Share2 size={16} strokeWidth={2} />
                    {t('common.share', 'Share')}
                  </button>
                )}
                {onRestart && (
                  <button
                    onClick={onRestart}
                    className="h-[50px] rounded-2xl flex items-center justify-center gap-2 font-semibold text-[14px] text-slate-500 transition-all duration-200 hover:bg-slate-100"
                    style={{
                      background: '#f8fafc',
                      border: '1.5px solid rgba(226,232,240,0.8)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    <RotateCcw size={15} strokeWidth={2} />
                    {t('common.start_over', 'Start Over')}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* ── Share Modal ── */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        activityName={displayTitle}
        shareContent={shareContent}
        emoji={shareEmoji || icon || <CheckCircle2 size={24} />}
      />
    </motion.div>
  );
};

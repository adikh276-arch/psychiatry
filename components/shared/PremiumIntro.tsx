'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSound } from '@/lib/hooks/useSound';

interface PremiumIntroProps {
  title?: string;
  description: string;
  onStart: () => void;
  icon?: React.ReactNode;
  benefits?: string[];
  duration?: string;
  children?: React.ReactNode;
}

// Tiny twinkling star dots scattered around the hero icon
const SPARKLE_POSITIONS = [
  { top: '-10%', left: '10%',  delay: 0 },
  { top: '5%',  right: '5%',  delay: 0.6 },
  { top: '50%', left: '-8%',  delay: 1.1 },
  { top: '80%', left: '15%',  delay: 0.3 },
  { top: '70%', right: '2%',  delay: 0.9 },
  { top: '25%', right: '-5%', delay: 1.5 },
];

export const PremiumIntro: React.FC<PremiumIntroProps> = ({
  description,
  onStart,
  icon,
  benefits,
  duration,
  children,
}) => {
  const { t } = useTranslation();
  const { playStart } = useSound();
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleStart = () => {
    playStart();
    onStart();
  };

  return (
    <div className="w-full space-y-5 pb-8">

      {/* ── Hero card with sparkles ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        className="relative rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-visible"
      >
        <div className="p-8 space-y-5">
          {/* Icon row + duration */}
          <div className="flex items-start justify-between gap-4">
            {/* Icon with pulsing glow ring */}
            <div className="relative shrink-0">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0, 0.15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-2xl bg-sky-400"
                style={{ zIndex: 0 }}
              />
              <div
                className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-primary z-10"
                style={{ background: 'linear-gradient(135deg, rgba(224,242,255,0.95), rgba(186,230,255,0.75))' }}
              >
                {icon || <ArrowRight size={28} />}
              </div>

              {/* Sparkle dots around icon */}
              {SPARKLE_POSITIONS.map((pos, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.1, 0.5] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: pos.delay, ease: 'easeInOut' }}
                  className="absolute w-2 h-2 rounded-full bg-sky-400"
                  style={{ ...pos, zIndex: 20 }}
                />
              ))}
            </div>

            {duration && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-sky-50 border border-sky-100 text-[12px] font-semibold text-sky-500 shrink-0">
                <Clock size={12} strokeWidth={2.5} />
                {duration}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-[16px] font-semibold text-slate-700 leading-relaxed">
            {description}
          </p>
        </div>
      </motion.div>

      {/* ── Benefits — staggered ── */}
      {Array.isArray(benefits) && benefits.length > 0 && (
        <div className="space-y-2.5">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + idx * 0.08, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center gap-3.5 px-5 py-3.5 bg-white rounded-2xl border border-slate-200/60 shadow-sm"
            >
              <div className="w-7 h-7 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                <CheckCircle2 size={14} className="text-sky-500" strokeWidth={2.5} />
              </div>
              <span className="text-[14px] font-medium text-slate-600 leading-snug">{benefit}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Extra slot */}
      {children && <div>{children}</div>}

      {/* ── CTA ── */}
      <motion.button
        ref={btnRef}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.22 }}
        onClick={handleStart}
        whileHover={{ translateY: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-2xl text-white font-bold text-[16px] flex items-center justify-center gap-2.5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 60%, #0284c7 100%)',
          boxShadow: '0 6px 24px -4px rgba(14,165,233,0.38), 0 2px 6px rgba(0,0,0,0.07)',
          height: '58px',
          letterSpacing: '-0.015em',
        }}
      >
        {/* Shimmer overlay */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.22) 50%, transparent 80%)', zIndex: 0 }}
        />
        <span className="relative z-10 flex items-center gap-2.5">
          {t('common.get_started', 'Get Started')}
          <ArrowRight size={18} strokeWidth={2.5} />
        </span>
      </motion.button>
    </div>
  );
};

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Pause, Play, RotateCcw, Wind } from 'lucide-react';
import { useSound } from '@/lib/hooks/useSound';
import { motion, AnimatePresence } from 'framer-motion';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n, { loadLocale } from './i18n';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';

// ─── Session Screen ────────────────────────────────────────────────────────────

const PHASES = [
  { label: 'breathe_in',  duration: 4 },
  { label: 'hold',        duration: 4 },
  { label: 'breathe_out', duration: 4 },
  { label: 'hold',        duration: 4 },
] as const;

const TOTAL_CYCLES = 4;

const PHASE_META = {
  breathe_in:  { scale: 1.0,  glowScale: 1.5, transitionDuration: 4, ease: [0.4, 0, 0.6, 1] as const },
  hold_in:     { scale: 1.0,  glowScale: 1.5, transitionDuration: 0.4, ease: [0.4, 0, 0.6, 1] as const },
  breathe_out: { scale: 0.55, glowScale: 0.9, transitionDuration: 4, ease: [0.4, 0, 0.6, 1] as const },
  hold_out:    { scale: 0.55, glowScale: 0.9, transitionDuration: 0.4, ease: [0.4, 0, 0.6, 1] as const },
};

function SessionScreen({ onComplete, onEnd }: { onComplete: () => void; onEnd: () => void }) {
  const { t } = useTranslation(undefined, { i18n });
  const { playBreathIn, playBreathOut, playHold, playPop } = useSound();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState<number>(PHASES[0].duration);
  const [cycle, setCycle] = useState(1);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phase = PHASES[phaseIndex];
  
  const metaKey = phase.label === 'hold' 
    ? (phaseIndex === 1 ? 'hold_in' : 'hold_out') 
    : phase.label as 'breathe_in' | 'breathe_out';
  const meta = PHASE_META[metaKey];

  const tick = useCallback(() => {
    setCountdown((prev) => {
      if (prev <= 1) {
        setPhaseIndex((pi) => {
          const next = (pi + 1) % PHASES.length;
          if (next === 0) {
            setCycle((c) => {
              if (c >= TOTAL_CYCLES) { onComplete(); return c; }
              return c + 1;
            });
          }
          return next;
        });
        return PHASES[(phaseIndex + 1) % PHASES.length].duration;
      }
      return prev - 1;
    });
  }, [phaseIndex, onComplete]);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [tick, paused]);

  useEffect(() => {
    if (paused) return;
    if (phaseIndex === 0) playBreathIn(PHASES[0].duration * 1000);
    else if (phaseIndex === 1 || phaseIndex === 3) playHold(PHASES[1].duration * 1000);
    else if (phaseIndex === 2) playBreathOut(PHASES[2].duration * 1000);
  }, [phaseIndex, paused, playBreathIn, playBreathOut, playHold]);

  const phaseColors: Record<string, string> = {
    breathe_in:  'rgba(56,189,248,0.18)',
    hold:        'rgba(99,210,190,0.18)',
    breathe_out: 'rgba(147,197,253,0.18)',
  };
  const glowColor = phaseColors[phase.label] ?? 'rgba(56,189,248,0.18)';

  return (
    <div className="flex flex-col items-center justify-center min-h-[62vh] relative">
      {/* Cycle dots */}
      <div className="absolute top-0 left-0 right-0 flex justify-center gap-3">
        {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i + 1 === cycle ? 1.3 : 1,
              backgroundColor: i + 1 <= cycle ? '#0ea5e9' : '#CBD5E1',
            }}
            transition={{ type: 'spring', damping: 15, stiffness: 280 }}
            className="w-2.5 h-2.5 rounded-full"
          />
        ))}
      </div>

      {/* Breathing circle */}
      <div className="flex flex-col items-center mt-14">
        <div className="relative flex items-center justify-center w-72 h-72">

          {/* Outer slow glow — breathes with the phase */}
          <motion.div
            animate={{ scale: paused ? 0.8 : meta.glowScale, opacity: paused ? 0 : 0.6 }}
            transition={{ duration: meta.transitionDuration, ease: meta.ease as [number,number,number,number] }}
            className="absolute inset-0 rounded-full"
            style={{ background: glowColor, filter: 'blur(36px)' }}
          />

          {/* Middle ring — faint border that expands */}
          <motion.div
            animate={{ scale: paused ? 0.75 : meta.scale * 1.18 }}
            transition={{ duration: meta.transitionDuration, ease: meta.ease as [number,number,number,number] }}
            className="absolute inset-0 rounded-full border-2 border-sky-300/30"
          />

          {/* Main circle */}
          <motion.div
            animate={{ scale: paused ? 0.72 : meta.scale }}
            transition={{ duration: meta.transitionDuration, ease: meta.ease as [number,number,number,number] }}
            className="w-56 h-56 rounded-full flex items-center justify-center relative z-10"
            style={{
              background: 'linear-gradient(145deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%)',
              boxShadow: '0 0 0 8px rgba(14,165,233,0.08), 0 16px 48px rgba(14,165,233,0.22)',
            }}
          >
            {/* Phase label + countdown */}
            <div className="text-center px-4">
              <AnimatePresence mode="wait">
                <motion.span
                  key={phase.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="text-white/90 font-bold text-base uppercase tracking-[0.15em] block"
                >
                  {t(phase.label, phase.label)}
                </motion.span>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.span
                  key={countdown}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-white font-light text-5xl tabular-nums mt-1 block leading-none"
                >
                  {countdown}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mt-16">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => { playPop(); setPaused(p => !p); }}
          className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center transition-all"
          style={paused
            ? { background: 'linear-gradient(135deg,#38bdf8,#0284c7)', boxShadow: '0 8px 24px rgba(14,165,233,0.3)' }
            : { background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(14,165,233,0.15)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', color: '#0284c7' }
          }
        >
          {paused
            ? <Play size={28} fill="white" className="text-white ml-1" />
            : <Pause size={28} fill="currentColor" />
          }
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => { playPop(); onEnd(); }}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-slate-400 hover:text-sky-600 transition-colors"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <RotateCcw size={20} strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* Phase instruction hint */}
      <motion.p
        key={phase.label}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: 0.5 }}
        className="mt-8 text-[12px] font-semibold text-sky-700 uppercase tracking-widest text-center"
      >
        {phase.label === 'breathe_in'
          ? t('instruction_in', 'breathe in slowly…')
          : phase.label === 'breathe_out'
          ? t('instruction_out', 'breathe out slowly…')
          : t('instruction_hold', 'gently hold…')}
      </motion.p>
    </div>
  );
}


// ─── Main Page ─────────────────────────────────────────────────────────────────

type Screen = 'overview' | 'session' | 'complete';

function BoxBreathingInner() {
  const { t } = useTranslation(undefined, { i18n });
  const [screen, setScreen] = useState<Screen>('overview');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lang = params.get('lang') || 'en';
      loadLocale(lang);
    }
  }, []);

  return (
    <PremiumLayout
      title={t('app_title', 'Box Breathing')}
      onReset={screen !== 'overview' ? () => setScreen('overview') : undefined}
    >
      <div className="w-full">
        <AnimatePresence mode="wait">
          {screen === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="w-full">
              <PremiumIntro
                title={t('app_title', 'Box Breathing')}
                description={t('app_description', '')}
                onStart={() => setScreen('session')}
                icon={<Wind size={32} />}
                benefits={[t('intro_p1', ''), t('intro_p2', ''), t('intro_p3', '')]}
                duration={t('app_duration', '5 minutes')}
              />
            </motion.div>
          )}
          {screen === 'session' && (
            <motion.div key="session" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="w-full">
              <SessionScreen onComplete={() => setScreen('complete')} onEnd={() => setScreen('overview')} />
            </motion.div>
          )}
          {screen === 'complete' && (
            <motion.div key="complete" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="w-full">
              <PremiumComplete
                title={t('app_title', 'Box Breathing')}
                message={t('app_complete_message', '')}
                onRestart={() => setScreen('session')}
                icon={<Wind size={48} />}
                  shareContent={"I just completed 'Box Breathing' on TherapyMantra — a guided breathing exercise that genuinely helped me. Try it! \n\n Android: https://play.google.com/store/apps/details?id=org.mantracare.therapy\n iOS: https://apps.apple.com/pk/app/therapymantra/id1607643888"}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumLayout>
  );
}

export default function BoxBreathingPage() {
  return (
    <I18nextProvider i18n={i18n}>
      <BoxBreathingInner />
    </I18nextProvider>
  );
}
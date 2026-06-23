'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, History, Check, X, Save, Sparkles, ArrowLeft, Loader2, Coffee, Smartphone, Wine } from "lucide-react";
import i18n, { loadLocale } from './i18n';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumComplete } from '@/components/shared/PremiumComplete';
import { apiPath } from '@/lib/apiPath';

// Stars canvas component for premium bedtime theme
const StarsCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Array<{ x: number; y: number; r: number; speed: number; phase: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();

    starsRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: 0.4 + Math.random() * 1.0,
      speed: 0.3 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
    }));

    let raf: number;
    const draw = (t: number) => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      for (const s of starsRef.current) {
        const opacity = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${opacity})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

interface HistoryEntry {
  id: string;
  date: string;
  score: number;
  rating: number;
  note: string;
}

function SleepAuditInner() {
  const { t } = useTranslation(undefined, { i18n });
  const [screen, setScreen] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [rating, setRating] = useState(3);
  const [note, setNote] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Localization sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lang = params.get('lang') || 'en';
      loadLocale(lang);
    }
  }, []);

  // Resource loaders
  const getOptions = () => {
    const raw = t("options", { returnObjects: true });
    if (Array.isArray(raw)) return raw as { emoji: string; text: string }[];
    return [
      { icon: <Coffee className="w-5 h-5" />, text: "Caffeine after 3 PM" },
      { icon: <Smartphone className="w-5 h-5" />, text: "Screens in bed (phone/tablet)" },
      { emoji: "⏰", text: "Inconsistent sleeping schedule" },
      { emoji: "", text: "Heavy meals close to bedtime" },
      { icon: <Wine className="w-5 h-5" />, text: "Alcohol close to bedtime" },
      { emoji: "", text: "Worrying or overthinking in bed" },
      { emoji: "️", text: "Uncomfortable bedroom environment" }
    ];
  };

  const getRatingLabels = () => {
    const raw = t("rating_labels", { returnObjects: true });
    if (Array.isArray(raw)) return raw as string[];
    return ["Very Poor", "Poor", "Average", "Good", "Excellent"];
  };

  const OPTIONS = getOptions();
  const RATING_LABELS = getRatingLabels();

  const getScoreInfo = (score: number) => {
    if (score >= 6) return { color: "#10B981", status: t("status_labels.track", "Great Sleep Track!") };
    if (score >= 4) return { color: "#F59E0B", status: t("status_labels.disruptions", "Minor Disruptions") };
    return { color: "#EF4444", status: t("status_labels.attention", "Needs Attention") };
  };

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(apiPath('/api/sleep-audit'));
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch sleep history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (showHistory || screen === 4) {
      fetchHistory();
    }
  }, [showHistory, screen, fetchHistory]);

  const handleSave = async () => {
    setIsSaving(true);
    const score = Math.max(0, Math.min(7, 7 - selected.size));
    const payload = {
      score,
      rating,
      note,
      selectedIndices: Array.from(selected)
    };

    try {
      const res = await fetch(apiPath('/api/sleep-audit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setScreen(4); // completed
      }
    } catch (error) {
      console.error("Failed to save audit:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const scoreValue = Math.max(0, Math.min(7, 7 - selected.size));
  const scoreInfo = getScoreInfo(scoreValue);

  if (screen === 4) {
    return (
      <PremiumComplete
        title={t("app_title", "Sleep Audit")}
        message={t("complete.message", `Your Sleep Quality Index is ${scoreValue}/7. A higher score means a more restful sleep cycle environment.`)}
        onRestart={() => {
          setScreen(0);
          setSelected(new Set());
          setRating(3);
          setNote("");
        }}
                  shareContent={"I just completed 'Sleep Audit' on TherapyMantra — a guided sleep improvement that genuinely helped me. Try it! \n\n Android: https://play.google.com/store/apps/details?id=org.mantracare.therapy\n iOS: https://apps.apple.com/pk/app/therapymantra/id1607643888"}
      >
        <div className="w-full max-w-md mx-auto mt-8 px-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScreen(0)}
            className="w-full py-5 rounded-[2rem] bg-white/60 backdrop-blur-md border border-white/60 shadow-inner text-slate-500 hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200/50"
          >
            <Moon size={20} className="animate-pulse" />
            {t("intro.more_insights", "Back to Start")}
          </motion.button>
        </div>
      </PremiumComplete>
    );
  }

  return (
    <PremiumLayout
      title={t("app_title", "Sleep Audit")}
      icon={<Moon className="w-6 h-6 text-primary animate-pulse" />}
      onBack={screen === 0 ? undefined : () => setScreen(prev => prev - 1)}
    >
      <div className="relative w-full max-w-md mx-auto min-h-[70vh] flex flex-col px-6 pb-12">
        <StarsCanvas />

        <div className="relative z-10 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {/* SCREEN 0: INTRO */}
            {screen === 0 && (
              <motion.div
                key="screen0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-10"
              >
                <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 flex items-center justify-center text-6xl shadow-2xl animate-pulse"><Moon className="inline-block w-8 h-8" /></div>
                <h1 className="text-3xl font-black text-slate-800">{t("intro.title", "Sleep Audit")}</h1>
                <p className="text-slate-500 text-base font-bold leading-relaxed max-w-[280px]">
                  {t("intro.description", "Evaluate your evening behaviors to discover what interrupts your resting state.")}
                </p>

                <div className="w-full space-y-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setScreen(1)}
                    className="act-btn-primary"
                  >
                    {t("intro.start_button", "Begin Sleep Audit")}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowHistory(true)}
                    className="w-full bg-white/10 backdrop-blur-md text-slate-650 py-5 rounded-2xl font-black text-lg border border-white/60 hover:bg-slate-50/50 hover:shadow-xl hover:shadow-primary/40/80 transition-all flex items-center justify-center gap-3 shadow-sm"
                  >
                    <History size={20} strokeWidth={2.5} />
                    {t("intro.history_button", "View Past Audits")}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 1: DISRUPTIONS CHECK */}
            {screen === 1 && (
              <motion.div
                key="screen1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col gap-6 py-6"
              >
                <div className="space-y-2">
                  <div className="inline-flex px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                    {t("screens.s1.phase", "Phase 1 of 2")}
                  </div>
                  <h2 className="text-2.5xl font-black text-slate-900 leading-tight">
                    {t("screens.s1.title", "Evening Disruptions")}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">
                    {t("screens.s1.desc", "Which of these have occurred in your routine in the past 24 hours? Select all that apply.")}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {OPTIONS.map((o, i) => {
                    const active = selected.has(i);
                    return (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.01, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const next = new Set(selected);
                          active ? next.delete(i) : next.add(i);
                          setSelected(next);
                        }}
                        className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all border ${
                          active
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10"
                            : "bg-white border-white/60 text-slate-800    hover:bg-slate-50  shadow-sm"
                        }`}
                      >
                        <span className="text-2xl shrink-0">{o.icon}</span>
                        <span className="flex-1 text-sm font-bold leading-tight">
                          {o.text}
                        </span>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                          active ? "bg-white/20 border-white/20" : "border-slate-205 "
                        }`}>
                          {active && <Check size={14} className="text-white" strokeWidth={4} />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setScreen(2)}
                  className="act-btn-primary mt-4"
                >
                  {t("buttons.continue", "Continue")}
                </button>
              </motion.div>
            )}

            {/* SCREEN 2: RATING & NOTES */}
            {screen === 2 && (
              <motion.div
                key="screen2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col gap-8 py-6"
              >
                <div className="space-y-2">
                  <div className="inline-flex px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                    {t("screens.s2.phase", "Phase 2 of 2")}
                  </div>
                  <h2 className="text-2.5xl font-black text-slate-900 leading-tight">
                    {t("screens.s2.title", "Sleep Quality Rating")}
                  </h2>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(n => {
                    const active = rating === n;
                    return (
                      <motion.button
                        key={n}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setRating(n)}
                        className={`flex flex-col items-center py-4 rounded-xl transition-all border ${
                          active
                            ? "bg-primary border-primary text-white scale-105 shadow-md shadow-primary/20"
                            : "bg-white border-white/60 text-slate-700    hover:bg-slate-50 "
                        }`}
                      >
                        <span className={`text-xl font-black ${active ? "text-white" : "text-slate-400"}`}>{n}</span>
                        <span className={`text-[8px] font-black uppercase mt-1 tracking-tighter ${active ? "text-white/80" : "text-slate-405 "}`}>
                          {RATING_LABELS[n - 1] || "—"}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    {t("screens.s2.label", "Personal Notes")}
                  </label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder={t("screens.s2.placeholder", "How did you feel when you woke up? Any thoughts on your sleep?")}
                    className="field-textarea"
                    rows={4}
                  />
                </div>

                <button
                  onClick={() => setScreen(3)}
                  className="act-btn-primary"
                >
                  {t("buttons.see_results", "Review Results")}
                </button>
              </motion.div>
            )}

            {/* SCREEN 3: RESULTS DIAGNOSTIC */}
            {screen === 3 && (
              <motion.div
                key="screen3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1 flex flex-col items-center gap-6 py-6 animate-fade-in"
              >
                <div className="p-8 rounded-[3rem] bg-white border border-white/60 shadow-2xl w-full flex flex-col items-center text-center">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="64"
                        fill="none"
                        stroke="#f1f5f9"
                        className=""
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="72"
                        cy="72"
                        r="64"
                        fill="none"
                        stroke={scoreInfo.color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 64}
                        initial={{ strokeDashoffset: 2 * Math.PI * 64 }}
                        animate={{ strokeDashoffset: (2 * Math.PI * 64) * (1 - scoreValue / 7) }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-black" style={{ color: scoreInfo.color }}>{scoreValue}</span>
                      <span className="field-label">
                        {t("screens.s3.score_label", "Score")}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black mt-8" style={{ color: scoreInfo.color }}>{scoreInfo.status}</h3>
                  <p className="text-sm text-slate-550 mt-4 leading-relaxed font-bold italic px-2">
                    {scoreValue >= 6 ? t("screens.s3.recommendations.solid", "Your evening hygiene is excellent. Keep maintaining these habits!") :
                     scoreValue >= 4 ? t("screens.s3.recommendations.some", "Some evening variables are active. Restricting caffeine or screens could boost sleep quality.") :
                     t("screens.s3.recommendations.many", "Multiple factors are impeding sleep depth. Implementing a consistent screen boundary is highly recommended.")}
                  </p>
                </div>

                <div className="w-full space-y-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="act-btn-primary"
                  >
                    <Save size={20} strokeWidth={3} />
                    {isSaving ? t("buttons.preserving", "Saving...") : t("buttons.preserve", "Preserve Sleep Audit")}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History Bottom Sheet Modal */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-end justify-center px-4 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="bg-white w-full max-w-md rounded-t-[3rem] p-8 pb-12 shadow-2xl max-h-[75vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
                  <h3 className="text-xl font-black text-slate-900">
                    {t("history.title", "Sleep Audits History")}
                  </h3>
                  <button onClick={() => setShowHistory(false)} className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 flex items-center justify-center">
                    <X size={20} className="text-slate-400" strokeWidth={3} />
                  </button>
                </div>

                {isLoadingHistory ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" />
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                      {t("loading", "Loading History...")}
                    </p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="w-14 h-14 bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <History size={28} />
                    </div>
                    <p className="text-slate-400 font-bold text-sm">
                      {t("history.no_entries", "No past audits found. Complete your first audit today.")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((e, i) => {
                      const info = getScoreInfo(e.score);
                      return (
                        <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 border border-white/60">
                          <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{e.date}</p>
                            <p className="text-sm font-black mt-1" style={{ color: info.color }}>{info.status}</p>
                            {e.note && (
                              <p className="text-xs text-slate-500 font-medium italic mt-2 line-clamp-2">
                                "{e.note}"
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end shrink-0 pl-4">
                            <span className="text-3xl font-black" style={{ color: info.color }}>{e.score}</span>
                            <span className="field-label">
                              {t("history.score_label", "/7")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumLayout>
  );
}

export default function SleepAuditPage() {
  return (
    <I18nextProvider i18n={i18n}>
      <SleepAuditInner />
    </I18nextProvider>
  );
}
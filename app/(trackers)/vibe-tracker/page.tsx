'use client';
import { parseDbDate } from '@/lib/dateUtils';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Clock, Calendar, ArrowRight, Check, History, Loader2, Wind, Sun, Flame, HeartHandshake, Anchor, CloudRain, Coffee, Activity, Battery, BatteryWarning } from 'lucide-react';
import i18n, { loadLocale } from './i18n';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';
import { apiPath } from '@/lib/apiPath';

type Screen = 'intro' | 'checkin' | 'reflection' | 'confirmation' | 'history';

const vibes = [
  { emoji: "calm", label: "Calm", icon: <Wind size={24} />, tint: "bg-emerald-50/50 border-emerald-100 text-emerald-800   " },
  { emoji: "light", label: "Light", icon: <Sun size={24} />, tint: "bg-amber-50/50 border-amber-100 text-amber-800   " },
  { emoji: "driven", label: "Driven", icon: <Flame size={24} />, tint: "bg-orange-50/50 border-orange-100 text-orange-800   " },
  { emoji: "content", label: "Content", icon: <HeartHandshake size={24} />, tint: "bg-pink-50/50 border-pink-100 text-pink-800   " },
  { emoji: "steady", label: "Steady", icon: <Anchor size={24} />, tint: "bg-blue-50/50 border-blue-100 text-blue-800   " },
  { emoji: "tender", label: "Tender", icon: <CloudRain size={24} />, tint: "bg-slate-50/50 border-white/60 text-slate-800   " },
  { emoji: "heavy", label: "Heavy", icon: <Coffee size={24} />, tint: "bg-indigo-50/50 border-indigo-100 text-indigo-800   " },
  { emoji: "thoughtful", label: "Thoughtful", icon: <Activity size={24} />, tint: "bg-teal-50/50 border-teal-100 text-teal-800   " },
  { emoji: "restless", label: "Restless", icon: <BatteryWarning size={24} />, tint: "bg-yellow-50/50 border-yellow-100 text-yellow-800   " },
  { emoji: "drained", label: "Drained", icon: <Battery size={24} />, tint: "bg-rose-50/50 border-rose-100 text-rose-800   " },
];

const vibeEmojiMap: Record<string, string> = vibes.reduce((acc, v) => ({ ...acc, [v.label]: v.emoji }), {});

interface VibeEntry {
  id: string;
  vibe: string;
  reflections: string[];
  timestamp: string;
}

function VibeTrackerInner() {
  const { t } = useTranslation(undefined, { i18n });
  const [screen, setScreen] = useState<Screen>('intro');
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [customVibe, setCustomVibe] = useState("");
  const [reflectionIndex, setReflectionIndex] = useState(0);
  const [reflectionAnswer, setReflectionAnswer] = useState("");
  const [reflectionAnswers, setReflectionAnswers] = useState<string[]>([]);
  const [historyEntries, setHistoryEntries] = useState<VibeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const promptKeys = ["needing", "happened", "speak", "notice", "sitOrShift", "ease", "kindness", "supported"];
  const [shuffledKeys, setShuffledKeys] = useState<string[]>([]);

  // Setup i18n locale and prompt shuffle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lang = params.get('lang') || 'en';
      loadLocale(lang);
    }
    // Shuffle prompts once on mount
    const shuffled = [...promptKeys].sort(() => Math.random() - 0.5).slice(0, 3);
    setShuffledKeys(shuffled);
  }, []);

  const currentVibe = selectedVibe || customVibe.trim();

  // Load history from /api/vibe-tracker
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiPath('/api/vibe-tracker'));
      if (res.ok) {
        const data = await res.json();
        setHistoryEntries(data);
      }
    } catch (err) {
      console.error('Failed to fetch vibe history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (screen === 'history') {
      fetchHistory();
    }
  }, [screen, fetchHistory]);

  const handleVibeSelected = () => {
    if (!currentVibe) return;
    setScreen("reflection");
  };

  const handleReflectionComplete = async (answersList: string[]) => {
    const entryId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    const newEntry = {
      id: entryId,
      vibe: currentVibe,
      reflections: answersList,
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch(apiPath('/api/vibe-tracker'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
    } catch (err) {
      console.error('Failed to save vibe entry:', err);
    }

    setScreen("confirmation");
  };

  const handleReflectionNext = () => {
    const nextAnswers = [...reflectionAnswers, reflectionAnswer];
    setReflectionAnswers(nextAnswers);

    if (reflectionIndex >= shuffledKeys.length - 1) {
      handleReflectionComplete(nextAnswers);
    } else {
      setReflectionAnswer("");
      setReflectionIndex((i) => i + 1);
    }
  };

  const handleDone = () => {
    setSelectedVibe(null);
    setCustomVibe("");
    setReflectionAnswers([]);
    setReflectionAnswer("");
    setReflectionIndex(0);
    setScreen("intro");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return t("today", "Today");
    if (date.toDateString() === yesterday.toDateString()) return t("yesterday", "Yesterday");

    return date.toLocaleDateString(i18n.language, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return parseDbDate(dateStr).toLocaleTimeString(i18n.language, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const groupedEntries = () => {
    const groups: Record<string, VibeEntry[]> = {};
    historyEntries.forEach((entry) => {
      const key = new Date(entry.timestamp).toDateString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  };

  const getTitle = () => {
    switch (screen) {
      case 'history': return t("screens.history.title", "Vibe History");
      case 'confirmation': return t("screens.confirmation.title", "Vibe Logged");
      case 'reflection': return t("screens.reflection.title", "Self-Reflection");
      default: return t("app_title", "Vibe Tracker");
    }
  };

  const getBackAction = () => {
    switch (screen) {
      case 'reflection':
        return () => {
          if (reflectionIndex > 0) {
            setReflectionIndex(reflectionIndex - 1);
            setReflectionAnswer(reflectionAnswers[reflectionIndex - 1] || "");
            setReflectionAnswers(reflectionAnswers.slice(0, -1));
          } else {
            setScreen("checkin");
          }
        };
      case 'checkin': return () => setScreen("intro");
      case 'history': return () => setScreen("intro");
      default: return undefined;
    }
  };

  return (
    <PremiumLayout
      title={getTitle()}
      icon={<Heart className="w-6 h-6 text-primary animate-pulse" />}
      onReset={screen !== 'intro' ? handleDone : undefined}
      onBack={getBackAction()}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-6 py-4 min-h-[70vh]">
        {screen === 'reflection' && shuffledKeys.length > 0 && (
          <div className="flex justify-center gap-2 mb-10">
            {shuffledKeys.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i <= reflectionIndex ? 'w-8 bg-primary' : 'w-2 bg-slate-150 '
                }`}
              />
            ))}
          </div>
        )}

        <div className="relative flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {/* INTRO SCREEN */}
            {screen === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="w-full flex-1 flex flex-col"
              >
                <PremiumIntro
                  title={t("app_title", "Vibe Tracker")}
                  description={t("app_description", "Tune in to your body & mind")}
                  onStart={() => setScreen("checkin")}
                  icon={<Sparkles size={32} />}
                  benefits={[
                    t('intro_p1', 'Gently identify your present emotion or mood state.'),
                    t('intro_p2', 'Reflect on what your energy or body is communicating.'),
                    t('intro_p3', 'Create a consistent timeline of your mental weather patterns.'),
                  ]}
                  duration={t('app_duration', "1-2 minutes")}
                >
                  <div className="mt-8 text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setScreen("history")}
                      className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm transition-colors"
                    >
                      <History size={18} />
                      {t("viewHistory", "View History")}
                    </motion.button>
                  </div>
                </PremiumIntro>
              </motion.div>
            )}

            {/* CHECKIN SCREEN */}
            {screen === 'checkin' && (
              <motion.div
                key="checkin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full flex-1 flex flex-col space-y-8"
              >
                <div className="space-y-2 text-left">
                  <h1 className="act-heading">
                    {t("rightNowIFeel", "Right now, I feel...")}
                  </h1>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {vibes.map((vibe, i) => (
                    <motion.button
                      key={vibe.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedVibe(vibe.label);
                        setCustomVibe("");
                      }}
                      className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all shadow-sm ${
                        selectedVibe === vibe.label
                          ? "bg-primary text-white border-primary"
                          : "bg-white/80 backdrop-blur-sm border-white text-slate-700 hover:border-sky-100"
                      }`}
                    >
                      <span className="mb-2 opacity-90">{vibe.icon}</span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                        {t(`vibes.${vibe.label}`, vibe.label)}
                      </span>
                    </motion.button>
                  ))}
                </div>

                <div className="space-y-3">
                  <label className="field-label">
                    {t("describeOwnVibe", "Or describe your own vibe")}
                  </label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder={t("rightNowIFeel", "Right now, I feel...")}
                    value={customVibe}
                    onChange={(e) => {
                      setCustomVibe(e.target.value);
                      if (e.target.value.trim()) setSelectedVibe(null);
                    }}
                  />
                </div>

                <div className="pt-2">
                  <button
                    disabled={!currentVibe}
                    onClick={handleVibeSelected}
                    className="act-btn-primary"
                  >
                    {t("saveVibe", "Save & Continue")}
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* REFLECTION SCREEN */}
            {screen === 'reflection' && shuffledKeys.length > 0 && (
              <motion.div
                key="reflection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full flex-1 flex flex-col space-y-8"
              >
                <div className="space-y-4 text-center">
                  <h1 className="act-heading">
                    {t("pauseAndReflect", "Pause & Reflect")}
                  </h1>
                </div>

                <p className="text-xl font-bold text-slate-700 text-center leading-relaxed px-4">
                  {t(`prompts.${shuffledKeys[reflectionIndex]}`, shuffledKeys[reflectionIndex])}
                </p>

                <div className="space-y-3">
                  <label className="field-label">
                    {t("typeThoughts", "Type your thoughts")}
                  </label>
                  <textarea
                    className="field-textarea min-h-[160px]"
                    placeholder={t("type_your_reflection_here", "Type your reflection here...")}
                    value={reflectionAnswer}
                    onChange={(e) => setReflectionAnswer(e.target.value)}
                  />
                </div>

                <div className="pt-2">
                  <button
                    disabled={!reflectionAnswer.trim()}
                    onClick={handleReflectionNext}
                    className="act-btn-primary"
                  >
                    {reflectionIndex >= shuffledKeys.length - 1 ? t("submitReflection", "Save Check-In") : t("next", "Next")}
                    {reflectionIndex >= shuffledKeys.length - 1 ? <Check size={15} strokeWidth={2.5} /> : <ArrowRight size={15} strokeWidth={2.5} />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* CONFIRMATION SCREEN */}
            {screen === 'confirmation' && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full flex-1 flex flex-col"
              >
                <PremiumComplete
                  title={t("app_title", "Vibe Tracker")}
                  message={t("thankYou", "Thank you for checking in with yourself.")}
                  onRestart={handleDone}
                  onHome={handleDone}
                  icon={<Heart size={48} fill="currentColor" className="text-primary animate-pulse" />}
                  shareContent={"I just completed 'Vibe Tracker' on TherapyMantra — a guided mood tracking that genuinely helped me. Try it! \n\n Android: https://play.google.com/store/apps/details?id=org.mantracare.therapy\n iOS: https://apps.apple.com/pk/app/therapymantra/id1607643888"}
                >
                  <div className="flex flex-col gap-4 mt-8 w-full max-w-sm mx-auto">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setScreen("history")}
                      className="w-full py-5 rounded-[2rem] bg-white/60 backdrop-blur-md border border-white/60 shadow-inner text-slate-500 font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200/50 hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center gap-3"
                    >
                      <Clock size={20} />
                      {t("viewHistory", "View History")}
                    </motion.button>
                  </div>
                </PremiumComplete>
              </motion.div>
            )}

            {/* HISTORY SCREEN */}
            {screen === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full flex-1 flex flex-col space-y-6 pb-20"
              >
                <div className="flex justify-between items-center">
                  <div className="text-left space-y-1">
                    <span className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest animate-pulse">
                      <Sparkles size={12} />
                      {t("yourJourney", "Your Journey")}
                    </span>
                    <h1 className="act-heading">
                      {t("yourJourney", "Mood Journey")}
                    </h1>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" />
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                      {t("loading", "Loading your path...")}
                    </p>
                  </div>
                ) : historyEntries.length === 0 ? (
                  <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-slate-300 shadow-sm">
                      <Calendar size={32} />
                    </div>
                    <p className="text-slate-400 font-medium text-sm">{t("noVibes", "No logged moods found.")}</p>
                    <button
                      onClick={() => setScreen("checkin")}
                      className="act-btn-primary"
                    >
                      {t("startFirstCheckIn", "Log Your First Vibe")}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {groupedEntries().map(([dateKey, dayEntries], groupIdx) => (
                      <div key={dateKey} className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">
                          {formatDate(dayEntries[0].timestamp)}
                        </p>

                        <div className="space-y-4">
                          {dayEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((entry, i) => {
                            const matchingVibe = vibes.find(v => v.label === entry.vibe);
                            return (
                              <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (groupIdx * 2 + i) * 0.05 }}
                                className="p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-sm space-y-3 relative overflow-hidden hover:border-sky-100 transition-all"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors ${matchingVibe?.tint || 'bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 '}`}>
                                      {(vibes.find(v => v.label === entry.vibe)?.icon || vibeEmojiMap[entry.vibe]) || "?"}
                                    </div>
                                    <div>
                                      <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                                        {t(`vibes.${entry.vibe}`, entry.vibe)}
                                      </h4>
                                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        <Clock size={10} />
                                        {formatTime(entry.timestamp)}
                                      </div>
                                    </div>
                                  </div>
                                  <Heart size={16} className="text-slate-100 group-hover:text-primary transition-colors animate-pulse" fill="currentColor" />
                                </div>

                                {entry.reflections && entry.reflections.length > 0 && entry.reflections.some(r => r && r.trim()) && (
                                  <div className="space-y-3 pt-2">
                                    {entry.reflections
                                      .filter((r) => r.trim())
                                      .map((reflection, idx) => (
                                        <p
                                          key={idx}
                                          className="text-slate-600 text-sm font-bold leading-relaxed line-clamp-3 italic"
                                        >
                                          "{reflection}"
                                        </p>
                                      ))}
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumLayout>
  );
}

export default function VibeTrackerPage() {
  return (
    <I18nextProvider i18n={i18n}>
      <VibeTrackerInner />
    </I18nextProvider>
  );
}
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Calendar, Plus, ChevronLeft, ChevronRight, Check, History, Loader2, Sparkles, Pencil, CalendarDays, Home, ArrowLeft, Frown, Moon, Smile } from "lucide-react";
import i18n, { loadLocale } from './i18n';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';
import { apiPath } from '@/lib/apiPath';

// --- Constants & Types ---

interface SelfCareEntry {
  date: string;
  didSelfCare: boolean | null;
  activities: string[];
  duration: string;
  preventionReasons: string[];
  helpfulType: string;
  mood: string;
  moodEmoji: string;
}

const ACTIVITIES = [
  "Exercise", "Meditation", "Journaling", "Reading",
  "Rest", "Nap", "Skincare", "Healthy Meal", "Nature", "Walk",
  "Social Time", "Hobby", "Therapy", "Digital Detox",
];

const DURATIONS = [
  "< 10 minutes", "10–30 minutes", "30–60 minutes", "1+ hour",
];

const PREVENTION_REASONS = [
  "Busy schedule", "Low energy", "Stress", "Forgot",
  "No motivation", "Not feeling well", "Lack of time", "Emotional overwhelm",
];

const HELPFUL_TYPES = [
  "Rest", "Relaxation", "Physical activity",
  "Talking to someone", "Quiet time", "Creative activity",
];

const MOODS = [
  { emoji: "", icon: <Smile className="w-5 h-5" />, label: "Happy" },
  { emoji: "", icon: <Smile className="w-5 h-5" />, label: "Calm" },
  { emoji: "", icon: <Smile className="w-5 h-5" />, label: "Neutral" },
  { emoji: "", icon: <Frown className="w-5 h-5" />, label: "Low" },
  { emoji: "", icon: <Frown className="w-5 h-5" />, label: "Stressed" },
  { emoji: "", icon: <Moon className="w-5 h-5" />, label: "Tired" },
];

const POSITIVE_STATEMENTS = [
  "You showed up for yourself today. That's powerful. ",
  "Self-care isn't selfish — it's essential. Well done. ",
  "Every small act of care builds a stronger you. ",
  "You invested in yourself today. That matters. ",
  "Taking care of you is the best thing you did today. ",
];

const SUPPORTIVE_STATEMENTS = [
  "It's okay. Tomorrow is a fresh start. Be gentle with yourself. ",
  "Not every day will be perfect, and that's perfectly fine. ️",
  "You're doing your best. That's always enough. ",
  "Rest is also a form of self-care. Give yourself grace. ",
  "Acknowledging today takes courage. You're already growing. ",
];

const toLocalIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateShort = (dateStr: string) => {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
};

// --- Sub-components ---

function OptionChip({
  label,
  selected,
  onToggle,
  emoji,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
  emoji?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onToggle}
      className={`px-5 py-3 rounded-full font-bold text-sm border transition-all flex items-center gap-2 ${
        selected
          ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 shadow-primary/20"
          : "bg-white  border-white/60  text-slate-600  hover:bg-slate-50  hover:shadow-xl hover:shadow-primary/40"
      }`}
    >
      {emoji && <span>{emoji}</span>}
      {label}
    </motion.button>
  );
}

function ContinueButton({
  onClick,
  disabled,
  isLoading,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  label?: string;
}) {
  const { t } = useTranslation(undefined, { i18n });

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-20">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        disabled={disabled || isLoading}
        className="w-full py-5 rounded-[2rem] bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:shadow-none"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {label || t('common.continue', 'Continue')}
            <ChevronRight size={20} />
          </>
        )}
      </motion.button>
    </div>
  );
}

// --- Main App Page ---

type Screen = "intro" | "checkin" | "activities" | "duration" | "noSelfCare" | "mood" | "statement" | "review" | "history";

function CareTrackerInner() {
  const { t } = useTranslation(undefined, { i18n });
  const [screen, setScreen] = useState<Screen>("intro");
  const [isSaving, setIsSaving] = useState(false);
  const [historyList, setHistoryList] = useState<SelfCareEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [date, setDate] = useState(new Date());
  const [entry, setEntry] = useState<SelfCareEntry>({
    date: toLocalIsoDate(new Date()),
    didSelfCare: null,
    activities: [],
    duration: "",
    preventionReasons: [],
    helpfulType: "",
    mood: "",
    moodEmoji: "",
  });

  const [customActivity, setCustomActivity] = useState("");
  const [customList, setCustomList] = useState<string[]>([]);
  const [statementInfo, setStatementInfo] = useState({ text: "", index: 0 });

  // Dynamic localization param loader
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lang = params.get('lang') || 'en';
      loadLocale(lang);
    }
  }, []);

  const resetFlow = useCallback(() => {
    const today = new Date();
    setDate(today);
    setEntry({
      date: toLocalIsoDate(today),
      didSelfCare: null,
      activities: [],
      duration: "",
      preventionReasons: [],
      helpfulType: "",
      mood: "",
      moodEmoji: "",
    });
    setCustomList([]);
    setScreen("checkin");
  }, []);

  const handleDateChange = (dateVal: string) => {
    const d = new Date(dateVal + "T00:00:00");
    setDate(d);
    setEntry((prev) => ({ ...prev, date: dateVal }));
  };

  const handleCheckIn = (didSelfCare: boolean) => {
    setEntry((prev) => ({ ...prev, didSelfCare }));
    setScreen(didSelfCare ? "activities" : "noSelfCare");
  };

  // Screen 2 Activities toggle helper
  const toggleActivity = (act: string) => {
    setEntry((prev) => ({
      ...prev,
      activities: prev.activities.includes(act)
        ? prev.activities.filter((a) => a !== act)
        : [...prev.activities, act],
    }));
  };

  const addCustomActivity = () => {
    const trimmed = customActivity.trim();
    if (trimmed && !customList.includes(trimmed) && !ACTIVITIES.includes(trimmed)) {
      setCustomList((prev) => [...prev, trimmed]);
      setEntry((prev) => ({ ...prev, activities: [...prev.activities, trimmed] }));
      setCustomActivity("");
    }
  };

  // Screen 3 NoSelfCare toggle helper
  const toggleReason = (r: string) => {
    setEntry((prev) => ({
      ...prev,
      preventionReasons: prev.preventionReasons.includes(r)
        ? prev.preventionReasons.filter((item) => item !== r)
        : [...prev.preventionReasons, r],
    }));
  };

  const handleMoodSelect = (moodLabel: string, moodEmoji: string) => {
    setEntry((prev) => ({
      ...prev,
      mood: prev.mood === moodLabel ? "" : moodLabel,
      moodEmoji: prev.mood === moodLabel ? "" : moodEmoji,
    }));
  };

  const handleMoodContinue = () => {
    // Select randomized statement
    const list = entry.didSelfCare ? POSITIVE_STATEMENTS : SUPPORTIVE_STATEMENTS;
    const idx = Math.floor(Math.random() * list.length);
    setStatementInfo({ text: list[idx], index: idx });
    setScreen("statement");
  };

  const handleStatementContinue = async () => {
    setIsSaving(true);
    try {
      await fetch(apiPath('/api/care-tracker'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (err) {
      console.error("Save selfcare entry failed:", err);
    } finally {
      setIsSaving(false);
      setScreen("review");
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(apiPath('/api/care-tracker'));
      if (res.ok) {
        const data = await res.json();
        // filter last 7 entries
        setHistoryList(data.slice(0, 7));
      }
    } catch (err) {
      console.error("Load selfcare logs failed:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleViewHistory = () => {
    loadHistory();
    setScreen("history");
  };

  const getTitle = () => {
    switch (screen) {
      case 'history': return t('screens.history.title', 'Your Progress');
      case 'review': return t('screens.review.title', 'Review Today');
      default: return t('app_title', 'Self-Care Log');
    }
  };

  const screenOrder: Screen[] = ["intro", "checkin", "activities", "duration", "noSelfCare", "mood", "statement", "review", "history"];
  const currentIdx = screenOrder.indexOf(screen);

  return (
    <PremiumLayout
      title={getTitle()}
      icon={<Activity className="w-6 h-6 text-primary" />}
      onReset={screen !== 'intro' && screen !== 'review' ? resetFlow : undefined}
    >
      <div className="w-full max-w-md mx-auto min-h-[70vh]">
        {screen !== 'intro' && screen !== 'review' && screen !== 'history' && screen !== 'statement' && (
          <div className="flex justify-center gap-2 mb-10">
            {["checkin", "activities/noSelfCare", "duration", "mood"].map((s, i) => {
              const currentStepIdx = entry.didSelfCare === false && s === "duration" ? -1 : i;
              if (currentStepIdx === -1) return null;
              
              let stepFilled = false;
              if (screen === "checkin" && i === 0) stepFilled = true;
              if ((screen === "activities" || screen === "noSelfCare") && i <= 1) stepFilled = true;
              if (screen === "duration" && i <= 2) stepFilled = true;
              if (screen === "mood" && i <= 3) stepFilled = true;

              return (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-550 ${
                    stepFilled ? "w-8 bg-primary" : "w-2 bg-slate-100 "
                  }`}
                />
              );
            })}
          </div>
        )}

        <div className="relative flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* 1. Intro Screen */}
            {screen === "intro" && (
              <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="w-full">
                <PremiumIntro
                  title={t('app_title', 'Self-Care Log')}
                  description={t('screens.intro.description', 'Track and reflect on your daily self-care habits to nurture well-being.')}
                  onStart={() => setScreen("checkin")}
                  icon={<Activity size={32} />}
                  benefits={[
                    t('screens.intro.benefit1', 'Log daily physical and mental wellness acts'),
                    t('screens.intro.benefit2', 'Notice challenges keeping you from rest'),
                    t('screens.intro.benefit3', 'Build mindfulness through positive reinforcement'),
                  ]}
                  duration={t('screens.intro.duration', '2-3 minutes')}
                />
              </motion.div>
            )}

            {/* 2. Check-In (Date & Yes/No) */}
            {screen === "checkin" && (
              <motion.div key="checkin" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="w-full space-y-8 pb-32">
                <div className="space-y-2">
                  <h1 className="act-heading">
                    {t('screens.checkin.title', 'Checking In')}
                  </h1>
                  <p className="text-slate-500 text-sm">
                    {t('screens.checkin.subtitle', 'First, select the date for your entry.')}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {t('common.date', 'Date')}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="date"
                      value={entry.date}
                      max={toLocalIsoDate(new Date())}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="field-input w-full py-5 px-6 rounded-[2rem] bg-white border border-slate-100 text-slate-700 font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {t('screens.checkin.question', 'Did you make time for self-care today?')}
                  </label>
                  <div className="flex gap-4">
                    <OptionChip
                      label={t('common.yes', 'Yes')}
                      selected={entry.didSelfCare === true}
                      onToggle={() => handleCheckIn(true)}
                      emoji=""
                    />
                    <OptionChip
                      label={t('common.no', 'No')}
                      selected={entry.didSelfCare === false}
                      onToggle={() => handleCheckIn(false)}
                      emoji=""
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. Yes Self Care Activities select */}
            {screen === "activities" && (
              <motion.div key="activities" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="w-full space-y-8 pb-32">
                <div className="space-y-2">
                  <h1 className="act-heading">
                    {t('screens.activities.title', 'Self-Care Activities')}
                  </h1>
                  <p className="text-slate-500 text-sm">
                    {t('screens.activities.subtitle', 'What acts of self-care did you practice today?')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {ACTIVITIES.map((act) => (
                    <OptionChip
                      key={act}
                      label={t(`data.activities.${act}`, act)}
                      selected={entry.activities.includes(act)}
                      onToggle={() => toggleActivity(act)}
                    />
                  ))}
                  {customList.map((act) => (
                    <OptionChip
                      key={act}
                      label={act}
                      selected={entry.activities.includes(act)}
                      onToggle={() => toggleActivity(act)}
                    />
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    value={customActivity}
                    onChange={(e) => setCustomActivity(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomActivity()}
                    placeholder={t('common.add_activity', 'Add custom activity...')}
                    className="flex-1 py-5 px-6 rounded-2xl bg-white border border-white/60 text-slate-700 placeholder:text-slate-300 font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  />
                  <button
                    onClick={addCustomActivity}
                    disabled={!customActivity.trim()}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/20 disabled:opacity-40"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                <ContinueButton
                  onClick={() => setScreen("duration")}
                  disabled={entry.activities.length === 0}
                />
              </motion.div>
            )}

            {/* 4. Duration Select */}
            {screen === "duration" && (
              <motion.div key="duration" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="w-full space-y-8 pb-32">
                <div className="space-y-2">
                  <h1 className="act-heading">
                    {t('screens.duration.title', 'Time Spent')}
                  </h1>
                  <p className="text-slate-505 text-sm">
                    {t('screens.duration.subtitle', 'Roughly how long did you spend practicing self-care?')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-4">
                  {DURATIONS.map((dur) => (
                    <OptionChip
                      key={dur}
                      label={t(`data.durations.${dur}`, dur)}
                      selected={entry.duration === dur}
                      onToggle={() => setEntry((prev) => ({ ...prev, duration: prev.duration === dur ? "" : dur }))}
                    />
                  ))}
                </div>

                <ContinueButton
                  onClick={() => setScreen("mood")}
                  disabled={!entry.duration}
                />
              </motion.div>
            )}

            {/* 5. No Self Care reasons select */}
            {screen === "noSelfCare" && (
              <motion.div key="noSelfCare" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="w-full space-y-8 pb-32">
                <div className="space-y-2">
                  <h1 className="act-heading">
                    {t('screens.noSelfCare.title', 'Understand Today')}
                  </h1>
                  <p className="text-slate-500 text-sm">
                    {t('screens.noSelfCare.subtitle', "Let's reflect gently on what kept you from self-care.")}
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {t('screens.noSelfCare.question1', 'What obstacles stood in your way? (Select all that apply)')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PREVENTION_REASONS.map((r) => (
                      <OptionChip
                        key={r}
                        label={t(`data.reasons.${r}`, r)}
                        selected={entry.preventionReasons.includes(r)}
                        onToggle={() => toggleReason(r)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {t('screens.noSelfCare.question2', 'What type of support would be most helpful to you right now?')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {HELPFUL_TYPES.map((ht) => (
                      <OptionChip
                        key={ht}
                        label={t(`data.helpfulTypes.${ht}`, ht)}
                        selected={entry.helpfulType === ht}
                        onToggle={() => setEntry((prev) => ({ ...prev, helpfulType: prev.helpfulType === ht ? "" : ht }))}
                      />
                    ))}
                  </div>
                </div>

                <ContinueButton
                  onClick={() => setScreen("mood")}
                  disabled={entry.preventionReasons.length === 0 || !entry.helpfulType}
                />
              </motion.div>
            )}

            {/* 6. Mood Selection */}
            {screen === "mood" && (
              <motion.div key="mood" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="w-full space-y-8 pb-32">
                <div className="space-y-2">
                  <h1 className="act-heading">
                    {t('screens.mood.title', 'Your Mood')}
                  </h1>
                  <p className="text-slate-500 text-sm">
                    {t('screens.mood.subtitle', 'How do you feel overall today?')}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4">
                  {MOODS.map((m) => {
                    const isSelected = entry.mood === m.label;
                    return (
                      <button
                        key={m.label}
                        onClick={() => handleMoodSelect(m.label, m.emoji)}
                        className={`flex flex-col items-center gap-3 rounded-3xl border p-5 transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? "border-primary bg-primary/10  text-slate-900 "
                            : "border-white/60  bg-white  hover:border-primary/30 text-slate-500 "
                        }`}
                      >
                        <span className="text-4xl flex items-center justify-center">{m.icon || m.emoji}</span>
                        <span className="text-xs font-bold uppercase tracking-wider">{t(`data.moods.${m.label}`, m.label)}</span>
                      </button>
                    );
                  })}
                </div>

                <ContinueButton
                  onClick={handleMoodContinue}
                  disabled={!entry.mood}
                />
              </motion.div>
            )}

            {/* 7. Motivational Quote statement splash */}
            {screen === "statement" && (
              <motion.div key="statement" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="w-full space-y-8 pb-32">
                <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                  <div className="flex justify-center mb-8">{entry.didSelfCare ? <Sparkles className="w-20 h-20 text-primary" /> : <Moon className="w-20 h-20 text-primary" />}</div>
                  <p className="font-display text-2xl font-bold leading-relaxed tracking-tight px-4 text-slate-850">
                    {entry.didSelfCare
                      ? t(`data.positiveStatements.${statementInfo.index}`, statementInfo.text)
                      : t(`data.supportiveStatements.${statementInfo.index}`, statementInfo.text)}
                  </p>
                </div>

                <ContinueButton
                  onClick={handleStatementContinue}
                  isLoading={isSaving}
                />
              </motion.div>
            )}

            {/* 8. Summary Review Sheet */}
            {screen === "review" && (
              <motion.div key="review" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="w-full">
                <PremiumComplete
                  title={t('app_title', 'Self-Care Log')}
                  message={t('screens.review.subtitle', "Fantastic work reflecting on today's self-care habits.")}
                  onRestart={resetFlow}
                  shareContent={"I just completed 'Self-Care Log' on TherapyMantra — a guided self-care tracking that genuinely helped me. Try it! \n\n Android: https://play.google.com/store/apps/details?id=org.mantracare.therapy\n iOS: https://apps.apple.com/pk/app/therapymantra/id1607643888"}
                >
                  <div className="grid gap-3 w-full max-w-md mx-auto mt-10">
                    <div className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-50 shadow-sm">
                      <span className="text-[10px] font-black text-slate-350 uppercase tracking-[0.2em]">{t('common.date', 'Date')}</span>
                      <span className="text-base font-bold text-slate-700">{formatDateShort(entry.date)}</span>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-50 shadow-sm">
                      <span className="text-[10px] font-black text-slate-350 uppercase tracking-[0.2em]">{t('screens.review.didSelfCare', 'Self-Care')}</span>
                      <span className="text-base font-bold text-slate-700">
                        {entry.didSelfCare ? `${t('common.yes', 'Yes')} ` : `${t('common.no', 'No')} `}
                      </span>
                    </div>

                    {entry.didSelfCare ? (
                      <>
                        {entry.activities.length > 0 && (
                          <div className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-50 shadow-sm">
                            <span className="text-[10px] font-black text-slate-350 uppercase tracking-[0.2em]">{t('screens.review.activities', 'Activities')}</span>
                            <span className="text-base font-bold text-slate-700 max-w-[200px] text-right truncate">
                              {entry.activities.map((a) => t(`data.activities.${a}`, a)).join(", ")}
                            </span>
                          </div>
                        )}
                        {entry.duration && (
                          <div className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-50 shadow-sm">
                            <span className="text-[10px] font-black text-slate-350 uppercase tracking-[0.2em]">{t('screens.review.duration', 'Duration')}</span>
                            <span className="text-base font-bold text-slate-700">{t(`data.durations.${entry.duration}`, entry.duration)}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {entry.preventionReasons.length > 0 && (
                          <div className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-50 shadow-sm">
                            <span className="text-[10px] font-black text-slate-350 uppercase tracking-[0.2em]">{t('screens.review.challenges', 'Challenges')}</span>
                            <span className="text-base font-bold text-slate-700 max-w-[200px] text-right truncate">
                              {entry.preventionReasons.map((r) => t(`data.reasons.${r}`, r)).join(", ")}
                            </span>
                          </div>
                        )}
                        {entry.helpfulType && (
                          <div className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-50 shadow-sm">
                            <span className="text-[10px] font-black text-slate-350 uppercase tracking-[0.2em]">{t('screens.review.whatHelps', 'What helps')}</span>
                            <span className="text-base font-bold text-slate-700">{t(`data.helpfulTypes.${entry.helpfulType}`, entry.helpfulType)}</span>
                          </div>
                        )}
                      </>
                    )}

                    {entry.mood && (
                      <div className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-50 shadow-sm">
                        <span className="text-[10px] font-black text-slate-350 uppercase tracking-[0.2em]">{t('screens.review.mood', 'Mood')}</span>
                        <span className="text-base font-bold text-slate-700">
                          {MOODS.find(m => m.label === entry.mood)?.icon || entry.moodEmoji} {t(`data.moods.${entry.mood}`, entry.mood)}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-8">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={resetFlow}
                        className="py-5 rounded-2xl bg-white border border-white/60 text-slate-500 font-black text-[10px] uppercase tracking-widest shadow-sm flex items-center justify-center gap-2 hover:text-primary hover:border-primary/20 transition-all"
                      >
                        <Pencil size={16} />
                        {t('screens.review.editToday', 'Edit Entry')}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleViewHistory}
                        className="py-5 rounded-2xl bg-white border border-white/60 text-slate-500 font-black text-[10px] uppercase tracking-widest shadow-sm flex items-center justify-center gap-2 hover:text-primary hover:border-primary/20 transition-all"
                      >
                        <CalendarDays size={16} />
                        {t('screens.review.viewHistory', 'View History')}
                      </motion.button>
                    </div>
                  </div>
                </PremiumComplete>
              </motion.div>
            )}

            {/* 9. History Progress Logs Card list */}
            {screen === "history" && (
              <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="w-full space-y-6 pb-12">
                <div className="text-left flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-1">
                      {t('screens.history.title', 'Your Progress')}
                    </h2>
                    <p className="text-slate-505 text-sm font-medium">
                      {t('your_progress_over_the_last_7_days', 'Your progress over the last 7 days')}
                    </p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setScreen("review")} 
                    className="p-3 bg-slate-100 text-slate-650 rounded-2xl hover:bg-slate-200 hover:shadow-xl hover:shadow-primary/40 transition-colors shadow-sm"
                  >
                    <ArrowLeft size={20} />
                  </motion.button>
                </div>

                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                      {t('fetching_data', 'Fetching data...')}
                    </p>
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="text-center py-16 bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 rounded-3xl border border-dashed border-white/60">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200 shadow-sm">
                      <History size={32} />
                    </div>
                    <p className="text-slate-400 font-bold text-sm px-8">
                      {t('screens.history.subtitle', 'No entries yet. Start your self-care journey today.')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyList.map((entryItem, i) => {
                      const keyInfo = entryItem.didSelfCare
                        ? (entryItem.activities && entryItem.activities[0] ? t(`data.activities.${entryItem.activities[0]}`, entryItem.activities[0]) : t('common.yes', 'Yes'))
                        : (entryItem.preventionReasons && entryItem.preventionReasons[0] ? t(`data.reasons.${entryItem.preventionReasons[0]}`, entryItem.preventionReasons[0]) : t('common.no', 'No'));

                      return (
                        <motion.div
                          key={entryItem.date}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="group bg-white rounded-[2rem] border border-white/60 p-6 flex items-center justify-between transition-all hover:border-primary/20 hover:shadow-md"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 flex items-center justify-center text-2xl group-hover:bg-primary/10 transition-colors">
                              {MOODS.find(m => m.label === entryItem.mood)?.icon || entryItem.moodEmoji || <Calendar size={24} className="text-slate-300" />}
                            </div>
                            <div>
                              <p className="field-label">
                                {formatDateShort(entryItem.date)}
                              </p>
                              <p className="text-base font-bold text-slate-800 mt-0.5 line-clamp-1">
                                {keyInfo}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                              entryItem.didSelfCare
                                ? "bg-primary/10 text-primary"
                                : "bg-slate-100  text-slate-400 "
                            }`}
                          >
                            {entryItem.didSelfCare ? t('common.yes', 'Yes') : t('common.no', 'No')}
                          </div>
                        </motion.div>
                      );
                    })}
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

export default function CareTrackerPage() {
  return (
    <I18nextProvider i18n={i18n}>
      <CareTrackerInner />
    </I18nextProvider>
  );
}
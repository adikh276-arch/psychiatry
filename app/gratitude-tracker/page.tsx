'use client';
import React from 'react';
import { parseDbDate } from '@/lib/dateUtils';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, Sparkles, Heart, ArrowLeft, ArrowRight, Smile, Check, History, Sun, Cloud, CloudRain, CloudLightning } from 'lucide-react';
import i18n, { loadLocale } from './i18n';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';
import { apiPath } from '@/lib/apiPath';

// --- Types & Constants ---

type Screen = 'overview' | 'entry' | 'mood' | 'review' | 'history';

interface MoodOption {
  emoji: string;
  label: string;
  icon?: React.ReactNode;
}

const MOODS: MoodOption[] = [
  { emoji: "happy", label: "Happy", icon: <Sun size={24} className="text-amber-500" /> },
  { emoji: "calm", label: "Calm", icon: <Smile size={24} className="text-emerald-500" /> },
  { emoji: "neutral", label: "Neutral", icon: <Cloud size={24} className="text-slate-500" /> },
  { emoji: "low", label: "Low", icon: <CloudRain size={24} className="text-indigo-500" /> },
  { emoji: "stressed", label: "Stressed", icon: <CloudLightning size={24} className="text-rose-500" /> },
];

interface GratitudeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  gratitude1: string;
  gratitude2?: string;
  mood: MoodOption;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toLocalIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Gratitude Tracker Inner ---

function GratitudeTrackerInner() {
  const { t } = useTranslation(undefined, { i18n });
  const [screen, setScreen] = useState<Screen>('overview');

  // Input states
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [currentEntryId, setCurrentEntryId] = useState('');

  // History states
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [historyList, setHistoryList] = useState<GratitudeEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<GratitudeEntry | null>(null);

  // Sync lang URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lang = params.get('lang') || 'en';
      loadLocale(lang);
    }
  }, []);

  // Fetch month entries based on currentMonth (YYYY-MM)
  const fetchMonthEntries = useCallback(async (dateObj: Date) => {
    setHistoryLoading(true);
    const year = dateObj.getFullYear();
    const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
    const monthParam = `${year}-${monthStr}`;

    try {
      const res = await fetch(apiPath(`/api/gratitude-tracker?month=${monthParam}`));
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((row: any) => ({
          id: row.id,
          date: row.date,
          gratitude1: row.gratitude1,
          gratitude2: row.gratitude2 || '',
          mood: {
            emoji: row.mood_emoji,
            label: row.mood_label,
          },
        }));
        setHistoryList(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch gratitude logs:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (screen === 'history') {
      fetchMonthEntries(currentMonth);
    }
  }, [screen, currentMonth, fetchMonthEntries]);

  // Submit today's entry
  const handleSaveEntry = async () => {
    if (!selectedMood || !gratitude1.trim()) return;

    const dateStr = toLocalIsoDate(new Date());
    const id = currentEntryId || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15));

    const payload = {
      id,
      date: dateStr,
      gratitude1,
      gratitude2,
      moodEmoji: selectedMood.emoji,
      moodLabel: selectedMood.label,
    };

    try {
      const res = await fetch(apiPath('/api/gratitude-tracker'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert("SAVE FAILED: " + JSON.stringify(errData));
        return;
      }
      setCurrentEntryId(id);
      setScreen('review');
    } catch (err) {
      console.error('Failed to save gratitude log:', err);
    }
  };

  const handleResetFlow = () => {
    setScreen('overview');
    setGratitude1('');
    setGratitude2('');
    setSelectedMood(null);
    setCurrentEntryId('');
    setSelectedHistoryEntry(null);
  };

  const handleEditEntry = () => {
    setScreen('entry');
  };

  // Calendar Math using native Date objects
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startOfWeek = firstDay.getDay();

    const totalDays = new Date(year, month + 1, 0).getDate();
    const list = Array.from({ length: totalDays }, (_, i) => new Date(year, month, i + 1));

    return {
      startOfWeek,
      list,
    };
  }, [currentMonth]);

  const entryDatesMap = useMemo(() => {
    const map = new Map<string, GratitudeEntry>();
    historyList.forEach((e) => {
      if (!map.has(e.date)) {
        map.set(e.date, e);
      }
    });
    return map;
  }, [historyList]);

  const handleDateClick = (dayObj: Date) => {
    const isoStr = toLocalIsoDate(dayObj);
    const entry = entryDatesMap.get(isoStr);
    if (entry) {
      setSelectedHistoryEntry(entry);
    } else {
      setSelectedHistoryEntry(null);
    }
  };

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(nextMonth);
    setSelectedHistoryEntry(null);
  };

  const canContinue = gratitude1.trim().length > 0;

  const screenOrder: Screen[] = ['overview', 'entry', 'mood', 'review'];
  const currentIdx = screenOrder.indexOf(screen);

  return (
    <PremiumLayout
      title={t('app_title', 'Gratitude Journal')}
      icon={<Heart className="w-6 h-6 text-primary" />}
      onBack={currentIdx > 0 && screen !== 'review' ? handleResetFlow : undefined}
      onReset={currentIdx > 0 && screen !== 'review' ? handleResetFlow : undefined}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-6 py-4 min-h-[70vh] text-center">
        {screen !== 'review' && screen !== 'history' && (
          <div className="flex justify-center gap-2 mb-10">
            {screenOrder.slice(0, 3).map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i <= currentIdx ? 'w-8 bg-primary' : 'w-2 bg-slate-150 '
                }`}
              />
            ))}
          </div>
        )}

        <div className="relative flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {/* SCREEN 1: OVERVIEW */}
            {screen === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="w-full flex-1 flex flex-col"
              >
                <PremiumIntro
                  title={t('app_title', 'Gratitude Journal')}
                  description={t('app.description', 'Track your daily gratitude and mood for better mental wellness')}
                  onStart={() => setScreen('entry')}
                  icon={<Heart size={32} />}
                  benefits={[
                    t('intro_p1', 'Improve your emotional wellbeing'),
                    t('intro_p2', 'Focus on the positive things'),
                    t('intro_p3', 'Build a lasting habit of gratitude'),
                  ]}
                  duration={t('app_duration', '2-3 minutes')}
                >
                  <div className="mt-8 flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setScreen('history')}
                      className="flex items-center gap-3 text-slate-500 hover:text-primary font-bold text-xs uppercase tracking-widest transition-all bg-white px-6 py-3 rounded-2xl border border-white/60 shadow-sm"
                    >
                      <CalendarIcon size={16} />
                      {t('review.history', 'View History')}
                    </motion.button>
                  </div>
                </PremiumIntro>
              </motion.div>
            )}

            {/* SCREEN 2: GRATITUDE ITEMS */}
            {screen === 'entry' && (
              <motion.div
                key="entry"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full flex-1 flex flex-col space-y-6 text-left"
              >
                <div className="space-y-2">
                  <span className="act-eyebrow">
                    <Sparkles size={11} />
                    {t('app_title', 'Gratitude Journal')}
                  </span>
                  <h1 className="act-heading">
                    {t('gratitude.heading', 'What are you grateful for today?')}
                  </h1>
                  <p className="act-body">
                    {t('gratitude.subheading', 'Take a moment to reflect on the good things, big or small.')}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest px-1">
                      {t('gratitude.item1.label', 'Gratitude Item 1')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('gratitude.item1.placeholder', 'e.g. A warm cup of tea this morning...')}
                      value={gratitude1}
                      onChange={(e) => setGratitude1(e.target.value)}
                      className="field-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest px-1">
                      {t('gratitude.item2.label', 'Gratitude Item 2')}{' '}
                      <span className="font-normal normal-case text-slate-300">{t('gratitude.optional', '(optional)')}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t('gratitude.item2.placeholder', 'e.g. A kind word from a friend...')}
                      value={gratitude2}
                      onChange={(e) => setGratitude2(e.target.value)}
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    disabled={!canContinue}
                    onClick={() => setScreen('mood')}
                    className="act-btn-primary"
                  >
                    {t('common.continue', 'Continue')}
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 3: MOOD SELECTION */}
            {screen === 'mood' && (
              <motion.div
                key="mood"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full flex-1 flex flex-col space-y-6 text-left"
              >
                <div className="space-y-2">
                  <span className="act-eyebrow">
                    <Smile size={11} />
                    {t('mood.heading', 'How are you feeling?')}
                  </span>
                  <h1 className="act-heading">
                    {t('mood.heading', 'How are you feeling?')}
                  </h1>
                  <p className="act-body">
                    {t('mood.subheading', 'Select the mood that best describes you right now.')}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {MOODS.map((opt, i) => {
                    const isSelected = selectedMood?.label === opt.label;
                    return (
                      <motion.button
                        key={opt.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedMood(opt)}
                        className={`flex items-center gap-4 rounded-xl border px-5 py-3.5 transition-all text-left ${
                          isSelected
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white/80 backdrop-blur-sm border-white text-slate-700 hover:border-sky-100'
                        }`}
                      >
                        <span className="text-2xl flex items-center justify-center">{opt.icon || opt.emoji}</span>
                        <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                          {t(`mood.${opt.label.toLowerCase()}`, opt.label)}
                        </span>
                        <div className={`ml-auto w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? 'border-white bg-white/20' : 'border-slate-200'
                        }`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <button
                    disabled={!selectedMood}
                    onClick={handleSaveEntry}
                    className="act-btn-primary"
                  >
                    {t('mood.save', 'Save Entry')}
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 4: COMPLETED REVIEW */}
            {screen === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex-1 flex flex-col"
              >
                <PremiumComplete
        shareContent={`I just completed "Gratitude Tracker" on TherapyMantra — a guided gratitude practice that genuinely helped me. Try it! \n\n Android: https://play.google.com/store/apps/details?id=org.mantracare.therapy\n iOS: https://apps.apple.com/pk/app/therapymantra/id1607643888`}
                  title={t('common.well_done', 'Well Done!')}
                  message={t(
                    'common.completion_message',
                    "You've successfully completed this activity. Take a moment to appreciate your progress."
                  )}
                  onRestart={handleResetFlow}
                  icon={<Heart size={48} fill="currentColor" className="text-rose-500 animate-pulse" />}
                >
                  {/* Summary Card */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-sm text-left space-y-4 p-5">
                    <div className="flex justify-between items-center border-b border-sky-50 pb-3">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                        {t('review.heading', 'Your Entry')}
                      </span>
                      {selectedMood && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 shrink-0">
                          <span className="text-lg leading-none flex items-center justify-center">{selectedMood.icon || selectedMood.emoji}</span>
                          <span className="text-[11px] font-semibold">
                            {t(`mood.${selectedMood.label.toLowerCase()}`, selectedMood.label)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">
                          {t('review.gratitude1', 'Gratitude 1')}
                        </span>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{gratitude1}</p>
                      </div>

                      {gratitude2.trim() && (
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">
                            {t('review.gratitude2', 'Gratitude 2')}
                          </span>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed">{gratitude2}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleEditEntry}
                      className="flex-1 py-4 bg-white border border-white/60 text-slate-500 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      {t('review.edit', 'Edit Entry')}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setScreen('history')}
                      className="act-btn-primary flex-1"
                    >
                      <CalendarIcon size={14} />
                      {t('review.history', 'View History')}
                    </motion.button>
                  </div>
                </PremiumComplete>
              </motion.div>
            )}

            {/* SCREEN 5: CALENDAR HISTORY */}
            {screen === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full flex-1 flex flex-col space-y-6 pb-20 text-left"
              >
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="act-eyebrow">
                      <History size={12} />
                      {t('review.history', 'View History')}
                    </span>
                    <h1 className="act-heading">
                      {t('history.heading', 'History')}
                    </h1>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={handleResetFlow}
                    className="p-3 bg-slate-100 text-slate-650 rounded-2xl hover:bg-slate-200 hover:shadow-xl hover:shadow-primary/40 transition-colors shadow-sm"
                  >
                    <ArrowLeft size={18} />
                  </motion.button>
                </div>

                <div className="flex items-center justify-between bg-slate-55/60 p-2.5 rounded-2xl border border-white/60 shadow-sm">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => changeMonth(-1)}
                    className="p-2.5 bg-white text-slate-400 rounded-xl hover:text-slate-800 transition-all shadow-sm border border-white/60/50"
                  >
                    <ChevronLeft size={16} strokeWidth={3} />
                  </motion.button>
                  <span className="text-sm font-black text-slate-750 min-w-[120px] text-center">
                    {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => changeMonth(1)}
                    className="p-2.5 bg-white text-slate-400 rounded-xl hover:text-slate-800 transition-all shadow-sm border border-white/60/50"
                  >
                    <ChevronRight size={16} strokeWidth={3} />
                  </motion.button>
                </div>

                {/* Calendar box wrapper */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-sm min-h-[340px] flex flex-col relative justify-center p-5">
                  {historyLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary opacity-30" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-7 gap-2.5 mb-4">
                        {WEEKDAYS.map((d) => (
                          <div
                            key={d}
                            className="text-center text-[10px] font-black text-slate-350 uppercase tracking-widest"
                          >
                            {t(`history.${d.toLowerCase()}`, d).substring(0, 3)}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2.5">
                        {Array.from({ length: calendarDays.startOfWeek }).map((_, i) => (
                          <div key={`empty-${i}`} />
                        ))}
                        {calendarDays.list.map((day) => {
                          const isoStr = toLocalIsoDate(day);
                          const hasEntry = entryDatesMap.has(isoStr);
                          const isToday = toLocalIsoDate(new Date()) === isoStr;
                          const isSelected = selectedHistoryEntry?.date === isoStr;

                          return (
                            <motion.button
                              key={isoStr}
                              whileHover={hasEntry ? { scale: 1.08, y: -1 } : {}}
                              whileTap={hasEntry ? { scale: 0.96 } : {}}
                              onClick={() => handleDateClick(day)}
                              className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-black transition-all ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105'
                                  : isToday
                                  ? 'bg-primary/10 text-primary'
                                  : hasEntry
                                  ? 'bg-slate-55  text-slate-700  hover:bg-slate-100 border border-white/60/50 '
                                  : 'text-slate-200  pointer-events-none'
                              }`}
                            >
                              {day.getDate()}
                              {hasEntry && !isSelected && (
                                <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Selected Day Details display */}
                <AnimatePresence mode="wait">
                  {selectedHistoryEntry ? (
                    <motion.div
                      key={selectedHistoryEntry.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-sm space-y-4 p-5"
                    >
                      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                        <div className="flex items-center gap-2.5 text-slate-400">
                          <CalendarIcon size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            {parseDbDate(selectedHistoryEntry.date + 'T00:00:00').toLocaleDateString(undefined, {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
                          <span className="text-xl leading-none flex items-center justify-center">
    {MOODS.find(m => m.label === selectedHistoryEntry.mood.label)?.icon || selectedHistoryEntry.mood.emoji}
  </span>
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {t(`mood.${selectedHistoryEntry.mood.label.toLowerCase()}`, selectedHistoryEntry.mood.label)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-350 uppercase tracking-widest block">
                            {t('review.gratitude1', 'Gratitude 1')}
                          </span>
                          <p className="text-sm font-bold text-slate-750 leading-relaxed">
                            {selectedHistoryEntry.gratitude1}
                          </p>
                        </div>
                        {selectedHistoryEntry.gratitude2 && (
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-350 uppercase tracking-widest block">
                              {t('review.gratitude2', 'Gratitude 2')}
                            </span>
                            <p className="text-sm font-bold text-slate-750 leading-relaxed">
                              {selectedHistoryEntry.gratitude2}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="py-12 text-center bg-slate-55/40 rounded-3xl border border-dashed border-white/60">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200 shadow-sm animate-pulse">
                        <CalendarIcon size={24} />
                      </div>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest px-4">
                        {t('select_a_date_to_relive_gratitude', 'Select a date to relive gratitude')}
                      </p>
                    </div>
                  )}
                </AnimatePresence>

                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleResetFlow}
                    className="w-full py-4.5 rounded-2xl bg-primary text-primary-foreground font-black text-base shadow-lg shadow-primary/10 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    {t('create_new_entry', 'Create New Entry')}
                    <Sparkles size={16} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumLayout>
  );
}

export default function GratitudeTrackerPage() {
  return (
    <I18nextProvider i18n={i18n}>
      <GratitudeTrackerInner />
    </I18nextProvider>
  );
}
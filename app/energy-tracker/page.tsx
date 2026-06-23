'use client';
import React from 'react';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation as useTrans, I18nextProvider as I18nProvider } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { BatteryMedium, History, ArrowLeft, ArrowRight, Check, Sparkles, Coffee, Droplets, Footprints, Info, Loader2, BatteryWarning, Battery as BatteryFull, BatteryLow, Zap } from 'lucide-react';
import i18n, { loadLocale } from './i18n';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';
import { apiPath } from '@/lib/apiPath';

// --- Types & Constants ---

type EnergyLevel = 'very-low' | 'low' | 'okay' | 'good' | 'high';

interface EnergyEntry {
  id: string;
  date: string;
  level: EnergyLevel;
  factors: string[];
  note: string;
}

type Screen = 'overview' | 'checkin' | 'factors' | 'summary' | 'weekly';

const EMOJI_MAP: Record<EnergyLevel, React.ReactNode> = {
  'very-low': <BatteryWarning size={32} className="text-rose-500" />,
  'low': <BatteryLow size={32} className="text-amber-500" />,
  'okay': <BatteryMedium size={32} className="text-blue-500" />,
  'good': <BatteryFull size={32} className="text-teal-500" />,
  'high': <Zap size={32} className="text-emerald-500" />,
};

const ENERGY_LEVEL_NUMS: Record<EnergyLevel, number> = {
  'very-low': 1,
  'low': 2,
  'okay': 3,
  'good': 4,
  'high': 5,
};

// --- Energy Tracker Inner Component ---

function EnergyTrackerInner() {
  const { t } = useTrans(undefined, { i18n });
  const [screen, setScreen] = useState<Screen>('overview');
  const [currentLevel, setCurrentLevel] = useState<EnergyLevel | null>(null);
  const [currentFactors, setCurrentFactors] = useState<string[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [entries, setEntries] = useState<EnergyEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync URL query lang parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lang = params.get('lang') || 'en';
      loadLocale(lang);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiPath('/api/energy-tracker'));
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((row: any) => ({
          id: row.id,
          date: row.date,
          level: row.level as EnergyLevel,
          factors: typeof row.factors === 'string' ? JSON.parse(row.factors) : row.factors,
          note: row.note || '',
        }));
        setEntries(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch energy logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const levelOptions = useMemo(() => [
    { level: 'very-low' as const, emoji: EMOJI_MAP['very-low'], label: t('very_low', 'Very Low'), color: 'bg-rose-50 border-rose-100  ' },
    { level: 'low' as const, emoji: EMOJI_MAP['low'], label: t('low', 'Low'), color: 'bg-amber-50 border-amber-100  ' },
    { level: 'okay' as const, emoji: EMOJI_MAP['okay'], label: t('okay', 'Okay'), color: 'bg-blue-50 border-blue-100  ' },
    { level: 'good' as const, emoji: EMOJI_MAP['good'], label: t('good', 'Good'), color: 'bg-teal-50 border-teal-100  ' },
    { level: 'high' as const, emoji: EMOJI_MAP['high'], label: t('high', 'High'), color: 'bg-emerald-50 border-emerald-100  ' },
  ], [t]);

  const factorsOptions = useMemo(() => [
    { id: 'Sleep', label: t('sleep', 'Sleep') },
    { id: 'Work / Study', label: t('work_study', 'Work / Study') },
    { id: 'Stress', label: t('stress', 'Stress') },
    { id: 'Exercise', label: t('exercise', 'Exercise') },
    { id: 'Socializing', label: t('socializing', 'Socializing') },
    { id: 'Screen Time', label: t('screen_time', 'Screen Time') },
    { id: 'Health', label: t('health', 'Health') },
    { id: 'Rest', label: t('rest', 'Rest') },
    { id: 'Mood', label: t('mood', 'Mood') },
    { id: 'Anxiety', label: t('anxiety', 'Anxiety') },
  ], [t]);

  const toggleFactor = (factorId: string) => {
    setCurrentFactors((prev) =>
      prev.includes(factorId) ? prev.filter((id) => id !== factorId) : [...prev, factorId]
    );
  };

  const handleSave = async () => {
    if (!currentLevel) return;
    setSaving(true);

    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);

    const payload = {
      id,
      date: dateStr,
      level: currentLevel,
      factors: currentFactors,
      note: currentNote,
    };

    try {
      const res = await fetch(apiPath('/api/energy-tracker'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Refresh local memory and lists
        const newEntry: EnergyEntry = {
          id,
          date: dateStr,
          level: currentLevel,
          factors: currentFactors,
          note: currentNote,
        };
        setEntries((prev) => [newEntry, ...prev.filter((e) => e.date !== dateStr)]);
      }
    } catch (err) {
      console.error('Failed to save energy checkin:', err);
    } finally {
      setSaving(false);
      setScreen('summary');
    }
  };

  const activeLevel = useMemo(() => {
    if (currentLevel) return currentLevel;
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const todayEntry = entries.find((e) => e.date === dateStr);
    return todayEntry ? todayEntry.level : 'okay';
  }, [currentLevel, entries]);

  const supportiveMessages: Record<EnergyLevel, string> = {
    'very-low': t('msg_very_low', "It's okay to feel drained. Listen to your body and prioritize rest."),
    'low': t('msg_low', 'Take it slow. Maybe try a short break or some gentle stretching.'),
    'okay': t('msg_okay', 'Steady as it goes. Keep monitoring your pace through the day.'),
    'good': t('msg_good', "You're in a good spot! Use this momentum for your tasks."),
    'high': t('msg_high', "Brilliant! You've got great energy today. Make the most of it!"),
  };

  const suggestions = useMemo(() => [
    { icon: Coffee, text: t('breaks', 'Take regular short breaks') },
    { icon: Droplets, text: t('hydrated', 'Stay well hydrated') },
    { icon: Footprints, text: t('movement', 'Short gentle movement') },
  ], [t]);

  // --- SVG Chart Computations ---
  const chartData = useMemo(() => {
    const todayObj = new Date();
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(todayObj.getDate() - (6 - i));
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const entry = entries.find((e) => e.date === dateStr);
      list.push({
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr,
        value: entry ? ENERGY_LEVEL_NUMS[entry.level] : null,
      });
    }
    return list;
  }, [entries]);

  const filledDays = useMemo(() => chartData.filter((d) => d.value !== null), [chartData]);

  const avgValue = useMemo(() => {
    if (!filledDays.length) return null;
    return Math.round(filledDays.reduce((sum, d) => sum + (d.value || 0), 0) / filledDays.length);
  }, [filledDays]);

  const hasEnoughData = filledDays.length >= 3;

  // Render Premium SVG Chart Path & Dots
  const chartSvgContent = useMemo(() => {
    const width = 340;
    const height = 150;
    const paddingLeft = 40;
    const paddingRight = 10;
    const paddingTop = 15;
    const paddingBottom = 20;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    const points: { x: number; y: number; val: number; dayName: string }[] = [];
    chartData.forEach((d, idx) => {
      if (d.value !== null) {
        const x = paddingLeft + (idx * plotWidth) / 6;
        const y = paddingTop + plotHeight - ((d.value - 1) * plotHeight) / 4;
        points.push({ x, y, val: d.value, dayName: d.dayName });
      }
    });

    if (points.length === 0) return null;

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    let areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`;

    return {
      width,
      height,
      paddingLeft,
      paddingTop,
      plotWidth,
      plotHeight,
      points,
      pathD,
      areaD,
      yGrid: Array.from({ length: 5 }).map((_, i) => paddingTop + (i * plotHeight) / 4),
      xGrid: Array.from({ length: 7 }).map((_, i) => paddingLeft + (i * plotWidth) / 6),
    };
  }, [chartData]);

  const numToLabel: Record<number, string> = {
    1: t('very_low', 'Very Low'),
    2: t('low', 'Low'),
    3: t('okay', 'Okay'),
    4: t('good', 'Good'),
    5: t('high', 'High'),
  };

  const handleReset = () => {
    setScreen('overview');
    setCurrentLevel(null);
    setCurrentFactors([]);
    setCurrentNote('');
  };

  const screenOrder: Screen[] = ['overview', 'checkin', 'factors', 'summary'];
  const currentIdx = screenOrder.indexOf(screen);

  return (
    <PremiumLayout
      title={t('app_title', 'Energy Tracker')}
      icon={<BatteryMedium className="w-6 h-6 text-primary" />}
      onBack={currentIdx > 0 && screen !== 'summary' ? () => setScreen(screenOrder[currentIdx - 1]) : undefined}
      onReset={currentIdx > 0 && screen !== 'summary' ? handleReset : undefined}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-6 py-4 min-h-[70vh]">
        {screen !== 'summary' && screen !== 'weekly' && (
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
                  title={t('app_title', 'Energy Tracker')}
                  description={t(
                    'app_description',
                    'Track your energy levels throughout the day to understand your patterns and optimize your wellbeing.'
                  )}
                  onStart={() => setScreen('checkin')}
                  icon={<BatteryMedium size={32} />}
                  benefits={[
                    t('intro_p1', 'Identify energy drains'),
                    t('intro_p2', 'Discover peak productivity times'),
                    t('intro_p3', 'Learn what recharges you'),
                  ]}
                  duration={t('app_duration', '1 minute')}
                >
                  <div className="mt-8 text-center">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setScreen('weekly')}
                      className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-xs uppercase tracking-widest transition-all bg-white px-6 py-3 rounded-2xl border border-white/60 shadow-sm"
                    >
                      <History size={16} />
                      {t('view_weekly', 'View Weekly Trends')}
                    </motion.button>
                  </div>
                </PremiumIntro>
              </motion.div>
            )}

            {/* SCREEN 2: ENERGY CHECKIN */}
            {screen === 'checkin' && (
              <motion.div
                key="checkin"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="w-full flex-1 flex flex-col space-y-5"
              >
                <div className="text-left space-y-1.5">
                  <span className="act-eyebrow">
                    <Sparkles size={11} />
                    {t('app_title', 'Energy Tracker')}
                  </span>
                  <h2 className="act-heading">
                    {t('how_is_energy', 'How is your energy right now?')}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {levelOptions.map((opt, i) => {
                    const isSelected = currentLevel === opt.level;
                    return (
                      <motion.button
                        key={opt.level}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setCurrentLevel(opt.level)}
                        className={`flex items-center gap-4 rounded-xl border px-5 py-3.5 transition-all text-left ${
                          isSelected
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white/80 backdrop-blur-sm border-white text-slate-700 hover:border-sky-100'
                        }`}
                      >
                        <span className="text-2xl flex items-center justify-center">{opt.emoji}</span>
                        <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                          {opt.label}
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
                    disabled={!currentLevel}
                    onClick={() => setScreen('factors')}
                    className="act-btn-primary"
                  >
                    {t('continue', 'Continue')}
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 3: ENERGY FACTORS */}
            {screen === 'factors' && (
              <motion.div
                key="factors"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="w-full flex-1 flex flex-col space-y-6 pb-20"
              >
                <div className="text-left space-y-1">
                  <span className="act-eyebrow">
                    <Sparkles size={12} />
                    {t('factors_title', 'Contributors')}
                  </span>
                  <h2 className="act-heading">
                    {t('what_affected', 'What affected your energy?')}
                  </h2>
                  <p className="text-slate-450 text-xs font-bold uppercase tracking-wider">
                    {t('optional', 'Optional')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {factorsOptions.map((f, i) => {
                    const selected = currentFactors.includes(f.id);
                    return (
                      <motion.button
                        key={f.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => toggleFactor(f.id)}
                        className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-xs font-semibold transition-all border ${
                          selected
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-white bg-white/80 backdrop-blur-sm text-slate-600 hover:border-sky-100'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                          selected ? 'bg-primary text-white' : 'bg-slate-100 text-transparent'
                        }`}>
                          <Check size={10} strokeWidth={3} />
                        </div>
                        <span className="truncate">{f.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block px-1">
                    {t('add_note', 'Add a note')}{' '}
                    <span className="font-normal normal-case">({t('optional', 'optional')})</span>
                  </label>
                  <textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value.slice(0, 120))}
                    placeholder={t('note_placeholder', 'Describe briefly...')}
                    maxLength={120}
                    rows={3}
                    className="field-textarea"
                  />
                  <p className="text-right text-[11px] font-medium text-slate-300 px-1">
                    {currentNote.length}/120
                  </p>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full h-12 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:bg-primary/80 transition-colors duration-150 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>{t('save_checkin', 'Save Check-in')}<ArrowRight size={15} strokeWidth={2.5} /></>
                  )}
                </button>
              </motion.div>
            )}

            {/* SCREEN 4: TODAY SUMMARY */}
            {screen === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full flex-1 flex flex-col"
              >
                <PremiumComplete
                  title={t('today_energy', `Today you're feeling {{label}}`, { label: numToLabel[ENERGY_LEVEL_NUMS[activeLevel]] })}
                  message={supportiveMessages[activeLevel]}
                  onRestart={handleReset}
                  icon={<span className="text-6xl filter drop-shadow-md flex items-center justify-center scale-150">{EMOJI_MAP[activeLevel]}</span>}
                  shareContent={"I just completed 'Energy Tracker' on TherapyMantra — a guided energy tracking that genuinely helped me. Try it! \n\n Android: https://play.google.com/store/apps/details?id=org.mantracare.therapy\n iOS: https://apps.apple.com/pk/app/therapymantra/id1607643888"}
                >
                  <div className="space-y-5 w-full mt-6">
                    <div className="grid gap-3">
                      {suggestions.map((s, i) => (
                        <motion.div
                          key={s.text}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-center gap-4 rounded-2xl bg-white border border-white/60 px-5 py-4 shadow-sm hover:border-primary/20 transition-all text-left"
                        >
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <s.icon className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-bold text-slate-700">
                            {s.text}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setScreen('weekly')}
                      className="w-full py-4 rounded-2xl bg-white border border-white/60 text-slate-500 hover:text-slate-900 font-bold text-sm uppercase tracking-widest shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <History size={16} />
                      {t('view_weekly', 'View Weekly Trends')}
                    </motion.button>
                  </div>
                </PremiumComplete>
              </motion.div>
            )}

            {/* SCREEN 5: WEEKLY TRENDS */}
            {screen === 'weekly' && (
              <motion.div
                key="weekly"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full flex-1 flex flex-col space-y-6 pb-20 text-left"
              >
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="act-eyebrow">
                      <History size={12} />
                      {t('weekly_title', 'Weekly Trend')}
                    </span>
                    <h1 className="act-heading">
                      {t('your_weekly', 'Your Energy Flow')}
                    </h1>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setScreen(currentLevel ? 'summary' : 'overview')}
                    className="p-3 bg-slate-100 text-slate-650 rounded-2xl hover:bg-slate-200 hover:shadow-xl hover:shadow-primary/40 transition-colors shadow-sm"
                  >
                    <ArrowLeft size={18} />
                  </motion.button>
                </div>

                {/* SVG Chart Container */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-sm overflow-hidden flex flex-col items-center justify-center p-5"
                >
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" />
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        {t('common.loading', 'Loading...')}
                      </p>
                    </div>
                  ) : filledDays.length === 0 ? (
                    <p className="py-12 text-center text-sm text-slate-400 font-medium px-4">
                      {t('no_entries', 'Complete 3 check-ins to see your weekly trend.')}
                    </p>
                  ) : (
                    <div className="w-full relative select-none">
                      {chartSvgContent && (
                        <svg
                          viewBox={`0 0 ${chartSvgContent.width} ${chartSvgContent.height}`}
                          className="w-full h-auto overflow-visible"
                        >
                          <defs>
                            {/* Calming glow gradient under line */}
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
                            </linearGradient>
                          </defs>

                          {/* Horizontal Grid lines */}
                          {chartSvgContent.yGrid.map((y, idx) => (
                            <line
                              key={idx}
                              x1={chartSvgContent.paddingLeft}
                              y1={y}
                              x2={chartSvgContent.width}
                              y2={y}
                              stroke="var(--color-grid, #F1F5F9)"
                              className="stroke-slate-100"
                              strokeWidth={1}
                              strokeDasharray="3 3"
                            />
                          ))}

                          {/* Y-Axis tick labels */}
                          {chartSvgContent.yGrid.map((y, idx) => {
                            const valNum = 5 - idx;
                            return (
                              <text
                                key={idx}
                                x={chartSvgContent.paddingLeft - 8}
                                y={y + 3.5}
                                textAnchor="end"
                                className="fill-slate-400 font-bold text-[9px] uppercase tracking-wider"
                              >
                                {numToLabel[valNum]}
                              </text>
                            );
                          })}

                          {/* Glowing area under the line */}
                          {chartSvgContent.points.length > 1 && (
                            <path d={chartSvgContent.areaD} fill="url(#chartGradient)" />
                          )}

                          {/* Main line path */}
                          {chartSvgContent.points.length > 1 && (
                            <path
                              d={chartSvgContent.pathD}
                              fill="none"
                              stroke="#10B981"
                              strokeWidth={3}
                              strokeLinecap="round"
                            />
                          )}

                          {/* Connecting Dots */}
                          {chartSvgContent.points.map((p, idx) => (
                            <g key={idx}>
                              {/* Inner glowing core */}
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r={6}
                                fill="#10B981"
                                className="transition-all hover:scale-125 duration-100 cursor-pointer"
                              />
                              <circle cx={p.x} cy={p.y} r={3} fill="white" />
                            </g>
                          ))}

                          {/* X-Axis labels */}
                          {chartSvgContent.xGrid.map((x, idx) => (
                            <text
                              key={idx}
                              x={x}
                              y={chartSvgContent.height - 2}
                              textAnchor="middle"
                              className="fill-slate-400 font-bold text-[9.5px] uppercase tracking-wider"
                            >
                              {chartData[idx].dayName}
                            </text>
                          ))}
                        </svg>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* INSIGHT CARD */}
                {filledDays.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`rounded-3xl p-6 border flex gap-4 ${
                      hasEnoughData && avgValue
                        ? 'bg-primary/5 border-primary/15'
                        : 'bg-white/40 backdrop-blur-sm shadow-sm border border-white/50  border-white/60 '
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 text-primary shadow-sm">
                      <Info size={20} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-black text-primary uppercase tracking-widest">
                        {t('insight', 'Energy Insight')}
                      </h3>
                      <p className="text-sm font-bold text-slate-650 leading-relaxed">
                        {hasEnoughData && avgValue ? (
                          avgValue >= 4 ? (
                            t(
                              'insight_high',
                              'Your energy has been consistently positive this week. It thrives on your current routine!'
                            )
                          ) : avgValue >= 3 ? (
                            t('insight_okay', 'You\'ve had a steady energy flow. Balancing work and rest seems to be working for you.')
                          ) : (
                            t(
                              'insight_low',
                              'Your energy has been on the lower side. Consider checking if you\'re getting enough rest or exercise.'
                            )
                          )
                        ) : (
                          t('insight_more_data', 'Continue tracking daily to see deeper patterns in your energy levels.')
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumLayout>
  );
}

export default function EnergyTrackerPage() {
  return (
    <I18nProvider i18n={i18n}>
      <EnergyTrackerInner />
    </I18nProvider>
  );
}
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, History, Loader2, Sparkles, Plus, X, ArrowRight, ArrowLeft, CheckCircle2, ListFilter, MoveRight, Inbox, Clock, Trash2, Target, Check, Trash, Play, Pause, Calendar, Feather, Equal, CloudRain } from 'lucide-react';
import i18n, { loadLocale } from './i18n';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';
import { apiPath } from '@/lib/apiPath';

// --- Types ---

interface ThoughtItem {
  id: string;
  text: string;
  bucket?: "action" | "later" | "letgo";
}

interface SavedSession {
  id: string;
  date: string;
  thoughts: ThoughtItem[];
  reflection?: string;
}

type Bucket = "action" | "later" | "letgo";

// --- Sub-components ---

// 1. Brain Dump input Screen
function BrainDump({ onComplete }: { onComplete: (text: string) => void }) {
  const { t } = useTranslation(undefined, { i18n });
  const [thoughts, setThoughts] = useState<string[]>([""]);
  const maxRows = 50;

  const updateThought = (index: number, value: string) => {
    setThoughts((prev) => prev.map((t, i) => (i === index ? value : t)));
  };

  const addThought = () => {
    setThoughts((prev) => (prev.length < maxRows ? [...prev, ""] : prev));
  };

  const removeThought = (index: number) => {
    setThoughts((prev) => {
      if (prev.length === 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const isLast = index === thoughts.length - 1;
    if (isLast) {
      addThought();
      setTimeout(() => {
        const nextInput = document.getElementById(`thought-input-${index + 1}`);
        nextInput?.focus();
      }, 50);
    }
  };

  const filledThoughts = thoughts.map((t) => t.trim()).filter(Boolean);

  return (
    <div className="flex flex-col items-center py-6 pb-24">
      <div className="w-full max-w-lg space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 leading-tight">
            {t('app_description', 'Reshape your focus through sorting mental clutter.')}
          </h1>
          <p className="text-slate-500 text-sm">
            {t('dump_hint', 'Type out anything currently filling your mind. Press Enter after each item.')}
          </p>
        </header>

        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {thoughts.map((thought, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 group"
              >
                <div className="flex-1 relative">
                  <input
                    id={`thought-input-${index}`}
                    type="text"
                    value={thought}
                    onChange={(e) => updateThought(index, e.target.value)}
                    onKeyDown={(e) => handleEnter(e, index)}
                    placeholder={index === 0 ? t('dump_placeholder', 'Type a thought here...') : t('type_another', 'Type another thought...')}
                    className="field-input"
                  />
                  {index === 0 && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/30">
                      <Sparkles size={18} />
                    </div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, color: "#EF4444" }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => removeThought(index)}
                  className="w-12 h-12 shrink-0 rounded-full bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 text-slate-300 flex items-center justify-center hover:bg-rose-50 transition-colors"
                >
                  <X size={18} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={addThought}
            className="flex items-center gap-2 text-primary font-bold text-sm px-6 py-2"
          >
            <Plus size={18} />
            {t('keep_going', 'Keep going...')}
          </motion.button>
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-20">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => filledThoughts.length > 0 && onComplete(filledThoughts.join("\n"))}
            disabled={filledThoughts.length === 0}
            className="w-full py-5 rounded-[2rem] bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:shadow-none"
          >
            {t('finished', 'Finished')}
            <ArrowRight size={20} />
          </motion.button>
          <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-4">
            {t('breathe', 'Breathe deeply as you clear your mind.')}
          </p>
        </div>
      </div>
    </div>
  );
}

// 2. Sort Thoughts Screen
interface SortThoughtsProps {
  thoughts: ThoughtItem[];
  onComplete: (sorted: ThoughtItem[]) => void;
  onBack: () => void;
}

function SortThoughts({ thoughts: initial, onComplete, onBack }: SortThoughtsProps) {
  const { t } = useTranslation(undefined, { i18n });
  const [items, setItems] = useState<ThoughtItem[]>(initial);

  const buckets: { key: Bucket; icon: React.ReactNode; label: string; desc: string }[] = [
    { key: "action", icon: <Inbox size={20} />, label: t('action_needed', 'Action Needed'), desc: t('action_desc', 'Things to tackle soon') },
    { key: "later", icon: <Clock size={20} />, label: t('do_later', 'Do Later'), desc: t('later_desc', 'Needs attention later') },
    { key: "letgo", icon: <Trash2 size={20} />, label: t('let_it_go', 'Let it Go'), desc: t('letgo_desc', 'Trivial or uncontrollable thoughts') },
  ];

  const sorted = items.filter((i) => i.bucket);
  const unsorted = items.filter((i) => !i.bucket);
  const progress = items.length > 0 ? sorted.length / items.length : 0;
  const allSorted = unsorted.length === 0 && items.length > 0;

  const assignBucket = (id: string, bucket: Bucket) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, bucket } : i)));
  };

  return (
    <div className="flex flex-col items-center py-6 pb-24">
      <div className="w-full max-w-lg space-y-8">
        <header className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack} 
            className="p-3 bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 text-slate-400 rounded-2xl hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
              {t('sort_title', 'Sort Your Mind')}
            </h1>
            <p className="text-slate-505 text-sm leading-tight">
              {t('sort_desc', 'Sort items into Action, Later, or Let Go.')}
            </p>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="bg-white rounded-[2rem] border border-white/60 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
              <ListFilter size={18} className="text-primary" />
              {t('clarity_progress', 'Clarity Progress')}
            </div>
            <span className="text-primary font-black text-sm">{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              className="h-full bg-primary" 
            />
          </div>
        </div>

        {/* Current sorting thought card */}
        <AnimatePresence mode="wait">
          {unsorted.length > 0 ? (
            <motion.div
              key={unsorted[0].id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="bg-white rounded-[2.5rem] border border-primary/20 p-8 shadow-xl shadow-primary/5 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 text-primary/10">
                <Sparkles size={48} />
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                {t('sorting_thought', 'Sorting thought')}
              </p>
              <h2 className="text-2xl font-bold text-slate-800 leading-relaxed">
                {unsorted[0].text}
              </h2>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 rounded-[2.5rem] border border-emerald-100 p-8 text-center"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 shadow-sm border border-emerald-100">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-emerald-900 mb-2">
                {t('all_sorted', 'All thoughts sorted!')}
              </h2>
              <p className="text-emerald-600 font-medium">
                {t('your_mind_is_clear_and_ready_for_the_next_step', 'Your mind is clear and ready for the next step.')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buckets */}
        <div className="grid gap-4">
          {buckets.map((b) => {
            const bucketItems = items.filter((i) => i.bucket === b.key);
            const isClickable = unsorted.length > 0;
            
            return (
              <motion.button
                key={b.key}
                whileHover={isClickable ? { scale: 1.02, x: 5 } : {}}
                whileTap={isClickable ? { scale: 0.98 } : {}}
                onClick={() => isClickable && assignBucket(unsorted[0].id, b.key)}
                className={`w-full text-left rounded-[2rem] border p-6 transition-all group ${
                  isClickable 
                    ? "bg-white  border-white/60  hover:border-primary/50 shadow-sm" 
                    : "bg-white/40 backdrop-blur-sm shadow-sm border border-white/50  border-transparent opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {b.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{b.label}</h3>
                      <p className="text-xs text-slate-400 font-medium">{b.desc}</p>
                    </div>
                  </div>
                  {bucketItems.length > 0 && (
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                      {bucketItems.length}
                    </span>
                  )}
                </div>
                
                {bucketItems.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {bucketItems.map((item) => (
                      <motion.span 
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3 py-1.5 rounded-xl bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 text-slate-650 text-xs font-bold"
                      >
                        {item.text}
                      </motion.span>
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Complete Buttons */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-20">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onComplete(items)}
            disabled={!allSorted}
            className="w-full py-5 rounded-[2rem] bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:shadow-none"
          >
            {t('continue', 'Continue')}
            <MoveRight size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// 3. Focused Action Step Screen
interface OneSmallStepProps {
  thoughts: ThoughtItem[];
  onComplete: () => void;
  onBack: () => void;
}

const rotatingTexts = [
  "Just focus on this single step.",
  "Stay entirely in this moment.",
  "One step is always manageable.",
  "Breathe and let go of the rest.",
];

function OneSmallStep({ thoughts, onComplete, onBack }: OneSmallStepProps) {
  const { t } = useTranslation(undefined, { i18n });
  const [selected, setSelected] = useState<string | null>(null);
  const [nextStep, setNextStep] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [paused, setPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [textIndex, setTextIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedItem = thoughts.find((t) => t.id === selected);

  // Timer loop
  useEffect(() => {
    if (focusMode && !paused && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(intervalRef.current!);
    }
    if (timeLeft === 0) onComplete();
  }, [focusMode, paused, timeLeft, onComplete]);

  // Message loop
  useEffect(() => {
    if (!focusMode) return;
    const interval = setInterval(() => setTextIndex((i) => (i + 1) % rotatingTexts.length), 4000);
    return () => clearInterval(interval);
  }, [focusMode]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / 180;

  if (focusMode) {
    return (
      <div className="flex flex-col items-center py-6 pb-24">
        <div className="w-full max-w-lg flex flex-col items-center gap-12">
          <header className="text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 leading-tight">
              {t('focused_work', 'Focused Work')}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {nextStep || selectedItem?.text}
            </p>
          </header>

          {/* Premium Pomodoro Circular Ring */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="#F1F5F9" 
                strokeWidth="4" 
              />
              <motion.circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="var(--color-primary, #3b82f6)" 
                strokeWidth="4" 
                strokeLinecap="round"
                strokeDasharray="282.7"
                animate={{ strokeDashoffset: 282.7 * (1 - progress) }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-48 h-48 rounded-full bg-primary/20"
              />
            </div>

            <div className="relative flex flex-col items-center">
              <span className="text-5xl font-black text-slate-800 tabular-nums leading-none">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{t('time_left', 'Time Left')}</span>
            </div>
          </div>

          <div className="h-8 overflow-hidden text-center">
            <AnimatePresence mode="wait">
              <motion.p 
                key={textIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-slate-500 font-bold italic"
              >
                {rotatingTexts[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Buttons */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-20">
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaused((p) => !p)}
                className="flex-1 py-5 rounded-[2rem] bg-white border border-white/60 text-slate-650 font-bold shadow-sm flex items-center justify-center gap-3"
              >
                {paused ? <Play size={20} className="fill-current" /> : <Pause size={20} className="fill-current" />}
                {paused ? t('resume', 'Resume') : t('pause', 'Pause')}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onComplete}
                className="flex-1 py-5 rounded-[2rem] bg-primary text-white font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
              >
                {t('i_m_done', 'Complete')}<Check size={20} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-6 pb-24">
      <div className="w-full max-w-lg space-y-8">
        <header className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack} 
            className="p-3 bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 text-slate-400 rounded-2xl hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
              {t('small_step_title', 'One Small Step')}
            </h1>
            <p className="text-slate-505 text-sm leading-tight">
              {t('small_step_desc', 'Identify the single smallest step to resolve a stressful concern.')}
            </p>
          </div>
        </header>

        {thoughts.length === 0 ? (
          <div className="text-center py-20 bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 rounded-[2.5rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold mb-6">{t('no_action_items_found', 'No action items selected.')}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20"
            >
              {t('go_back_sort', 'Go Back & Sort')}
            </motion.button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest px-2">
              <Target size={14} className="text-primary" />
              {t('pick_one_thing_to_focus_on', 'Select one item to focus on')}
            </div>
            
            <div className="grid gap-3">
              {thoughts.map((item, i) => {
                const isSelected = selected === item.id;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelected(item.id)}
                    className={`w-full text-left p-6 rounded-[2rem] border transition-all duration-300 flex items-center justify-between ${
                      isSelected 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white  border-white/60  text-slate-700  hover:bg-slate-50  hover:shadow-xl hover:shadow-primary/40/40"
                    }`}
                  >
                    <span className="text-base font-bold">{item.text}</span>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                        >
                          <Check size={16} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {selectedItem && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-4 border-t border-slate-50"
                >
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest px-2">
                    <Sparkles size={14} className="text-primary" />
                    {t('first_step_placeholder', 'What is your absolute first tiny step?')}
                  </div>
                  <input
                    type="text"
                    value={nextStep}
                    onChange={(e) => setNextStep(e.target.value)}
                    placeholder={t('e_g_open_the_document_tidy_one_corner', 'e.g. Open the document, tidy one corner...')}
                    className="field-input"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-20">
          <div className="flex flex-col gap-3">
            {selectedItem ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFocusMode(true)}
                className="w-full py-5 rounded-[2rem] bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl transition-all flex items-center justify-center gap-3"
              >
                <Clock size={20} />{t('start_3_minute_focus', 'Start 3-Minute Focus')}
              </motion.button>
            ) : (
              thoughts.length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onComplete}
                  className="w-full py-5 rounded-[2rem] bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                >
                  {t('continue', 'Continue')}
                  <ArrowRight size={20} />
                </motion.button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Emotional check-in Reflection Screen
interface ReflectionProps {
  onComplete: (reflection: string) => void;
  onBack: () => void;
}

const feelings = [
  { label: "Slightly lighter", icon: <Feather className="w-5 h-5" /> },
  { label: "More focused", icon: <Target className="w-5 h-5" /> },
  { label: "About the same", icon: <Equal className="w-5 h-5" /> },
  { label: "Still overwhelmed", icon: <CloudRain className="w-5 h-5" /> },
];

function Reflection({ onComplete, onBack }: ReflectionProps) {
  const { t } = useTranslation(undefined, { i18n });
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <PremiumComplete
      title={t('app_title', 'Clarity Dump')}
      message={t('reflection_desc', 'How do you feel after sorting and clearing your mind?')}
      onRestart={() => onComplete(selected || "Finished")}
    >
      <div className="space-y-6 w-full max-w-md mx-auto mt-8">
        <div className="grid gap-3">
          {feelings.map((f, i) => (
            <motion.button
              key={f.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(f.label)}
              className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all duration-300 ${
                selected === f.label
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white  border-white/60  text-slate-700  hover:bg-slate-50  hover:shadow-xl hover:shadow-primary/40"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{f.icon}</span>
                <span className="text-sm font-bold">{f.label}</span>
              </div>
              <AnimatePresence>
                {selected === f.label && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                  >
                    <Check size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-4"
          >
            <p className="text-slate-505 text-sm font-medium leading-relaxed italic">
              &quot;{t('growth_reminder', "Even tiny steps reduce mental weight. You don't have to carry everything at once.")}&quot;
            </p>
          </motion.div>
        )}
      </div>
    </PremiumComplete>
  );
}

// 5. Past History Logs Screen
interface SavedThoughtsProps {
  sessions: SavedSession[];
  onBack: () => void;
  onDelete: (id: string) => void;
}

function SavedThoughts({ sessions, onBack, onDelete }: SavedThoughtsProps) {
  const { t } = useTranslation(undefined, { i18n });

  const bucketLabels: Record<string, { icon: React.ReactNode; label: string }> = {
    action: { icon: <Inbox size={14} />, label: t('action_needed', 'Action Needed') },
    later: { icon: <Clock size={14} />, label: t('do_later', 'Do Later') },
    letgo: { icon: <Trash size={14} />, label: t('let_it_go', 'Let it Go') },
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col items-center py-6 pb-24">
      <div className="w-full max-w-lg space-y-8">
        <header className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-1">{t('history', 'History')}</h1>
            <p className="text-slate-500 text-sm">{t('your_past_mental_clarity_sessions', 'Your past mental clarity sessions')}</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack} 
            className="p-3 bg-slate-100 text-slate-650 rounded-2xl hover:bg-slate-200 hover:shadow-xl hover:shadow-primary/40 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </motion.button>
        </header>

        {sessions.length === 0 ? (
          <div className="text-center py-20 bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 rounded-[2.5rem] border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-200 shadow-sm">
              <History size={32} />
            </div>
            <p className="text-slate-400 font-bold mb-6">{t('no_sessions', 'No past sessions saved.')}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20"
            >{t('start_new_session', 'Start New Session')}</motion.button>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {sessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-[2.5rem] border border-white/60 p-6 shadow-sm group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 rounded-full">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {formatDate(session.date)}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, color: "#EF4444" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDelete(session.id)}
                      className="p-2 rounded-xl bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 text-slate-300 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    {(["action", "later", "letgo"] as const).map((bucket) => {
                      const items = session.thoughts.filter((t) => t.bucket === bucket);
                      if (items.length === 0) return null;
                      const config = bucketLabels[bucket];
                      return (
                        <div key={bucket} className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-400">
                            {config.icon}
                            <span className="text-[10px] font-bold uppercase tracking-widest">{config.label}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {items.map((item) => (
                              <span
                                key={item.id}
                                className="px-3 py-1.5 rounded-xl bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 text-slate-600 text-xs font-bold border border-white/60"
                              >
                                {item.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {session.reflection && (
                    <div className="mt-6 pt-6 border-t border-slate-50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" />
                        {t('feelings', 'Feelings')}
                      </p>
                      <p className="text-sm font-bold text-slate-700">{session.reflection}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Page Wrapper ---

function BrainDumpAppInner() {
  const { t } = useTranslation(undefined, { i18n });
  const [screen, setScreen] = useState(0);
  const [thoughts, setThoughts] = useState<ThoughtItem[]>([]);
  const [transitioning, setTransitioning] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lang = params.get('lang') || 'en';
      loadLocale(lang);
    }
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(apiPath('/api/brain-dump'));
      if (res.ok) {
        const data = await res.json();
        setSavedSessions(data);
      }
    } catch (err) {
      console.error("Failed to load brain dump logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const goTo = useCallback((next: number) => {
    setTransitioning(true);
    setTimeout(() => {
      setScreen(next);
      setTransitioning(false);
    }, 400);
  }, []);

  const handleDumpComplete = (text: string) => {
    const lines = text
      .split(/[\n,.;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const items: ThoughtItem[] = lines.map((t, i) => ({
      id: `t-${i}-${Date.now()}`,
      text: t,
    }));
    setThoughts(items);
    goTo(2);
  };

  const handleSortComplete = (sorted: ThoughtItem[]) => {
    setThoughts(sorted);
    goTo(3);
  };

  const handleReflectionComplete = async (reflection: string) => {
    const newSession: SavedSession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      thoughts: thoughts,
      reflection: reflection,
    };

    try {
      const res = await fetch(apiPath('/api/brain-dump'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      });
      if (res.ok) {
        setSavedSessions((prev) => [newSession, ...prev]);
      }
    } catch (e) {
      console.error("Failed to save brain dump session to DB", e);
    }

    setThoughts([]);
    goTo(5); // Completion Screen
  };

  const handleDeleteSession = async (id: string) => {
    try {
      const res = await fetch(apiPath(`/api/brain-dump?id=${id}`), {
        method: 'DELETE',
      });
      if (res.ok) {
        setSavedSessions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete session", e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showSaved) {
    return (
      <PremiumLayout
        title={t('app_title', 'Clarity Dump')}
        subtitle={t('your_mental_clarity_journey', 'Mental Clarity Journey')}
        icon={<History className="w-6 h-6 text-primary" />}
        onBack={() => setShowSaved(false)}
      >
        <div className="w-full max-w-md mx-auto px-6 py-4">
          <SavedThoughts
            sessions={savedSessions}
            onBack={() => setShowSaved(false)}
            onDelete={handleDeleteSession}
          />
        </div>
      </PremiumLayout>
    );
  }

  if (screen === 5) {
    return (
      <PremiumComplete
        title={t('app_title', 'Clarity Dump')}
        message={t('complete_message', "You've successfully sorted your thoughts and identified actionable steps. A clearer mind leads to a calmer heart.")}
        onRestart={() => goTo(0)}
                  shareContent={"I just completed 'Brain Dump and Sort' on TherapyMantra — a guided mental clarity exercise that genuinely helped me. Try it! \n\n Android: https://play.google.com/store/apps/details?id=org.mantracare.therapy\n iOS: https://apps.apple.com/pk/app/therapymantra/id1607643888"}
      />
    );
  }

  const subtitles = [
    t('welcome_sub', "Welcome"),
    t('clearing_sub', "Mental Clearing"),
    t('sorting_sub', "Sorting"),
    t('action_sub', "Action Steps"),
    t('reflect_sub', "Reflection")
  ];

  return (
    <PremiumLayout
      title={t('app_title', 'Clarity Dump')}
      subtitle={subtitles[screen]}
      icon={<Brain className="w-6 h-6 text-primary" />}
      onBack={screen > 0 ? () => goTo(screen - 1) : undefined}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-6 py-4 min-h-[70vh]">
        <div className="flex justify-center gap-2 mb-10">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${i <= screen ? "w-8 bg-primary" : "w-2 bg-slate-100 "}`}
            />
          ))}
        </div>

        <div
          className={`transition-all duration-500 ease-in-out flex-1 flex flex-col ${
            transitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          {screen === 0 && (
            <PremiumIntro
              title={t('app_title', 'Clarity Dump')}
              description={t('welcome_desc', 'Declutter your mind by writing, categorization, and dedicated work focus.')}
              onStart={() => goTo(1)}
              icon={<Brain size={32} />}
              benefits={[
                t('intro_p1', 'Clear persistent mental loops'),
                t('intro_p2', 'Uncover actionable tasks'),
                t('intro_p3', 'Build momentum through tiny actions'),
              ]}
              duration={t('app_duration', '5-10 minutes')}
            >
              {savedSessions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 text-center"
                >
                  <button
                    onClick={() => setShowSaved(true)}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-primary font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    <History size={16} />
                    {t('intro.viewHistory', 'View History')}
                  </button>
                </motion.div>
              )}
            </PremiumIntro>
          )}
          {screen === 1 && <BrainDump onComplete={handleDumpComplete} />}
          {screen === 2 && <SortThoughts thoughts={thoughts} onComplete={handleSortComplete} onBack={() => goTo(1)} />}
          {screen === 3 && <OneSmallStep thoughts={thoughts.filter((t) => t.bucket === "action")} onComplete={() => goTo(4)} onBack={() => goTo(2)} />}
          {screen === 4 && <Reflection onComplete={handleReflectionComplete} onBack={() => goTo(0)} />}
        </div>
      </div>
    </PremiumLayout>
  );
}

export default function BrainDumpAppPage() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrainDumpAppInner />
    </I18nextProvider>
  );
}
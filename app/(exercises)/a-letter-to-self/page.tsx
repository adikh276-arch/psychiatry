'use client';

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Calendar, Trash2, Loader2, Sparkles, Heart, ChevronDown, Check, Send, Save, History, X } from 'lucide-react';
import i18n, { loadLocale } from './i18n';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';
import { apiPath } from '@/lib/apiPath';

// --- Types ---

interface LetterEntry {
  id: string;
  date: string;
  time: string;
  content: string;
  emotionalState: string;
  createdAt: string;
  updatedAt: string;
}

// --- Helper Functions ---

const generateId = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const getCurrentDate = () => new Date().toISOString().split('T')[0];

const getCurrentTime = () => {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDateString = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const EMOTIONS = [
  "I feel lighter than before.",
  "I feel emotional but supported.",
  "I feel neutral, but I'm glad I wrote.",
  "I still feel heavy, but this helped a little.",
  "I'm not sure what I feel yet.",
];

// --- Sub-screens ---

// 1. Intro
interface IntroScreenProps {
  onStart: () => void;
  onViewHistory: () => void;
}

function IntroScreen({ onStart, onViewHistory }: IntroScreenProps) {
  const { t } = useTranslation(undefined, { i18n });

  return (
    <PremiumIntro
      title={t('app_title', 'Letter to Self')}
      description={t('app_description', 'A moment of kindness, just for you')}
      onStart={onStart}
      icon={<Mail size={32} />}
      benefits={[
        t('intro_p1', 'No judgments. No pressure. Just you.'),
        t('intro_p2', 'A space for reflection'),
        t('intro_p3', 'Connect with your future self'),
      ]}
      duration={t('app_duration', '10-15 minutes')}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <button
          onClick={onViewHistory}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-primary font-black text-[10px] uppercase tracking-widest transition-all"
        >
          <History size={16} />
          {t('view_past_letters', 'View Past Letters')}
        </button>
      </motion.div>
    </PremiumIntro>
  );
}

// 2. Writing
interface WritingScreenProps {
  content: string;
  setContent: (val: string) => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  onSave: () => void;
  onFinish: () => void;
  onBack: () => void;
}

function WritingScreen({
  content,
  setContent,
  saveStatus,
  onSave,
  onFinish,
  onBack,
}: WritingScreenProps) {
  const { t, i18n: translationInstance } = useTranslation(undefined, { i18n });
  const [inspirationOpen, setInspirationOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const localizedPrompts = useMemo(() => {
    const p = t('prompts', { returnObjects: true });
    if (Array.isArray(p)) return p;
    return [
      "What have I been handling well lately?",
      "What would I tell myself on a difficult day?",
      "What strengths helped me get through recent stress?",
      "What hope or encouragement do I need right now?",
      "What would a kind friend say to me today?",
      "What am I proud of, even quietly?",
    ];
  }, [t]);

  const handlePromptClick = (prompt: string) => {
    setContent(content ? content + "\n\n" + prompt + "\n" : prompt + "\n");
    textareaRef.current?.focus();
  };

  const currentDate = new Date().toLocaleDateString(translationInstance.language || "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full space-y-10 pb-32">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
            {t('write_title', 'Write to Yourself')}
          </h1>
          <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
            <Calendar size={14} />
            {currentDate}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={saveStatus}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
          >
            {saveStatus === "saving" && (
              <span className="text-primary flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" /> {t('common.saving', 'Saving...')}
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-emerald-500 flex items-center gap-1.5">
                <Check size={12} /> {t('common.saved', 'Saved')}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('write_placeholder', "Dear me,\n\nI know things have been difficult...")}
          className="field-textarea min-h-[400px] text-xl px-10 py-10"
        />
      </motion.div>

      {/* Inspiration Prompt Section */}
      <div className="bg-white rounded-[2.5rem] border border-white/60 overflow-hidden shadow-sm group hover:border-primary/20 transition-all">
        <button
          onClick={() => setInspirationOpen(!inspirationOpen)}
          className="w-full flex items-center justify-between px-8 py-6 text-left hover:bg-slate-50 hover:shadow-xl hover:shadow-primary/40/50 transition-colors"
        >
          <div className="flex items-center gap-3 font-black text-slate-700 uppercase text-xs tracking-widest">
            <Sparkles className="text-primary" size={20} />
            {t('need_inspiration', 'Need Inspiration?')}
          </div>
          <motion.div
            animate={{ rotate: inspirationOpen ? 180 : 0 }}
            className="text-slate-300 group-hover:text-primary transition-colors"
          >
            <ChevronDown size={24} />
          </motion.div>
        </button>

        <AnimatePresence>
          {inspirationOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-8 pb-8 grid gap-4">
                {localizedPrompts.map((prompt: string) => (
                  <motion.button
                    key={prompt}
                    whileHover={{ scale: 1.02, x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePromptClick(prompt)}
                    className="text-left bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 text-slate-700 rounded-2xl px-6 py-5 text-base font-bold hover:bg-primary/5 hover:text-primary transition-all border border-transparent hover:border-primary/10 shadow-sm"
                  >
                    &quot;{prompt}&quot;
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-10 z-20">
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSave}
            className="flex-1 py-5 rounded-[2rem] bg-white border border-white/60 text-slate-400 font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200/50 flex items-center justify-center gap-3 hover:text-slate-900 hover:border-slate-200 transition-all"
          >
            <Save size={20} />{t('common.save', 'Save')}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onFinish}
            disabled={!content.trim()}
            className="flex-2 py-5 rounded-[2rem] bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-40 disabled:shadow-none"
          >
            {t('finish', 'Finish')}<Send size={22} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// 3. Emotional Check-in
interface EmotionalCheckInProps {
  onComplete: (emotion: string) => void;
  onBack: () => void;
}

function EmotionalCheckIn({ onComplete, onBack }: EmotionalCheckInProps) {
  const { t } = useTranslation(undefined, { i18n });
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="w-full space-y-10 pb-32">
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
          <Heart size={16} />
          {t('post_writing_reflection', 'Post-Writing Reflection')}
        </div>
        <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
          {t('check_in_title', 'How are you feeling?')}
        </h1>
        <p className="text-slate-500 text-lg font-bold leading-relaxed max-w-sm">
          {t('reflection_desc', 'Acknowledging your feelings is a powerful step in your journey.')}
        </p>
      </header>

      <div className="grid gap-4">
        {EMOTIONS.map((emotion, i) => {
          const isSelected = selected === emotion;
          return (
            <motion.button
              key={emotion}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02, x: 8 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(emotion)}
              className={`w-full flex items-center justify-between px-10 py-8 rounded-[2.5rem] border transition-all duration-300 text-left group ${
                isSelected 
                  ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" 
                  : "bg-white/40 backdrop-blur-sm shadow-sm border border-white/50  border-transparent text-slate-700  hover:bg-white  hover:border-primary/10 shadow-sm"
              }`}
            >
              <span className="text-lg font-black">{emotion}</span>
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                  >
                    <Check size={20} strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-10 z-20">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => selected && onComplete(selected)}
          disabled={!selected}
          className="w-full py-5 rounded-[2rem] bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:shadow-none"
        >
          {t('finish_save_reflection', 'Finish & Save Reflection')}
          <Send size={22} />
        </motion.button>
      </div>
    </div>
  );
}

// 4. Past Letters
interface PastLettersProps {
  entries: LetterEntry[];
  onSelect: (entry: LetterEntry) => void;
  onDelete: (id: string) => void;
  onWriteNew: () => void;
  loading: boolean;
}

function PastLetters({ entries, onSelect, onDelete, onWriteNew, loading }: PastLettersProps) {
  const { t } = useTranslation(undefined, { i18n });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{t('loading_journey', 'Loading Journey...')}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 pb-12">
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
          <Sparkles size={16} />
          {t('your_written_journey', 'Your Written Journey')}
        </div>
        <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
          {t('saved_letters', 'Saved Letters')}
        </h1>
        <p className="text-slate-500 text-lg font-bold leading-relaxed max-w-sm">
          {t('reflect_on_your_growth_through_your_past_words', 'Reflect on your growth through your past words.')}
        </p>
      </header>

      {(!entries || entries.length === 0) ? (
        <div className="text-center py-24 bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 rounded-[3rem] border border-dashed border-slate-200 space-y-8 group hover:border-primary/20 transition-all">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-100 shadow-sm group-hover:scale-110 transition-transform">
            <Mail size={48} strokeWidth={1} />
          </div>
          <div className="space-y-2">
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">{t('no_letters_found_yet', 'No letters found yet')}</p>
            <p className="text-slate-300 text-sm font-bold">{t('your_future_self_is_waiting_to_hear_from_you', 'Your future self is waiting to hear from you.')}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onWriteNew}
            className="px-10 py-5 bg-primary text-white font-black text-lg rounded-[2rem] shadow-xl shadow-primary/20 hover:shadow-2xl transition-all"
          >
            {t('write_first_letter', 'Write First Letter')}
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {entries.map((entry, i) => (
            <motion.button
              key={entry.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.01, y: -4 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(entry)}
              className="w-full text-left bg-white rounded-[2.5rem] border border-white/60 p-10 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all group flex flex-col gap-6"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-primary transition-colors">
                  <Calendar size={14} />
                  {formatDateString(entry.date)}
                </div>
                {entry.emotionalState && (
                  <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
                    {entry.emotionalState}
                  </div>
                )}
              </div>
              <p className="text-slate-600 font-bold text-lg leading-relaxed line-clamp-3">
                {entry.content}
              </p>
              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-slate-500 transition-colors">{t('read_full_letter', 'Read Full Letter')}</span>
                <Mail size={16} className="text-slate-200 group-hover:text-primary transition-all" />
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[101] p-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[3rem] border-4 border-white/60 p-12 max-w-md w-full shadow-2xl pointer-events-auto"
              >
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-slate-900 leading-tight">
                    {t('delete_letter', 'Delete Letter?')}
                  </h3>
                  <p className="text-slate-500 text-lg font-bold leading-relaxed">
                    {t('this_memory_will_be_removed_from_your_journey_this', 'This memory will be removed from your journey. This action cannot be undone.')}
                  </p>
                </div>
                <div className="mt-10 flex gap-4">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="flex-1 rounded-2xl py-4 border border-white/60 font-black text-sm uppercase tracking-widest hover:bg-slate-50 hover:shadow-xl hover:shadow-primary/40 transition-all text-slate-500"
                  >
                    {t('cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={() => {
                      onDelete(deleteId);
                      setDeleteId(null);
                    }}
                    className="flex-1 rounded-2xl py-4 bg-rose-500 hover:bg-rose-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-200 transition-all"
                  >
                    {t('delete', 'Delete')}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// 5. Letter Detail View
interface LetterDetailProps {
  entry: LetterEntry;
  onBack: () => void;
  onDeleteRequest: (id: string) => void;
}

function LetterDetail({ entry, onBack, onDeleteRequest }: LetterDetailProps) {
  const { t } = useTranslation(undefined, { i18n });

  return (
    <div className="w-full space-y-10 pb-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[3rem] border border-white/60 p-12 shadow-xl shadow-slate-200/40 space-y-10 text-left relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-10 text-slate-100 pointer-events-none opacity-40">
          <Mail size={120} strokeWidth={1} />
        </div>

        <div className="flex items-center justify-between border-b border-slate-50 pb-8 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
              <Calendar size={14} />
              {formatDateString(entry.date)}
            </div>
            <p className="text-slate-400 font-bold text-xs">{entry.time}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, color: '#EF4444' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDeleteRequest(entry.id)}
            className="w-12 h-12 rounded-2xl bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 text-slate-300 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
          >
            <Trash2 size={20} />
          </motion.button>
        </div>

        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-xl font-bold relative z-10">
          {entry.content}
        </p>

        {entry.emotionalState && (
          <div className="pt-10 border-t border-slate-50 relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              {t('how_you_felt_after_writing', 'How you felt after writing')}
            </p>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full text-sm font-black shadow-sm">
              <Heart size={16} fill="currentColor" />
              {entry.emotionalState}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// --- Main Page Component ---

type Screen = 'intro' | 'write' | 'check-in' | 'complete' | 'history' | 'detail';

function ALetterToSelfInner() {
  const { t } = useTranslation(undefined, { i18n });
  const [screen, setScreen] = useState<Screen>('intro');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const [entries, setEntries] = useState<LetterEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<LetterEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);

  // Maintain unique entry state across edits/saves
  const currentEntryRef = useRef<LetterEntry>({
    id: generateId(),
    date: getCurrentDate(),
    time: getCurrentTime(),
    content: '',
    emotionalState: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const searchParams = useSearchParams();

  // Load language dynamically based on url search param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lang = searchParams.get('lang') || 'en';
      loadLocale(lang);
    }
  }, [searchParams]);

  // Fetch past letters from Server API
  const fetchLetters = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiPath('/api/letters'));
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((row: any) => {
          const dateStr = (row.created_at || new Date().toISOString()).replace(' ', 'T') + (!row.created_at || row.created_at.includes('Z') ? '' : 'Z');
          const d = new Date(dateStr);
          return {
            id: row.id,
            content: row.content,
            emotionalState: row.emotional_state,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            date: d.toISOString(),
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        });
        setEntries(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch letters from server:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = useCallback(async (text: string) => {
    setSaveStatus('saving');
    currentEntryRef.current.content = text;
    currentEntryRef.current.updatedAt = new Date().toISOString();
    try {
      const res = await fetch(apiPath('/api/letters'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentEntryRef.current),
      });
      if (res.ok) {
        setSaveStatus('saved');
      } else {
        setSaveStatus('idle');
      }
    } catch (err) {
      console.error('Auto save error:', err);
      setSaveStatus('idle');
    }
  }, []);

  // Auto-saving logic every 5 seconds while typing
  useEffect(() => {
    if (!content || screen !== 'write') return;
    const timer = setInterval(() => {
      handleSave(content);
    }, 5000);
    return () => clearInterval(timer);
  }, [content, screen, handleSave]);

  const handleFinishWriting = async () => {
    await handleSave(content);
    setScreen('check-in');
  };

  const handleCompleteCheckIn = async (emotion: string) => {
    currentEntryRef.current.emotionalState = emotion;
    currentEntryRef.current.updatedAt = new Date().toISOString();
    try {
      await fetch(apiPath('/api/letters'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentEntryRef.current),
      });

      setScreen('complete');
    } catch (err) {
      console.error('Final letter save failed:', err);
      setScreen('complete');
    }
  };

  const handleDeleteLetter = async (id: string) => {
    try {
      const res = await fetch(apiPath(`/api/letters?id=${id}`), {
        method: 'DELETE',
      });
      if (res.ok) {
        setEntries((prev) => prev.filter((item) => item.id !== id));
        if (selectedEntry?.id === id) {
          setSelectedEntry(null);
          setScreen('history');
        }
      }
    } catch (err) {
      console.error('Failed to delete letter:', err);
    }
  };

  const handleRestart = () => {
    // Reset writing buffer
    setContent('');
    currentEntryRef.current = {
      id: generateId(),
      date: getCurrentDate(),
      time: getCurrentTime(),
      content: '',
      emotionalState: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setScreen('write');
  };

  const handleViewHistory = () => {
    fetchLetters();
    setScreen('history');
  };

  const handleSelectEntry = (entry: LetterEntry) => {
    setSelectedEntry(entry);
    setScreen('detail');
  };

  return (
    <PremiumLayout
      title={t('app_title', 'Letter to Self')}
      icon={<Mail className="w-6 h-6 text-primary" />}
      onBack={
        screen === 'write'
          ? () => setScreen('intro')
          : screen === 'check-in'
          ? () => setScreen('write')
          : screen === 'history'
          ? () => setScreen('intro')
          : screen === 'detail'
          ? () => setScreen('history')
          : undefined
      }
      onReset={screen !== 'intro' && screen !== 'complete' ? () => setScreen('intro') : undefined}
    >
      <div className="w-full">
        <AnimatePresence mode="wait">
          {screen === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full"
            >
              <IntroScreen
                onStart={() => setScreen('write')}
                onViewHistory={handleViewHistory}
              />
            </motion.div>
          )}

          {screen === 'write' && (
            <motion.div
              key="write"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full"
            >
              <WritingScreen
                content={content}
                setContent={(v) => {
                  setContent(v);
                  setSaveStatus('idle');
                }}
                saveStatus={saveStatus}
                onSave={() => handleSave(content)}
                onFinish={handleFinishWriting}
                onBack={() => setScreen('intro')}
              />
            </motion.div>
          )}

          {screen === 'check-in' && (
            <motion.div
              key="check-in"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full"
            >
              <EmotionalCheckIn
                onComplete={handleCompleteCheckIn}
                onBack={() => setScreen('write')}
              />
            </motion.div>
          )}

          {screen === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full"
            >
              <PremiumComplete
                title={t('app_title', 'Letter to Self')}
                message={t('completion_message', "Your letter has been saved safely. Take a moment to appreciate your progress.")}
                onRestart={handleRestart}
                icon={<Mail size={48} />}
                  shareContent={"I just completed 'A Letter to Self' on TherapyMantra — a guided reflective writing that genuinely helped me. Try it! \n\n Android: https://play.google.com/store/apps/details?id=org.mantracare.therapy\n iOS: https://apps.apple.com/pk/app/therapymantra/id1607643888"}
              >
                <div className="w-full max-w-md mx-auto mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleViewHistory}
                    className="w-full py-5 rounded-[2rem] bg-white/60 backdrop-blur-md border border-white/60 shadow-inner text-slate-500 font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200/50 hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center gap-3"
                  >
                    <History size={20} />{t('view_past_letters', 'View Past Letters')}
                  </motion.button>
                </div>
              </PremiumComplete>
            </motion.div>
          )}

          {screen === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full"
            >
              <PastLetters
                entries={entries}
                onSelect={handleSelectEntry}
                onDelete={handleDeleteLetter}
                onWriteNew={handleRestart}
                loading={loading}
              />
            </motion.div>
          )}

          {screen === 'detail' && selectedEntry && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full"
            >
              <LetterDetail
                entry={selectedEntry}
                onBack={() => setScreen('history')}
                onDeleteRequest={(id) => setDeletePendingId(id)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic letter deletion modal in detailed letter view */}
      <AnimatePresence>
        {deletePendingId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletePendingId(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[101] p-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[3rem] border-4 border-white/60 p-12 max-w-md w-full shadow-2xl pointer-events-auto"
              >
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-slate-900 leading-tight">
                    {t('delete_letter', 'Delete Letter?')}
                  </h3>
                  <p className="text-slate-500 text-lg font-bold leading-relaxed">
                    {t('this_memory_will_be_removed_from_your_journey_this', 'This memory will be removed from your journey. This action cannot be undone.')}
                  </p>
                </div>
                <div className="mt-10 flex gap-4">
                  <button
                    onClick={() => setDeletePendingId(null)}
                    className="flex-1 rounded-2xl py-4 border border-white/60 font-black text-sm uppercase tracking-widest hover:bg-slate-50 hover:shadow-xl hover:shadow-primary/40 transition-all text-slate-500"
                  >
                    {t('cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteLetter(deletePendingId);
                      setDeletePendingId(null);
                    }}
                    className="flex-1 rounded-2xl py-4 bg-rose-500 hover:bg-rose-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-200 transition-all"
                  >
                    {t('delete', 'Delete')}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </PremiumLayout>
  );
}

export default function ALetterToSelfPage() {
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<div>Loading...</div>}>
        <ALetterToSelfInner />
      </Suspense>
    </I18nextProvider>
  );
}
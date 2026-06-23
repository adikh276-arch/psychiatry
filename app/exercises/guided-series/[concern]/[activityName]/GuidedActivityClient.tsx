'use client';
import { parseDbDate } from '@/lib/dateUtils';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, CheckCircle2, History, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/i18n';
import { loadGlobalResource as loadLocale } from '@/lib/i18n/i18n';
import { apiPath } from '@/lib/apiPath';

interface GuidedActivityClientProps {
  concern: string;
  activityName: string;
}

type UiType = 'THOUGHT_RECORD' | 'REFRAME' | 'CHECKLIST' | 'ASSESSMENT' | 'DEFAULT';

function getUiType(name: string): UiType {
  const n = name.toLowerCase();
  if (n.includes('thought record')) return 'THOUGHT_RECORD';
  if (n.includes('reframe') || n.includes('transforming')) return 'REFRAME';
  if (n.includes('check') || n.includes('signs') || n.includes('checklist')) return 'CHECKLIST';
  if (n.includes('mood') || n.includes('stress') || n.includes('grief')) return 'ASSESSMENT';
  if (n.includes('log') || n.includes('habit')) return 'LOG' as any;
  return 'DEFAULT';
}

interface HistoryEntry {
  created_at: string;
  entry_data: Record<string, any>;
}

export function GuidedActivityClient({ concern, activityName }: GuidedActivityClientProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lang = params.get('lang') || 'en';
      if (typeof loadLocale === 'function') {
        loadLocale(lang);
      }
    }
  }, []);

  const router = useRouter();
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const uiType = getUiType(activityName);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(apiPath(`/api/guided-series/history?concern=${encodeURIComponent(concern)}&activity=${encodeURIComponent(activityName)}`));
      if (res.ok) {
        const rows = await res.json();
        setHistory(rows);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, [concern, activityName]);

  const handleSave = async () => {
    const finalData = uiType === 'DEFAULT' ? { reflection } : formData;
    setIsSaving(true);
    try {
      const res = await fetch(apiPath('/api/guided-series/save'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concern, activityName, entryData: finalData }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setReflection('');
        setFormData({});
        fetchHistory();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const renderSpecializedUI = () => {
    switch (uiType) {
      case 'THOUGHT_RECORD':
        return (
          <div className="space-y-5">
            <div className="bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 p-4 rounded-2xl border border-white/60">
              <label className="text-[13px] font-bold text-slate-400 uppercase mb-2 block">{t('the_situation', 'The Situation')}</label>
              <input type="text" placeholder={t('what_happened', 'What happened?')} className="w-full bg-transparent outline-none text-slate-700 font-medium"
                onChange={(e) => setFormData({ ...formData, situation: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 p-4 rounded-2xl border border-white/60">
                <label className="text-[13px] font-bold text-slate-400 uppercase mb-2 block">{t('emotion', 'Emotion')}</label>
                <input type="text" placeholder={t('e_g_anxiety', 'e.g. Anxiety')} className="w-full bg-transparent outline-none text-slate-700 font-medium"
                  onChange={(e) => setFormData({ ...formData, emotion: e.target.value })} />
              </div>
              <div className="bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 p-4 rounded-2xl border border-white/60">
                <label className="text-[13px] font-bold text-slate-400 uppercase mb-2 block">{t('intensity', 'Intensity')}</label>
                <input type="number" placeholder={t('1_10', '1-10')} className="w-full bg-transparent outline-none text-slate-700 font-medium"
                  onChange={(e) => setFormData({ ...formData, intensity: e.target.value })} />
              </div>
            </div>
            <div className="bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 p-4 rounded-2xl border border-white/60">
              <label className="text-[13px] font-bold text-slate-400 uppercase mb-2 block">{t('automatic_thought', 'Automatic Thought')}</label>
              <textarea placeholder={t('what_was_your_mind_telling_you', 'What was your mind telling you?')} className="w-full bg-transparent outline-none text-slate-700 font-medium h-20 resize-none"
                onChange={(e) => setFormData({ ...formData, thought: e.target.value })} />
            </div>
          </div>
        );

      case 'REFRAME':
        return (
          <div className="space-y-4">
            <div className="p-6 bg-red-50/50 rounded-3xl border border-red-100">
              <h4 className="text-red-800 font-bold mb-3 flex items-center gap-2">
                <X size={16} />{t('negative_thought', 'Negative Thought')}
              </h4>
              <textarea placeholder={t('the_original_thought', 'The original thought...')} className="w-full bg-white/60 p-4 rounded-xl border border-red-100 outline-none h-20 resize-none"
                onChange={(e) => setFormData({ ...formData, negative: e.target.value })} />
            </div>
            <div className="p-6 bg-green-50/50 rounded-3xl border border-green-100">
              <h4 className="text-green-800 font-bold mb-3 flex items-center gap-2">
                <Plus size={16} />{t('empowered_reframe', 'Empowered Reframe')}
              </h4>
              <textarea placeholder={t('the_more_balanced_view', 'The more balanced view...')} className="w-full bg-white/60 p-4 rounded-xl border border-green-100 outline-none h-20 resize-none"
                onChange={(e) => setFormData({ ...formData, positive: e.target.value })} />
            </div>
          </div>
        );

      case 'CHECKLIST': {
        const options = activityName.toLowerCase().includes('postpartum')
          ? [t('checklist.low_mood', 'Low mood'), t('checklist.anxiety', 'Anxiety'), t('checklist.sleep_issues', 'Sleep issues'), t('checklist.fatigue', 'Fatigue'), t('checklist.irritability', 'Irritability')]
          : [t('checklist.feeling_trapped', 'Feeling trapped'), t('checklist.lack_of_interest', 'Lack of interest'), t('checklist.changes_in_appetite', 'Changes in appetite'), t('checklist.sleep_disturbance', 'Sleep disturbance'), t('checklist.negative_self_talk', 'Negative self-talk')];
        return (
          <div className="space-y-3">
            <p className="text-slate-500 text-sm mb-4">{t('select_all_that_apply_to_you_currently', 'Select all that apply to you currently:')}</p>
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  const current: string[] = formData.checked || [];
                  const next = current.includes(opt) ? current.filter((c) => c !== opt) : [...current, opt];
                  setFormData({ ...formData, checked: next });
                }}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  (formData.checked || []).includes(opt)
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                    : 'bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 border-white/60 text-slate-600 hover:border-slate-200'
                }`}
              >
                <span className="font-medium">{opt}</span>
                {(formData.checked || []).includes(opt) && <CheckCircle2 size={18} />}
              </button>
            ))}
          </div>
        );
      }

      case 'ASSESSMENT':
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">{t('intensity_level', 'Intensity Level')}</p>
              <div className="flex justify-between max-w-sm mx-auto">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setFormData({ ...formData, rating: num })}
                    className={`w-12 h-12 rounded-2xl font-black text-lg transition-all ${
                      formData.rating === num
                        ? 'bg-blue-600 text-white scale-110 shadow-xl'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex justify-between max-w-sm mx-auto mt-2 px-1">
                <span className="text-[10px] font-bold text-slate-300">{t('low', 'LOW')}</span>
                <span className="text-[10px] font-bold text-slate-300">{t('high', 'HIGH')}</span>
              </div>
            </div>
            <textarea
              value={reflection}
              onChange={(e) => {
                setReflection(e.target.value);
                setFormData({ ...formData, note: e.target.value });
              }}
              placeholder={t('start_typing_your_reflection_here', 'Start typing your reflection here...')}
              className="w-full p-6 bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 border border-white/60 rounded-3xl outline-none h-40 resize-none text-slate-700"
            />
          </div>
        );

      default:
        return (
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder={t('start_typing_your_reflection_here', 'Start typing your reflection here...')}
            className="w-full h-64 p-8 bg-[#F8FAFC] border border-white/60 rounded-[32px] focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400 transition-all resize-none text-slate-700 text-lg placeholder:text-slate-300 leading-relaxed"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/60 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 hover:bg-slate-100 rounded-full transition-colors bg-white/40 backdrop-blur-sm shadow-sm border border-white/50"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-800 truncate max-w-[200px]">{t('hub.guided_series', 'Guided Series')}</h1>
        </div>
        <button
          onClick={() => { setShowHistory(!showHistory); if (!showHistory) fetchHistory(); }}
          className="p-2.5 hover:bg-slate-100 rounded-full transition-colors bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 relative"
        >
          <History size={20} className={showHistory ? 'text-blue-500' : 'text-slate-400'} />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white/60"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
              {t(`guided_series.${activityName}`, activityName)}
            </h2>
            <p className="text-slate-400 leading-relaxed font-medium text-[16px]">
              {t('take_a_moment_to_reflect_on_this_activity_use_the_', 'Take a moment to reflect on this activity. Use the space below to write down your thoughts, feelings, or findings.')}
            </p>
          </div>

          <div className="relative">
            {renderSpecializedUI()}

            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-white/98 rounded-[32px] backdrop-blur-md z-10"
                >
                  <div className="text-center">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={48} className="text-green-500" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">{t('entry_saved', 'Entry Saved!')}</h3>
                    <p className="text-slate-400 mt-2 font-medium">{t('your_progress_is_safely_recorded', 'Your progress is safely recorded.')}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full mt-10 py-6 rounded-[24px] flex items-center justify-center gap-3 text-lg font-black transition-all active:scale-[0.98] ${
              !isSaving
                ? 'bg-slate-900 text-white shadow-md hover:bg-black shadow-2xl shadow-slate-200'
                : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
            }`}
          >
            {isSaving ? (
              <div className="w-6 h-6 rounded-full border border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <Send size={20} className="opacity-70" />
                {t('save_reflection', 'Save Reflection')}
              </>
            )}
          </button>
        </motion.div>

        {/* History Section */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12"
            >
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-4">
                {t('previous_records', 'Previous Records')}
              </h3>

              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((entry, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[32px] border border-white/60 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                          {parseDbDate(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(entry.entry_data).map(([key, val]) => (
                          <div key={key} className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">{key}</span>
                            <span className="text-slate-700 font-medium leading-relaxed">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-100/30 rounded-[32px] p-12 text-center border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-bold">{t('no_history_available_yet', 'No history available yet.')}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

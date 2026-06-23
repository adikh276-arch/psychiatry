'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, ArrowRight, Check, History, Loader2, Calendar, Sparkles, ChevronLeft } from 'lucide-react';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';
import { apiPath } from '@/lib/apiPath';
import { parseDbDate } from '@/lib/dateUtils';

type Screen = 'intro' | 'checkin' | 'confirmation' | 'history';

const dimensions = [
  { key: 'mood',         label: 'Mood',         low: 'Very Low',   high: 'Very High',  color: '#7C3AED' },
  { key: 'energy',       label: 'Energy',       low: 'Depleted',   high: 'Energised',  color: '#0284C7' },
  { key: 'sleep',        label: 'Sleep Quality',low: 'Very Poor',  high: 'Excellent',  color: '#059669' },
  { key: 'focus',        label: 'Focus',        low: 'Scattered',  high: 'Sharp',      color: '#EA580C' },
  { key: 'irritability', label: 'Irritability', low: 'Calm',       high: 'Very High',  color: '#DC2626' },
];

interface CheckInEntry {
  id: string;
  scores: Record<string, number>;
  note: string;
  created_at: string;
}

function SymptomCheckInInner() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [scores, setScores] = useState<Record<string, number>>({ mood: 5, energy: 5, sleep: 5, focus: 5, irritability: 3 });
  const [note, setNote] = useState('');
  const [history, setHistory] = useState<CheckInEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiPath('/api/symptom-check-in'));
      if (res.ok) setHistory(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (screen === 'history') fetchHistory();
  }, [screen, fetchHistory]);

  const handleSubmit = async () => {
    try {
      await fetch(apiPath('/api/symptom-check-in'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores, note }),
      });
    } catch (e) { console.error(e); }
    setScreen('confirmation');
  };

  const handleReset = () => {
    setScores({ mood: 5, energy: 5, sleep: 5, focus: 5, irritability: 3 });
    setNote('');
    setScreen('intro');
  };

  const overallScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / dimensions.length);

  return (
    <PremiumLayout
      title={screen === 'history' ? 'Check-In History' : 'Symptom Check-In'}
      icon={<ScanLine className="w-6 h-6 text-violet-600" />}
      onReset={screen !== 'intro' ? handleReset : undefined}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-4 py-4 min-h-[70vh]">
        <AnimatePresence mode="wait">
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex-1 flex flex-col">
              <PremiumIntro
                title="Symptom Check-In"
                description="A quick 5-dimension daily snapshot of how you're doing — clinically and personally."
                onStart={() => setScreen('checkin')}
                icon={<ScanLine size={32} className="text-violet-600" />}
                benefits={[
                  'Rate mood, energy, sleep, focus, and irritability in under 2 minutes.',
                  'Track patterns that matter to your treatment over time.',
                  'Bring your history to your next psychiatrist appointment.',
                ]}
                duration="2 minutes"
              >
                <div className="mt-8 text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setScreen('history')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 font-bold text-sm transition-colors"
                  >
                    <History size={18} /> View History
                  </motion.button>
                </div>
              </PremiumIntro>
            </motion.div>
          )}

          {screen === 'checkin' && (
            <motion.div key="checkin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-1">Today's Check-In</p>
                <h1 className="act-heading">How are you doing?</h1>
                <p className="text-slate-500 text-sm mt-1">Rate each dimension from 1 (low) to 10 (high).</p>
              </div>

              <div className="space-y-5">
                {dimensions.map((dim) => (
                  <div key={dim.key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-800 text-sm">{dim.label}</label>
                      <span className="text-2xl font-black" style={{ color: dim.color }}>{scores[dim.key]}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider px-0.5">
                      <span>{dim.low}</span><span>{dim.high}</span>
                    </div>
                    <input
                      type="range" min={1} max={10} value={scores[dim.key]}
                      onChange={(e) => setScores(s => ({ ...s, [dim.key]: Number(e.target.value) }))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${dim.color} 0%, ${dim.color} ${(scores[dim.key] - 1) / 9 * 100}%, #e2e8f0 ${(scores[dim.key] - 1) / 9 * 100}%, #e2e8f0 100%)`
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="field-label">Anything you want to note? (optional)</label>
                <textarea
                  className="field-textarea min-h-[80px]"
                  placeholder="Unusual symptoms, medication change, stressful event..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>

              <button onClick={handleSubmit} className="act-btn-primary">
                Save Check-In <Check size={16} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}

          {screen === 'confirmation' && (
            <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <PremiumComplete
                title="Check-In Saved"
                message={`Overall score: ${overallScore}/10 — logged and ready to share with your psychiatrist.`}
                onRestart={handleReset}
                onHome={handleReset}
                icon={<ScanLine size={48} className="text-violet-600" />}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setScreen('history')}
                  className="w-full py-4 rounded-[2rem] bg-white/60 border border-white/60 shadow-inner text-slate-500 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 mt-4"
                >
                  <History size={18} /> View History
                </motion.button>
              </PremiumComplete>
            </motion.div>
          )}

          {screen === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col space-y-6 pb-20">
              <div className="flex items-center gap-3">
                <button onClick={() => setScreen('intro')} className="p-2 rounded-xl hover:bg-white text-slate-400 hover:text-slate-700 transition-all">
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-violet-500">Your History</p>
                  <h1 className="act-heading">Check-In Log</h1>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Loading your history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="p-6 bg-white/80 rounded-2xl border border-white text-center space-y-4 shadow-sm">
                  <Calendar size={32} className="mx-auto text-slate-300" />
                  <p className="text-slate-400 font-medium text-sm">No check-ins yet. Start today!</p>
                  <button onClick={() => setScreen('checkin')} className="act-btn-primary">Start First Check-In</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((entry, idx) => {
                    const overall = Math.round(Object.values(entry.scores).reduce((a, b) => a + b, 0) / dimensions.length);
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
                        className="p-5 bg-white/80 rounded-2xl border border-white shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
                            {parseDbDate(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                          <span className="text-2xl font-black text-violet-600">{overall}<span className="text-sm text-slate-400">/10</span></span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {dimensions.map(dim => (
                            <div key={dim.key} className="text-center">
                              <div className="text-lg font-black" style={{ color: dim.color }}>{entry.scores[dim.key] ?? '–'}</div>
                              <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">{dim.label.split(' ')[0]}</div>
                            </div>
                          ))}
                        </div>
                        {entry.note && <p className="text-slate-500 text-xs italic border-t border-slate-100 pt-2">"{entry.note}"</p>}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumLayout>
  );
}

export default function SymptomCheckInPage() {
  return <SymptomCheckInInner />;
}

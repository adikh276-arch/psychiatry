'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Check, History, Loader2, Calendar, ChevronLeft } from 'lucide-react';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';
import { apiPath } from '@/lib/apiPath';
import { parseDbDate } from '@/lib/dateUtils';

type Screen = 'intro' | 'log' | 'confirmation' | 'history';

const COMMON_EFFECTS = [
  'Fatigue / Sedation', 'Nausea', 'Weight Gain', 'Weight Loss',
  'Dry Mouth', 'Headache', 'Dizziness', 'Insomnia', 'Increased Appetite',
  'Decreased Appetite', 'Brain Fog', 'Emotional Blunting', 'Sexual Side Effects',
  'Tremor / Shaking', 'Constipation', 'Sweating', 'Restlessness (Akathisia)',
  'Blurred Vision', 'Memory Issues', 'Muscle Stiffness',
];

const SEVERITY_LABELS = ['Barely noticeable', 'Mild', 'Moderate', 'Significant', 'Severe'];

interface LogEntry {
  id: string;
  effect: string;
  severity: number;
  note: string;
  created_at: string;
}

function SideEffectLoggerInner() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [selectedEffect, setSelectedEffect] = useState('');
  const [customEffect, setCustomEffect] = useState('');
  const [severity, setSeverity] = useState(2);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiPath('/api/side-effect-logger'));
      if (res.ok) setHistory(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (screen === 'history') fetchHistory();
  }, [screen, fetchHistory]);

  const currentEffect = customEffect.trim() || selectedEffect;

  const handleSubmit = async () => {
    try {
      await fetch(apiPath('/api/side-effect-logger'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ effect: currentEffect, severity, note }),
      });
    } catch (e) { console.error(e); }
    setScreen('confirmation');
  };

  const handleReset = () => {
    setSelectedEffect(''); setCustomEffect(''); setSeverity(2); setNote('');
    setScreen('intro');
  };

  const severityColor = ['#10B981', '#84CC16', '#F59E0B', '#F97316', '#EF4444'][severity - 1];

  return (
    <PremiumLayout
      title={screen === 'history' ? 'Side Effect History' : 'Side Effect Logger'}
      icon={<Activity className="w-6 h-6 text-orange-500" />}
      onReset={screen !== 'intro' ? handleReset : undefined}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-4 py-4 min-h-[70vh]">
        <AnimatePresence mode="wait">
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex-1 flex flex-col">
              <PremiumIntro
                description="Track side effects consistently so you can advocate for yourself with real data — not just a vague 'I feel off' at your next appointment."
                onStart={() => setScreen('log')}
                icon={<Activity size={32} className="text-orange-500" />}
                benefits={[
                  'Pick from common side effects or describe your own.',
                  'Rate severity from barely noticeable to severe.',
                  'Build a timeline that speaks for you in the doctor\'s office.',
                ]}
                duration="1 minute"
              >
                <div className="mt-8 text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setScreen('history')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-500 font-bold text-sm transition-colors"
                  >
                    <History size={18} /> View History
                  </motion.button>
                </div>
              </PremiumIntro>
            </motion.div>
          )}

          {screen === 'log' && (
            <motion.div key="log" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">Log Entry</p>
                <h1 className="act-heading">What are you experiencing?</h1>
              </div>

              <div className="flex flex-wrap gap-2">
                {COMMON_EFFECTS.map(effect => (
                  <button
                    key={effect}
                    onClick={() => { setSelectedEffect(effect); setCustomEffect(''); }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                    style={selectedEffect === effect ? { backgroundColor: '#FFF7ED', borderColor: '#FB923C', color: '#EA580C' } : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: '#64748B' }}
                  >
                    {effect}
                  </button>
                ))}
              </div>

              <div>
                <label className="field-label">Or describe your own</label>
                <input
                  type="text" className="field-input"
                  placeholder="e.g. Jaw clenching, vivid dreams..."
                  value={customEffect}
                  onChange={e => { setCustomEffect(e.target.value); if (e.target.value.trim()) setSelectedEffect(''); }}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800 text-sm">Severity</label>
                  <span className="text-sm font-black" style={{ color: severityColor }}>{SEVERITY_LABELS[severity - 1]}</span>
                </div>
                <input
                  type="range" min={1} max={5} value={severity}
                  onChange={e => setSeverity(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, ${severityColor} 0%, ${severityColor} ${(severity - 1) / 4 * 100}%, #e2e8f0 ${(severity - 1) / 4 * 100}%, #e2e8f0 100%)` }}
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                  <span>Mild</span><span>Severe</span>
                </div>
              </div>

              <div>
                <label className="field-label">Extra notes (optional)</label>
                <textarea
                  className="field-textarea min-h-[80px]"
                  placeholder="When did it start? What makes it better or worse?"
                  value={note} onChange={e => setNote(e.target.value)}
                />
              </div>

              <button onClick={handleSubmit} disabled={!currentEffect} className="act-btn-primary">
                Log Side Effect <Check size={16} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}

          {screen === 'confirmation' && (
            <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <PremiumComplete
                title="Side Effect Logged"
                message={`"${currentEffect}" — rated ${SEVERITY_LABELS[severity - 1].toLowerCase()}. Saved to your history.`}
                onRestart={handleReset}
                onHome={handleReset}
                icon={<Activity size={48} className="text-orange-500" />}
              />
            </motion.div>
          )}

          {screen === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col space-y-5 pb-20">
              <div className="flex items-center gap-3">
                <button onClick={() => setScreen('intro')} className="p-2 rounded-xl hover:bg-white text-slate-400 hover:text-slate-700 transition-all">
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-500">Your Log</p>
                  <h1 className="act-heading">Side Effect History</h1>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
                </div>
              ) : history.length === 0 ? (
                <div className="p-6 bg-white/80 rounded-2xl text-center space-y-4 shadow-sm border border-white">
                  <Calendar size={32} className="mx-auto text-slate-300" />
                  <p className="text-slate-400 font-medium text-sm">No side effects logged yet.</p>
                  <button onClick={() => setScreen('log')} className="act-btn-primary">Log First Entry</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((entry, i) => {
                    const sColor = ['#10B981', '#84CC16', '#F59E0B', '#F97316', '#EF4444'][(entry.severity || 1) - 1];
                    return (
                      <motion.div key={entry.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className="p-4 bg-white/80 rounded-2xl border border-white shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-black text-slate-800 text-sm">{entry.effect}</p>
                          <span className="text-xs font-black px-2 py-1 rounded-full" style={{ backgroundColor: `${sColor}20`, color: sColor }}>
                            {SEVERITY_LABELS[(entry.severity || 1) - 1]}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold mt-1">
                          {parseDbDate(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        {entry.note && <p className="text-xs text-slate-500 italic mt-2">"{entry.note}"</p>}
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

export default function SideEffectLoggerPage() {
  return <SideEffectLoggerInner />;
}

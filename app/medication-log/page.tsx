'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, ArrowRight, Check, History, Loader2, Calendar, Plus, X, ChevronLeft } from 'lucide-react';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';
import { apiPath } from '@/lib/apiPath';
import { parseDbDate } from '@/lib/dateUtils';

type Screen = 'intro' | 'log' | 'confirmation' | 'history';

interface MedEntry {
  id: string;
  medication: string;
  dose: string;
  time: string;
  taken: boolean;
  note: string;
  created_at: string;
}

function MedicationLogInner() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [medication, setMedication] = useState('');
  const [dose, setDose] = useState('');
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [taken, setTaken] = useState(true);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState<MedEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiPath('/api/medication-log'));
      if (res.ok) setHistory(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (screen === 'history') fetchHistory();
  }, [screen, fetchHistory]);

  const handleSubmit = async () => {
    try {
      await fetch(apiPath('/api/medication-log'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medication, dose, time, taken, note }),
      });
    } catch (e) { console.error(e); }
    setScreen('confirmation');
  };

  const handleReset = () => {
    setMedication(''); setDose(''); setTime(new Date().toTimeString().slice(0, 5));
    setTaken(true); setNote('');
    setScreen('intro');
  };

  const canSubmit = medication.trim() && dose.trim();

  // Group history by date
  const grouped = history.reduce((acc: Record<string, MedEntry[]>, entry) => {
    const d = parseDbDate(entry.created_at).toDateString();
    if (!acc[d]) acc[d] = [];
    acc[d].push(entry);
    return acc;
  }, {});

  return (
    <PremiumLayout
      title={screen === 'history' ? 'Medication History' : 'Medication Log'}
      icon={<Pill className="w-6 h-6 text-sky-600" />}
      onReset={screen !== 'intro' ? handleReset : undefined}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-4 py-4 min-h-[70vh]">
        <AnimatePresence mode="wait">
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex-1 flex flex-col">
              <PremiumIntro
                description="Log your medications each day — what you took, when, and whether you skipped. A simple habit that gives your psychiatrist the most accurate picture."
                onStart={() => setScreen('log')}
                icon={<Pill size={32} className="text-sky-600" />}
                benefits={[
                  'Track doses, timing, and skipped medications.',
                  'Add notes about side effects or how you felt.',
                  'Build a history you can review before appointments.',
                ]}
                duration="1 minute"
              >
                <div className="mt-8 text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setScreen('history')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 font-bold text-sm transition-colors"
                  >
                    <History size={18} /> View Log History
                  </motion.button>
                </div>
              </PremiumIntro>
            </motion.div>
          )}

          {screen === 'log' && (
            <motion.div key="log" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-sky-500 mb-1">Log Entry</p>
                <h1 className="act-heading">Today's Medication</h1>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="field-label">Medication Name</label>
                  <input type="text" className="field-input" placeholder="e.g. Sertraline, Lithium, Ritalin..." value={medication} onChange={e => setMedication(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Dose</label>
                    <input type="text" className="field-input" placeholder="e.g. 50mg" value={dose} onChange={e => setDose(e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">Time Taken</label>
                    <input type="time" className="field-input" value={time} onChange={e => setTime(e.target.value)} />
                  </div>
                </div>

                {/* Taken / Skipped toggle */}
                <div>
                  <label className="field-label">Did you take it?</label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {[
                      { label: '✓ Taken', value: true,  accent: '#059669', bg: '#F0FDF4', border: '#A7F3D0' },
                      { label: '✗ Skipped', value: false, accent: '#DC2626', bg: '#FFF1F2', border: '#FECACA' },
                    ].map(opt => (
                      <button
                        key={String(opt.value)}
                        onClick={() => setTaken(opt.value)}
                        className="py-3 rounded-2xl font-bold text-sm transition-all border-2"
                        style={taken === opt.value ? { backgroundColor: opt.bg, borderColor: opt.border, color: opt.accent } : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#94a3b8' }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="field-label">Notes (optional)</label>
                  <textarea
                    className="field-textarea min-h-[80px]"
                    placeholder="Side effects, how you felt, reason for skipping..."
                    value={note} onChange={e => setNote(e.target.value)}
                  />
                </div>
              </div>

              <button onClick={handleSubmit} disabled={!canSubmit} className="act-btn-primary">
                Save Entry <Check size={16} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}

          {screen === 'confirmation' && (
            <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <PremiumComplete
                title="Entry Logged"
                message={`${medication} ${dose} — ${taken ? 'taken ✓' : 'skipped ✗'} at ${time}.`}
                onRestart={handleReset}
                onHome={handleReset}
                icon={<Pill size={48} className="text-sky-600" />}
              >
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setScreen('log')} className="flex-1 py-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 font-bold text-sm flex items-center justify-center gap-2">
                    <Plus size={16} /> Log Another
                  </button>
                  <button onClick={() => setScreen('history')} className="flex-1 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center gap-2">
                    <History size={16} /> View Log
                  </button>
                </div>
              </PremiumComplete>
            </motion.div>
          )}

          {screen === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col space-y-5 pb-20">
              <div className="flex items-center gap-3">
                <button onClick={() => setScreen('intro')} className="p-2 rounded-xl hover:bg-white text-slate-400 hover:text-slate-700 transition-all">
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-sky-500">Your Log</p>
                  <h1 className="act-heading">Medication History</h1>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                </div>
              ) : history.length === 0 ? (
                <div className="p-6 bg-white/80 rounded-2xl border border-white text-center space-y-4 shadow-sm">
                  <Calendar size={32} className="mx-auto text-slate-300" />
                  <p className="text-slate-400 font-medium text-sm">No entries yet.</p>
                  <button onClick={() => setScreen('log')} className="act-btn-primary">Log First Entry</button>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(grouped).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).map(([dateKey, entries]) => (
                    <div key={dateKey} className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">{new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                      {entries.map((entry, i) => (
                        <motion.div key={entry.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                          className={`p-4 rounded-2xl border shadow-sm ${entry.taken ? 'bg-green-50/80 border-green-100' : 'bg-red-50/80 border-red-100'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-black text-slate-800 text-sm">{entry.medication}</p>
                              <p className="text-xs text-slate-500 font-semibold">{entry.dose} · {entry.time}</p>
                            </div>
                            <span className={`text-xs font-black px-3 py-1 rounded-full ${entry.taken ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {entry.taken ? 'Taken' : 'Skipped'}
                            </span>
                          </div>
                          {entry.note && <p className="text-xs text-slate-400 mt-2 italic">"{entry.note}"</p>}
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumLayout>
  );
}

export default function MedicationLogPage() {
  return <MedicationLogInner />;
}

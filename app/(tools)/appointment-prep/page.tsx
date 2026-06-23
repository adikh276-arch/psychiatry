'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, ArrowRight, Check, Copy, CheckCheck } from 'lucide-react';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';

type Screen = 'intro' | 'step1' | 'step2' | 'step3' | 'summary';

const STEP_LABELS = ['Since Last Visit', 'Side Effects', 'Questions to Ask'];

function AppointmentPrepInner() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [sinceLastVisit, setSinceLastVisit] = useState('');
  const [sideEffects, setSideEffects] = useState('');
  const [questions, setQuestions] = useState('');
  const [copied, setCopied] = useState(false);

  const steps: Screen[] = ['step1', 'step2', 'step3'];
  const stepIndex = steps.indexOf(screen);

  const summary = `── PSYCHIATRY APPOINTMENT PREP ──

📋 SINCE MY LAST VISIT:
${sinceLastVisit || 'Nothing noted.'}

⚠️ SIDE EFFECTS / CONCERNS:
${sideEffects || 'None to report.'}

❓ QUESTIONS FOR MY DOCTOR:
${questions || 'No questions noted.'}

── Prepared with MantraCare Psychiatry ──`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Copy failed');
    }
  };

  const handleReset = () => {
    setSinceLastVisit(''); setSideEffects(''); setQuestions('');
    setCopied(false);
    setScreen('intro');
  };

  return (
    <PremiumLayout
      title="Appointment Prep"
      icon={<CalendarClock className="w-6 h-6 text-emerald-600" />}
      onReset={screen !== 'intro' ? handleReset : undefined}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-4 py-4 min-h-[70vh]">
        <AnimatePresence mode="wait">
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex-1 flex flex-col">
              <PremiumIntro
                description="Psychiatric appointments are short. This prep guide helps you say the right things, ask the right questions, and leave with better support."
                onStart={() => setScreen('step1')}
                icon={<CalendarClock size={32} className="text-emerald-600" />}
                benefits={[
                  'Summarise what changed since your last visit.',
                  'Document side effects clearly and concisely.',
                  'List your questions before they slip away in the moment.',
                  'Export a shareable summary card.',
                ]}
                duration="5–10 minutes"
              />
            </motion.div>
          )}

          {(screen === 'step1' || screen === 'step2' || screen === 'step3') && (
            <motion.div key={screen} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col space-y-6">
              {/* Step indicator */}
              <div className="flex gap-2">
                {STEP_LABELS.map((l, i) => (
                  <div key={l} className={`flex-1 h-1.5 rounded-full transition-all ${i <= stepIndex ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Step {stepIndex + 1} of 3 — {STEP_LABELS[stepIndex]}</p>

              {screen === 'step1' && (
                <>
                  <h1 className="act-heading">What's changed since your last visit?</h1>
                  <p className="act-body">Think about mood shifts, new symptoms, big life events, or changes in how you've been functioning day-to-day.</p>
                  <div>
                    <label className="field-label">Your notes</label>
                    <textarea
                      className="field-textarea min-h-[200px]"
                      placeholder="e.g. My sleep has been much worse this month. I had two days where I couldn't get out of bed. Work has been stressful and I think it triggered a low episode..."
                      value={sinceLastVisit}
                      onChange={e => setSinceLastVisit(e.target.value)}
                    />
                  </div>
                  <button onClick={() => setScreen('step2')} className="act-btn-primary disabled:opacity-40" disabled={!sinceLastVisit.trim()}>
                    Next: Side Effects <ArrowRight size={16} />
                  </button>
                </>
              )}

              {screen === 'step2' && (
                <>
                  <h1 className="act-heading">Any side effects or medication concerns?</h1>
                  <p className="act-body">Be specific — what, when, and how severe. Your doctor can only adjust what they know about.</p>
                  <div>
                    <label className="field-label">Side effects & concerns</label>
                    <textarea
                      className="field-textarea min-h-[200px]"
                      placeholder="e.g. I've been feeling very tired every morning since the dose increase. I also gained about 3kg in the last 6 weeks. The nausea after taking it has reduced..."
                      value={sideEffects}
                      onChange={e => setSideEffects(e.target.value)}
                    />
                  </div>
                  <button onClick={() => setScreen('step3')} className="act-btn-primary disabled:opacity-40" disabled={!sideEffects.trim()}>
                    Next: Questions <ArrowRight size={16} />
                  </button>
                </>
              )}

              {screen === 'step3' && (
                <>
                  <h1 className="act-heading">What do you want to ask your doctor?</h1>
                  <p className="act-body">Write your questions now while you're thinking clearly — not while you're in the appointment room.</p>
                  <div>
                    <label className="field-label">Your questions</label>
                    <textarea
                      className="field-textarea min-h-[200px]"
                      placeholder="e.g. Is the fatigue likely to get better? Could we try a lower dose? Are there alternatives with fewer weight-related side effects? When should we review my diagnosis again?..."
                      value={questions}
                      onChange={e => setQuestions(e.target.value)}
                    />
                  </div>
                  <button onClick={() => setScreen('summary')} className="act-btn-primary disabled:opacity-40" disabled={!questions.trim()}>
                    Generate Summary <Check size={16} />
                  </button>
                </>
              )}
            </motion.div>
          )}

          {screen === 'summary' && (
            <motion.div key="summary" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col space-y-5 pb-10">
              <PremiumComplete
                title="Ready for Your Appointment"
                message="Your prep notes are neatly summarized. Keep them handy for your doctor."
                onRestart={handleReset}
                icon={<CalendarClock size={48} className="text-emerald-600" />}
                shareContent={summary}
              >
                <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden mt-6 text-left">
                  {/* Header strip */}
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                    <p className="text-white font-black text-sm uppercase tracking-widest">Psychiatry Appointment Prep</p>
                    <p className="text-emerald-100 text-xs mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="p-6 space-y-5">
                    {[
                      { icon: '📋', label: 'Since My Last Visit', content: sinceLastVisit },
                      { icon: '⚠️', label: 'Side Effects & Concerns', content: sideEffects },
                      { icon: '❓', label: 'Questions for My Doctor', content: questions },
                    ].map(section => (
                      <div key={section.label} className="space-y-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{section.icon} {section.label}</p>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {section.content || <span className="text-slate-300 italic">Nothing noted.</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={handleCopy}
                  className={`w-full mt-4 py-4 rounded-2xl font-bold text-white text-base shadow-md flex items-center justify-center gap-2 transition-all ${copied ? 'opacity-90' : ''}`}
                  style={copied ? { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' } : { background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                >
                  {copied ? <><CheckCheck size={20} /> Copied!</> : <><Copy size={20} /> Copy Summary</>}
                </button>
              </PremiumComplete>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumLayout>
  );
}

export default function AppointmentPrepPage() {
  return <AppointmentPrepInner />;
}

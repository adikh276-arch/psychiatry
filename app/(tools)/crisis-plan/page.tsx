'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ArrowRight, Check, Copy, CheckCheck, UserCheck, AlertTriangle } from 'lucide-react';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';

type Screen = 'intro' | 'gateway' | 'step1' | 'step2' | 'step3' | 'step4' | 'plan';

const STEP_LABELS = ['Warning Signs', 'Coping Strategies', 'People to Contact', 'Next Steps'];

function CrisisPlanInner() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [warningSigns, setWarningSigns] = useState('');
  const [copingStrategies, setCopingStrategies] = useState('');
  const [contacts, setContacts] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [copied, setCopied] = useState(false);

  const steps: Screen[] = ['step1', 'step2', 'step3', 'step4'];
  const stepIndex = steps.indexOf(screen);

  const plan = `── MY PERSONAL SAFETY PLAN ──

🚨 MY WARNING SIGNS:
${warningSigns || 'Not filled in.'}

🛡️ MY COPING STRATEGIES:
${copingStrategies || 'Not filled in.'}

📞 PEOPLE I WILL CONTACT:
${contacts || 'Not filled in.'}

🏥 MY NEXT STEPS IF THINGS ESCALATE:
${nextSteps || 'Not filled in.'}

── Prepared with MantraCare Psychiatry ──`;

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(plan); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch { console.error('Copy failed'); }
  };

  const handleReset = () => {
    setWarningSigns(''); setCopingStrategies(''); setContacts(''); setNextSteps('');
    setCopied(false); setScreen('intro');
  };

  // ── Therapist gateway component
  const PSYCHIATRY_REDIRECT_URL = 'https://web.mantracare.com/app/psychiatry';

  const handleConnectTherapist = () => {
    if (typeof window !== 'undefined') {
      if ((window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify({ action: 'navigate', screen: 'ConnectTherapist', params: {} }));
      } else if (window.parent !== window) {
        window.parent.postMessage({ action: 'connect_therapist' }, 'https://web.mantracare.com');
      } else {
        // Ponytail: Perfect exit action for psychiatry portal
        window.location.href = PSYCHIATRY_REDIRECT_URL;
      }
    }
  };

  return (
    <PremiumLayout
      title="Crisis Plan"
      icon={<ShieldAlert className="w-6 h-6 text-red-600" />}
      onReset={screen !== 'intro' ? handleReset : undefined}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-4 py-4 min-h-[70vh]">
        <AnimatePresence mode="wait">
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex-1 flex flex-col">
              <PremiumIntro
                description="Having a safety plan isn't pessimistic — it's one of the most powerful things you can do for your mental health."
                onStart={() => setScreen('gateway')}
                icon={<ShieldAlert size={32} className="text-red-600" />}
                benefits={[
                  'Identify your personal warning signs before they escalate.',
                  'Map out coping strategies that actually work for you.',
                  'Pre-decide who to call and what to do when it gets serious.',
                ]}
                duration="10–15 minutes"
              />
            </motion.div>
          )}

          {screen === 'gateway' && (
            <motion.div key="gateway" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={20} className="text-amber-600" />
                  </div>
                  <p className="font-bold text-amber-800 text-sm">Before you continue</p>
                </div>
                <p className="text-amber-700 text-sm leading-relaxed">
                  A crisis safety plan works best when created with support from a mental health professional.
                  We recommend connecting with a therapist to help guide this process.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleConnectTherapist}
                  className="w-full rounded-2xl text-white font-bold text-base flex items-center justify-center gap-3 h-14 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
                >
                  <UserCheck size={20} />
                  Connect with a Therapist
                </button>
                <button
                  onClick={() => setScreen('step1')}
                  className="act-btn-ghost"
                >
                  Continue without therapist
                </button>
              </div>

              <p className="text-xs text-slate-400 text-center leading-relaxed">
                If you are in immediate danger, please call your local emergency number or go to your nearest emergency room.
              </p>
            </motion.div>
          )}

          {steps.includes(screen) && (
            <motion.div key={screen} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col space-y-6">
              <div className="flex gap-2">
                {STEP_LABELS.map((l, i) => (
                  <div key={l} className={`flex-1 h-1.5 rounded-full transition-all ${i <= stepIndex ? 'bg-red-500' : 'bg-slate-200'}`} />
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-red-500">Step {stepIndex + 1} of 4 — {STEP_LABELS[stepIndex]}</p>

              {screen === 'step1' && (
                <>
                  <h1 className="act-heading">What are your warning signs?</h1>
                  <p className="act-body">Think about thoughts, feelings, behaviours, or physical sensations that tell you things are getting hard.</p>
                  <div>
                    <label className="field-label">My personal warning signs</label>
                    <textarea className="field-textarea min-h-[200px]"
                      placeholder="e.g. I stop replying to messages. I sleep more than 12 hours. I start thinking everything is pointless. I feel disconnected from my body..."
                      value={warningSigns} onChange={e => setWarningSigns(e.target.value)} />
                  </div>
                  <button onClick={() => setScreen('step2')} className="act-btn-primary">Next <ArrowRight size={16} /></button>
                </>
              )}

              {screen === 'step2' && (
                <>
                  <h1 className="act-heading">What helps you cope?</h1>
                  <p className="act-body">Things you can do alone, without anyone else's help, that make even a small difference when things get dark.</p>
                  <div>
                    <label className="field-label">My coping strategies</label>
                    <textarea className="field-textarea min-h-[200px]"
                      placeholder="e.g. Go for a walk even if it's short. Make tea. Put on a familiar TV show. Do box breathing for 5 minutes. Write in my journal. Take a shower..."
                      value={copingStrategies} onChange={e => setCopingStrategies(e.target.value)} />
                  </div>
                  <button onClick={() => setScreen('step3')} className="act-btn-primary">Next <ArrowRight size={16} /></button>
                </>
              )}

              {screen === 'step3' && (
                <>
                  <h1 className="act-heading">Who will you contact?</h1>
                  <p className="act-body">Name specific people — not just 'a friend'. The more specific, the more likely you'll actually do it in a crisis.</p>
                  <div>
                    <label className="field-label">People & numbers</label>
                    <textarea className="field-textarea min-h-[200px]"
                      placeholder="e.g.&#10;1. [Name] — mobile: +XX XXXX XXXX&#10;2. [Name] — they know about my condition&#10;3. My psychiatrist: +XX XXXX XXXX&#10;4. Crisis line: XXXX XXXX"
                      value={contacts} onChange={e => setContacts(e.target.value)} />
                  </div>
                  <button onClick={() => setScreen('step4')} className="act-btn-primary">Next <ArrowRight size={16} /></button>
                </>
              )}

              {screen === 'step4' && (
                <>
                  <h1 className="act-heading">What are your next steps if things escalate?</h1>
                  <p className="act-body">Decide now what you'll do if coping strategies stop working. Remove uncertainty when you need clarity most.</p>
                  <div>
                    <label className="field-label">Escalation plan</label>
                    <textarea className="field-textarea min-h-[200px]"
                      placeholder="e.g. If I feel unsafe, I will call [Name]. If I can't reach them, I will go to [Hospital name]. I will not be alone. I will tell someone where I am..."
                      value={nextSteps} onChange={e => setNextSteps(e.target.value)} />
                  </div>
                  <button onClick={() => setScreen('plan')} className="act-btn-primary">
                    Generate My Plan <Check size={16} />
                  </button>
                </>
              )}
            </motion.div>
          )}

          {screen === 'plan' && (
            <motion.div key="plan" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col space-y-5 pb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">Your Safety Plan</p>
                <h1 className="act-heading">Keep This Somewhere Safe</h1>
                <p className="text-sm text-slate-500 mt-1">Screenshot this or copy it. Share with your therapist or a trusted person.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4">
                  <p className="text-white font-black text-sm uppercase tracking-widest">My Personal Safety Plan</p>
                  <p className="text-red-100 text-xs mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="p-6 space-y-5">
                  {[
                    { icon: '🚨', label: 'My Warning Signs', content: warningSigns },
                    { icon: '🛡️', label: 'My Coping Strategies', content: copingStrategies },
                    { icon: '📞', label: 'People I Will Contact', content: contacts },
                    { icon: '🏥', label: 'If Things Escalate', content: nextSteps },
                  ].map(section => (
                    <div key={section.label} className="space-y-1">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{section.icon} {section.label}</p>
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {section.content || <span className="text-slate-300 italic">Not filled in.</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCopy}
                className={`act-btn-primary transition-all`}
                style={copied ? { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' } : { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
              >
                {copied ? <><CheckCheck size={16} /> Copied!</> : <><Copy size={16} /> Copy My Safety Plan</>}
              </button>

              <button onClick={handleConnectTherapist}
                className="w-full rounded-2xl font-bold text-sm flex items-center justify-center gap-2 h-12 border-2 border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 transition-all"
              >
                <UserCheck size={18} /> Share with My Therapist
              </button>

              <button onClick={handleReset} className="act-btn-ghost">Start Over</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumLayout>
  );
}

export default function CrisisPlanPage() {
  return <CrisisPlanInner />;
}

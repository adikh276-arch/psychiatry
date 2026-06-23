'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ArrowRight, Check, Sparkles, BookOpen } from 'lucide-react';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';

type Screen = 'intro' | 'activity' | 'summary';

const myths = [
  {
    myth: "Psychiatric medication changes your core personality.",
    fact: "Medication is designed to remove the symptoms (like severe anxiety or depression) that are masking who you really are, not to change your personality."
  },
  {
    myth: "If you feel better, it means you can stop taking it.",
    fact: "Feeling better means the medication is working. Stopping abruptly often causes a severe relapse or withdrawal symptoms. Always consult your doctor before stopping."
  },
  {
    myth: "Taking medication is a sign of weakness or 'giving up'.",
    fact: "Mental health conditions have biological components. Taking medication for your brain is no different than taking insulin for diabetes—it's a proactive health choice."
  },
  {
    myth: "You'll be 'hooked' or addicted to them forever.",
    fact: "While some specific medications (like benzos) can be habit-forming, most antidepressants, mood stabilizers, and antipsychotics are not addictive."
  }
];

export default function MedicationMythsFacts() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState<boolean[]>(new Array(myths.length).fill(false));

  const handleReset = () => {
    setScreen('intro');
    setCurrentIndex(0);
    setRevealed(new Array(myths.length).fill(false));
  };

  const handleReveal = () => {
    const newRevealed = [...revealed];
    newRevealed[currentIndex] = true;
    setRevealed(newRevealed);
  };

  const handleNext = () => {
    if (currentIndex < myths.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setScreen('summary');
    }
  };

  const currentItem = myths[currentIndex];
  const isRevealed = revealed[currentIndex];

  return (
    <PremiumLayout
      title="Medication Myths & Facts"
      icon={<HelpCircle className="w-6 h-6 text-fuchsia-600" />}
      onReset={screen !== 'intro' ? handleReset : undefined}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-4 py-4 min-h-[70vh]">
        <AnimatePresence mode="wait">
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex-1 flex flex-col justify-center">
              <PremiumIntro
                description="There's a lot of noise out there about psychiatric medications. Let's cut through the stigma and debunk some of the most common myths with scientific facts."
                onStart={() => setScreen('activity')}
                icon={<BookOpen size={32} className="text-fuchsia-600" />}
              />
            </motion.div>
          )}

          {screen === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col max-w-md w-full mx-auto">
              <div className="space-y-6 flex-1 mt-6">
                <div className="text-center space-y-2 mb-6">
                  <span className="text-xs font-bold tracking-widest text-fuchsia-600 uppercase">Fact Check {currentIndex + 1} of {myths.length}</span>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100/60 relative overflow-hidden transition-all duration-500 min-h-[300px] flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {!isRevealed ? (
                      <motion.div
                        key="myth"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center space-y-4"
                      >
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <HelpCircle size={28} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 leading-snug">"{currentItem.myth}"</h3>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="fact"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-4 relative z-10"
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-fuchsia-50 rounded-full blur-3xl -z-10"></div>
                        <div className="w-16 h-16 bg-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Sparkles size={28} className="text-fuchsia-600" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-700 leading-relaxed">{currentItem.fact}</h3>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="pt-6 pb-4">
                {!isRevealed ? (
                  <button
                    onClick={handleReveal}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white p-4 rounded-2xl font-bold shadow-sm transition-all"
                  >
                    Reveal Fact
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white p-4 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    {currentIndex < myths.length - 1 ? 'Next Statement' : 'Complete'} <ArrowRight size={20} />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {screen === 'summary' && (
            <motion.div key="summary" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center">
              <PremiumComplete
                title="Knowledge is Power"
              >
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-3 mb-6">
                  <BookOpen className="w-8 h-8 text-fuchsia-500 mx-auto" />
                  <h3 className="font-bold text-slate-800">Still have questions?</h3>
                  <p className="text-sm text-slate-500">
                    It's entirely normal to have concerns. Bring any lingering questions about your specific treatment to your next psychiatry appointment.
                  </p>
                </div>
              </PremiumComplete>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumLayout>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, ArrowRight, Brain, Zap, Activity } from 'lucide-react';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';
import { useRouter } from 'next/navigation';

type Screen = 'intro' | 'activity' | 'summary';

const stages = [
  {
    title: "Light Sleep (N1 & N2)",
    icon: Moon,
    desc: "The transition phase. Your heart rate slows and your body temperature drops. It acts as a bridge to deeper restoration.",
    color: "text-indigo-400",
    bg: "bg-indigo-50"
  },
  {
    title: "Deep Sleep (N3)",
    icon: Activity,
    desc: "The physical repair phase. This is when your body repairs tissue, builds bone and muscle, and strengthens the immune system.",
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    title: "REM Sleep",
    icon: Brain,
    desc: "The mental repair phase. Your brain processes emotions and memories. Crucial for psychiatric stability and emotional regulation.",
    color: "text-fuchsia-500",
    bg: "bg-fuchsia-50"
  }
];

export default function SleepCycleGuide() {
  const [screen, setScreen] = useState<Screen>('intro');
  const router = useRouter();

  const handleReset = () => {
    setScreen('intro');
  };

  return (
    <PremiumLayout
      title="Sleep Cycle Guide"
      icon={<Moon className="w-6 h-6 text-indigo-600" />}
      onReset={screen !== 'intro' ? handleReset : undefined}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-4 py-4 min-h-[70vh]">
        <AnimatePresence mode="wait">
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex-1 flex flex-col justify-center">
              <PremiumIntro
                description="Sleep architecture is critical for psychiatric stability. Let's understand what happens when you close your eyes and how to use it to your advantage."
                onStart={() => setScreen('activity')}
                icon={<Moon size={32} className="text-indigo-600" />}
              />
            </motion.div>
          )}

          {screen === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col max-w-md w-full mx-auto">
              <div className="space-y-6 flex-1 mt-6">
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">The 90-Minute Cycle</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">Your brain cycles through these stages multiple times a night.</p>
                </div>

                <div className="space-y-4 relative">
                  <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-indigo-100 z-0"></div>
                  {stages.map((stage, idx) => {
                    const Icon = stage.icon;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.2 }}
                        key={stage.title} 
                        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/60 relative z-10 ml-4 flex gap-4"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-white ${stage.bg} -ml-10`}>
                          <Icon size={24} className={stage.color} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 mb-1">{stage.title}</h3>
                          <p className="text-sm text-slate-600 leading-relaxed">{stage.desc}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 items-start mt-6">
                  <Zap className="text-indigo-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-indigo-900 font-medium">
                    <span className="font-bold">Pro Tip:</span> Waking up in the middle of Deep Sleep causes "sleep inertia" (extreme grogginess). Waking up at the end of a 90-minute cycle feels natural.
                  </p>
                </div>
              </div>

              <div className="pt-6 pb-4">
                <button
                  onClick={() => setScreen('summary')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  Continue <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {screen === 'summary' && (
            <motion.div key="summary" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center">
              <PremiumComplete
                title="Knowledge Unlocked"
              >
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4 mb-6">
                  <Moon className="w-8 h-8 text-indigo-500 mx-auto" />
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">Plan Your Sleep</h3>
                    <p className="text-sm text-slate-500">
                      Now that you know about the 90-minute cycle, use our Sleep Window Planner to calculate your perfect bedtime.
                    </p>
                  </div>
                  <button 
                    onClick={() => router.push('/sleep-window-planner')}
                    className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-indigo-700 font-bold rounded-xl text-sm transition-colors border border-slate-200"
                  >
                    Open Sleep Planner
                  </button>
                </div>
              </PremiumComplete>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumLayout>
  );
}

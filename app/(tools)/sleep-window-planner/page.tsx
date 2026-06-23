'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, ArrowRight, Check, Moon, Sun, Clock } from 'lucide-react';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';

type Screen = 'intro' | 'step1' | 'summary';

export default function SleepWindowPlanner() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [wakeTime, setWakeTime] = useState<string>('07:00');
  const [selectedCycles, setSelectedCycles] = useState<number>(5); // 5 cycles = 7.5 hours

  const handleReset = () => {
    setScreen('intro');
    setWakeTime('07:00');
    setSelectedCycles(5);
  };

  // 1 cycle = 90 mins. We also add 15 mins to fall asleep.
  const calculateBedtime = (wakeTimeStr: string, cycles: number) => {
    const [hours, minutes] = wakeTimeStr.split(':').map(Number);
    const wakeDate = new Date();
    wakeDate.setHours(hours, minutes, 0, 0);

    const totalMinutesToSubtract = (cycles * 90) + 15;
    wakeDate.setMinutes(wakeDate.getMinutes() - totalMinutesToSubtract);

    return wakeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTargetBedtime = () => calculateBedtime(wakeTime, selectedCycles);
  const getTotalSleepTime = () => {
    const totalMinutes = selectedCycles * 90;
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  return (
    <PremiumLayout
      title="Sleep Window Planner"
      icon={<CalendarClock className="w-6 h-6 text-indigo-600" />}
      onReset={screen !== 'intro' ? handleReset : undefined}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-4 py-4 min-h-[70vh]">
        <AnimatePresence mode="wait">
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex-1 flex flex-col justify-center">
              <PremiumIntro
                description="Sleep isn't just about resting—it works in 90-minute cycles. Waking up in the middle of a cycle causes grogginess. Let's calculate the perfect bedtime so you wake up at the end of a cycle, feeling refreshed."
                onStart={() => setScreen('step1')}
                icon={<Moon size={32} className="text-indigo-600" />}
              />
            </motion.div>
          )}

          {screen === 'step1' && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col max-w-md w-full mx-auto">
              <div className="space-y-6 flex-1 mt-6">
                <div className="text-center space-y-2 mb-8">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sun size={24} className="text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">When do you need to wake up?</h2>
                  <p className="text-slate-500 font-medium">We'll calculate your ideal bedtime from here.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/60">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Target Wake Time</label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full p-4 text-center text-3xl font-bold text-slate-800 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 ml-1">Select Target Sleep Cycles (90 mins each)</label>
                  {[
                    { cycles: 4, label: "6 Hours", desc: "Minimum for basic function" },
                    { cycles: 5, label: "7.5 Hours", desc: "Recommended average" },
                    { cycles: 6, label: "9 Hours", desc: "For high recovery needs" }
                  ].map((option) => (
                    <button
                      key={option.cycles}
                      onClick={() => setSelectedCycles(option.cycles)}
                      className={`w-full p-4 rounded-xl flex items-center justify-between transition-all border-2 ${
                        selectedCycles === option.cycles
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                          : 'border-transparent bg-white hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      <div className="text-left">
                        <div className={`font-bold ${selectedCycles === option.cycles ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {option.cycles} Cycles ({option.label})
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">{option.desc}</div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedCycles === option.cycles ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300'
                      }`}>
                        {selectedCycles === option.cycles && <Check size={14} strokeWidth={3} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 pb-4">
                <button
                  onClick={() => setScreen('summary')}
                  disabled={!wakeTime}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  Calculate Bedtime <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {screen === 'summary' && (
            <motion.div key="summary" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center">
              <PremiumComplete
                title="Your Sleep Plan"
              >
                <div className="space-y-4 mb-8">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <Clock className="text-indigo-600 mb-3 relative z-10" size={32} />
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest relative z-10 mb-1">Target Bedtime</span>
                    <span className="text-4xl font-black text-slate-800 relative z-10">{getTargetBedtime()}</span>
                    <span className="text-xs text-slate-400 font-medium relative z-10 mt-2 text-center">(Includes 15m to fall asleep)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                      <Sun className="text-orange-500 mb-2" size={20} />
                      <span className="text-xs font-bold text-slate-500 uppercase">Wake Time</span>
                      <span className="text-lg font-bold text-slate-800">{wakeTime}</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                      <Moon className="text-indigo-500 mb-2" size={20} />
                      <span className="text-xs font-bold text-slate-500 uppercase">Total Sleep</span>
                      <span className="text-lg font-bold text-slate-800">{getTotalSleepTime()}</span>
                    </div>
                  </div>
                </div>
              </PremiumComplete>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumLayout>
  );
}

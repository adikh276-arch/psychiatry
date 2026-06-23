'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, ArrowRight, Activity, Moon, Droplets, Pill } from 'lucide-react';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';

type Screen = 'intro' | 'activity' | 'summary';

const habits = [
  { id: 'sleep', title: "Sleep Consistency", desc: "Going to bed at roughly the same time", icon: Moon, color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: 'water', title: "Hydration", desc: "Drinking enough water daily", icon: Droplets, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 'movement', title: "Movement", desc: "Some form of physical activity", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: 'meds', title: "Medication", desc: "Taking meds consistently as prescribed", icon: Pill, color: "text-rose-500", bg: "bg-rose-50" }
];

export default function WhatAreYourHabits() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const handleReset = () => {
    setScreen('intro');
    setRatings({});
  };

  const handleRating = (id: string, value: number) => {
    setRatings(prev => ({ ...prev, [id]: value }));
  };

  const isComplete = habits.every(h => ratings[h.id] !== undefined);

  return (
    <PremiumLayout
      title="What Are Your Habits?"
      icon={<ClipboardList className="w-6 h-6 text-teal-600" />}
      onReset={screen !== 'intro' ? handleReset : undefined}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-4 py-4 min-h-[70vh]">
        <AnimatePresence mode="wait">
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex-1 flex flex-col justify-center">
              <PremiumIntro
                description="Psychiatric stability is built on a foundation of daily habits. Let's take an honest inventory of your current routines."
                onStart={() => setScreen('activity')}
                icon={<ClipboardList size={32} className="text-teal-600" />}
              />
            </motion.div>
          )}

          {screen === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col max-w-md w-full mx-auto">
              <div className="space-y-6 flex-1 mt-6">
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Rate Your Habits</h2>
                  <p className="text-slate-500 font-medium">How consistent are you with these basics?</p>
                </div>

                <div className="space-y-4">
                  {habits.map(habit => {
                    const Icon = habit.icon;
                    return (
                      <div key={habit.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/60">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${habit.bg}`}>
                            <Icon size={20} className={habit.color} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 leading-tight">{habit.title}</h3>
                            <p className="text-xs text-slate-500 font-medium">{habit.desc}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between gap-2">
                          {[
                            { val: 1, label: 'Rarely' },
                            { val: 2, label: 'Sometimes' },
                            { val: 3, label: 'Usually' },
                            { val: 4, label: 'Always' }
                          ].map(opt => (
                            <button
                              key={opt.val}
                              onClick={() => handleRating(habit.id, opt.val)}
                              className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all border-2 ${
                                ratings[habit.id] === opt.val
                                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                                  : 'border-transparent bg-slate-50 hover:bg-slate-100 text-slate-500'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 pb-4">
                <button
                  onClick={() => setScreen('summary')}
                  disabled={!isComplete}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  See Results <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {screen === 'summary' && (
            <motion.div key="summary" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center">
              <PremiumComplete
                title="Inventory Complete"
              >
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-3 mb-6">
                  <ClipboardList className="w-8 h-8 text-teal-500 mx-auto" />
                  <h3 className="font-bold text-slate-800">Start Small</h3>
                  <p className="text-sm text-slate-500">
                    If you marked 'Rarely' on any habit, don't try to perfect it immediately. Choose the easiest one to improve and focus on a 1% change tomorrow.
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

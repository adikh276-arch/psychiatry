'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Check, Monitor, Home, Zap } from 'lucide-react';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';

type Screen = 'intro' | 'step1' | 'step2' | 'step3' | 'summary';

export default function EnvironmentOptimization() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handleReset = () => {
    setScreen('intro');
    setCheckedItems({});
  };

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = {
    step1: {
      title: "Workspace & Visuals",
      icon: Monitor,
      items: [
        { id: 'w1', text: 'My primary workspace is clear of non-essential clutter.' },
        { id: 'w2', text: 'I use visual cues (like post-its) only for immediate priorities.' },
        { id: 'w3', text: 'Everything I need for my main task is within arm\'s reach.' }
      ],
      next: 'step2' as Screen
    },
    step2: {
      title: "Digital Environment",
      icon: Zap,
      items: [
        { id: 'd1', text: 'Non-essential notifications are muted on my phone and PC.' },
        { id: 'd2', text: 'I close or group browser tabs at the end of the day.' },
        { id: 'd3', text: 'My home screen contains only tools, not endless feeds.' }
      ],
      next: 'step3' as Screen
    },
    step3: {
      title: "Home & Rest",
      icon: Home,
      items: [
        { id: 'h1', text: 'My bedroom is optimized for sleep (cool, dark, quiet).' },
        { id: 'h2', text: 'Items I need in the morning are laid out the night before.' },
        { id: 'h3', text: 'I have a designated "drop zone" for keys, wallet, and bag.' }
      ],
      next: 'summary' as Screen
    }
  };

  const renderStep = (stepKey: 'step1' | 'step2' | 'step3') => {
    const data = categories[stepKey];
    const Icon = data.icon;
    const allChecked = data.items.every(item => checkedItems[item.id]);

    return (
      <motion.div key={stepKey} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col max-w-md w-full mx-auto">
        <div className="space-y-6 flex-1 mt-6">
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon size={24} className="text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{data.title}</h2>
            <p className="text-slate-500 font-medium">Check the statements that are currently true for you.</p>
          </div>

          <div className="space-y-3">
            {data.items.map(item => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all border-2 text-left ${
                  checkedItems[item.id]
                    ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                    : 'border-transparent bg-white hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className={`w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  checkedItems[item.id] ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300'
                }`}>
                  {checkedItems[item.id] && <Check size={14} strokeWidth={3} />}
                </div>
                <span className={`font-medium ${checkedItems[item.id] ? 'text-amber-900' : 'text-slate-700'}`}>
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 pb-4">
          <button
            onClick={() => setScreen(data.next)}
            className={`w-full p-4 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-2 transition-all ${
              allChecked ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
          >
            {stepKey === 'step3' ? 'Finish Audit' : 'Next Category'} <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <PremiumLayout
      title="Environment Optimization"
      icon={<Sparkles className="w-6 h-6 text-amber-600" />}
      onReset={screen !== 'intro' ? handleReset : undefined}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-4 py-4 min-h-[70vh]">
        <AnimatePresence mode="wait">
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex-1 flex flex-col justify-center">
              <PremiumIntro
                description="Your environment heavily impacts executive function. Let's do a quick audit of your physical and digital spaces to find areas of high friction."
                onStart={() => setScreen('step1')}
                icon={<Sparkles size={32} className="text-amber-600" />}
              />
            </motion.div>
          )}

          {screen === 'step1' && renderStep('step1')}
          {screen === 'step2' && renderStep('step2')}
          {screen === 'step3' && renderStep('step3')}

          {screen === 'summary' && (
            <motion.div key="summary" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center">
              <PremiumComplete
                title="Audit Complete"
              >
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-3 mb-6">
                  <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
                  <h3 className="font-bold text-slate-800">Pick One Thing</h3>
                  <p className="text-sm text-slate-500">
                    Don't try to fix everything at once. Look at the items you didn't check off, pick just one, and fix it today to reduce your environmental friction.
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

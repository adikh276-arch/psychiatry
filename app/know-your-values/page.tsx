'use client';
import React from 'react';
import { parseDbDate } from '@/lib/dateUtils';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, ArrowRight, ArrowLeft, RefreshCw, History, Calendar, Check, Target, Heart, Loader2, Users, HeartPulse, Palette, BookOpen, Compass, Bird, TrendingUp, Smile, Scale, ShieldCheck } from 'lucide-react';
import i18n, { loadLocale } from './i18n';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';
import { apiPath } from '@/lib/apiPath';

interface ValueItem {
  emoji: string;
  name: string;
  icon?: React.ReactNode;
}

const ALL_VALUES: ValueItem[] = [
  { emoji: "family", name: "Family", icon: <Users size={24} className="text-blue-500" /> },
  { emoji: "health", name: "Health", icon: <HeartPulse size={24} className="text-rose-500" /> },
  { emoji: "creativity", name: "Creativity", icon: <Palette size={24} className="text-purple-500" /> },
  { emoji: "learning", name: "Learning", icon: <BookOpen size={24} className="text-amber-500" /> },
  { emoji: "adventure", name: "Adventure", icon: <Compass size={24} className="text-emerald-500" /> },
  { emoji: "freedom", name: "Freedom", icon: <Bird size={24} className="text-sky-500" /> },
  { emoji: "growth", name: "Growth", icon: <TrendingUp size={24} className="text-teal-500" /> },
  { emoji: "kindness", name: "Kindness", icon: <Smile size={24} className="text-pink-500" /> },
  { emoji: "balance", name: "Balance", icon: <Scale size={24} className="text-indigo-500" /> },
  { emoji: "honesty", name: "Honesty", icon: <ShieldCheck size={24} className="text-slate-500" /> },
];

interface Reflection {
  id: string;
  date: string;
  valueEmoji: string;
  valueName: string;
  reflection: string;
  action: string;
}

function KnowYourValuesInner() {
  const { t } = useTranslation(undefined, { i18n });
  const [screen, setScreen] = useState<'intro' | 'choose' | 'reflect' | 'action' | 'summary' | 'history'>('intro');
  
  const [selectedValues, setSelectedValues] = useState<ValueItem[]>([]);
  const [chosenValue, setChosenValue] = useState<ValueItem | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [actionText, setActionText] = useState('');
  
  const [historyList, setHistoryList] = useState<Reflection[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedReflection, setSavedReflection] = useState<Reflection | null>(null);

  // Sync lang URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lang = params.get('lang') || 'en';
      loadLocale(lang);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(apiPath('/api/know-your-values'));
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
      }
    } catch (err) {
      console.error('Failed to load reflections history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const handleToggleValue = (v: ValueItem) => {
    setSelectedValues((prev) =>
      prev.find((p) => p.name === v.name)
        ? prev.filter((p) => p.name !== v.name)
        : [...prev, v]
    );
  };

  const handleSave = async () => {
    if (!chosenValue || !reflectionText.trim() || !actionText.trim()) return;
    setSaveLoading(true);

    const payload = {
      valueEmoji: chosenValue.emoji,
      valueName: chosenValue.name,
      reflection: reflectionText,
      action: actionText,
    };

    try {
      const res = await fetch(apiPath('/api/know-your-values'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const full: Reflection = {
          id: data.id,
          date: data.date,
          valueEmoji: chosenValue.emoji,
          valueName: chosenValue.name,
          reflection: reflectionText,
          action: actionText,
        };
        setSavedReflection(full);
        setScreen('summary');
      }
    } catch (err) {
      console.error('Failed to save reflection:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleResetActivity = () => {
    setSelectedValues([]);
    setChosenValue(null);
    setReflectionText('');
    setActionText('');
    setSavedReflection(null);
    setScreen('intro');
  };

  const handleViewHistory = () => {
    fetchHistory();
    setScreen('history');
  };

  const getTitle = () => {
    switch (screen) {
      case 'history':
        return t('screens.history.title', 'History');
      case 'summary':
        return t('screens.summary.title', 'Summary');
      default:
        return t('app_title', 'Values Reflection');
    }
  };

  return (
    <PremiumLayout
      title={getTitle()}
      icon={<Brain className="w-6 h-6 text-primary" />}
      onBack={screen !== 'intro' ? handleResetActivity : undefined}
      onReset={screen !== 'intro' ? handleResetActivity : undefined}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-6 py-4 min-h-[70vh] text-center">
        <AnimatePresence mode="wait">
          {/* SCREEN 1: INTRO */}
          {screen === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex-1 flex flex-col"
            >
              <PremiumIntro
                title={t('app_title', 'Values Reflection')}
                description={t(
                  'app_description',
                  'Discover and clarify your core personal values to steer your choices toward a meaningful life.'
                )}
                onStart={() => setScreen('choose')}
                icon={<Brain size={32} />}
                benefits={[
                  t('app.description2', 'Examine what matters most in your relationships, career, and growth'),
                ]}
                duration={t('app_duration', '5 minutes')}
              >
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleViewHistory}
                  className="w-full py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-white text-slate-500 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-3 hover:text-sky-600 hover:border-sky-100 transition-all"
                >
                  <History size={16} strokeWidth={2.5} />
                  {t('app.viewHistory', 'View History')}
                </motion.button>
              </PremiumIntro>
            </motion.div>
          )}

          {/* SCREEN 2: CHOOSE VALUES */}
          {screen === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left w-full"
            >
              <div className="space-y-2">
                <span className="act-eyebrow">
                  <Sparkles size={11} />
                  {t('app_title', 'Values Reflection')}
                </span>
                <h1 className="act-heading">
                  {t('app.chooseTitle', 'Select Your Core Values')}
                </h1>
                <p className="act-body">
                  {t('app.chooseDesc', 'Choose a few values that resonate most deeply with how you want to live.')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {ALL_VALUES.map((v) => {
                  const isSelected = !!selectedValues.find((s) => s.name === v.name);
                  return (
                    <motion.button
                      key={v.name}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleToggleValue(v)}
                      className={`relative flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border transition-all aspect-square ${
                        isSelected
                          ? 'bg-primary/5 border-primary'
                          : 'bg-white/80 backdrop-blur-sm border-white hover:border-sky-100'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                          ?
                        </div>
                      )}
                      <span className="text-2xl leading-none flex items-center justify-center">{v.icon || v.emoji}</span>
                      <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                        {t(`values.${v.name}`, v.name)}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  disabled={selectedValues.length === 0}
                  onClick={() => setScreen('reflect')}
                  className="act-btn-primary"
                >
                  {t('app.continue', 'Continue')}
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 3: REFLECT TEXTAREA */}
          {screen === 'reflect' && (
            <motion.div
              key="reflect"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left w-full"
            >
              <div className="space-y-2">
                <h1 className="act-heading">
                  {t('app.reflectTitle', 'Reflect on a Value')}
                </h1>
                <p className="act-body">
                  {t('app.reflectDesc', 'Select one value from your set and write down what it means to you.')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedValues.map((v) => {
                  const isChosen = chosenValue?.name === v.name;
                  return (
                    <motion.button
                      key={v.name}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setChosenValue(v)}
                      className={`px-4 py-2 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all ${
                        isChosen
                          ? 'bg-primary text-white'
                          : 'bg-white/80 backdrop-blur-sm border border-white text-slate-600 hover:border-sky-100'
                      }`}
                    >
                      {v.icon || v.emoji} {t(`values.${v.name}`, v.name)}
                    </motion.button>
                  );
                })}
              </div>

              {chosenValue && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="space-y-2">
                    <label className="field-label">
                      {t('app.reflectQuestion', 'Why is this value essential in your life right now?')}
                    </label>
                    <textarea
                      value={reflectionText}
                      onChange={(e) => setReflectionText(e.target.value)}
                      placeholder={t('app.reflectPlaceholder', 'Write your thoughts and feelings here...')}
                      rows={5}
                      className="field-textarea"
                    />
                  </div>

                  <button
                    disabled={!reflectionText.trim()}
                    onClick={() => setScreen('action')}
                    className="act-btn-primary"
                  >
                    {t('app.next', 'Continue')}
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* SCREEN 4: ACTION DEFINITION */}
          {screen === 'action' && chosenValue && (
            <motion.div
              key="action"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left w-full"
            >
              <div className="space-y-2">
                <h1 className="act-heading">
                  {t('app.liveTitle', 'Live Your Values')}
                </h1>
                <div className="flex justify-start">
                  <div className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 font-semibold text-[11px] uppercase tracking-widest flex items-center gap-1.5">
                    {chosenValue.icon || chosenValue.emoji} {t(`values.${chosenValue.name}`, chosenValue.name)}
                  </div>
                </div>
                <p className="act-body">
                  {t('app.liveDesc', 'How can you put this value into action? Define one practical action you can perform.')}
                </p>
              </div>

              <div className="space-y-2">
                <label className="field-label">
                  {t('app.liveQuestion', 'One practical action item')}
                </label>
                <textarea
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder={t('app.livePlaceholder', 'e.g. Call my partner to check in at lunch, or block 30 minutes to practice painting...')}
                  rows={5}
                  className="field-textarea"
                />
              </div>

              <button
                disabled={!actionText.trim() || saveLoading}
                onClick={handleSave}
                className="act-btn-primary"
              >
                {saveLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Check size={15} strokeWidth={2.5} />}
                {t('app.saveReflection', 'Save Reflection')}
              </button>
            </motion.div>
          )}

          {/* SCREEN 5: SUMMARY COMPLETE */}
          {screen === 'summary' && savedReflection && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex-1 flex flex-col"
            >
              <PremiumComplete
                title={t('app_title', 'Values Reflection')}
                message={t('app.quote', 'A life aligned with your values is a life of strength, peace, and clarity.')}
                onRestart={handleResetActivity}
                icon={<Target size={48} className="text-primary animate-pulse" />}
                  shareContent={"I just completed 'Know Your Values' on TherapyMantra — a guided values reflection that genuinely helped me. Try it! \n\n Android: https://play.google.com/store/apps/details?id=org.mantracare.therapy\n iOS: https://apps.apple.com/pk/app/therapymantra/id1607643888"}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-sm text-left space-y-5 p-5">
                  <div className="flex items-center gap-3 border-b border-sky-50 pb-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-2xl leading-none shrink-0">
                      {ALL_VALUES.find(val => val.name === savedReflection.valueName)?.icon || savedReflection.valueEmoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base leading-snug">
                        {t(`values.${savedReflection.valueName}`, savedReflection.valueName)}
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                        {t('app.aligned', 'Aligned')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">
                        {t('app.reflectionLabel', 'My Reflection')}
                      </span>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                        &quot;{savedReflection.reflection}&quot;
                      </p>
                    </div>

                    <div className="space-y-0.5 border-t border-sky-50 pt-3">
                      <span className="text-[11px] font-semibold text-sky-500 uppercase tracking-widest block">
                        {t('app.actionLabel', 'Action Commitment')}
                      </span>
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                        {savedReflection.action}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleViewHistory}
                    className="w-full h-12 rounded-xl bg-white/80 backdrop-blur-sm border border-white text-slate-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white hover:border-sky-100 transition-all"
                  >
                    <History size={15} />
                    {t('app.viewHistory', 'View History')}
                  </button>
                </div>
              </PremiumComplete>
            </motion.div>
          )}

          {/* SCREEN 6: REFLECTIONS HISTORY LIST */}
          {screen === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left w-full"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="act-eyebrow">
                    <History size={11} />
                    {t('app.viewHistory', 'History')}
                  </span>
                  <h1 className="act-heading">
                    {t('app.historyTitle', 'Reflections History')}
                  </h1>
                </div>
                <button
                  onClick={handleResetActivity}
                  className="p-2.5 bg-white/80 backdrop-blur-sm border border-white text-slate-500 rounded-xl hover:border-sky-100 hover:text-sky-600 transition-all"
                >
                  <ArrowLeft size={16} />
                </button>
              </div>

              {historyLoading ? (
                <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary opacity-30" />
                  <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">
                    {t('loading', 'Loading reflections...')}
                  </p>
                </div>
              ) : historyList.length === 0 ? (
                <div className="py-12 text-center bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-sm px-6 space-y-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto text-slate-200 shadow-sm">
                    <Calendar size={22} />
                  </div>
                  <p className="text-slate-400 font-medium text-sm">
                    {t('app.noHistory', 'No reflection entries yet')}
                  </p>
                  <button
                    onClick={() => setScreen('choose')}
                    className="act-btn-primary"
                  >
                    {t('app.startActivity', 'Start Reflection')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyList.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="act-card space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-sky-50 flex items-center justify-center text-xl leading-none shrink-0">
                            {ALL_VALUES.find(val => val.name === r.valueName)?.icon || r.valueEmoji}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 text-sm">
                              {t(`values.${r.valueName}`, r.valueName)}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium">
                              {parseDbDate(r.date).toLocaleDateString(undefined, {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <Heart size={12} className="text-sky-200" fill="currentColor" />
                      </div>

                      <div className="space-y-2 pt-1">
                        <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
                          &quot;{r.reflection}&quot;
                        </p>
                        <div className="flex items-center gap-1.5 text-sky-500 font-semibold text-[11px] uppercase tracking-widest pt-1 border-t border-sky-50">
                          <Target size={11} />
                          {t('app.actionLabel', 'Action')}: {r.action}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div className="pt-2">
                    <button
                      onClick={handleResetActivity}
                      className="act-btn-primary"
                    >
                      <RefreshCw size={15} strokeWidth={2.5} />
                      {t('app.startNew', 'Reflect Again')}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumLayout>
  );
}

export default function KnowYourValuesPage() {
  return (
    <I18nextProvider i18n={i18n}>
      <KnowYourValuesInner />
    </I18nextProvider>
  );
}
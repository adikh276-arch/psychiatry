'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, RotateCcw, Check, Sparkles } from 'lucide-react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n, { loadLocale } from './i18n';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';

const NAME_SUGGESTIONS = [
  'The Critic', 'Overthinker', 'Worry FM',
  'The Overthinking Machine', 'The Inner Critic',
  'The What-If Generator', 'Drama Director',
];

const REFLECTION_OPTIONS = [
  'The thought felt a little less intense than before',
  'I felt like I had some distance from the thought',
  'It still felt just as strong as before',
  "I'm not sure what changed, if anything",
];

type Screen = 'intro' | 'concept' | 'thought' | 'name' | 'practice' | 'reflection' | 'complete';

function NameYourMindInner() {
  const { t } = useTranslation(undefined, { i18n });
  const [screen, setScreen] = useState<Screen>('intro');
  const [thought, setThought] = useState('');
  const [mindName, setMindName] = useState('');
  const [customName, setCustomName] = useState('');
  const [reflection, setReflection] = useState('');
  const [practiceCount, setPracticeCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lang = new URLSearchParams(window.location.search).get('lang') || 'en';
      loadLocale(lang);
    }
  }, []);

  const reset = () => {
    setScreen('intro');
    setThought('');
    setMindName('');
    setCustomName('');
    setReflection('');
    setPracticeCount(0);
  };

  const finalName = customName.trim() || mindName;

  const screens: Record<Screen, React.ReactNode> = {
    intro: (
      <PremiumIntro
        title={t('app_title', 'Name Your Mind')}
        description={t('intro.description', 'Learn to distance yourself from overwhelming thoughts by giving your inner voice a name.')}
        onStart={() => setScreen('concept')}
        icon={<Brain size={32} />}
        benefits={[
          t('intro.benefits.0', 'Create mental distance'),
          t('intro.benefits.1', 'Reduce the power of harsh thoughts'),
          t('intro.benefits.2', 'Notice thoughts without being them'),
        ]}
        duration={t('intro.duration', '2-3 minutes')}
      />
    ),

    concept: (
      <motion.div
        key="concept"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-primary font-black text-[10px] uppercase tracking-widest">
            <Sparkles size={12} /> {t('subtitles.concept', 'Perspective')}
          </span>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            {t('screens.concept.title', 'A small shift')}
          </h1>
        </div>

        <div className="bg-white rounded-[2rem] border border-white/60 p-8 shadow-sm space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-block bg-red-50 border border-red-100 rounded-2xl px-6 py-4">
              <p className="text-2xl font-black text-red-500 italic">
                {t('screens.concept.example', '"I\'m not good enough"')}
              </p>
            </div>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              When a thought shows up, it often feels like it's <strong className="text-slate-700">you</strong>. But what if you could step back and <strong className="text-primary">notice</strong> it instead?
            </p>
          </div>
          <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
            <p className="text-sm font-bold text-slate-600 text-center italic leading-relaxed">
              "That's just <span className="text-primary font-black">my mind</span> talking. I don't have to believe everything it says."
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setScreen('thought')}
          className="w-full py-4.5 rounded-2xl bg-primary text-primary-foreground font-black text-base shadow-lg shadow-primary/15 flex items-center justify-center gap-2"
        >
          {t('buttons.continue', 'Continue')} <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    ),

    thought: (
      <motion.div
        key="thought"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-primary font-black text-[10px] uppercase tracking-widest">
            <Sparkles size={12} /> {t('subtitles.notice', 'Notice your thoughts')}
          </span>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            {t('screens.input_thought.title', "Let's start with a real thought")}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {t('screens.input_thought.desc', 'What is one thought that has been bothering you lately?')}
          </p>
        </div>

        <textarea
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          placeholder={t('screens.input_thought.placeholder', 'Write it exactly as it comes to you…')}
          rows={4}
          className="field-textarea"
        />

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={!thought.trim()}
          onClick={() => setScreen('name')}
          className="w-full py-4.5 rounded-2xl bg-primary text-primary-foreground font-black text-base shadow-lg shadow-primary/15 flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {t('buttons.continue', 'Continue')} <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    ),

    name: (
      <motion.div
        key="name"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-primary font-black text-[10px] uppercase tracking-widest">
            <Sparkles size={12} /> {t('subtitles.name', 'Give it a name')}
          </span>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            {t('screens.input_name.title', 'Create some distance')}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {t('screens.input_name.desc', 'Give your mind a name to help separate yourself from these thoughts.')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {NAME_SUGGESTIONS.map((s) => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setMindName(s); setCustomName(''); }}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border ${
                mindName === s && !customName
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/15'
                  : 'bg-white  text-slate-600  border-slate-200  hover:border-primary/30'
              }`}
            >
              {s}
            </motion.button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
            {t('screens.input_name.placeholder', 'Or type your own…')}
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => { setCustomName(e.target.value); setMindName(''); }}
            placeholder="Type a custom name…"
            className="field-input"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={!finalName}
          onClick={() => setScreen('practice')}
          className="w-full py-4.5 rounded-2xl bg-primary text-primary-foreground font-black text-base shadow-lg shadow-primary/15 flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {t('buttons.continue', 'Continue')} <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    ),

    practice: (
      <motion.div
        key="practice"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-primary font-black text-[10px] uppercase tracking-widest">
            <Sparkles size={12} /> {t('subtitles.practice', 'Practice')}
          </span>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            {t('screens.practice.title', 'Try this shift')}
          </h1>
        </div>

        <div className="bg-white rounded-[2rem] border border-white/60 p-8 shadow-sm space-y-6">
          <div className="space-y-3">
            <p className="field-label">
              {t('screens.practice.instead_of', 'Instead of')}
            </p>
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
              <p className="font-bold text-red-600 italic text-sm">"{thought}"</p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="field-label">
              {t('screens.practice.try_saying', 'Try saying')}
            </p>
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15">
              <p className="font-black text-primary text-base leading-snug">
                "{finalName} is telling me: "{thought}""
              </p>
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-sm font-medium text-center leading-relaxed px-4">
          {t('screens.practice.guide', 'Gently repeat this sentence to yourself 4–5 times at your own pace.')}
        </p>

        <div className="flex gap-3 justify-center">
          {[1, 2, 3, 4, 5].map((n) => (
            <motion.button
              key={n}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setPracticeCount(n)}
              className={`w-10 h-10 rounded-full font-black text-sm transition-all ${
                n <= practiceCount
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-white  border border-slate-200  text-slate-400'
              }`}
            >
              {n <= practiceCount ? <Check size={16} className="mx-auto" /> : n}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={practiceCount < 1}
          onClick={() => setScreen('reflection')}
          className="w-full py-4.5 rounded-2xl bg-primary text-primary-foreground font-black text-base shadow-lg shadow-primary/15 flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {t('screens.practice.button', "I'm Ready")} <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    ),

    reflection: (
      <motion.div
        key="reflection"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-primary font-black text-[10px] uppercase tracking-widest">
            <Sparkles size={12} /> Reflect
          </span>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            {t('screens.reflection.title', 'What did you notice?')}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {t('screens.reflection.desc', 'How did the thought feel after giving it a name?')}
          </p>
        </div>

        <div className="space-y-3">
          {REFLECTION_OPTIONS.map((opt) => (
            <motion.button
              key={opt}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setReflection(opt)}
              className={`w-full text-left p-5 rounded-2xl border font-bold text-sm transition-all flex items-center gap-4 ${
                reflection === opt
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-white  border-white/60  text-slate-600  hover:border-primary/20'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                reflection === opt ? 'border-primary bg-primary' : 'border-slate-300 '
              }`}>
                {reflection === opt && <Check size={10} className="text-white" strokeWidth={3} />}
              </div>
              {opt}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={!reflection}
          onClick={() => setScreen('complete')}
          className="w-full py-4.5 rounded-2xl bg-primary text-primary-foreground font-black text-base shadow-lg shadow-primary/15 flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {t('screens.reflection.button', 'Complete Reflection')} <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    ),

    complete: (
      <PremiumComplete
        title={t('complete.great_job', 'Great Job!')}
        message={t('complete.message', "You've successfully named your mind and created some space between yourself and your thoughts.")}
        onRestart={reset}
        icon={<Brain size={48} />}
        hideShare={false}
                  shareContent={"I just completed 'Name Your Mind' on TherapyMantra — a guided mindfulness technique that genuinely helped me. Try it! \n\n Android: https://play.google.com/store/apps/details?id=org.mantracare.therapy\n iOS: https://apps.apple.com/pk/app/therapymantra/id1607643888"}
      >
        <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10 text-center">
          <p className="text-sm font-bold text-slate-600 italic leading-relaxed">
            "{t('complete.footer', "Remember: You don't have to believe every thought your mind gives you.")}"
          </p>
        </div>
      </PremiumComplete>
    ),
  };

  return (
    <PremiumLayout
      title={t('app_title', 'Name Your Mind')}
      icon={<Brain className="w-6 h-6 text-primary" />}
      onReset={screen !== 'intro' ? reset : undefined}
      exitOnBack={screen === 'intro'}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-6 py-4 min-h-[70vh]">
        <AnimatePresence mode="wait">
          {screen === 'intro' ? (
            <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="w-full flex-1 flex flex-col">
              {screens.intro}
            </motion.div>
          ) : screen === 'complete' ? (
            <motion.div key="complete" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="w-full">
              {screens.complete}
            </motion.div>
          ) : (
            <motion.div key={screen} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              {screens[screen]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumLayout>
  );
}

export default function NameYourMindPage() {
  return (
    <I18nextProvider i18n={i18n}>
      <NameYourMindInner />
    </I18nextProvider>
  );
}
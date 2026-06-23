'use client';

import { useState, useEffect } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, Check, RotateCcw } from 'lucide-react';
import i18n, { loadLocale } from './i18n';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumIntro } from '@/components/shared/PremiumIntro';
import { PremiumComplete } from '@/components/shared/PremiumComplete';

// --- Types & Data ---

interface Feeling {
  id: string;
  label: string;
  affirmations: string[];
}

const feelings: Feeling[] = [
  {
    id: "lonely",
    label: "When you feel lonely and sad",
    affirmations: [
      "I am not alone, even when it feels that way.",
      "My feelings deserve care and gentleness.",
      "This moment will not last forever.",
      "I am allowed to need connection.",
      "I can offer myself warmth right now.",
    ],
  },
  {
    id: "terrified",
    label: "When you feel terrified",
    affirmations: [
      "I am safe in this moment.",
      "Fear is a feeling, not a prediction.",
      "I can take this one breath at a time.",
      "I don't have to solve everything right now.",
      "I am stronger than this moment.",
    ],
  },
  {
    id: "insignificant",
    label: "When you feel insignificant",
    affirmations: [
      "Small moments still count.",
      "I don't need to prove my value.",
      "I am allowed to take up space.",
      "My existence matters.",
      "I am enough as I am.",
    ],
  },
  {
    id: "overwhelmed",
    label: "When you feel overwhelmed",
    affirmations: [
      "I don't have to do everything at once.",
      "One small step is enough.",
      "It's okay to pause.",
      "I am allowed to rest.",
      "This will become manageable again.",
    ],
  },
  {
    id: "hopeless",
    label: "When you feel hopeless",
    affirmations: [
      "I don't need answers today.",
      "Change is still possible.",
      "I've survived difficult days before.",
      "I can stay here for now.",
      "Something gentle can still unfold.",
    ],
  },
  {
    id: "conflicted",
    label: "When you feel conflicted",
    affirmations: [
      "It's okay to feel more than one thing at once.",
      "I don't need clarity immediately.",
      "Confusion does not mean failure.",
      "I can give myself time.",
      "I trust myself to figure this out.",
    ],
  },
  {
    id: "self-critical",
    label: "When you are very self-critical",
    affirmations: [
      "I can speak to myself with kindness.",
      "I don't need to punish myself to grow.",
      "Mistakes don't define who I am.",
      "I am learning, not failing.",
      "Growth does not require cruelty.",
    ],
  },
  {
    id: "out-of-place",
    label: "When you feel socially out of place",
    affirmations: [
      "I'm allowed to be quiet or different.",
      "I don't have to match anyone else's energy.",
      "I belong as I am.",
      "I can take up space gently.",
      "I am not doing this wrong.",
    ],
  },
  {
    id: "unsafe",
    label: "When you feel unsafe around strangers",
    affirmations: [
      "I can move at my own pace.",
      "I am allowed to protect my boundaries.",
      "I can stay grounded in my body.",
      "I am allowed to leave situations.",
      "I can keep myself safe.",
    ],
  },
  {
    id: "pressured",
    label: "When you feel pressured at work",
    affirmations: [
      "My worth is not my productivity.",
      "I don't need to prove myself constantly.",
      "Doing my best is enough today.",
      "One task at a time is okay.",
      "I am more than my role.",
    ],
  },
  {
    id: "face-the-day",
    label: "When you don't want to face the day",
    affirmations: [
      "I can take today in small pieces.",
      "Getting through is enough.",
      "I don't need motivation to begin.",
      "Showing up gently still counts.",
      "This day doesn't define me.",
    ],
  },
  {
    id: "future",
    label: "When you worry about your future",
    affirmations: [
      "I can come back to the present.",
      "I will handle things as they come.",
      "I don't need certainty today.",
      "I am capable of adapting.",
      "I can trust myself a little more.",
    ],
  },
  {
    id: "stuck",
    label: "When you feel stuck in a problem",
    affirmations: [
      "Being stuck doesn't mean I'm broken.",
      "I can pause without giving up.",
      "I don't need immediate solutions.",
      "I am allowed to feel unsure.",
      "I'm still moving, even slowly.",
    ],
  },
  {
    id: "compare",
    label: "When you compare yourself",
    affirmations: [
      "My journey is my own.",
      "I don't need to compete to be worthy.",
      "I am allowed to grow at my pace.",
      "Someone else's success doesn't erase mine.",
      "I am not behind.",
    ],
  },
  {
    id: "give-up",
    label: "When you want to give up",
    affirmations: [
      "I don't have to decide anything right now.",
      "This feeling will pass.",
      "I've survived more than I realise.",
      "I can stay one more moment.",
      "I am still here — and that matters.",
    ],
  },
];

const FEELING_COLORS = [
  "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100    ",
  "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100    ",
  "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100    ",
  "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100    ",
  "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100    ",
  "bg-teal-50 text-teal-600 border-teal-100 hover:bg-teal-100    ",
  "bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100    ",
  "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100    ",
];

const premiumTints = [
  "bg-primary/5 border-primary/20",
  "bg-cyan-50 border-cyan-100  ",
  "bg-blue-50 border-blue-100  ",
  "bg-emerald-50 border-emerald-100  ",
  "bg-sky-50 border-sky-100  ",
  "bg-teal-50 border-teal-100  ",
];

// --- Sub-components ---

function FeelingSelector({ onSelect }: { onSelect: (feelingId: string, colorIndex: number) => void }) {
  const { t } = useTranslation(undefined, { i18n });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {t('feelings_heading', 'How are you feeling?')}
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          {t('feelings_subheading', "Select the emotion you're experiencing right now.")}
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
        {feelings.map((feeling, index) => (
          <motion.button
            key={feeling.id}
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(feeling.id, index % FEELING_COLORS.length)}
            className={`w-full p-5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
              FEELING_COLORS[index % FEELING_COLORS.length]
            }`}
          >
            <span className="font-bold text-base">
              {t(`feelings.${feeling.id}.label`, feeling.label)}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-xl font-bold">→</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

interface AffirmationScreenProps {
  feelingId: string;
  colorIndex: number;
  onChooseAnother: () => void;
  onFinish: () => void;
}

function AffirmationScreen({
  feelingId,
  colorIndex,
  onChooseAnother,
  onFinish,
}: AffirmationScreenProps) {
  const { t } = useTranslation(undefined, { i18n });
  const tintClass = premiumTints[colorIndex % premiumTints.length];
  const feeling = feelings.find((f) => f.id === feelingId);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [feelingId]);

  if (!feeling) return null;

  const total = feeling.affirmations.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  const goNext = () => {
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
    } else {
      onFinish();
    }
  };

  const goPrev = () => {
    if (!isFirst) {
      setCurrentIndex((i) => i - 1);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[60vh]">
      <div className="w-full max-w-lg flex flex-col flex-1">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-2">
            {t('affirmation_for', 'Affirmation for')}
          </h2>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {t(`feelings.${feelingId}.label`, feeling.label)}
          </h1>
        </div>

        {/* Affirmation Card */}
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -10 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`w-full aspect-[4/3] rounded-[2.5rem] border ${tintClass} p-10 flex items-center justify-center text-center shadow-xl shadow-slate-200/50  relative overflow-hidden`}
            >
              {/* Decorative element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full -ml-12 -mb-12 blur-2xl" />
              
              <p className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug relative z-10">
                {t(`feelings.${feelingId}.affirmations.${currentIndex}`, feeling.affirmations[currentIndex])}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="mt-10 flex items-center gap-3">
            {feeling.affirmations.map((_, i) => (
              <motion.span
                key={i}
                animate={{ 
                  scale: i === currentIndex ? 1.5 : 1,
                  backgroundColor: i === currentIndex ? 'var(--color-primary, #3b82f6)' : '#E2E8F0'
                }}
                className="block h-2 w-2 rounded-full transition-all"
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-4 mt-4 mb-8">
          <motion.button
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={goPrev}
            disabled={isFirst}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-white/60 text-slate-600 shadow-sm disabled:opacity-20 transition-all"
          >
            <ChevronLeft size={24} />
          </motion.button>

          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              {t('affirmation', 'Affirmation')}
            </p>
            <p className="text-lg font-extrabold text-slate-900">
              {currentIndex + 1} <span className="text-slate-300 mx-1">/</span> {total}
            </p>
          </div>

          <motion.button
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={goNext}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-all"
          >
            {isLast ? <Check size={24} /> : <ChevronRight size={24} />}
          </motion.button>
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onChooseAnother}
            className="w-full py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold flex items-center justify-center gap-2 hover:bg-slate-200 hover:shadow-xl hover:shadow-primary/40 transition-all"
          >
            <RotateCcw size={18} />
            {t('common.chooseAnother', 'Choose another feeling')}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Wrapper ---

type Screen = 'intro' | 'feelings' | 'affirmation' | 'complete';

function AffirmationsInner() {
  const { t } = useTranslation(undefined, { i18n });
  const [screen, setScreen] = useState<Screen>('intro');
  const [selectedFeeling, setSelectedFeeling] = useState<string>('');
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lang = params.get('lang') || 'en';
      loadLocale(lang);
    }
  }, []);

  const handleSelectFeeling = (feelingId: string, colorIndex: number) => {
    setSelectedFeeling(feelingId);
    setSelectedColorIndex(colorIndex);
    setScreen('affirmation');
  };

  const screenOrder: Screen[] = ['intro', 'feelings', 'affirmation', 'complete'];
  const currentIdx = screenOrder.indexOf(screen);

  return (
    <PremiumLayout
      title={t('app_title', 'Mindset')}
      icon={<Sparkles className="w-6 h-6 text-primary" />}
      onBack={currentIdx > 0 && screen !== 'complete' ? () => setScreen(screenOrder[currentIdx - 1]) : undefined}
      onReset={currentIdx > 0 && screen !== 'complete' ? () => setScreen('intro') : undefined}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-6 py-4 min-h-[70vh]">
        {screen !== 'complete' && (
          <div className="flex justify-center gap-2 mb-10">
            {screenOrder.slice(0, 3).map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i <= currentIdx ? 'w-8 bg-primary' : 'w-2 bg-slate-100 '
                }`}
              />
            ))}
          </div>
        )}

        <div className="relative flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {screen === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="w-full flex-1 flex flex-col"
              >
                <PremiumIntro
                  title={t('app_title', 'Mindset')}
                  description={t('intro.description', 'Daily affirmations help reshape your mindset and build emotional resilience.')}
                  onStart={() => setScreen('feelings')}
                  icon={<Sparkles size={32} />}
                  benefits={[
                    t('intro.benefits.0', 'Find peace in difficult moments'),
                    t('intro.benefits.1', 'Challenge negative thought patterns'),
                    t('intro.benefits.2', 'Build self-compassion and strength'),
                  ]}
                  duration={t('app_duration', '2-3 minutes')}
                />
              </motion.div>
            )}

            {screen === 'feelings' && (
              <motion.div
                key="feelings"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="w-full flex-1 flex flex-col"
              >
                <FeelingSelector onSelect={handleSelectFeeling} />
              </motion.div>
            )}

            {screen === 'affirmation' && (
              <motion.div
                key="affirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full flex-1 flex flex-col"
              >
                <AffirmationScreen
                  feelingId={selectedFeeling}
                  colorIndex={selectedColorIndex}
                  onChooseAnother={() => setScreen('feelings')}
                  onFinish={() => setScreen('complete')}
                />
              </motion.div>
            )}

            {screen === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="w-full flex-1 flex flex-col"
              >
                <PremiumComplete
                  title={t('app_title', 'Mindset')}
                  message={t('app_complete_message', 'Daily affirmations help reshape your mindset. Carry these positive thoughts with you today.')}
                  onRestart={() => setScreen('feelings')}
                  icon={<Sparkles size={48} />}
                  shareContent={"I just completed 'Positive Affirmations' on TherapyMantra — a guided affirmations practice that genuinely helped me. Try it! \n\n Android: https://play.google.com/store/apps/details?id=org.mantracare.therapy\n iOS: https://apps.apple.com/pk/app/therapymantra/id1607643888"}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumLayout>
  );
}

export default function AffirmationsPage() {
  return (
    <I18nextProvider i18n={i18n}>
      <AffirmationsInner />
    </I18nextProvider>
  );
}
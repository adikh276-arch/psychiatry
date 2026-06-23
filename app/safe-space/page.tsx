'use client';

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation, I18nextProvider } from "react-i18next";
import { PremiumLayout } from "@/components/shared/PremiumLayout";
import { PremiumComplete } from "@/components/shared/PremiumComplete";
import { Shield, ChevronRight, Moon, Activity, Leaf } from "lucide-react";
import i18n, { loadLocale } from "./i18n";

const transition = { duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

const variants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

const staggerChildren = {
  center: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const childFade = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as any } },
};

const floatEmoji = {
  animate: {
    y: [0, -6, 0],
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" as any },
  },
};

const breathe = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.4, 0.8, 0.4],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as any },
  },
};

function Screen1({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation(undefined, { i18n });
  const [feeling, setFeeling] = useState("");
  const description = ((_t => Array.isArray(_t) ? _t : null)(t("s1.description", { returnObjects: true }))) || [
    "To begin, take a moment to notice where you are carrying tension or stress.",
    "Acknowledge whatever you are feeling right now — anxiety, restlessness, fatigue, or numbness. There is no wrong way to be."
  ];

  return (
    <motion.div variants={staggerChildren} initial="enter" animate="center" className="flex flex-col items-center text-center gap-10">
      <motion.div variants={floatEmoji} animate="animate" className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner"><Leaf className="inline-block w-8 h-8" /></motion.div>

      <div className="space-y-4">
        <motion.h1 variants={childFade} className="text-3xl font-black text-slate-800 leading-tight">
          {t("s1.title", "Notice Your Current State")}
        </motion.h1>
        <motion.div variants={childFade} className="space-y-4 text-slate-500 font-medium leading-relaxed text-base">
          {description && description.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </motion.div>
      </div>

      <motion.div variants={childFade} className="w-full">
        <textarea 
          placeholder={t("s1.placeholder", "Type how you are feeling (e.g. My shoulders feel tight...)")} 
          value={feeling} 
          onChange={(e) => setFeeling(e.target.value)}
          className="field-textarea min-h-[120px]" 
        />
      </motion.div>
      <motion.div variants={childFade} className="w-full">
        <button
          onClick={onContinue}
          className="w-full bg-slate-900 text-white shadow-md py-5 rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/20 hover:opacity-90 hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-3"
        >
          {t("s1.button", "Continue")}
          <ChevronRight size={20} strokeWidth={3} />
        </button>
      </motion.div>
    </motion.div>
  );
}

function Screen2({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation(undefined, { i18n });
  const description = ((_t => Array.isArray(_t) ? _t : null)(t("s2.description", { returnObjects: true }))) || [
    "Close your eyes if you feel safe to do so, or soften your gaze.",
    "Imagine a place where you feel completely secure, calm, and protected.",
    "This could be a beach, a quiet forest room, a warm blanket, or a childhood memory."
  ];

  return (
    <motion.div variants={staggerChildren} initial="enter" animate="center" className="flex flex-col items-center text-center gap-10">
      <motion.div variants={floatEmoji} animate="animate" className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner"><Activity className="inline-block w-8 h-8" /></motion.div>

      <div className="space-y-4">
        <motion.h1 variants={childFade} className="text-3xl font-black text-slate-800 leading-tight">
          {t("s2.title", "Create Your Safe Space")}
        </motion.h1>
        <motion.div variants={childFade} className="space-y-4 text-slate-500 font-medium leading-relaxed text-base">
          {description && description.slice(0, 2).map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
          <p className="font-black text-primary italic">{description && description[2]}</p>
        </motion.div>
      </div>

      <motion.div variants={childFade} className="w-full">
        <button
          onClick={onContinue}
          className="w-full bg-slate-900 text-white shadow-md py-5 rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/20 hover:opacity-90 hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-3"
        >
          {t("s2.button", "I have my place")}
          <ChevronRight size={20} strokeWidth={3} />
        </button>
      </motion.div>
    </motion.div>
  );
}

function Screen3({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation(undefined, { i18n });
  const description = ((_t => Array.isArray(_t) ? _t : null)(t("s3.description", { returnObjects: true }))) || [
    "Now look around this safe space. Notice the details.",
    "What colors do you see? What objects are present? Let your mind explore the layout.",
    "Take a slow breath as you anchor yourself in these details."
  ];

  return (
    <motion.div variants={staggerChildren} initial="enter" animate="center" className="flex flex-col items-center text-center gap-10">
      <motion.div variants={floatEmoji} animate="animate" className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner">
        
      </motion.div>

      <div className="space-y-4">
        <motion.h1 variants={childFade} className="text-3xl font-black text-slate-800 leading-tight">
          {t("s3.title", "What Do You See?")}
        </motion.h1>
        <motion.div variants={childFade} className="space-y-4 text-slate-500 font-medium leading-relaxed text-base">
          {description && description.slice(0, 2).map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
          <p className="font-black text-primary italic">{description && description[2]}</p>
        </motion.div>
      </div>

      <motion.div variants={childFade} className="w-full">
        <button
          onClick={onContinue}
          className="w-full bg-slate-900 text-white shadow-md py-5 rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/20 hover:opacity-90 hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-3"
        >
          {t("s3.button", "Continue Exploring")}
          <ChevronRight size={20} strokeWidth={3} />
        </button>
      </motion.div>
    </motion.div>
  );
}

function Screen4({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation(undefined, { i18n });
  const description = ((_t => Array.isArray(_t) ? _t : null)(t("s4.description", { returnObjects: true }))) || [
    "What sounds are in your space? Is there soft wind, crackling fire, or silence?",
    "Notice the physical sensations. The warm sun on your skin, or the soft ground beneath you.",
    "Follow the breathing circle. Breathe in as it expands, out as it shrinks."
  ];

  return (
    <motion.div variants={staggerChildren} initial="enter" animate="center" className="flex flex-col items-center text-center gap-10">
      <motion.div variants={floatEmoji} animate="animate" className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner"><Moon className="inline-block w-8 h-8" /></motion.div>

      <div className="space-y-4">
        <motion.h1 variants={childFade} className="text-3xl font-black text-slate-800 leading-tight">
          {t("s4.title", "Notice Sound & Touch")}
        </motion.h1>
        <motion.div variants={childFade} className="space-y-4 text-slate-500 font-medium leading-relaxed text-base">
          {description && description.slice(0, 2).map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
          <p className="font-black text-primary italic">{description && description[2]}</p>
        </motion.div>
      </div>

      <motion.div variants={childFade} className="relative flex items-center justify-center my-2">
        <motion.div variants={breathe} animate="animate"
          className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t("s4.breathe", "Breathe")}</span>
        </motion.div>
      </motion.div>

      <motion.div variants={childFade} className="bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 rounded-3xl p-6 border border-white/60">
        <p className="text-slate-500 font-bold text-sm italic leading-relaxed">
          {t("s4.notice", "Allow yourself to fully settle. There is nothing else you need to do right now.")}
        </p>
      </motion.div>

      <motion.div variants={childFade} className="w-full">
        <button
          onClick={onContinue}
          className="w-full bg-slate-900 text-white shadow-md py-5 rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/20 hover:opacity-90 hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-3"
        >
          {t("s4.button", "I feel settled")}
          <ChevronRight size={20} strokeWidth={3} />
        </button>
      </motion.div>
    </motion.div>
  );
}

function Screen5({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation(undefined, { i18n });
  const [reflection, setReflection] = useState("");
  const description = ((_t => Array.isArray(_t) ? _t : null)(t("s5.description", { returnObjects: true }))) || [
    "As we finish, check in with your body one more time.",
    "Notice if any tension has softened, or if your breathing feels a bit steadier."
  ];

  return (
    <motion.div variants={staggerChildren} initial="enter" animate="center" className="flex flex-col items-center text-center gap-10">
      <motion.div variants={floatEmoji} animate="animate" className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner">
        
      </motion.div>

      <div className="space-y-4">
        <motion.h1 variants={childFade} className="text-3xl font-black text-slate-800 leading-tight">
          {t("s5.title", "Reflect and Return")}
        </motion.h1>
        <motion.div variants={childFade} className="space-y-4 text-slate-500 font-medium leading-relaxed text-base">
          {description && description.slice(0, 1).map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
          <p className="font-black text-primary italic">{description && description[1]}</p>
        </motion.div>
      </div>

      <motion.div variants={childFade} className="w-full">
        <textarea 
          placeholder={t("s5.placeholder", "Write down how you feel now...")} 
          value={reflection} 
          onChange={(e) => setReflection(e.target.value)}
          className="field-textarea min-h-[120px]" 
        />
      </motion.div>

      <motion.div variants={childFade} className="w-full">
        <button
          onClick={onDone}
          className="w-full bg-slate-900 text-white shadow-md py-5 rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/20 hover:opacity-90 hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-3"
        >
          {t("s5.button", "Complete Session")}
          <ChevronRight size={20} strokeWidth={3} />
        </button>
      </motion.div>
    </motion.div>
  );
}

function SafePlaceVisualizationInner() {
  const { t } = useTranslation(undefined, { i18n });
  const [screen, setScreen] = useState(0);

  // Sync lang parameter from query
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lang = params.get('lang') || 'en';
      loadLocale(lang);
    }
  }, []);

  const next = useCallback(() => setScreen((s) => Math.min(s + 1, 5)), []);
  const reset = useCallback(() => setScreen(0), []);

  if (screen === 5) {
    return (
      <PremiumComplete
        title={t("app_title", "Safe Space Visualization")}
        message={t("complete.message", "Take this feeling of safety with you. You can return to your safe space whenever you need a moment of peace.")}
        onRestart={reset}
                  shareContent={"I just completed 'Safe Space' on TherapyMantra — a guided visualization exercise that genuinely helped me. Try it! \n\n Android: https://play.google.com/store/apps/details?id=org.mantracare.therapy\n iOS: https://apps.apple.com/pk/app/therapymantra/id1607643888"}
      />
    );
  }

  const titles = ((_t => Array.isArray(_t) ? _t : null)(t("nav", { returnObjects: true }))) || [
    "Notice Feeling",
    "Find Your Space",
    "What You See",
    "Sound & Touch",
    "Check Out"
  ];

  return (
    <PremiumLayout
      title={t("app_title", "Safe Space Visualization")}
      subtitle={titles[screen]}
      icon={<Shield className="w-6 h-6 text-primary" />}
      onBack={screen > 0 ? () => setScreen(prev => prev - 1) : undefined}
      onReset={screen > 0 ? reset : undefined}
    >
      <div className="w-full max-w-md mx-auto flex flex-col px-6 py-4 min-h-[70vh]">
        <div className="flex justify-center gap-2 mb-10">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${i <= screen ? "w-8 bg-primary" : "w-2 bg-slate-100"}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="flex-1 flex flex-col"
          >
            {screen === 0 && <Screen1 onContinue={next} />}
            {screen === 1 && <Screen2 onContinue={next} />}
            {screen === 2 && <Screen3 onContinue={next} />}
            {screen === 3 && <Screen4 onContinue={next} />}
            {screen === 4 && <Screen5 onDone={next} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </PremiumLayout>
  );
}

export default function SafePlacePage() {
  return (
    <I18nextProvider i18n={i18n}>
      <SafePlaceVisualizationInner />
    </I18nextProvider>
  );
}
'use client';
import { useState, useCallback, useMemo, useEffect } from "react";
import { loadLocale } from "../i18n/i18n";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumIntro } from "../../../components/shared/PremiumIntro";
import { PremiumComplete } from "../../../components/shared/PremiumComplete";
import { Compass, Eye, Hand, Volume2, Wind, Utensils } from "lucide-react";
import ProgressDots from "../components/ProgressDots";
import GroundingButton from "../components/GroundingButton";
import StepInput from "../components/StepInput";

const stepIcons = [
  <Wind key="0" size={32} />,
  <Eye key="1" size={32} />,
  <Hand key="2" size={32} />,
  <Volume2 key="3" size={32} />,
  <Compass key="4" size={32} />,
  <Utensils key="5" size={32} />,
  <Wind key="6" size={32} />
];

const GroundingExercise = () => {
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lang = params.get('lang') || 'en';
      if (typeof loadLocale === 'function') {
        loadLocale(lang);
      }
    }
  }, []);

  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<number, string[]>>({});
  const [reflectionWord, setReflectionWord] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Use GroundingButton just to silence the unused warning if we want, or remove the import. 
  // Let's just remove the import in the next call if we didn't use it, wait I left it here.
  
  const steps = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stepsData = t("steps", { returnObjects: true }) as any;
    const stepsArray = Array.isArray(stepsData) ? stepsData : [];
    
    const config = [
      { inputCount: 0 },
      { inputCount: 5 },
      { inputCount: 4 },
      { inputCount: 3 },
      { inputCount: 2 },
      { inputCount: 1 },
      { inputCount: 0, reflectionPrompt: true },
    ];
    return stepsArray.map((s, i) => ({
      ...s,
      ...config[i]
    }));
  }, [t]);

  const totalSteps = steps.length;
  const step = steps[currentStep];

  const handleNext = useCallback(() => {
    if (currentStep === totalSteps - 1) {
      setSubmitted(true);
      return;
    }
    setCurrentStep((s) => s + 1);
  }, [currentStep, totalSteps]);

  if (!step) {
    return <div className="min-h-[60vh] flex items-center justify-center text-slate-400">Loading...</div>;
  }

  const handleInputChange = (values: string[]) => {
    setResponses((prev) => ({ ...prev, [currentStep]: values }));
  };

  if (submitted) {
    return (
      <PremiumComplete
        title={t("app_title")}
        message={t("common.completion_message")}
        onRestart={() => {
          setCurrentStep(0);
          setResponses({});
          setReflectionWord("");
          setSubmitted(false);
        }}
      >
        {reflectionWord && (
          <div className="bg-white p-6 rounded-2xl border border-white/60 shadow-sm text-center">
             <p className="text-slate-500 text-sm mb-1">{t("common.you_feel")}</p>
             <p className="text-2xl font-bold text-primary italic">&quot;{reflectionWord}&quot;</p>
          </div>
        )}
      </PremiumComplete>
    );
  }

  if (currentStep === 0) {
    return (
      <PremiumIntro
        title={t("app_title")}
        description={step.body}
        onStart={handleNext}
        icon={stepIcons[0]}
        benefits={[t('intro_p1'), t('intro_p2'), t('intro_p3')]}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-[60vh]">
      {/* Progress */}
      <div className="mb-8 flex justify-center">
        <ProgressDots total={totalSteps} current={currentStep} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 flex flex-col items-center text-center"
        >
          {/* Step icon/number */}
          <div className="mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                {stepIcons[currentStep] || <Compass size={32} />}
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-6">
            {step.heading}
          </h1>

          <div className="max-w-md mb-8">
            {step.body.split("\n\n").map((paragraph: string, i: number) => (
              <p key={i} className="text-slate-600 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Inputs for sense steps */}
          {step.inputCount > 0 && (
            <div className="mb-8 w-full max-w-sm">
              <StepInput
                count={step.inputCount}
                values={responses[currentStep] || []}
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Reflection input */}
          {step.reflectionPrompt && (
            <div className="mb-8 w-full max-w-sm text-left">
              <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">
                {t("common.reflection_question")}
              </label>
              <input
                type="text"
                value={reflectionWord}
                onChange={(e) => setReflectionWord(e.target.value)}
                placeholder={t("common.reflection_placeholder")}
                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-base focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
              />
            </div>
          )}

          <div className="mt-auto w-full max-w-xs">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
            >
              {step.button}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GroundingExercise;

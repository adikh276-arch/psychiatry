'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { PremiumComplete } from "@/components/shared/PremiumComplete";
import { PremiumLayout } from "@/components/shared/PremiumLayout";
import { withLang } from "@/lib/navigation";
import { Wind } from "lucide-react";
import '../i18n/i18n';
import { loadLocale } from '../i18n/i18n';

const CompletionScreen = () => {
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

  const router = useRouter();
  const [reflection, setReflection] = useState("");

  return (
    <PremiumLayout title={t("app_title")}>
      <PremiumComplete
        title={t("app_title")}
        message={`${t('notice_body')} ${t('breath_slower')} ${t('chest_softer')}`}
        onRestart={() => router.push(withLang("/4_6_8_breathing/breathe"))}
        icon={<Wind size={48} />}
                  shareContent={"I just completed '4-6-8 Breathing' on TherapyMantra — a guided breathing exercises that genuinely helped me. Try it! \n\n Android: https://play.google.com/store/apps/details?id=org.mantracare.therapy\n iOS: https://apps.apple.com/pk/app/therapymantra/id1607643888"}
      >
        <div className="w-full flex flex-col gap-4 text-left mt-8">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
            {t('what_feels_different')}
          </p>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder={t('reflection_placeholder')}
            rows={4}
            className="field-textarea text-lg p-8"
          />
        </div>
      </PremiumComplete>
    </PremiumLayout>
  );
};

export default CompletionScreen;
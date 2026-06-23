'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, BookOpen, Heart, Newspaper, HelpCircle } from 'lucide-react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import i18n, { loadLocale } from '../../i18n';
import { getLocalizedData } from '../../dataLoader';
import { Resource } from '../../types';

const ICON_MAP: Record<string, any> = {
  tips: Heart,
  articles: Newspaper,
  stories: BookOpen,
  myths: HelpCircle
};

const COLOR_MAP: Record<string, string> = {
  tips: 'text-rose-500 bg-rose-50',
  articles: 'text-emerald-500 bg-emerald-50',
  stories: 'text-amber-500 bg-amber-50',
  myths: 'text-indigo-500 bg-indigo-50'
};

interface ResourceListInnerProps {
  concern: string;
  type: string;
}

function ResourceListInner({ concern, type }: ResourceListInnerProps) {
  const { t } = useTranslation(undefined, { i18n });
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load language from query parameter
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lang = params.get('lang') || 'en';
      loadLocale(lang).then(() => {
        loadData(lang);
      });
    } else {
      loadData('en');
    }
  }, [concern, type]);

  // Handle manual language change on the fly if needed
  useEffect(() => {
    const handleLangChange = (lang: string) => {
      loadData(lang);
    };
    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, [concern, type]);

  const loadData = async (lang: string) => {
    setLoading(true);
    try {
      const data = await getLocalizedData(lang);
      const filtered = (data as any)?.[type || '']?.filter((r: any) => r.concern === concern) || [];
      setResources(filtered);
    } catch (err) {
      console.error("Failed to load resources:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PremiumLayout title={t("common.loading", "Loading...")}>
        <div className="flex items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PremiumLayout>
    );
  }
  
  const Icon = ICON_MAP[type || 'tips'] || BookOpen;
  const colorClass = COLOR_MAP[type || 'tips'] || 'text-primary bg-primary/10';
  const colorParts = colorClass.split(' ');
  const textClr = colorParts[0];
  const bgClr = colorParts[1];

  const title = `${t(`concerns.${concern}`, concern)} ${t(`types.${type}`, type)}`;

  return (
    <PremiumLayout 
      title={title}
      onBack={() => router.push(`/?lang=${i18n.language}`)}
    >
      <div className="w-full max-w-4xl mx-auto space-y-12 pb-24 px-4">
        <div className="grid gap-6">
          {resources.length > 0 ? (
            resources.map((res: Resource, i: number) => (
              <motion.button
                key={res.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', damping: 20 }}
                whileHover={{ y: -2, scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                onClick={() => router.push(`/resources/${concern}/${type}/${res.id}?lang=${i18n.language}`)}
                className="w-full text-left p-6 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:border-slate-200 transition-all flex items-center gap-6 md:gap-8 group relative overflow-hidden"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500 ${bgClr}`}>
                  <Icon className={`w-6 h-6 ${textClr}`} />
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-bold text-slate-900 text-lg md:text-xl group-hover:text-primary transition-colors leading-tight">
                    {res.title}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed line-clamp-2 pr-4">
                    {res.preview}
                  </p>
                </div>
                
                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-50 transition-all duration-300">
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.button>
            ))
          ) : (
            <div className="py-32 text-center space-y-6 bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 rounded-[4rem] border border-dashed border-slate-200">
              <div className="text-slate-200 flex justify-center">
                <Icon size={80} strokeWidth={1} />
              </div>
              <div className="space-y-1">
                <p className="text-slate-900 font-black text-lg">{t('list.empty_title', { type: t(`types.${type}`, type) })}</p>
                <p className="text-slate-400 font-bold text-sm">{t('list.empty_desc')}</p>
              </div>
            </div>
          )}
        </div>

        <footer className="pt-12 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
            {t('list.footer')}
          </p>
        </footer>
      </div>
    </PremiumLayout>
  );
}

export default function ResourceListPage({ params }: { params: Promise<{ concern: string; type: string }> }) {
  const { concern, type } = use(params);

  return (
    <I18nextProvider i18n={i18n}>
      <ResourceListInner concern={concern} type={type} />
    </I18nextProvider>
  );
}

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Lightbulb, MessageCircle, HelpCircle, ArrowLeft } from 'lucide-react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import i18n, { loadLocale } from '../../../i18n';
import { getLocalizedData } from '../../../dataLoader';
import { Resource, Tip, Article, Story, Myth } from '../../../types';

interface ResourceDetailInnerProps {
  concern: string;
  type: string;
  id: string;
}

function ResourceDetailInner({ concern, type, id }: ResourceDetailInnerProps) {
  const { t } = useTranslation(undefined, { i18n });
  const router = useRouter();
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lang = params.get('lang') || 'en';
      loadLocale(lang).then(() => {
        loadData(lang);
      });
    } else {
      loadData('en');
    }
  }, [concern, type, id]);

  const loadData = async (lang: string) => {
    setLoading(true);
    try {
      const data = await getLocalizedData(lang);
      const allResources = (data as any)?.[type || ''] || [];
      const found = allResources.find((r: any) => r.id === id) as Resource;
      setResource(found);
    } catch (err) {
      console.error("Failed to load resource detail:", err);
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

  if (!resource) {
    return (
      <PremiumLayout title={t("app_title", "Resources")}>
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
            <HelpCircle size={40} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-slate-900 font-black text-xl">{t("not_found.message")}</p>
            <p className="text-slate-400 font-bold text-sm">{t("not_found.description")}</p>
          </div>
          <button 
            onClick={() => router.push(`/resources/${concern}/${type}?lang=${i18n.language}`)} 
            className="px-8 py-3 bg-primary text-white font-black rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            {t("not_found.button")}
          </button>
        </div>
      </PremiumLayout>
    );
  }

  const renderTip = (tip: Tip) => {
    return (
      <div className="w-full space-y-12 pb-24">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] border border-white/60 p-12 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 text-slate-50 pointer-events-none">
            <Sparkles size={120} />
          </div>
          <h2 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
            <Sparkles size={14} />
            {t("detail.tip.insight_label")}
          </h2>
          <p className="text-slate-700 text-2xl font-black leading-tight tracking-tight relative z-10">{tip.whyItHelps}</p>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-10"
        >
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t("detail.tip.plan_title")}</h2>
            <span className="px-4 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
              {t("detail.tip.steps", { count: tip.whatYouCanDo.length })}
            </span>
          </div>
          
          <div className="grid gap-4">
            {tip.whatYouCanDo.map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="flex items-start gap-8 p-10 bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 rounded-[3rem] border border-transparent hover:bg-white hover:border-primary/20 transition-all group shadow-sm hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="w-12 h-12 rounded-2xl bg-white text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <CheckCircle2 size={24} strokeWidth={3} />
                </div>
                <span className="text-slate-800 text-lg font-bold leading-relaxed">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {tip.example && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-10 md:p-12 bg-rose-50/70 rounded-[2.5rem] border border-rose-100 shadow-sm space-y-8 relative overflow-hidden group"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-100/40 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-[0.3em] relative z-10">
              <Lightbulb size={16} className="text-rose-500" />
              {t("detail.tip.example_label")}
            </div>
            <div className="grid md:grid-cols-[1fr,auto,1fr] items-center gap-8 relative z-10">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-rose-450 uppercase tracking-wider">{t("detail.tip.instead_of")}</p>
                <p className="text-rose-900/60 text-lg font-bold leading-relaxed italic">{tip.example.instead}</p>
              </div>
              
              <div className="hidden md:flex flex-col items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-rose-200" />
                <div className="w-1 h-8 bg-gradient-to-b from-rose-200 to-rose-300 rounded-full" />
                <div className="w-1 h-1 rounded-full bg-rose-300" />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{t("detail.tip.try_this")}</p>
                <p className="text-rose-950 text-2xl font-bold leading-tight tracking-tight">{tip.example.tryThis}</p>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    );
  };

  const renderArticle = (article: Article) => {
    return (
      <div className="w-full space-y-12 pb-24">
        <article className="prose prose-slate max-w-none">
          <div 
            className="text-slate-750 text-xl leading-relaxed space-y-8 font-medium article-content"
            dangerouslySetInnerHTML={{ __html: article.body }} 
          />
        </article>

        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 md:p-12 bg-emerald-50/70 rounded-[2.5rem] text-slate-800 space-y-6 shadow-sm relative overflow-hidden flex flex-col items-center text-center max-w-2xl mx-auto border border-emerald-100"
        >
          <div className="absolute top-0 right-0 p-8 text-emerald-200/20 pointer-events-none select-none">
            <Sparkles size={180} />
          </div>
          
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-[0.3em] relative z-10">
            <Sparkles size={14} className="text-emerald-500" />
            {t("detail.article.final_thought", "FINAL THOUGHT")}
          </div>
          
          <p className="text-emerald-950 text-xl md:text-2xl font-bold italic leading-relaxed relative z-10 max-w-xl">
            &ldquo;{article.takeaway}&rdquo;
          </p>
        </motion.section>
      </div>
    );
  };

  const renderStory = (story: Story) => {
    return (
      <div className="w-full space-y-16 pb-24">
        <div className="relative p-12 bg-white rounded-[4rem] border border-white/60 shadow-sm overflow-hidden group hover:border-amber-200 transition-all duration-500">
          <div className="absolute -top-10 -right-10 p-12 text-amber-50 pointer-events-none group-hover:text-amber-100/50 transition-colors duration-700">
            <MessageCircle size={200} strokeWidth={1} />
          </div>
          <p className="text-3xl font-black text-slate-900 leading-tight tracking-tight relative z-10 italic">
            &ldquo;{story.quote}&rdquo;
          </p>
        </div>

        <div className="space-y-10 text-slate-700 text-xl leading-relaxed font-medium max-w-2xl">
          {story.story.map((para, i) => (
            <motion.p 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              {para}
            </motion.p>
          ))}
        </div>

        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-12 bg-amber-50 rounded-[4rem] border border-amber-100 space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 text-amber-200/30">
            <Sparkles size={100} />
          </div>
          <h3 className="text-amber-600 font-black text-[11px] uppercase tracking-[0.4em] relative z-10">{t("detail.story.reflection_label")}</h3>
          <p className="text-amber-900 font-black text-3xl leading-[1.3] tracking-tight italic relative z-10">
            &ldquo;{story.highlight}&rdquo;
          </p>
        </motion.section>

        <section className="p-12 bg-white/40 backdrop-blur-sm shadow-sm border border-white/50 rounded-[4rem] border border-white/60">
          <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mb-6">{t("detail.story.note_label")}</h3>
          <p className="text-slate-600 text-lg font-bold leading-relaxed">
            {story.takeaway}
          </p>
        </section>
      </div>
    );
  };

  const renderMyth = (myth: Myth) => {
    return (
      <div className="w-full space-y-16 pb-24">
        <motion.section 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-indigo-600 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 text-white/10">
            <Sparkles size={200} />
          </div>
          <h2 className="text-[11px] font-black text-indigo-200 uppercase tracking-[0.5em] mb-6 relative z-10">{t("detail.myth.truth_label")}</h2>
          <p className="text-white text-4xl font-black leading-tight tracking-tight relative z-10">{myth.truth}</p>
        </motion.section>

        <article className="p-12 bg-white rounded-[4rem] border border-white/60 shadow-sm space-y-8">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{t("detail.myth.explanation_label")}</h3>
          <div 
            className="text-slate-700 text-xl leading-relaxed space-y-8 font-medium article-content"
            dangerouslySetInnerHTML={{ __html: myth.explanation }} 
          />
        </article>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 md:p-12 bg-indigo-50/70 rounded-[2.5rem] text-slate-800 space-y-6 shadow-sm relative overflow-hidden flex flex-col items-center text-center max-w-2xl mx-auto border border-indigo-100"
        >
          <div className="absolute top-0 right-0 p-8 text-indigo-200/20 pointer-events-none select-none">
            <Sparkles size={180} />
          </div>
          
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.3em] relative z-10">
            <Sparkles size={14} className="text-indigo-500" />
            {t("detail.myth.insight_label", "KEY INSIGHT")}
          </div>
          
          <p className="text-indigo-950 text-xl md:text-2xl font-bold italic leading-relaxed relative z-10 max-w-xl">
            &ldquo;{myth.takeaway}&rdquo;
          </p>
        </motion.section>
      </div>
    );
  };

  return (
    <PremiumLayout 
      title={resource.title}
      onBack={() => router.push(`/resources/${concern}/${type}?lang=${i18n.language}`)}
    >
      <div className="max-w-3xl mx-auto px-6 py-4">
        {/* Custom scoped article styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          .article-content p {
            margin-bottom: 2rem;
            line-height: 1.8;
            color: #334155;
          }
          .article-content h2 {
            font-weight: 900;
            font-size: 2rem;
            color: #0f172a;
            margin-top: 3.5rem;
            margin-bottom: 1.5rem;
            letter-spacing: -0.025em;
            line-height: 1.2;
          }
          .article-content h3 {
            font-weight: 900;
            font-size: 1.5rem;
            color: #1e293b;
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            letter-spacing: -0.025em;
          }
          .article-content ul, .article-content ol {
            margin-bottom: 2.5rem;
            padding-left: 2rem;
          }
          .article-content li {
            margin-bottom: 1rem;
            line-height: 1.6;
            color: #475569;
          }
          .article-content strong {
            font-weight: 900;
            color: #0f172a;
          }
          .article-content blockquote {
            border-left: 8px solid #f1f5f9;
            padding-left: 2.5rem;
            margin: 3rem 0;
            font-style: italic;
            color: #64748b;
            font-size: 1.5rem;
            line-height: 1.5;
          }
          .article-content .pullquote {
            border-left: 8px solid #6366f1;
            padding: 1.5rem 2.5rem;
            margin: 3rem 0;
            font-style: italic;
            color: #0f172a;
            font-size: 1.6rem;
            font-weight: 800;
            line-height: 1.5;
            background-color: #f8fafc;
            border-radius: 0 2rem 2rem 0;
          }
          .article-content .keybox {
            background-color: #f0fdf4;
            border: 2px solid #bbf7d0;
            padding: 2.5rem;
            border-radius: 2.5rem;
            margin: 3rem 0;
          }
          .article-content .keybox-title {
            font-weight: 900;
            color: #14532d;
            font-size: 1.25rem;
            display: block;
            margin-bottom: 1.5rem;
          }
          .article-content .keybox ul {
            list-style: none;
            padding-left: 0;
            margin-bottom: 0;
          }
          .article-content .keybox li {
            position: relative;
            padding-left: 2rem;
            color: #166534;
            font-weight: 700;
            margin-bottom: 0.75rem;
          }
          .article-content .keybox li::before {
            content: "";
            position: absolute;
            left: 0;
            color: #22c55e;
            font-weight: 900;
          }
          .article-content .myth-fact {
            background-color: #eff6ff;
            border-left: 8px solid #3b82f6;
            padding: 1.5rem 2rem;
            margin: 2.5rem 0;
            border-radius: 0 2rem 2rem 0;
          }
          .article-content .myth-fact h3 {
            margin-top: 0;
            margin-bottom: 0.5rem;
            color: #1e3a8a;
            font-size: 1.25rem;
          }
          .article-content .myth-explanation {
            font-size: 1.125rem;
            color: #334155;
            line-height: 1.8;
          }
          .article-content .myth-sources {
            font-size: 0.875rem;
            color: #64748b;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px dashed #cbd5e1;
          }
        `}} />
        {resource.type === 'tips' && renderTip(resource as Tip)}
        {resource.type === 'articles' && renderArticle(resource as Article)}
        {resource.type === 'stories' && renderStory(resource as Story)}
        {resource.type === 'myths' && renderMyth(resource as Myth)}
      </div>
    </PremiumLayout>
  );
}

export default function ResourceDetailPage({ params }: { params: Promise<{ concern: string; type: string; id: string }> }) {
  const { concern, type, id } = use(params);

  return (
    <I18nextProvider i18n={i18n}>
      <ResourceDetailInner concern={concern} type={type} id={id} />
    </I18nextProvider>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Smile,
  Clock,
  Activity,
  Book,
  Target,
  Moon,
  Cloud,
  Wind,
  Heart,
  Zap,
  Users,
  Sparkles,
  Star,
  Brain,
  Scale,
  User,
  Search
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/i18n';
import { loadGlobalResource as loadLocale } from '@/lib/i18n/i18n';
import { withLang } from '@/lib/navigation';

const iconMap: Record<string, any> = {
  Smile, Clock, Activity, Book, Target, Moon, Cloud, Wind,
  Heart, Zap, Users, Sparkles, Star, Brain, Scale, User, Search
};

interface Activity {
  name: string;
  description: string;
  icon: string;
  color: string;
  duration?: string;
  route?: string;
}

interface Category {
  name: string;
  activities: Activity[];
}

interface GuidedSeriesData {
  categories: Category[];
}

interface GuidedSeriesClientProps {
  concern: string;
  data: GuidedSeriesData | null;
}

export function GuidedSeriesClient({ concern, data }: GuidedSeriesClientProps) {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const handleActivityClick = useCallback((activity: Activity) => {
    if (activity.route) {
      if (activity.route.startsWith('http')) {
        window.location.href = withLang(activity.route);
      } else {
        router.push(withLang(activity.route));
      }
      return;
    }
    router.push(withLang(`/guided-series/${concern}/${encodeURIComponent(activity.name)}`));
  }, [concern, router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/60 px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800">
          {t('hub.guided_series', 'Guided Series')}
        </h1>
      </div>

      <motion.div
        className="max-w-2xl mx-auto px-4 mt-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {data ? (
          data.categories.map((category, catIndex) => (
            <div key={catIndex} className="mb-8">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-1">
                {category.name}
              </h2>
              <div className="space-y-3">
                {category.activities.map((activity, actIndex) => {
                  const Icon = iconMap[activity.icon] || Sparkles;
                  return (
                    <motion.button
                      key={actIndex}
                      variants={itemVariants}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleActivityClick(activity)}
                      className="w-full bg-white/60 backdrop-blur-lg border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-slate-200 transition-all text-left group"
                    >
                      {/* Icon Box */}
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${activity.color}18` }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ border: `2px solid ${activity.color}30` }}
                        >
                          <Icon size={22} style={{ color: activity.color }} strokeWidth={2} />
                        </div>
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-bold text-slate-800 mb-0.5 leading-snug">
                          {activity.name}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-1 leading-relaxed">
                          {activity.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ChevronRight
                        size={20}
                        className="text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all flex-shrink-0"
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Coming Soon</h3>
            <p className="text-sm text-slate-400 max-w-xs">
              The guided series for{' '}
              <span className="font-semibold capitalize">{concern}</span> is being
              prepared. Check back soon!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

'use client';
import { parseDbDate } from '@/lib/dateUtils';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Flame, Check, X, Pencil, Trash2,
  Plus, Loader2, Activity, ChevronDown, ChevronUp, Award, Zap, Clock, Calendar,
  Footprints, Flower2, Bike, Waves, Mountain, Music, Expand, Brain
} from 'lucide-react';
import i18n, { loadLocale } from './i18n';
import { PremiumLayout } from '@/components/shared/PremiumLayout';
import { PremiumComplete } from '@/components/shared/PremiumComplete';
import { apiPath } from '@/lib/apiPath';

interface ActivityEntry {
  id: number;
  date: string;
  emoji: string;
  name: string;
  duration: number;
  notes?: string;
}

const ACTIVITY_OPTIONS = [
  { name: 'Run',       emoji: '🏃',  color: 'bg-orange-50 text-orange-600 border-orange-100' },
  { name: 'Walk',      emoji: '🚶',  color: 'bg-blue-50   text-blue-600   border-blue-100'   },
  { name: 'Yoga',      emoji: '🧘',  color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { name: 'Gym',       emoji: '💪',  color: 'bg-rose-50   text-rose-600   border-rose-100'   },
  { name: 'Bike',      emoji: '🚴',  color: 'bg-green-50  text-green-600  border-green-100'  },
  { name: 'Swim',      emoji: '🏊',  color: 'bg-cyan-50   text-cyan-600   border-cyan-100'   },
  { name: 'Hike',      emoji: '🥾',  color: 'bg-amber-50  text-amber-600  border-amber-100'  },
  { name: 'Dance',     emoji: '💃',  color: 'bg-pink-50   text-pink-600   border-pink-100'   },
  { name: 'Stretch',   emoji: '🤸',  color: 'bg-teal-50   text-teal-600   border-teal-100'   },
  { name: 'Meditation',emoji: '🧠',  color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
];

const DURATION_PRESETS = [15, 20, 30, 45, 60, 90];

const EMOJI_MAP: Record<string, string> = {
  run: '🏃', walk: '🚶', swim: '🏊', bike: '🚴', yoga: '🧘',
  hike: '🥾', dance: '💃', gym: '💪', stretch: '🤸', meditation: '🧠',
};

function getEmoji(name: string): string {
  return EMOJI_MAP[name.toLowerCase()] || '🏃';
}

function getIcon(name: string, size: number = 24) {
  switch (name.toLowerCase()) {
    case 'run': return <Activity size={size} />;
    case 'walk': return <Footprints size={size} />;
    case 'yoga': return <Flower2 size={size} />;
    case 'gym': return <Dumbbell size={size} />;
    case 'bike': return <Bike size={size} />;
    case 'swim': return <Waves size={size} />;
    case 'hike': return <Mountain size={size} />;
    case 'dance': return <Music size={size} />;
    case 'stretch': return <Expand size={size} />;
    case 'meditation': return <Brain size={size} />;
    default: return <Activity size={size} />;
  }
}

const toLocalIsoDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

function PhysicalActivityLogInner() {
  const { t } = useTranslation(undefined, { i18n });

  const [activities, setActivities]     = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editingId, setEditingId]       = useState<number | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  // Form
  const [dateStr, setDateStr]           = useState(toLocalIsoDate(new Date()));
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration]         = useState('');
  const [notes, setNotes]               = useState('');
  const [isSaving, setIsSaving]         = useState(false);

  // Edit
  const [editName, setEditName]         = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editNotes, setEditNotes]       = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      loadLocale(params.get('lang') || 'en');
    }
  }, []);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(apiPath('/api/physical-activity'));
      if (res.ok) setActivities(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const handleAdd = async () => {
    if (!activityName.trim() || !duration || !dateStr) return;
    setIsSaving(true);
    try {
      const res = await fetch(apiPath('/api/physical-activity'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          emoji: getEmoji(activityName),
          name: activityName,
          duration: parseInt(duration, 10),
          notes,
        }),
      });
      if (res.ok) {
        const newRecord = await res.json();
        setActivities(prev => [newRecord, ...prev]);
        setActivityName(''); setDuration(''); setNotes('');
        setShowForm(false);
        setShowComplete(true);
      }
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim() || !editDuration) return;
    try {
      const res = await fetch(apiPath('/api/physical-activity'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, name: editName, emoji: getEmoji(editName), duration: parseInt(editDuration, 10), notes: editNotes }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActivities(prev => prev.map(a => a.id === editingId ? updated : a));
        setEditingId(null);
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(apiPath(`/api/physical-activity?id=${id}`), { method: 'DELETE' });
      if (res.ok) setActivities(prev => prev.filter(a => a.id !== id));
    } catch (e) { console.error(e); }
  };

  const stats = useMemo(() => {
    const sevenAgo  = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7);
    const thirtyAgo = new Date(); thirtyAgo.setDate(thirtyAgo.getDate() - 30);
    const week  = activities.filter(a => new Date(a.date) >= sevenAgo);
    const month = activities.filter(a => new Date(a.date) >= thirtyAgo);
    const weekMin  = week.reduce((s, a) => s + a.duration, 0);
    const monthMin = month.reduce((s, a) => s + a.duration, 0);
    const freq: Record<string, number> = {};
    activities.forEach(a => { freq[a.name] = (freq[a.name] || 0) + 1; });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const longest = activities.length ? Math.max(...activities.map(a => a.duration)) : 0;
    let streak = 0;
    const dates = new Set(activities.map(a => a.date));
    let d = new Date();
    if (!dates.has(toLocalIsoDate(d))) d.setDate(d.getDate() - 1);
    while (dates.has(toLocalIsoDate(d))) { streak++; d.setDate(d.getDate() - 1); }
    return { weekMin, monthMin, top, longest, streak };
  }, [activities]);

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const iso = toLocalIsoDate(d);
      return {
        day: d.toLocaleDateString(undefined, { weekday: 'short' }),
        date: iso,
        minutes: activities.filter(a => a.date === iso).reduce((s, a) => s + a.duration, 0),
      };
    });
  }, [activities]);

  const maxChart = Math.max(...chartData.map(d => d.minutes), 60);

  return (
    <PremiumLayout
      title={t('app_title', 'Activity Log')}
      icon={<Dumbbell className="w-5 h-5 text-primary" />}
    >
      <div className="w-full max-w-lg mx-auto px-4 pb-24 space-y-5">
        {showComplete ? (
          <PremiumComplete
            title={t('app_title', 'Activity Log')}
            message={t('complete_message', "You've successfully completed this activity. Regular movement builds a stronger mind.")}
            onRestart={() => setShowComplete(false)}
            shareContent="I just completed 'Activity Log' on TherapyMantra — a guided physical activity logging that genuinely helped me. Try it! \n\n Android: https://play.google.com/store/apps/details?id=org.mantracare.therapy\n iOS: https://apps.apple.com/pk/app/therapymantra/id1607643888"
          />
        ) : (
          <>

        {/* ─── STATS ROW ─── */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {[
            { label: 'This Week',  value: `${stats.weekMin}m`,  icon: <Clock size={16} />,    color: 'text-blue-500',   bg: 'bg-blue-50'   },
            { label: 'Streak',     value: `${stats.streak}d`,   icon: <Flame size={16} />,    color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'This Month', value: `${stats.monthMin}m`, icon: <Calendar size={16} />, color: 'text-emerald-500',bg: 'bg-emerald-50'},
            { label: 'Best Session',value: stats.longest > 0 ? `${stats.longest}m` : '—', icon: <Zap size={16} />, color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.bg} ${s.color}`}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-lg font-black text-slate-800 leading-tight">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── BAR CHART ─── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Last 7 Days</p>
          <div className="flex items-end gap-1.5 h-24">
            {chartData.map(d => {
              const pct = maxChart > 0 ? (d.minutes / maxChart) * 100 : 0;
              const isToday = d.date === toLocalIsoDate(new Date());
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-lg relative flex items-end justify-center" style={{ height: '80px' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(pct, 4)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                      className={`w-full rounded-lg ${isToday ? 'bg-primary' : 'bg-slate-100'}`}
                      style={{ minHeight: '4px' }}
                    />
                    {d.minutes > 0 && (
                      <span className="absolute -top-5 text-[9px] font-black text-slate-500">{d.minutes}m</span>
                    )}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wide ${isToday ? 'text-primary' : 'text-slate-400'}`}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── ADD BUTTON / FORM TOGGLE ─── */}
        <div className="flex flex-col gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 bg-primary text-white rounded-2xl font-black text-base shadow-lg shadow-primary/20"
          >
            <span className="flex items-center gap-2">
              <Plus size={20} />
              Log New Activity
            </span>
            {showForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </motion.button>

          {!showForm && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowComplete(true)}
              className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Check size={20} strokeWidth={3} />
              {t('common.finish_exit', 'Finish & Exit')}
            </motion.button>
          )}
        </div>

        {/* ─── LOG FORM ─── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-5"
            >
              {/* Activity picker */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Activity Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {ACTIVITY_OPTIONS.map(opt => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setActivityName(opt.name)}
                      className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-2xl border text-center transition-all ${
                        activityName === opt.name
                          ? 'border-primary bg-primary/10 text-primary scale-105 shadow-sm'
                          : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-primary/40'
                      }`}
                    >
                      <span className="flex items-center justify-center h-8 text-current">
                        {getIcon(opt.name, 22)}
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-tight leading-none">{opt.name}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or type a custom activity…"
                  value={activityName}
                  onChange={e => setActivityName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50"
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Duration (minutes)</label>
                <div className="flex gap-2 flex-wrap">
                  {DURATION_PRESETS.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDuration(String(p))}
                      className={`px-4 py-2 rounded-xl text-sm font-black border transition-all ${
                        duration === String(p)
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/40'
                      }`}
                    >
                      {p}m
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Custom minutes…"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50"
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Date</label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={e => setDateStr(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">How did it feel? (optional)</label>
                <textarea
                  placeholder="e.g. Felt amazing after, cleared my head completely…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAdd}
                  disabled={isSaving || !activityName || !duration}
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-black text-base shadow-md shadow-primary/20 hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  Save Entry
                </motion.button>
                <button
                  onClick={() => { setShowForm(false); setActivityName(''); setDuration(''); setNotes(''); }}
                  className="px-5 py-3.5 rounded-2xl bg-slate-100 text-slate-500 font-black text-sm hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── LOG HISTORY ─── */}
        <div className="space-y-3">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Past Sessions</p>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-7 h-7 animate-spin text-primary opacity-40" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-14 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Activity size={26} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold text-sm">No activities logged yet</p>
              <p className="text-slate-300 text-xs mt-1 font-medium">Tap the button above to record your first session!</p>
            </div>
          ) : (
            <AnimatePresence>
              {activities.map(a => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  {editingId === a.id ? (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Activity</label>
                          <input value={editName} onChange={e => setEditName(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50" />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Duration (min)</label>
                          <input type="number" value={editDuration} onChange={e => setEditDuration(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50" />
                        </div>
                      </div>
                      <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2}
                        placeholder="Notes…"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={handleSaveEdit}
                          className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-black flex items-center justify-center gap-1.5">
                          <Check size={14} /> Save
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-sm font-black">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        {getIcon(a.name, 24)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-slate-800 text-sm capitalize">{a.name}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black">{a.duration} min</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {parseDbDate(a.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        {a.notes && (
                          <p className="text-xs text-slate-500 italic mt-1 leading-snug line-clamp-2">"{a.notes}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => { setEditingId(a.id); setEditName(a.name); setEditDuration(String(a.duration)); setEditNotes(a.notes || ''); }}
                          className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(a.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
          </>
        )}
      </div>
    </PremiumLayout>
  );
}

export default function PhysicalActivityLogPage() {
  return (
    <I18nextProvider i18n={i18n}>
      <PhysicalActivityLogInner />
    </I18nextProvider>
  );
}
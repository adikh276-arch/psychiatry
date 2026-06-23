'use client';

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { withLang } from "@/lib/navigation";
import { useSound } from "@/lib/hooks/useSound";
import {
  ChevronLeft,
  Brain,
  Pill,
  Zap,
  Focus,
  Layers,
  Moon,
  Microscope,
  MessageSquare,
  AlertTriangle,
  Activity,
  ShieldAlert,
  Heart,
  Play,
  Newspaper,
  Lightbulb,
  BookMarked,
  HelpCircle,
  ArrowRight,
  Wind,
  Star,
  Sparkles,
  ClipboardList,
  CalendarClock,
  HeartPulse,
  ScanLine,
  Target,
  Mail,
  Compass,
  RefreshCw,
  Smile,
  Anchor,
} from "lucide-react";

interface TopicCard {
  id: string;
  icon: any;
  label: string;
  tagline: string;
  bgColor: string;
  iconColor: string;
}

const toolCards = [
  { id: "symptom-check-in",    icon: ScanLine,      label: "SYMPTOM CHECK-IN",   bgClass: "from-[#06b6d4] to-[#0891b2]", url: "/symptom-check-in" },
  { id: "medication-log",      icon: Pill,           label: "MEDICATION LOG",     bgClass: "from-[#fbbf24] to-[#f59e0b]", url: "/medication-log" },
  { id: "appointment-prep",    icon: CalendarClock,  label: "APPOINTMENT PREP",   bgClass: "from-[#f472b6] to-[#db2777]", url: "/appointment-prep" },
  { id: "vibe-tracker",        icon: HeartPulse,     label: "MOOD TRACKER",       bgClass: "from-[#38bdf8] to-[#0284c7]", url: "/vibe-tracker" },
  { id: "sleep-audit",         icon: Moon,           label: "SLEEP AUDIT",        bgClass: "from-[#34d399] to-[#059669]", url: "/sleep-audit" },
  { id: "crisis-plan",         icon: ShieldAlert,    label: "CRISIS PLAN",        bgClass: "from-[#fdba74] to-[#ea580c]", url: "/crisis-plan" },
];

const topicCards: TopicCard[] = [
  { id: "understanding-diagnosis",  icon: Brain,           label: "Understanding My Diagnosis",    tagline: "Decode what you've been told",             bgColor: "#EDE9FE", iconColor: "#7C3AED" },
  { id: "medication-treatment",     icon: Pill,            label: "Medication & Treatment",        tagline: "Be an informed partner in your care",      bgColor: "#E0F2FE", iconColor: "#0284C7" },
  { id: "mood-cycling-bipolar",     icon: Zap,             label: "Mood Cycling & Bipolar",        tagline: "Understand and chart your cycles",         bgColor: "#FFF7ED", iconColor: "#EA580C" },
  { id: "adhd-wired-brain",         icon: Brain,           label: "ADHD & the Wired Brain",        tagline: "Neuroscience of executive function",        bgColor: "#F0FDF4", iconColor: "#16A34A" },
  { id: "living-with-psychosis",    icon: Layers,          label: "Living with Psychosis",         tagline: "Grounding when reality feels unstable",    bgColor: "#F0F9FF", iconColor: "#0EA5E9" },
  { id: "sleep-clinical-marker",    icon: Moon,            label: "Sleep as a Clinical Marker",    tagline: "Sleep is a vital psychiatric sign",        bgColor: "#F5F3FF", iconColor: "#7C3AED" },
  { id: "biology-mental-health",    icon: Microscope,      label: "Biology of Your Mental Health", tagline: "Neurotransmitters & brain science",        bgColor: "#FFF1F2", iconColor: "#E11D48" },
  { id: "talking-to-psychiatrist",  icon: MessageSquare,   label: "Talking to Your Psychiatrist",  tagline: "Get the most from 15 minutes",             bgColor: "#ECFDF5", iconColor: "#059669" },
  { id: "managing-side-effects",    icon: Activity,        label: "Managing Side Effects",         tagline: "Work with side effects, not against them", bgColor: "#FFF7ED", iconColor: "#EA580C" },
  { id: "psychiatric-stability",    icon: Anchor,          label: "Building Psychiatric Stability", tagline: "Stability is a daily practice",           bgColor: "#EFF6FF", iconColor: "#2563EB" },
  { id: "crisis-safety-planning",   icon: AlertTriangle,   label: "Crisis & Safety Planning",      tagline: "Being prepared is the bravest thing",     bgColor: "#FFF1F2", iconColor: "#DC2626" },
  { id: "stigma-identity",          icon: Sparkles,        label: "Stigma, Identity & Living Well", tagline: "You are more than your diagnosis",       bgColor: "#FDF4FF", iconColor: "#A855F7" },
];

const topicDetails: Record<string, {
  desc: string;
  exercises: { title: string; icon: any; url: string; action?: string }[];
  todos: { title: string; icon: any; url: string }[];
  resources: { title: string; count: number; icon: any; url: string }[];
}> = {
  "understanding-diagnosis": {
    desc: "A psychiatric diagnosis can feel overwhelming. This space helps you understand what it means, how it was determined, and how to make sense of it on your own terms.",
    exercises: [
      { title: "Diagnosis Myths & Facts",    icon: HelpCircle, url: "/medication-myths-facts" },
      { title: "Diffusion Technique",        icon: RefreshCw,  url: "/diffusion-technique" },
      { title: "Box Breathing",              icon: Wind,       url: "/box-breathing" },
      { title: "A Letter to Self",           icon: Mail,       url: "/a-letter-to-self" },
    ],
    todos: [
      { title: "Appointment Prep",   icon: CalendarClock, url: "/appointment-prep" },
      { title: "Symptom Check-In",   icon: ScanLine,      url: "/symptom-check-in" },
      { title: "Mood Tracker",       icon: HeartPulse,    url: "/vibe-tracker" },
      { title: "Know Your Values",   icon: Target,        url: "/know-your-values" },
    ],
    resources: [
      { title: "Articles", count: 22, icon: Newspaper,  url: "/resources/understanding-diagnosis/articles" },
      { title: "Tips",     count: 15, icon: Lightbulb,  url: "/resources/understanding-diagnosis/tips" },
      { title: "Stories",  count: 12, icon: BookMarked, url: "/resources/understanding-diagnosis/stories" },
      { title: "Myths",    count: 10, icon: HelpCircle, url: "/resources/understanding-diagnosis/myths" },
    ],
  },
  "medication-treatment": {
    desc: "Understanding your medication isn't just a doctor's job. The more you know about how it works, what to expect, and how to communicate, the better your outcomes.",
    exercises: [
      { title: "Side Effect Logger",   icon: Activity,   url: "/side-effect-logger" },
      { title: "Medication Myths",     icon: HelpCircle, url: "/medication-myths-facts" },
      { title: "Box Breathing",        icon: Wind,       url: "/box-breathing" },
      { title: "Brain Dump & Sort",    icon: Brain,      url: "/brain-dump-and-sort" },
    ],
    todos: [
      { title: "Medication Log",     icon: Pill,          url: "/medication-log" },
      { title: "Appointment Prep",   icon: CalendarClock, url: "/appointment-prep" },
      { title: "Symptom Check-In",   icon: ScanLine,      url: "/symptom-check-in" },
      { title: "Sleep Audit",        icon: Moon,          url: "/sleep-audit" },
    ],
    resources: [
      { title: "Articles", count: 28, icon: Newspaper,  url: "/resources/medication-treatment/articles" },
      { title: "Tips",     count: 20, icon: Lightbulb,  url: "/resources/medication-treatment/tips" },
      { title: "Stories",  count: 14, icon: BookMarked, url: "/resources/medication-treatment/stories" },
      { title: "Myths",    count: 12, icon: HelpCircle, url: "/resources/medication-treatment/myths" },
    ],
  },
  "mood-cycling-bipolar": {
    desc: "Bipolar disorder isn't just 'mood swings'. Understanding the full cycle — highs, lows, mixed states, and the spaces between — is the foundation of managing it well.",
    exercises: [
      { title: "Mood Tracker",       icon: HeartPulse, url: "/vibe-tracker" },
      { title: "Energy Tracker",     icon: Zap,        url: "/energy-tracker" },
      { title: "Box Breathing",      icon: Wind,       url: "/box-breathing" },
      { title: "Symptom Check-In",   icon: ScanLine,   url: "/symptom-check-in" },
    ],
    todos: [
      { title: "Medication Log",     icon: Pill,          url: "/medication-log" },
      { title: "Sleep Audit",        icon: Moon,          url: "/sleep-audit" },
      { title: "Appointment Prep",   icon: CalendarClock, url: "/appointment-prep" },
      { title: "Care Tracker",       icon: Heart,         url: "/care-tracker" },
    ],
    resources: [
      { title: "Articles", count: 24, icon: Newspaper,  url: "/resources/mood-cycling-bipolar/articles" },
      { title: "Tips",     count: 18, icon: Lightbulb,  url: "/resources/mood-cycling-bipolar/tips" },
      { title: "Stories",  count: 14, icon: BookMarked, url: "/resources/mood-cycling-bipolar/stories" },
      { title: "Myths",    count: 10, icon: HelpCircle, url: "/resources/mood-cycling-bipolar/myths" },
    ],
  },
  "adhd-wired-brain": {
    desc: "ADHD isn't a discipline problem. It's a different wiring. Understanding how your brain processes focus, emotion, and time changes everything.",
    exercises: [
      { title: "Brain Dump & Sort",        icon: Brain,    url: "/brain-dump-and-sort" },
      { title: "Environment Optimisation", icon: Sparkles, url: "/environment-optimization" },
      { title: "Diffusion Technique",      icon: RefreshCw,url: "/diffusion-technique" },
      { title: "Symptom Check-In",         icon: ScanLine, url: "/symptom-check-in" },
    ],
    todos: [
      { title: "What Are My Habits?",  icon: ClipboardList, url: "/what-are-your-habits" },
      { title: "Energy Tracker",       icon: Zap,           url: "/energy-tracker" },
      { title: "Physical Activity Log",icon: Activity,      url: "/physical-activity-log" },
      { title: "Medication Log",       icon: Pill,          url: "/medication-log" },
    ],
    resources: [
      { title: "Articles", count: 22, icon: Newspaper,  url: "/resources/adhd-wired-brain/articles" },
      { title: "Tips",     count: 18, icon: Lightbulb,  url: "/resources/adhd-wired-brain/tips" },
      { title: "Stories",  count: 12, icon: BookMarked, url: "/resources/adhd-wired-brain/stories" },
      { title: "Myths",    count: 10, icon: HelpCircle, url: "/resources/adhd-wired-brain/myths" },
    ],
  },
  "living-with-psychosis": {
    desc: "When reality feels unstable, grounding yourself is the most powerful skill you have. This space offers compassionate, practical tools for the schizophrenia spectrum.",
    exercises: [
      { title: "5-4-3-2-1 Grounding",  icon: Compass,   url: "/5_4_3_2_1_grounding" },
      { title: "Safe Space Canvas",     icon: Sparkles,  url: "/safe-space" },
      { title: "Box Breathing",         icon: Wind,      url: "/box-breathing" },
      { title: "Diffusion Technique",   icon: RefreshCw, url: "/diffusion-technique" },
    ],
    todos: [
      { title: "Medication Log",     icon: Pill,          url: "/medication-log" },
      { title: "Care Tracker",       icon: Heart,         url: "/care-tracker" },
      { title: "Symptom Check-In",   icon: ScanLine,      url: "/symptom-check-in" },
      { title: "Crisis Plan",        icon: ShieldAlert,   url: "/crisis-plan" },
    ],
    resources: [
      { title: "Articles", count: 20, icon: Newspaper,  url: "/resources/living-with-psychosis/articles" },
      { title: "Tips",     count: 14, icon: Lightbulb,  url: "/resources/living-with-psychosis/tips" },
      { title: "Stories",  count: 10, icon: BookMarked, url: "/resources/living-with-psychosis/stories" },
      { title: "Myths",    count: 8,  icon: HelpCircle, url: "/resources/living-with-psychosis/myths" },
    ],
  },
  "sleep-clinical-marker": {
    desc: "In psychiatry, sleep isn't just rest — it's a diagnostic signal. Disrupted sleep triggers episodes, signals relapse, and responds to treatment before mood does.",
    exercises: [
      { title: "Sleep Audit",         icon: Moon,  url: "/sleep-audit" },
      { title: "Sleep Window Planner",icon: CalendarClock, url: "/sleep-window-planner" },
      { title: "4-6-8 Breathing",     icon: Wind,  url: "/4_6_8_breathing" },
      { title: "Symptom Check-In",    icon: ScanLine, url: "/symptom-check-in" },
    ],
    todos: [
      { title: "Sleep Cycle Guide",   icon: Moon,          url: "/sleep-cycle-guide" },
      { title: "Medication Log",      icon: Pill,          url: "/medication-log" },
      { title: "Energy Tracker",      icon: Zap,           url: "/energy-tracker" },
      { title: "Appointment Prep",    icon: CalendarClock, url: "/appointment-prep" },
    ],
    resources: [
      { title: "Articles", count: 20, icon: Newspaper,  url: "/resources/sleep-clinical-marker/articles" },
      { title: "Tips",     count: 15, icon: Lightbulb,  url: "/resources/sleep-clinical-marker/tips" },
      { title: "Stories",  count: 10, icon: BookMarked, url: "/resources/sleep-clinical-marker/stories" },
      { title: "Myths",    count: 8,  icon: HelpCircle, url: "/resources/sleep-clinical-marker/myths" },
    ],
  },
  "biology-mental-health": {
    desc: "Understanding what's happening in your brain makes you a better partner in your own care. This topic demystifies neurotransmitters, circuits, and the real science behind your condition.",
    exercises: [
      { title: "Box Breathing",        icon: Wind,     url: "/box-breathing" },
      { title: "Physical Activity Log",icon: Activity, url: "/physical-activity-log" },
      { title: "Gratitude Tracker",    icon: Star,     url: "/gratitude-tracker" },
      { title: "Diffusion Technique",  icon: RefreshCw,url: "/diffusion-technique" },
    ],
    todos: [
      { title: "Symptom Check-In",   icon: ScanLine,      url: "/symptom-check-in" },
      { title: "Sleep Audit",        icon: Moon,          url: "/sleep-audit" },
      { title: "Mood Tracker",       icon: HeartPulse,    url: "/vibe-tracker" },
      { title: "Medication Log",     icon: Pill,          url: "/medication-log" },
    ],
    resources: [
      { title: "Articles", count: 26, icon: Newspaper,  url: "/resources/biology-mental-health/articles" },
      { title: "Tips",     count: 16, icon: Lightbulb,  url: "/resources/biology-mental-health/tips" },
      { title: "Stories",  count: 8,  icon: BookMarked, url: "/resources/biology-mental-health/stories" },
      { title: "Myths",    count: 14, icon: HelpCircle, url: "/resources/biology-mental-health/myths" },
    ],
  },
  "talking-to-psychiatrist": {
    desc: "Med checks are often 15 minutes. Knowing what to say — and how to say it — determines whether you leave with the right support or the same prescription you've had for years.",
    exercises: [
      { title: "Appointment Prep",   icon: CalendarClock, url: "/appointment-prep" },
      { title: "Brain Dump & Sort",  icon: Brain,         url: "/brain-dump-and-sort" },
      { title: "A Letter to Self",   icon: Mail,          url: "/a-letter-to-self" },
      { title: "Box Breathing",      icon: Wind,          url: "/box-breathing" },
    ],
    todos: [
      { title: "Symptom Check-In",   icon: ScanLine,   url: "/symptom-check-in" },
      { title: "Medication Log",     icon: Pill,        url: "/medication-log" },
      { title: "Mood Tracker",       icon: HeartPulse, url: "/vibe-tracker" },
      { title: "Side Effect Logger", icon: Activity,   url: "/side-effect-logger" },
    ],
    resources: [
      { title: "Articles", count: 20, icon: Newspaper,  url: "/resources/talking-to-psychiatrist/articles" },
      { title: "Tips",     count: 18, icon: Lightbulb,  url: "/resources/talking-to-psychiatrist/tips" },
      { title: "Stories",  count: 12, icon: BookMarked, url: "/resources/talking-to-psychiatrist/stories" },
      { title: "Myths",    count: 6,  icon: HelpCircle, url: "/resources/talking-to-psychiatrist/myths" },
    ],
  },
  "managing-side-effects": {
    desc: "Side effects are real, common, and manageable. This topic gives you the tools to track them, understand them, and advocate for yourself without abandoning treatment.",
    exercises: [
      { title: "Side Effect Logger",   icon: Activity,  url: "/side-effect-logger" },
      { title: "Physical Activity Log",icon: Activity,  url: "/physical-activity-log" },
      { title: "Energy Tracker",       icon: Zap,       url: "/energy-tracker" },
      { title: "Symptom Check-In",     icon: ScanLine,  url: "/symptom-check-in" },
    ],
    todos: [
      { title: "Medication Log",     icon: Pill,          url: "/medication-log" },
      { title: "Appointment Prep",   icon: CalendarClock, url: "/appointment-prep" },
      { title: "Sleep Audit",        icon: Moon,          url: "/sleep-audit" },
      { title: "Care Tracker",       icon: Heart,         url: "/care-tracker" },
    ],
    resources: [
      { title: "Articles", count: 24, icon: Newspaper,  url: "/resources/managing-side-effects/articles" },
      { title: "Tips",     count: 20, icon: Lightbulb,  url: "/resources/managing-side-effects/tips" },
      { title: "Stories",  count: 14, icon: BookMarked, url: "/resources/managing-side-effects/stories" },
      { title: "Myths",    count: 8,  icon: HelpCircle, url: "/resources/managing-side-effects/myths" },
    ],
  },
  "psychiatric-stability": {
    desc: "Stability isn't luck — it's a practice. Consistent sleep, medication, monitoring, and early warning recognition are the pillars that keep severe episodes at bay.",
    exercises: [
      { title: "Mood Tracker",       icon: HeartPulse, url: "/vibe-tracker" },
      { title: "Care Tracker",       icon: Heart,      url: "/care-tracker" },
      { title: "Energy Tracker",     icon: Zap,        url: "/energy-tracker" },
      { title: "Crisis Plan",        icon: ShieldAlert,url: "/crisis-plan" },
    ],
    todos: [
      { title: "Medication Log",    icon: Pill,          url: "/medication-log" },
      { title: "Sleep Audit",       icon: Moon,          url: "/sleep-audit" },
      { title: "What Are My Habits?",icon: ClipboardList, url: "/what-are-your-habits" },
      { title: "Physical Activity", icon: Activity,      url: "/physical-activity-log" },
    ],
    resources: [
      { title: "Articles", count: 22, icon: Newspaper,  url: "/resources/psychiatric-stability/articles" },
      { title: "Tips",     count: 18, icon: Lightbulb,  url: "/resources/psychiatric-stability/tips" },
      { title: "Stories",  count: 12, icon: BookMarked, url: "/resources/psychiatric-stability/stories" },
      { title: "Myths",    count: 8,  icon: HelpCircle, url: "/resources/psychiatric-stability/myths" },
    ],
  },
  "crisis-safety-planning": {
    desc: "Having a safety plan isn't pessimistic — it's one of the most powerful things you can do. Know your warning signs before they escalate.",
    exercises: [
      { title: "Crisis Plan",          icon: ShieldAlert, url: "/crisis-plan" },
      { title: "5-4-3-2-1 Grounding", icon: Compass,     url: "/5_4_3_2_1_grounding" },
      { title: "Box Breathing",        icon: Wind,        url: "/box-breathing" },
      { title: "Safe Space Canvas",    icon: Sparkles,    url: "/safe-space" },
    ],
    todos: [
      { title: "Appointment Prep",   icon: CalendarClock, url: "/appointment-prep" },
      { title: "Care Tracker",       icon: Heart,         url: "/care-tracker" },
      { title: "Mood Tracker",       icon: HeartPulse,    url: "/vibe-tracker" },
      { title: "Symptom Check-In",   icon: ScanLine,      url: "/symptom-check-in" },
    ],
    resources: [
      { title: "Articles",  count: 18, icon: Newspaper,  url: "/resources/crisis-safety-planning/articles" },
      { title: "Tips",      count: 14, icon: Lightbulb,  url: "/resources/crisis-safety-planning/tips" },
      { title: "Hotlines",  count: 8,  icon: BookMarked, url: "/resources/crisis-safety-planning/stories" },
      { title: "Myths",     count: 6,  icon: HelpCircle, url: "/resources/crisis-safety-planning/myths" },
    ],
  },
  "stigma-identity": {
    desc: "A diagnosis doesn't define you. This topic is about navigating stigma, deciding who to tell, finding community, and building an identity that holds your whole self.",
    exercises: [
      { title: "A Letter to Self",   icon: Mail,      url: "/a-letter-to-self" },
      { title: "Affirmations",       icon: Smile,     url: "/affirmations" },
      { title: "Know Your Values",   icon: Target,    url: "/know-your-values" },
      { title: "Diffusion Technique",icon: RefreshCw, url: "/diffusion-technique" },
    ],
    todos: [
      { title: "Gratitude Tracker",        icon: Star,       url: "/gratitude-tracker" },
      { title: "Personal Mission Statement",icon: Compass,   url: "/personal-mission-statement" },
      { title: "Mood Tracker",             icon: HeartPulse, url: "/vibe-tracker" },
      { title: "Care Tracker",             icon: Heart,      url: "/care-tracker" },
    ],
    resources: [
      { title: "Articles", count: 20, icon: Newspaper,  url: "/resources/stigma-identity/articles" },
      { title: "Tips",     count: 12, icon: Lightbulb,  url: "/resources/stigma-identity/tips" },
      { title: "Stories",  count: 18, icon: BookMarked, url: "/resources/stigma-identity/stories" },
      { title: "Myths",    count: 10, icon: HelpCircle, url: "/resources/stigma-identity/myths" },
    ],
  },
};

function PsychHubInner({ topicId }: { topicId?: string }) {
  const router = useRouter();
  const { playPop } = useSound();
  const selectedTopic = topicId || null;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex min-h-screen bg-[#F6F7F9]">
      <div className="flex-1 flex flex-col min-w-0">
        <main className="max-w-4xl w-full mx-auto px-4 md:px-6 py-6 pt-10">
          <AnimatePresence mode="wait">
            {selectedTopic ? (() => {
              const topic = topicCards.find(t => t.id === selectedTopic) || topicCards[0];
              const detail = topicDetails[selectedTopic] || {
                desc: "",
                exercises: [],
                todos: [],
                resources: []
              };
              return (
                <motion.div
                  key="topic-detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <button
                    onClick={() => router.replace(withLang('/'))}
                    className="flex items-center gap-2 text-[#64748B] hover:text-[#020817] transition-colors group mb-4"
                  >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to topics</span>
                  </button>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: topic.bgColor }}>
                        <topic.icon size={24} style={{ color: topic.iconColor }} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Psychiatry Self-Care</p>
                        <h1 className="text-2xl font-bold text-[#020817]">{topic.label}</h1>
                      </div>
                    </div>
                    <p className="text-base text-[#64748B] leading-relaxed max-w-2xl pl-1">{detail.desc}</p>
                  </div>

                  {/* Guided Series */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-[#020817]">Guided Series</h2>
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        playPop();
                        router.push(withLang(`/guided-series/${selectedTopic}`));
                      }}
                      className="w-full bg-[#F5FBFF] border-2 border-[#E0F2FE] rounded-2xl p-6 flex items-center justify-between hover:border-primary hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                          <Play size={20} className="text-white fill-current" />
                        </div>
                        <div className="text-left">
                          <span className="block font-bold text-[#020817]">Start Guided Series</span>
                          <span className="text-xs text-[#64748B]">A step-by-step clinical self-care journey</span>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-[#64748B] group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>

                  {/* Exercises */}
                  {detail.exercises.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-[#020817]">Exercises</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {detail.exercises.map((ex, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ y: -4 }}
                            onClick={() => {
                              playPop();
                              ex.url?.startsWith('http') ? (window.location.href = withLang(ex.url)) : router.push(withLang(ex.url));
                            }}
                            className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-left space-y-3"
                          >
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                              <ex.icon size={20} />
                            </div>
                            <p className="text-sm font-bold text-slate-800 leading-tight">{ex.title}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* To Do's */}
                  {detail.todos.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-[#020817]">To Do's</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {detail.todos.map((todo, i) => {
                          const colors = [
                            { accent: '#7C3AED', bg: '#F5F3FF', iconBg: '#EDE9FE' },
                            { accent: '#0284C7', bg: '#EFF6FF', iconBg: '#DBEAFE' },
                            { accent: '#059669', bg: '#F0FDF4', iconBg: '#D1FAE5' },
                            { accent: '#EA580C', bg: '#FFF7ED', iconBg: '#FFEDD5' },
                          ];
                          const color = colors[i % colors.length];
                          return (
                            <motion.button
                              key={i}
                              whileHover={{ x: 4, scale: 1.02 }}
                              onClick={() => {
                                playPop();
                                todo.url?.startsWith('http') ? (window.location.href = withLang(todo.url)) : router.push(withLang(todo.url));
                              }}
                              className="p-5 rounded-2xl flex items-center gap-5 transition-all border border-slate-100/50 shadow-sm hover:shadow-xl group"
                              style={{ backgroundColor: color.bg }}
                            >
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-inner" style={{ backgroundColor: color.iconBg }}>
                                <todo.icon size={24} style={{ color: color.accent }} />
                              </div>
                              <div className="flex-1 text-left">
                                <span className="font-bold text-slate-800 text-base group-hover:text-primary transition-colors">{todo.title}</span>
                              </div>
                              <ArrowRight size={18} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {detail.resources.length > 0 && (
                    <div className="space-y-6 pt-4">
                      <h2 className="text-xl font-bold text-[#020817]">Resources</h2>
                      <div className="space-y-3">
                        {detail.resources.map((res, i) => {
                          const ResIcon = res.icon;
                          const colors = [
                            { accent: '#7C3AED', bg: '#F5F3FF', bar: '#DDD6FE', iconBg: '#EDE9FE' },
                            { accent: '#0284C7', bg: '#EFF6FF', bar: '#BFDBFE', iconBg: '#DBEAFE' },
                            { accent: '#A855F7', bg: '#FAF5FF', bar: '#E9D5FF', iconBg: '#F3E8FF' },
                            { accent: '#059669', bg: '#F0FDF4', bar: '#A7F3D0', iconBg: '#D1FAE5' },
                          ];
                          const color = colors[i % colors.length];
                          return (
                            <motion.button
                              key={i}
                              whileHover={{ x: 8, scale: 1.01 }}
                              onClick={() => {
                                playPop();
                                router.push(withLang(res.url));
                              }}
                              className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all group relative overflow-hidden text-left"
                              style={{ backgroundColor: color.bg }}
                            >
                              <div className="absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 transition-all" style={{ backgroundColor: color.accent }}></div>
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform relative z-10" style={{ backgroundColor: color.iconBg }}>
                                <ResIcon size={22} style={{ color: color.accent }} />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-[#020817] mb-0.5 leading-tight">{res.title}</h3>
                                <div className="flex items-center gap-2">
                                  <div className="h-1 w-12 rounded-full group-hover:w-16 transition-all" style={{ backgroundColor: color.bar }}></div>
                                  <span className="text-xs text-[#64748B] opacity-0 group-hover:opacity-100 transition-opacity">View resource</span>
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-all" style={{ backgroundColor: color.iconBg }}>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" style={{ color: color.accent }} />
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })() : (
              <motion.div
                key="main-hub"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-10 py-6"
              >
                {/* Header */}
                <div className="space-y-1 mb-10">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        import('@/lib/navigation').then((mod) => {
                          mod.handlePlatformExit();
                        });
                      }}
                      className="text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <div className="w-12 h-12 bg-[#E0F2FE] rounded-[1rem] flex items-center justify-center shadow-sm">
                      <Sparkles size={24} className="text-[#0284C7]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#0B192C] tracking-tight">Self-Care Resources</h1>
                  </div>
                  <p className="text-slate-500 font-medium ml-[4.5rem]">Explore tools and guidance for your mental wellness journey</p>
                </div>

                {/* Quick-Access Tools */}
                <div className="space-y-5">
                  <h2 className="text-[22px] font-bold text-[#0B192C]">Tools</h2>
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 md:grid-cols-6 gap-4"
                  >
                    {toolCards.map((tool) => (
                      <motion.button
                        key={tool.id}
                        variants={item}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          playPop();
                          router.push(withLang(tool.url));
                        }}
                        className={`aspect-square p-5 rounded-[1.5rem] flex flex-col justify-between shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all relative overflow-hidden group bg-gradient-to-br ${tool.bgClass}`}
                      >
                        <tool.icon size={32} className="relative z-10 text-white" strokeWidth={1.5} />
                        <span className="text-[11px] font-black tracking-widest text-left leading-snug relative z-10 text-white uppercase w-[85%]">{tool.label}</span>
                        <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-110 group-hover:opacity-30 transition-all duration-500 text-white">
                          <tool.icon size={110} strokeWidth={1} />
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                </div>

                {/* Topics */}
                <div className="space-y-5">
                  <h2 className="text-[22px] font-bold text-[#0B192C]">Topics</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {topicCards.map((topic) => (
                      <motion.button
                        key={topic.id}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          playPop();
                          router.replace(withLang(`/topics/${topic.id}`));
                        }}
                        className="p-8 bg-white rounded-3xl flex flex-col items-center justify-center gap-5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] border-transparent text-center group"
                      >
                        <div className="w-[4.5rem] h-[4.5rem] rounded-[1.25rem] flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: topic.bgColor }}>
                          <topic.icon size={32} strokeWidth={1.5} style={{ color: topic.iconColor }} />
                        </div>
                        <div>
                          <span className="font-bold text-[#0B192C] text-[15px] leading-tight block">{topic.label}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export function PsychHub(props: { topicId?: string }) {
  return <PsychHubInner {...props} />;
}

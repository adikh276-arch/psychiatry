'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Copy, Check, Share2, Link2,
  Sparkles, Heart, CheckCircle2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ── Platform SVG icons ──────────────────────────────────────────────────────
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// ── Share options config ────────────────────────────────────────────────────
interface ShareOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  bg: string;
  iconColor: string;
  action: (text: string, url: string) => void;
}

// ── Props ───────────────────────────────────────────────────────────────────
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityName: string;
  /** Optional custom message for this specific activity. Falls back to generic. */
  shareContent?: string;
  /** Optional emoji or icon to show in the preview card. */
  emoji?: React.ReactNode;
}

const APP_ANDROID = 'https://play.google.com/store/apps/details?id=org.mantracare.therapy';
const APP_IOS = 'https://apps.apple.com/pk/app/therapymantra/id1607643888';

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  activityName,
  shareContent,
  emoji,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    setHasNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  // Build the share message
  const defaultMessage = t('common.share_text', {
    defaultValue:
      `I just completed "${activityName}" on TherapyMantra — a guided mental wellness activity that's genuinely helped me. Try it yourself! \n\n Android: ${APP_ANDROID}\n iOS: ${APP_IOS}`,
    activityName,
    androidUrl: APP_ANDROID,
    iosUrl: APP_IOS,
  });
  const shareText = shareContent || defaultMessage;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback for non-https / old browsers
      const el = document.createElement('textarea');
      el.value = shareText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: `TherapyMantra — ${activityName}`, text: shareText });
    } catch { /* user cancelled */ }
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <WhatsAppIcon />,
      bg: '#dcfce7',
      iconColor: '#16a34a',
      action: (text) => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'),
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: <TelegramIcon />,
      bg: '#e0f2fe',
      iconColor: '#0284c7',
      action: (text, url) =>
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank'),
    },
    {
      id: 'twitter',
      label: 'X / Twitter',
      icon: <TwitterXIcon />,
      bg: '#f1f5f9',
      iconColor: '#0f172a',
      action: (text) =>
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank'),
    },
    {
      id: 'link',
      label: 'Copy Link',
      icon: <Link2 size={20} />,
      bg: '#faf5ff',
      iconColor: '#7c3aed',
      action: handleCopy,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.9 }}
            className="fixed bottom-0 left-0 right-0 z-[201] pointer-events-auto"
            style={{ maxWidth: '560px', margin: '0 auto' }}
          >
            <div
              className="rounded-t-[2rem] overflow-hidden"
              style={{
                background: '#ffffff',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.12), 0 -1px 0 rgba(0,0,0,0.04)',
              }}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-slate-200" />
              </div>

              <div className="px-6 pb-10 pt-2 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)' }}
                    >
                      <Share2 size={20} className="text-sky-600" />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-bold text-slate-900" style={{ letterSpacing: '-0.02em' }}>
                        {t('common.share_progress', 'Share Progress')}
                      </h3>
                      <p className="text-[12px] text-slate-400 font-medium">
                        {t('common.inspire_others', 'Inspire someone today')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Activity achievement card preview */}
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.08, duration: 0.3 }}
                  className="relative rounded-2xl overflow-hidden p-5"
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #075985 100%)',
                  }}
                >
                  {/* Subtle pattern dots */}
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />
                  {/* Glow orb */}
                  <div
                    className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }}
                  />

                  <div className="relative flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-[28px] text-white flex-shrink-0 drop-shadow-sm [&>svg]:!w-7 [&>svg]:!h-7 [&>svg]:!stroke-white [&>svg]:!stroke-[1.5]"
                      style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
                    >
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles size={11} className="text-sky-200" />
                        <span className="text-[10px] font-bold text-sky-200 uppercase tracking-widest">
                          {t('common.completed', 'Completed')}
                        </span>
                      </div>
                      <p className="text-white font-bold text-[15px] leading-snug truncate" style={{ letterSpacing: '-0.015em' }}>
                        {activityName}
                      </p>
                      <p className="text-sky-200 text-[11px] font-medium mt-0.5">
                        TherapyMantra · Mental Wellness
                      </p>
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.2)' }}
                    >
                      <Heart size={14} className="text-white fill-white" />
                    </div>
                  </div>
                </motion.div>

                {/* Share platform grid */}
                <div className="grid grid-cols-4 gap-3">
                  {shareOptions.map((opt, i) => (
                    <motion.button
                      key={opt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.05 }}
                      onClick={() => opt.action(shareText, APP_ANDROID)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-active:scale-95 shadow-sm"
                        style={{ background: opt.bg, color: opt.iconColor }}
                      >
                        {opt.icon}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 text-center leading-tight">
                        {opt.label}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* CTA buttons */}
                <div className="space-y-2.5">
                  {/* Native share if available, otherwise copy */}
                  {hasNativeShare ? (
                    <button
                      onClick={handleNativeShare}
                      className="w-full h-[54px] rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2.5 relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 60%, #0284c7 100%)',
                        boxShadow: '0 4px 18px -3px rgba(14,165,233,0.38)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3 }}
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.2) 50%, transparent 80%)' }}
                      />
                      <Share2 size={18} className="relative z-10" />
                      <span className="relative z-10">{t('common.share_now', 'Share Now')}</span>
                    </button>
                  ) : null}

                  {/* Copy message */}
                  <motion.button
                    onClick={handleCopy}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-[50px] rounded-2xl flex items-center justify-center gap-2.5 font-semibold text-[15px] transition-all duration-200"
                    style={{
                      background: copied ? '#dcfce7' : '#f8fafc',
                      color: copied ? '#16a34a' : '#475569',
                      border: `1.5px solid ${copied ? '#bbf7d0' : '#e2e8f0'}`,
                      boxShadow: copied ? '0 0 0 4px rgba(134,239,172,0.2)' : '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.span
                          key="check"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          className="flex items-center gap-2"
                        >
                          <Check size={17} strokeWidth={2.5} />
                          {t('common.copied', 'Copied to clipboard!')}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          className="flex items-center gap-2"
                        >
                          <Copy size={16} strokeWidth={2} />
                          {t('common.copy_message', 'Copy Message')}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;

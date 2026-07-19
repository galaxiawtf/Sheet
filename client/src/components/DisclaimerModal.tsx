import { useState, useEffect, type ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Copy } from "lucide-react";

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional label + handler for the primary CTA (defaults to "Continue to docs" → onClose). */
  ctaLabel?: string;
  onContinue?: () => void;
}

/* ------------------------------------------------------------------ *
 * Real brand logos (inline SVG, official glyph paths)                 *
 * ------------------------------------------------------------------ */
function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function TelegramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.36 11.9c-.95-.29-.96-.94.2-1.39l17.05-6.57c.79-.36 1.53.19 1.23 1.4l-2.9 13.66c-.2.98-.79 1.22-1.6.76l-4.42-3.26-2.13 2.06c-.24.24-.44.44-.9.44z" />
    </svg>
  );
}
function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.42l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.41z" />
    </svg>
  );
}
function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.03 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8v8.44C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

type Social = {
  name: string;
  handle: string;
  link: string;
  accent: string;
  bg: string;
  icon: (p: { className?: string }) => ReactElement;
};

const SOCIALS: Social[] = [
  {
    name: "Instagram",
    handle: "@Elihateslies",
    link: "https://instagram.com/Elihateslies",
    accent: "#d62976",
    bg: "linear-gradient(45deg, #feda75 0%, #fa7e1e 25%, #d62976 50%, #962fbf 75%, #4f5bd5 100%)",
    icon: InstagramIcon,
  },
  {
    name: "Telegram",
    handle: "@kishshiii",
    link: "https://t.me/kishshiii",
    accent: "#229ED9",
    bg: "linear-gradient(180deg, #37aee2 0%, #1e96c8 100%)",
    icon: TelegramIcon,
  },
  {
    name: "X",
    handle: "@Demorgavon",
    link: "https://x.com/Demorgavon",
    accent: "#71767b",
    bg: "linear-gradient(180deg, #16181c 0%, #000000 100%)",
    icon: XIcon,
  },
  {
    name: "Facebook",
    handle: "itsurboyelifr",
    link: "https://www.facebook.com/itsurboyelifr",
    accent: "#1877F2",
    bg: "linear-gradient(180deg, #1877F2 0%, #0b5fd0 100%)",
    icon: FacebookIcon,
  },
];

export default function DisclaimerModal({ isOpen, onClose, ctaLabel = "Continue to docs", onContinue }: DisclaimerModalProps) {
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  // Esc-to-close, only while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/70 backdrop-blur-md"
            aria-label="Close"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/60 bg-card text-card-foreground shadow-[0_24px_80px_-12px_rgba(0,0,0,0.35)]"
          >
            {/* Banner image as header band */}
            <div className="relative h-28 overflow-hidden">
              <img src="/banner.gif" alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-card" />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Avatar + title */}
            <div className="px-6 sm:px-7 pb-5 -mt-10 relative">
              <div className="mb-4 flex items-end justify-between">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-secondary shadow-sm">
                  <img src="/profile.jpg" alt="Eli" className="h-full w-full object-cover" />
                </div>
                <span className="rounded-full border border-border/60 bg-secondary/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  v2.0
                </span>
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-1.5">
                About
              </p>
              <h3 className="text-2xl font-semibold tracking-tight mb-1.5">Eli Shh Docs</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Built by Eli (Jm). A minimal reference for web development — docs, live previews, and 5,000+ templates.
              </p>
            </div>

            {/* Connect section */}
            <div className="px-6 sm:px-7 pb-3">
              <div className="mb-3 flex items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  Connect
                </p>
                <div className="h-px flex-1 bg-border/60" />
              </div>
              <ul className="space-y-2">
                {SOCIALS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.name}>
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/20 px-3.5 py-2.5 transition-all duration-200 hover:bg-secondary/50 hover:border-border hover:translate-x-0.5"
                      >
                        {/* Left brand accent bar */}
                        <span
                          className="h-7 w-1 rounded-full transition-all duration-200 group-hover:h-9"
                          style={{ background: s.bg }}
                        />
                        {/* Real brand logo on its brand gradient */}
                        <span
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 group-hover:scale-105"
                          style={{ background: s.bg }}
                        >
                          <Icon className="h-[18px] w-[18px]" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            {s.name}
                          </span>
                          <span
                            className="block truncate text-sm font-semibold"
                            style={{ color: s.accent }}
                          >
                            {s.handle}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCopy(s.handle, i);
                          }}
                          className="flex-shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                          aria-label={`Copy ${s.handle}`}
                        >
                          {copied === i ? (
                            <Check size={14} className="text-emerald-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Footer + CTA */}
            <div className="px-6 sm:px-7 pt-2 pb-6">
              <button
                type="button"
                onClick={onContinue ?? onClose}
                className="group w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-[0.985]"
              >
                {ctaLabel}
              </button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground/80">
                Tip: press <kbd className="rounded border border-border bg-secondary px-1 py-0.5 text-[10px] font-semibold">Esc</kbd> or click outside to close.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

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
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.05-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.38C1.35 2.68.94 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.12.66.66 1.33 1.07 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 002.12-1.38 5.86 5.86 0 001.38-2.12c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 00-1.38-2.12A5.86 5.86 0 0019.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 105.84 12 6.16 6.16 0 0012 5.84zm0 10.16A4 4 0 118 12a4 4 0 014 4zm6.41-10.4a1.44 1.44 0 11-1.44-1.44 1.44 1.44 0 011.44 1.44z" />
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
            {/* Header band with avatar */}
            <div className="relative h-24 overflow-hidden bg-gradient-to-br from-primary/15 via-accent/40 to-primary/10">
              <div
                className="pointer-events-none absolute inset-0 opacity-50 dark:opacity-30"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 25% 30%, color-mix(in oklch, var(--primary) 22%, transparent) 0, transparent 38%), radial-gradient(circle at 78% 60%, color-mix(in oklch, var(--primary) 14%, transparent) 0, transparent 45%)",
                }}
              />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Avatar + title */}
            <div className="px-6 sm:px-7 pb-5 -mt-10 relative">
              <div className="mb-4 flex items-end justify-between">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-secondary shadow-sm">
                  <img src="/logo.jpg" alt="Eli Shh Docs" className="h-full w-full object-cover" />
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

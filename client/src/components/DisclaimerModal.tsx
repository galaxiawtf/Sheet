import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Copy } from "lucide-react";

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOCIALS = [
  { name: "Instagram", handle: "@Elihateslies", link: "https://instagram.com/Elihateslies" },
  { name: "Telegram", handle: "@kishshiii", link: "https://t.me/kishshiii" },
  { name: "X", handle: "@Demorgavon", link: "https://x.com/Demorgavon" },
  { name: "Discord", handle: "@Shinzuke", link: "https://discord.com" },
];

export default function DisclaimerModal({ isOpen, onClose }: DisclaimerModalProps) {
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            aria-label="Close"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>

            <div className="p-6 sm:p-8 relative">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
                About
              </p>
              <h3 className="text-2xl font-semibold tracking-tight mb-3">Eli Shh Docs</h3>
              <p className="text-sm leading-relaxed text-muted-foreground mb-8">
                Built by Eli (Jm). A minimal reference for web development — docs, live previews, and 5,000+ templates.
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Connect
              </p>
              <ul className="space-y-2 mb-8">
                {SOCIALS.map((s, i) => (
                  <li key={s.name} className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3 transition-colors hover:bg-secondary/60 hover:border-accent/40">
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1 text-sm font-medium"
                    >
                      <span className="text-muted-foreground text-xs font-normal w-20 inline-block">{s.name}</span>
                      {s.handle}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(s.handle, i)}
                      className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-background transition-colors"
                    >
                      {copied === i ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

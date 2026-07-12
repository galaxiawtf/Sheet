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
            className="fixed inset-0 bg-black/70"
            aria-label="Close"
          />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-lg border border-border/60 bg-[#111113] text-zinc-100 shadow-xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded p-1 text-zinc-500 hover:text-zinc-200"
            >
              <X size={16} />
            </button>

            <div className="p-6 sm:p-7">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-2">
                About
              </p>
              <h3 className="text-lg font-medium tracking-tight mb-3">Eli Shh Docs</h3>
              <p className="text-sm leading-relaxed text-zinc-400 mb-6">
                Built by Eli (Jm). A minimal reference for web development — docs, live previews, and 5,000+ templates.
              </p>

              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Connect
              </p>
              <ul className="space-y-2 mb-7">
                {SOCIALS.map((s, i) => (
                  <li key={s.name} className="flex items-center justify-between gap-3 rounded-md border border-white/[0.06] px-3 py-2">
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1 text-sm hover:underline"
                    >
                      <span className="text-zinc-500 text-xs mr-2">{s.name}</span>
                      {s.handle}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(s.handle, i)}
                      className="text-zinc-500 hover:text-zinc-200 p-1"
                    >
                      {copied === i ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-md bg-zinc-100 py-2.5 text-sm font-medium text-zinc-950 hover:bg-white transition-colors"
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

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Copy, User, Info, MessageSquare } from "lucide-react";

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DisclaimerModal({ isOpen, onClose }: DisclaimerModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const socials = [
    {
      name: "Facebook",
      username: "Jahn Mark",
      link: "https://facebook.com",
      color: "from-blue-600/20 to-blue-500/5 hover:border-blue-500/40 hover:text-blue-400",
      iconColor: "text-blue-500",
      // Bespoke FB SVG Icon
      svg: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      username: "@Elihateslies",
      link: "https://instagram.com/Elihateslies",
      color: "from-pink-600/20 to-purple-500/5 hover:border-pink-500/40 hover:text-pink-400",
      iconColor: "text-pink-500",
      // Bespoke Instagram SVG Icon
      svg: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    {
      name: "Telegram",
      username: "@kishshiii",
      link: "https://t.me/kishshiii",
      color: "from-sky-500/20 to-sky-400/5 hover:border-sky-400/40 hover:text-sky-400",
      iconColor: "text-sky-400",
      // Bespoke Telegram SVG Icon
      svg: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.6 1.48-1.52 2.73-2.58 4-3.1.66-.26.8-.3.95-.3.32 0 .42.1.42.3z" />
        </svg>
      ),
    },
    {
      name: "X / Twitter",
      username: "@Demorgavon",
      link: "https://x.com/Demorgavon",
      color: "from-neutral-800/80 to-neutral-900/40 hover:border-neutral-500/40 hover:text-white",
      iconColor: "text-foreground",
      // Modern X SVG Icon
      svg: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Discord",
      username: "@Shinzuke",
      link: "https://discord.com",
      color: "from-indigo-600/20 to-indigo-500/5 hover:border-indigo-500/40 hover:text-indigo-400",
      iconColor: "text-indigo-400",
      // Bespoke Discord SVG Icon
      svg: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
        </svg>
      ),
    },
    {
      name: "WeChat",
      username: "JmOhuh",
      link: "#",
      color: "from-emerald-600/20 to-emerald-500/5 hover:border-emerald-500/40 hover:text-emerald-400",
      iconColor: "text-emerald-500",
      // Bespoke WeChat SVG Icon
      svg: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.5 15c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zm4 0c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zm7.36-4.66C21.43 9.4 22 8.01 22 6.5 22 3.46 18.42 1 14 1S6 3.46 6 6.5c0 1.34.45 2.58 1.22 3.59C6.44 11.23 5.04 12 3.5 12c-.28 0-.5.22-.5.5s.22.5.5.5c2.44 0 4.54-1.5 5.59-3.66C10.21 9.8 12.04 10 14 10c2.3 0 4.43-.51 6.13-1.4l1.37.7c.18.09.38.03.48-.13.07-.12.05-.27-.04-.37l-1.08-.96zM14 8c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zm3 0c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zm.5 10c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zm-4 0c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zm5.55-2.88c-.62-.55-1.42-.92-2.31-1.05C16.89 13.9 16.94 13.45 16.94 13c0-3.31-2.91-6-6.5-6s-6.5 2.69-6.5 6c0 1.25.42 2.4 1.13 3.33L4.09 17.2c-.09.1-.11.25-.04.37.08.12.22.18.35.15l1.64-.42c1.02.44 2.18.7 3.42.7.41 0 .8-.03 1.19-.08 1.05 1.5 2.92 2.48 5.06 2.48.28 0 .5-.22.5-.5s-.22-.5-.5-.5c-1.63 0-3.08-1.02-3.77-2.52 1.74-.29 3.25-1.12 4.23-2.32l1.01.51c.17.09.38.03.48-.13.07-.12.05-.27-.04-.37l-.73-.65z" />
        </svg>
      ),
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            className="relative w-full max-w-lg flex flex-col max-h-[90dvh] overflow-hidden rounded-2xl border border-border bg-card/90 shadow-2xl ring-1 ring-black/10 backdrop-blur-xl"
          >
            {/* Elegant Header Accent Line */}
            <div className="flex-shrink-0 h-1.5 w-full bg-gradient-to-r from-accent via-indigo-500 to-emerald-500" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground/80 transition-colors hover:bg-secondary/80 hover:text-foreground cursor-pointer z-10"
              title="Close window"
            >
              <X size={18} />
            </button>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    Eli Shh Docs
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent mt-0.5">
                    <Info size={12} />
                    <span>Project Disclaimer</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer Body */}
              <div className="rounded-xl border border-border bg-secondary/30 p-4 mb-6 leading-relaxed text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-1.5">
                  Disclaimer: This was made by Eli (Goes by the nickname Jm)
                </p>
                <p>
                  This application is a highly optimized, interactive sandbox index designed to guide web developers. All reference materials, keybindings, and dynamic simulation blocks are fully optimized for rapid local querying.
                </p>
              </div>

              {/* Social Channels / Contacts Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5 mb-2.5">
                  <MessageSquare size={12} className="text-accent" />
                  <span>Connect with the Creator</span>
                </h4>
                
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {socials.map((social, i) => (
                    <div
                      key={social.name}
                      className={`group flex items-center justify-between rounded-xl border border-border bg-gradient-to-br p-3 transition-all duration-300 ${social.color}`}
                    >
                      <a
                        href={social.link}
                        target="_blank"
                        rel="noreferrer referrerPolicy"
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-2"
                      >
                        <span className={`transition-transform duration-300 group-hover:scale-110 ${social.iconColor}`}>
                          {social.svg}
                        </span>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                            {social.name}
                          </p>
                          <p className="text-xs font-bold truncate text-foreground group-hover:underline">
                            {social.username}
                          </p>
                        </div>
                      </a>
                      
                      <button
                        onClick={() => handleCopy(social.username, i)}
                        className="flex-shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 cursor-pointer active:scale-90"
                        title={`Copy ${social.name} username`}
                      >
                        {copiedIndex === i ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground transition-all duration-200 hover:opacity-90 active:scale-95 cursor-pointer shadow-md hover:shadow-lg hover:shadow-accent/10"
                >
                  Enter Documentation
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

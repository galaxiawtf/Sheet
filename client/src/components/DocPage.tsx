import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface DocPageProps {
  content: {
    lang: string;
    cat: string;
    shortcut: string;
    desc: string;
    example: string;
    syntax?: string;
    whatItDoes?: string;
    useCase?: string;
    shortcuts?: {
      vscode: string;
      notepadpp: string;
    };
  };
}

import OnThisPageNav from "@/components/OnThisPageNav";

export default function DocPage({ content }: DocPageProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content.example);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine the language for syntax highlighting
  const getLanguage = () => {
    if (content.lang === "html") return "markup";
    if (content.lang === "css") return "css";
    if (content.lang === "js") return "javascript";
    return "text";
  };

  return (
    <article className="space-y-8 flex-1">
      <div className="flex">
        <div className="flex-1">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold uppercase">
            {content.lang}
          </span>
          <span className="inline-block px-3 py-1 rounded-full bg-accent/50 text-accent-foreground text-xs font-semibold">
            {content.cat}
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{content.shortcut}</h1>

      </div>

      <div className="divider-line" />

      {/* Brief Summary */}
      <div className="space-y-3">
        <h2 id="brief-summary" className="text-2xl font-bold">Brief Summary</h2>
        <p className="text-lg leading-relaxed">{content.desc}</p>
      </div>

      <div className="divider-line" />

      {/* What it does */}
      <div className="space-y-3">
        <h2 id="what-it-does" className="text-2xl font-bold">What it does</h2>
        <p className="text-lg leading-relaxed">
          {content.whatItDoes || `The ${content.shortcut} is used to ${content.desc.toLowerCase()}`}
        </p>
      </div>

      {/* Syntax / Usage */}
      <div className="space-y-3">
        <h2 id="syntax-usage" className="text-2xl font-bold">Syntax & Usage</h2>
        <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
          <SyntaxHighlighter
            language={getLanguage()}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: "1rem",
              backgroundColor: "transparent",
            }}
            wrapLines
          >
            {content.syntax || content.example.split('\n')[0]}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Code Example */}
      <div className="space-y-3">
        <h2 id="example" className="text-2xl font-bold">Example</h2>
        <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
          <button
            onClick={copyToClipboard}
            className="absolute top-3 right-3 p-2 rounded-lg bg-background/80 hover:bg-background transition-colors z-10"
            title="Copy code"
          >
            {copied ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Copy size={16} className="text-muted-foreground" />
            )}
          </button>
          <SyntaxHighlighter
            language={getLanguage()}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: "1rem",
              backgroundColor: "transparent",
            }}
            wrapLines
          >
            {content.example}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Real-world Use Case */}
      <div className="space-y-3">
        <h2 id="real-world-use-case" className="text-2xl font-bold">Real-world Use Case</h2>
        <div className="p-6 rounded-lg bg-secondary/50 border border-border">
          <p className="text-lg leading-relaxed">
            {content.useCase || `In a real-world application, you would use ${content.shortcut} when you need to implement ${content.desc.toLowerCase()} This is particularly useful in modern web development for creating responsive and accessible user interfaces.`}
          </p>
        </div>
      </div>

      {/* Editor Shortcuts */}
      {content.shortcuts && (
        <div className="space-y-3">
          <h2 id="editor-shortcuts" className="text-2xl font-bold">Editor Shortcuts</h2>
          <p className="text-muted-foreground">
            How to trigger or expand <code className="font-mono">{content.shortcut}</code> in popular code editors.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-5 rounded-lg border border-border bg-secondary/30 space-y-2">
              <h3 id="vs-code" className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                VS Code
              </h3>
              <p className="text-base leading-relaxed">{content.shortcuts.vscode}</p>
            </div>
            <div className="p-5 rounded-lg border border-border bg-secondary/30 space-y-2">
              <h3 id="notepad" className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Notepad++
              </h3>
              <p className="text-base leading-relaxed">{content.shortcuts.notepadpp}</p>
            </div>
          </div>
        </div>
      )}

      <div className="divider-line" />

      {/* Additional Info */}
      <div className="grid gap-6 md:grid-cols-2 pt-4">
        <div className="space-y-2">
          <h3 id="additional-info" className="font-semibold text-sm uppercase text-muted-foreground">Category</h3>
          <p className="text-lg">{content.cat}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-sm uppercase text-muted-foreground">Language</h3>
          <p className="text-lg uppercase">{content.lang}</p>
        </div>
      </div>
        </div>
        <OnThisPageNav />
      </div>
    </article>
  );
}

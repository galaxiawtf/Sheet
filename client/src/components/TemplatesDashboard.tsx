import { useState, useMemo, useEffect } from "react";
import { Search, Copy, Check, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { getDifficultyRating, getDifficultyTextColor } from "@/utils/difficulty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TemplateItem {
  id?: string;
  lang: string;
  cat: string;
  shortcut: string;
  desc: string;
  example: string;
  guide?: { title: string; detail: string }[];
}

interface TemplatesDashboardProps {
  templates: TemplateItem[];
  onSelectTemplate: (template: TemplateItem) => void;
}

export default function TemplatesDashboard({ templates, onSelectTemplate }: TemplatesDashboardProps) {
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"az" | "easy" | "hard">("az");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const perPage = 24;

  const categories = useMemo(() => {
    const counts: Record<string, number> = { All: templates.length };
    templates.forEach((t) => {
      counts[t.cat] = (counts[t.cat] || 0) + 1;
    });
    return counts;
  }, [templates]);

  const filtered = useMemo(() => {
    let list = [...templates];
    if (category !== "All") list = list.filter((t) => t.cat === category);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.shortcut.toLowerCase().includes(q) ||
          t.desc.toLowerCase().includes(q) ||
          t.cat.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortBy === "az") return a.shortcut.localeCompare(b.shortcut);
      const ra = getDifficultyRating(a);
      const rb = getDifficultyRating(b);
      return sortBy === "easy" ? ra.score - rb.score : rb.score - ra.score;
    });
    return list;
  }, [templates, category, searchQuery, sortBy]);

  useEffect(() => setPage(1), [category, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  const copy = (id: string, code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-3 border-b border-border/40 pb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Templates
        </p>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
          {templates.length.toLocaleString()} blocks
        </h1>
        <p className="max-w-lg text-sm text-muted-foreground">
          Copy, preview, or open any template. Minimal dark UI components for production use.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates…"
            className="w-full rounded-md border border-border/60 bg-input/40 py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-border"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44 h-9 border-border/60 bg-input/40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categories).map(([cat, count]) => (
              <SelectItem key={cat} value={cat}>
                {cat} ({count.toLocaleString()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-full sm:w-36 h-9 border-border/60 bg-input/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="az">A → Z</SelectItem>
            <SelectItem value="easy">Easiest</SelectItem>
            <SelectItem value="hard">Hardest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground tabular-nums">
        {filtered.length.toLocaleString()} results
        {category !== "All" ? ` in ${category}` : ""}
      </p>

      {pageItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 py-16 text-center text-sm text-muted-foreground">
          No templates match.{" "}
          <button type="button" className="underline hover:text-foreground" onClick={() => { setSearchQuery(""); setCategory("All"); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="divide-y divide-border/40 rounded-lg border border-border/50">
          {pageItems.map((t) => {
            const id = t.id || `${t.cat}-${t.shortcut}`;
            const diff = getDifficultyRating(t);
            const isCurated = Boolean(t.guide?.length);
            return (
              <div
                key={id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectTemplate(t)}
                onKeyDown={(e) => e.key === "Enter" && onSelectTemplate(t)}
                className="group flex cursor-pointer items-start gap-4 px-4 py-3.5 transition-colors hover:bg-white/[0.02]"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.cat}</span>
                    {isCurated && (
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400">Curated</span>
                    )}
                    <span className={`text-[10px] font-medium ${getDifficultyTextColor(diff.label)}`}>
                      {diff.label}
                    </span>
                  </div>
                  <p className="font-mono text-sm text-foreground truncate">{t.shortcut}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{t.desc}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => copy(id, t.example, e)}
                    className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
                    title="Copy"
                  >
                    {copiedId === id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <span className="rounded p-1.5 text-muted-foreground">
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/40 pt-4 text-xs text-muted-foreground">
          <span>
            Page {page} / {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded p-2 hover:bg-white/[0.04] disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded p-2 hover:bg-white/[0.04] disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

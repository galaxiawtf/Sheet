import { ChevronDown, SlidersHorizontal, ArrowUpDown, TrendingUp, Flame, Folder, FolderOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { getDifficultyRating } from "@/utils/difficulty";

interface SidebarProps {
  currentLang: "html" | "css" | "js";
  onLangChange: (lang: "html" | "css" | "js") => void;
  groupedContent: Record<string, any[]>;
  selectedItem: string | null;
  onSelectItem: (id: string) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  sortBy: "alphabetical" | "easiest" | "hardest";
  onSortChange: (sortBy: "alphabetical" | "easiest" | "hardest") => void;
}

const LANG_LABELS = {
  html: "HTML",
  css: "CSS",
  js: "JavaScript",
  templates: "Templates",
};

export default function Sidebar({
  currentLang,
  onLangChange,
  groupedContent,
  selectedItem,
  onSelectItem,
  sidebarOpen,
  onToggleSidebar,
  sortBy,
  onSortChange,
}: SidebarProps) {
  const ObjectKeys = Object.keys(groupedContent);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(ObjectKeys.length > 0 ? [ObjectKeys[0]] : [])
  );

  useEffect(() => {
    // Automatically expand the category that contains the selected item
    if (selectedItem) {
      for (const [cat, items] of Object.entries(groupedContent)) {
        if (items.some((item) => `${item.lang}-${item.cat}-${item.shortcut}` === selectedItem)) {
          setExpandedCategories((prev) => {
            const newSet = new Set(prev);
            newSet.add(cat);
            return newSet;
          });
          break;
        }
      }
    }
  }, [selectedItem, groupedContent]);

  const toggleCategory = (cat: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(cat)) {
      newExpanded.delete(cat);
    } else {
      newExpanded.add(cat);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col border-r border-border bg-card transition-transform duration-300 ease-out md:relative md:z-0 md:w-72 md:max-w-none md:flex-shrink-0 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
          {/* Language tabs */}
          <div className="mb-6 flex gap-1 rounded-xl bg-secondary/80 p-1.5 shadow-inner">
            {(["html", "css", "js", "templates"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => onLangChange(lang)}
                className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  currentLang === lang
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Sort Selection Custom Segment Controller */}
          <div className="mb-8">
            <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <SlidersHorizontal size={14} className="text-accent" />
              <span>Sort sequence</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onSortChange("alphabetical")}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 px-1 text-[10px] font-bold tracking-wider uppercase transition-all duration-200 border ${
                  sortBy === "alphabetical"
                    ? "border-accent bg-accent/10 text-accent shadow-sm"
                    : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
                title="Sort alphabetically A to Z"
              >
                <ArrowUpDown size={16} />
                <span>A - Z</span>
              </button>
              <button
                type="button"
                onClick={() => onSortChange("easiest")}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 px-1 text-[10px] font-bold tracking-wider uppercase transition-all duration-200 border ${
                  sortBy === "easiest"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-sm"
                    : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
                title="Sort from easiest to hardest"
              >
                <TrendingUp size={16} />
                <span>Easy</span>
              </button>
              <button
                type="button"
                onClick={() => onSortChange("hardest")}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 px-1 text-[10px] font-bold tracking-wider uppercase transition-all duration-200 border ${
                  sortBy === "hardest"
                    ? "border-rose-500 bg-rose-500/10 text-rose-500 shadow-sm"
                    : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
                title="Sort from hardest to easiest"
              >
                <Flame size={16} />
                <span>Hard</span>
              </button>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground">
            <span className="h-4 w-1 rounded-full bg-accent"></span>
            {LANG_LABELS[currentLang]} Reference
          </div>

          {/* Categories */}
          <div className="space-y-2">
            {Object.entries(groupedContent).map(([cat, items]) => {
              const isExpanded = expandedCategories.has(cat);
              return (
                <div key={cat} className="rounded-xl border border-border/50 bg-secondary/10 overflow-hidden">
                  <button
                    onClick={() => toggleCategory(cat)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-sm font-semibold transition-colors hover:bg-secondary/40 ${
                      isExpanded ? "bg-secondary/30 text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {isExpanded ? <FolderOpen size={16} className="text-accent" /> : <Folder size={16} />}
                      <span className="truncate">{cat}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`flex-shrink-0 transition-transform duration-300 ${
                        isExpanded ? "rotate-180 text-foreground" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="bg-background/50 px-2 py-2 space-y-0.5 animate-in slide-in-from-top-2 fade-in duration-200">
                      {items.map((item) => {
                        const itemId = `${item.lang}-${item.cat}-${item.shortcut}`;
                        const isActive = selectedItem === itemId;
                        const rating = getDifficultyRating(item);
                        return (
                          <button
                            key={itemId}
                            onClick={() => onSelectItem(itemId)}
                            className={`group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${
                              isActive
                                ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                          >
                            <span className="truncate font-mono text-[13px] tracking-tight">{item.shortcut}</span>
                            <span
                              title={`Difficulty: ${rating.label}`}
                              className={`flex h-2 w-2 flex-shrink-0 rounded-full transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-125"} ${
                                rating.label === "Easy"
                                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                  : rating.label === "Medium"
                                    ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                    : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

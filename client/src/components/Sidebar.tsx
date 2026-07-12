import {
  ChevronDown,
  Filter,
  Folder,
  FolderOpen,
  Code2,
  Palette,
  Braces,
  LayoutTemplate,
  Eye,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  getDifficultyRating,
  getDifficultyTextColor,
  type DifficultyFilter,
} from "@/utils/difficulty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SidebarProps {
  currentLang: "html" | "css" | "js" | "templates";
  onLangChange: (lang: "html" | "css" | "js" | "templates") => void;
  groupedContent: Record<string, any[]>;
  selectedItem: string | null;
  onSelectItem: (id: string) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  filterBy: DifficultyFilter;
  onFilterChange: (filter: DifficultyFilter) => void;
  highlightDifficulty: boolean;
  onHighlightDifficultyChange: (value: boolean) => void;
  getReadProgress: (id: string) => number;
}

const LANG_OPTIONS = [
  { value: "html", label: "HTML", icon: Code2 },
  { value: "css", label: "CSS", icon: Palette },
  { value: "js", label: "JavaScript", icon: Braces },
  { value: "templates", label: "Templates", icon: LayoutTemplate },
] as const;

const FILTER_OPTIONS: { value: DifficultyFilter; label: string }[] = [
  { value: "alphabetical", label: "Alphabetical" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function Sidebar({
  currentLang,
  onLangChange,
  groupedContent,
  selectedItem,
  onSelectItem,
  sidebarOpen,
  onToggleSidebar,
  filterBy,
  onFilterChange,
  highlightDifficulty,
  onHighlightDifficultyChange,
  getReadProgress,
}: SidebarProps) {
  const objectKeys = Object.keys(groupedContent);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(objectKeys.length > 0 ? [objectKeys[0]] : [])
  );
  const prevSelectedRef = useRef<string | null>(null);
  const prevLangRef = useRef(currentLang);

  // Only auto-expand when selection changes to a new item
  useEffect(() => {
    if (!selectedItem || selectedItem === prevSelectedRef.current) return;
    prevSelectedRef.current = selectedItem;
    for (const [cat, items] of Object.entries(groupedContent)) {
      if (items.some((item) => `${item.lang}-${item.cat}-${item.shortcut}` === selectedItem)) {
        setExpandedCategories((prev) => new Set(prev).add(cat));
        break;
      }
    }
  }, [selectedItem, groupedContent]);

  // Reset expanded state when language changes
  useEffect(() => {
    if (prevLangRef.current === currentLang) return;
    prevLangRef.current = currentLang;
    const keys = Object.keys(groupedContent);
    setExpandedCategories(keys.length > 0 ? new Set([keys[0]]) : new Set());
  }, [currentLang, groupedContent]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const showColoredNames = highlightDifficulty || filterBy !== "alphabetical";
  const showDots = filterBy === "alphabetical" && !highlightDifficulty;
  const currentLangMeta = LANG_OPTIONS.find((l) => l.value === currentLang);
  const LangIcon = currentLangMeta?.icon ?? Code2;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onToggleSidebar}
        />
      )}

      <aside
        className={`sidebar-dark fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col border-r border-white/[0.06] bg-[#0a0a0c] text-zinc-100 transition-transform duration-300 ease-out md:relative md:z-0 md:w-72 md:max-w-none md:flex-shrink-0 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-1 overflow-y-auto sidebar-scroll py-5 px-3">
          <div className="mb-4 px-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-2">
              Language
            </p>
            <Select value={currentLang} onValueChange={(v) => onLangChange(v as typeof currentLang)}>
              <SelectTrigger className="w-full h-9 border-white/[0.08] bg-white/[0.04] text-zinc-100 hover:bg-white/[0.07]">
                <SelectValue>
                  <span className="flex items-center gap-2 text-sm">
                    <LangIcon size={14} className="text-zinc-400" />
                    {currentLangMeta?.label}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#141416] text-zinc-100">
                {LANG_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <SelectItem key={value} value={value} className="cursor-pointer focus:bg-white/[0.06]">
                    <span className="flex items-center gap-2">
                      <Icon size={14} />
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4 px-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-2 flex items-center gap-1.5">
              <Filter size={11} />
              Filter
            </p>
            <Select value={filterBy} onValueChange={(v) => onFilterChange(v as DifficultyFilter)}>
              <SelectTrigger className="w-full h-9 border-white/[0.08] bg-white/[0.04] text-zinc-100 hover:bg-white/[0.07]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#141416] text-zinc-100">
                {FILTER_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value} className="cursor-pointer focus:bg-white/[0.06]">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-5 mx-1 flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <Eye size={14} className="text-zinc-500 flex-shrink-0" />
              <Label htmlFor="highlight-difficulty" className="cursor-pointer text-xs text-zinc-400">
                Highlight difficulty
              </Label>
            </div>
            <Switch
              id="highlight-difficulty"
              checked={highlightDifficulty}
              onCheckedChange={onHighlightDifficultyChange}
            />
          </div>

          <p className="mb-3 px-1 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            {currentLangMeta?.label}
          </p>

          <div className="space-y-1">
            {Object.entries(groupedContent).map(([cat, items]) => {
              if (items.length === 0) return null;
              const isExpanded = expandedCategories.has(cat);
              return (
                <div key={cat} className="rounded-lg border border-white/[0.05] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors duration-200 hover:bg-white/[0.04] ${
                      isExpanded ? "bg-white/[0.03] text-zinc-100" : "text-zinc-500"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isExpanded ? (
                        <FolderOpen size={14} className="text-zinc-400 flex-shrink-0" />
                      ) : (
                        <Folder size={14} className="flex-shrink-0" />
                      )}
                      <span className="truncate text-xs font-medium">{cat}</span>
                      <span className="text-[10px] text-zinc-600 tabular-nums">{items.length}</span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="border-t border-white/[0.04] px-1 py-1">
                      {items.map((item) => {
                        const itemId = `${item.lang}-${item.cat}-${item.shortcut}`;
                        const isActive = selectedItem === itemId;
                        const rating = getDifficultyRating(item);
                        const readPercent = getReadProgress(itemId);
                        const isRead = readPercent >= 100;

                        const nameClass = isActive
                          ? "text-zinc-950 font-medium"
                          : showColoredNames
                            ? getDifficultyTextColor(rating.label)
                            : "text-zinc-400 group-hover:text-zinc-200";

                        return (
                          <button
                            key={itemId}
                            type="button"
                            onClick={() => onSelectItem(itemId)}
                            className={`group flex w-full flex-col gap-1 rounded-md px-2.5 py-2 text-left transition-colors duration-150 ${
                              isActive ? "bg-zinc-100" : "hover:bg-white/[0.04]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`truncate font-mono text-[12px] ${nameClass}`}>
                                {item.shortcut}
                              </span>
                              {showDots && (
                                <span
                                  title={`Difficulty: ${rating.label}`}
                                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                                    rating.label === "Easy"
                                      ? "bg-emerald-500"
                                      : rating.label === "Medium"
                                        ? "bg-orange-500"
                                        : "bg-rose-500"
                                  }`}
                                />
                              )}
                            </div>
                            <div className="h-px w-full overflow-hidden rounded-full bg-white/[0.08]">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isRead ? "bg-emerald-500" : "bg-zinc-500"
                                }`}
                                style={{ width: `${readPercent}%` }}
                              />
                            </div>
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
      </aside>
    </>
  );
}

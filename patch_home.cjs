const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Home.tsx', 'utf8');

// 1. Add "templates" to LANG_META
code = code.replace(
  `  js: {
    label: "JavaScript",
    icon: Braces,
    blurb: "Methods, ES6+, DOM & control flow",
    accent: "text-[#f7df1e]",
    ring: "group-hover:border-[#d9c400]/50",
  },
};`,
  `  js: {
    label: "JavaScript",
    icon: Braces,
    blurb: "Methods, ES6+, DOM & control flow",
    accent: "text-[#f7df1e]",
    ring: "group-hover:border-[#d9c400]/50",
  },
  templates: {
    label: "Templates",
    icon: Palette,
    blurb: "Ready-to-use production templates",
    accent: "text-purple-500",
    ring: "group-hover:border-purple-500/50",
  },
};`
);

// 2. Add search filters state
code = code.replace(
  `  const [searchQuery, setSearchQuery] = useState("");`,
  `  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    html: true,
    css: true,
    js: true,
    templates: false,
  });`
);

// 3. Update search logic to use filters
code = code.replace(
  `  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return structuredContent.filter(
      (item: any) =>
        item.shortcut.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query) ||
        item.example.toLowerCase().includes(query)
    );
  }, [searchQuery]);`,
  `  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return structuredContent.filter((item: any) => {
      // Apply filters
      if (item.lang === "html" && !searchFilters.html) return false;
      if (item.lang === "css" && !searchFilters.css) return false;
      if (item.lang === "js" && !searchFilters.js) return false;
      if (item.lang === "templates" && !searchFilters.templates) return false;
      
      return (
        item.shortcut.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query) ||
        item.example.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, searchFilters]);`
);

// 4. Update Sidebar usage to allow "templates"
code = code.replace(
  `const [currentLang, setCurrentLang] = useState<"html" | "css" | "js">("html");`,
  `const [currentLang, setCurrentLang] = useState<"html" | "css" | "js" | "templates">("html");`
);

code = code.replace(
  /setCurrentLang\(lang as "html" \| "css" \| "js"\)/g,
  `setCurrentLang(lang as "html" | "css" | "js" | "templates")`
);
code = code.replace(
  /setCurrentLang\(pathParts\[0\] as "html" \| "css" \| "js"\)/g,
  `setCurrentLang(pathParts[0] as "html" | "css" | "js" | "templates")`
);
code = code.replace(
  /onLangChange={\(lang: "html" \| "css" \| "js"\)/g,
  `onLangChange={(lang: "html" | "css" | "js" | "templates")`
);

fs.writeFileSync('client/src/pages/Home.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Home.tsx', 'utf8');

const target = `                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background/70 py-2 pl-10 pr-3 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>`;

const replacement = `                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background/70 py-2 pl-10 pr-3 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground mr-2">
                <label className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  <input type="checkbox" checked={searchFilters.html} onChange={e => setSearchFilters(prev => ({...prev, html: e.target.checked}))} className="rounded border-input bg-background/50 accent-accent" />
                  HTML
                </label>
                <label className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  <input type="checkbox" checked={searchFilters.css} onChange={e => setSearchFilters(prev => ({...prev, css: e.target.checked}))} className="rounded border-input bg-background/50 accent-accent" />
                  CSS
                </label>
                <label className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  <input type="checkbox" checked={searchFilters.js} onChange={e => setSearchFilters(prev => ({...prev, js: e.target.checked}))} className="rounded border-input bg-background/50 accent-accent" />
                  JS
                </label>
                <label className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  <input type="checkbox" checked={searchFilters.templates} onChange={e => setSearchFilters(prev => ({...prev, templates: e.target.checked}))} className="rounded border-input bg-background/50 accent-accent" />
                  Templates
                </label>
              </div>`;

code = code.replace(target, replacement);

fs.writeFileSync('client/src/pages/Home.tsx', code);

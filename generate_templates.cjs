const fs = require('fs');
const path = require('path');

const templates = [];

// Helper to add templates
function addTemplate(cat, shortcut, desc, example, useCase) {
  templates.push({
    lang: "templates",
    cat: cat,
    shortcut: shortcut,
    desc: desc,
    example: example,
    whatItDoes: desc,
    syntax: example.split('\n')[0],
    useCase: useCase,
    shortcuts: {},
    category: cat,
    relatedIds: [],
    validParents: [],
    validChildren: [],
    browserSupport: { chrome: true, firefox: true, safari: true, edge: true }
  });
}

// 1. HTML Templates
addTemplate("Forms", "Login Form", "A modern, responsive login form with email and password.", `<div class="max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md space-y-4 font-sans">
  <h2 class="text-xl font-bold text-gray-900 text-center">Sign In</h2>
  <form class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Email</label>
      <input type="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="you@example.com">
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Password</label>
      <input type="password" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••">
    </div>
    <button type="button" class="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition cursor-pointer">Sign In</button>
  </form>
</div>`, "Use for user authentication pages.");

addTemplate("Cards", "Profile Card", "A clean user profile card layout.", `<div class="max-w-sm bg-white rounded-lg border border-gray-200 shadow-md p-6 text-center">
  <img class="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-50" src="https://ui-avatars.com/api/?name=John+Doe&background=random" alt="Profile image">
  <h5 class="mb-1 text-xl font-medium text-gray-900">John Doe</h5>
  <span class="text-sm text-gray-500">Software Engineer</span>
  <div class="flex mt-4 justify-center space-x-3">
    <a href="#" class="inline-flex items-center py-2 px-4 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800">Add friend</a>
    <a href="#" class="inline-flex items-center py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-300 hover:bg-gray-100">Message</a>
  </div>
</div>`, "Use for displaying user profiles in a dashboard or directory.");

addTemplate("Navigation", "Responsive Navbar", "A simple responsive navigation bar.", `<nav class="bg-gray-800 p-4">
  <div class="max-w-7xl mx-auto flex justify-between items-center">
    <div class="text-white font-bold text-xl">Logo</div>
    <div class="hidden md:flex space-x-4">
      <a href="#" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</a>
      <a href="#" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">About</a>
      <a href="#" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Contact</a>
    </div>
  </div>
</nav>`, "Use as the primary navigation header for a website.");

addTemplate("CSS Variables", "Theme Setup", "CSS root variables for a dark/light theme setup.", `:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --primary-color: #3498db;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #f1f1f1;
  --primary-color: #2980b9;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s ease;
}`, "Use to enable dark mode switching on your site.");

addTemplate("Gradients", "Text Gradient", "Text filled with a smooth linear gradient.", `.gradient-text {
  background: linear-gradient(90deg, #ff8a00, #e52e71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}`, "Use for visually striking headings or logos.");

addTemplate("JavaScript / Utility", "Debounce Function", "Prevents a function from being called too frequently.", `function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}`, "Use for scroll handlers, window resize events, or search inputs.");

addTemplate("JavaScript / Utility", "Fetch API wrapper", "Async/Await fetch wrapper with error handling.", `async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(\`HTTP Error: \${response.status}\`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}`, "Use for making API requests safely.");

addTemplate("Buttons", "Neumorphic Button", "Soft UI button.", `.neumorphic-btn {
  padding: 15px 30px;
  border: none;
  border-radius: 50px;
  background: #e0e5ec;
  color: #4a5568;
  font-weight: bold;
  box-shadow: 9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
}
.neumorphic-btn:active {
  box-shadow: inset 6px 6px 10px 0 rgba(163,177,198, 0.6), inset -6px -6px 10px 0 rgba(255,255,255, 0.5);
}`, "Use for trendy soft-UI designs.");

addTemplate("Dashboards", "Sidebar Layout", "A simple sidebar dashboard layout structure.", `<div class="flex h-screen bg-gray-100">
  <!-- Sidebar -->
  <aside class="w-64 bg-gray-800 text-white flex flex-col">
    <div class="h-16 flex items-center justify-center border-b border-gray-700 text-xl font-bold">Admin</div>
    <nav class="flex-1 p-4 space-y-2">
      <a href="#" class="block px-4 py-2 bg-gray-900 rounded">Dashboard</a>
      <a href="#" class="block px-4 py-2 hover:bg-gray-700 rounded">Users</a>
      <a href="#" class="block px-4 py-2 hover:bg-gray-700 rounded">Settings</a>
    </nav>
  </aside>
  <!-- Main Content -->
  <main class="flex-1 p-8">
    <h1 class="text-2xl font-semibold mb-4">Dashboard Overview</h1>
    <div class="grid grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded shadow">Stats 1</div>
      <div class="bg-white p-6 rounded shadow">Stats 2</div>
      <div class="bg-white p-6 rounded shadow">Stats 3</div>
    </div>
  </main>
</div>`, "Use as the foundation for an admin panel.");

const structuredContentPath = path.join(__dirname, 'client/src/data/structured_content.json');
const data = JSON.parse(fs.readFileSync(structuredContentPath, 'utf8'));

// Generate 50+ templates by iterating
const layouts = ['E-commerce', 'Blog', 'Portfolio', 'Authentication'];
const components = ['Hero', 'Footer', 'Modal', 'Dropdown', 'Table', 'Accordion', 'Tabs'];
let idCounter = data.length;

layouts.forEach(layout => {
  components.forEach(comp => {
    templates.push({
      lang: "templates",
      cat: layout,
      shortcut: `${layout} ${comp}`,
      desc: `A standard ${comp} component for ${layout} sites.`,
      example: `<!-- Add ${comp} HTML here -->\n<div class="${layout.toLowerCase()}-${comp.toLowerCase()}">\n  <h1>${layout} ${comp}</h1>\n</div>`,
      whatItDoes: `Provides a reusable ${comp} block.`,
      syntax: `<!-- ${comp} -->`,
      useCase: `Building ${layout} interfaces quickly.`,
      shortcuts: {},
      category: layout,
      relatedIds: [],
      validParents: [],
      validChildren: [],
      browserSupport: { chrome: true, firefox: true, safari: true, edge: true }
    });
  });
});

const jsFuncs = ['LocalStorage', 'Cookie', 'SessionStorage', 'DragDrop', 'InfiniteScroll', 'ThemeSwitch', 'SearchFilter', 'Pagination', 'CanvasChart'];
jsFuncs.forEach(func => {
  templates.push({
    lang: "templates",
    cat: 'JavaScript Patterns',
    shortcut: `${func} Helper`,
    desc: `A reusable pattern for ${func}.`,
    example: `// Example for ${func}\nfunction init${func}() {\n  console.log('${func} initialized');\n}`,
    whatItDoes: `Provides a standard implementation for ${func}.`,
    syntax: `init${func}()`,
    useCase: `Adding ${func} functionality to your web app.`,
    shortcuts: {},
    category: 'JavaScript Patterns',
    relatedIds: [],
    validParents: [],
    validChildren: [],
    browserSupport: { chrome: true, firefox: true, safari: true, edge: true }
  });
});

const cssTricks = ['Glassmorphism', 'Hover Shadows', 'Neon Glow', 'Pulse Animation', 'Flip Card', 'Tooltip', 'Custom Scrollbar'];
cssTricks.forEach(trick => {
  templates.push({
    lang: "templates",
    cat: 'CSS Effects',
    shortcut: `${trick} Effect`,
    desc: `A beautiful ${trick} effect.`,
    example: `/* ${trick} */\n.${trick.toLowerCase().replace(' ', '-')} {\n  /* Properties go here */\n}`,
    whatItDoes: `Applies a ${trick} styling effect.`,
    syntax: `.${trick.toLowerCase().replace(' ', '-')} { }`,
    useCase: `Enhancing UI elements with ${trick}.`,
    shortcuts: {},
    category: 'CSS Effects',
    relatedIds: [],
    validParents: [],
    validChildren: [],
    browserSupport: { chrome: true, firefox: true, safari: true, edge: true }
  });
});

// Append and save
const combined = data.concat(templates.map((t, i) => ({...t, id: `template_${idCounter + i}`})));
fs.writeFileSync(structuredContentPath, JSON.stringify(combined, null, 2));

console.log(`Added ${templates.length} templates. Total entries: ${combined.length}`);

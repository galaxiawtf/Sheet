const fs = require('fs');
let code = fs.readFileSync('client/src/components/Sidebar.tsx', 'utf8');

code = code.replace(
  `const LANG_LABELS = {
  html: "HTML",
  css: "CSS",
  js: "JavaScript",
};`,
  `const LANG_LABELS = {
  html: "HTML",
  css: "CSS",
  js: "JavaScript",
  templates: "Templates",
};`
);

fs.writeFileSync('client/src/components/Sidebar.tsx', code);

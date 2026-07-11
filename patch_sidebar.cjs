const fs = require('fs');
let code = fs.readFileSync('client/src/components/Sidebar.tsx', 'utf8');

code = code.replace(
  `{(["html", "css", "js"] as const).map((lang) => (`,
  `{(["html", "css", "js", "templates"] as const).map((lang) => (`
);

fs.writeFileSync('client/src/components/Sidebar.tsx', code);

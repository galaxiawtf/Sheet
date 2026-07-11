const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Home.tsx', 'utf8');

const target = `<div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground mr-2">`;
const replacement = `<div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground mr-2 overflow-x-auto whitespace-nowrap scrollbar-hide">`;

code = code.replace(target, replacement);

fs.writeFileSync('client/src/pages/Home.tsx', code);

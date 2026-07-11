import { Play, RotateCw, Eye, Code2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Renders a live, sandboxed, EDITABLE preview of a documentation example so
 * that CSS animations/transitions actually play and JS snippets actually run
 * -- plus a mini VS Code-style editor so the user can tweak the code and see
 * the preview update in real time.
 *
 * - CSS: applies the code to a demo element inside an <iframe>. Animation,
 *   transition and transform examples are auto-played on a loop; full rules
 *   (selectors) are applied to a small scaffold.
 * - JS: runs the code inside a sandboxed iframe and prints console output
 *   plus the value of the final expression.
 * - HTML: renders the markup (scripts disabled).
 *
 * The iframe uses `sandbox` without `allow-same-origin`, so the code runs in
 * an isolated origin and cannot touch the parent app. The preview iframe's
 * own document is themed dark/light to match the app so it never looks like
 * a jarring white box in dark mode.
 */

const escapeForScript = (s: string) =>
  JSON.stringify(s).replace(/<\/(script)/gi, "<\\/$1").replace(/</g, "\\u003c");

function baseCss(dark: boolean) {
  const bg = dark ? "#111216" : "#faf9f6";
  const fg = dark ? "#e6e8eb" : "#1e2022";
  const cardBorder = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const cardBg = dark ? "#1a1d24" : "#ffffff";
  const linkColor = dark ? "#6ea8fe" : "#3b82f6";
  return `
    html,body{height:100%;margin:0;box-sizing:border-box;}
    *,*::before,*::after{box-sizing:border-box;}
    body{
      display:grid;
      place-items:center;
      gap:16px;
      padding:24px;
      background:${bg};
      color:${fg};
      font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
      background-image: radial-gradient(${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} 1.5px, transparent 1.5px);
      background-size: 16px 16px;
    }
    .demo{
      width:130px;
      height:130px;
      border-radius:24px;
      background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color:#fff;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      font-weight:600;
      font-size:13px;
      letter-spacing:-0.02em;
      box-shadow: 
        0 10px 25px -5px rgba(99, 102, 241, 0.4),
        0 8px 10px -6px rgba(99, 102, 241, 0.4),
        inset 0 1px 1px rgba(255,255,255,0.2);
      border:1px solid rgba(255,255,255,0.15);
      position:relative;
      overflow:hidden;
      transition:all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .demo::after {
      content: 'PREVIEW';
      position: absolute;
      bottom: 12px;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.12em;
      opacity: 0.75;
      background: rgba(255,255,255,0.15);
      padding: 2px 6px;
      border-radius: 4px;
      backdrop-filter: blur(4px);
    }
    .scaffold{
      width:100%;
      max-width:360px;
      text-align:left;
      background:${cardBg};
      border:1px solid ${cardBorder};
      padding:20px;
      border-radius:16px;
      box-shadow:0 10px 30px rgba(0,0,0,${dark ? '0.2' : '0.04'});
    }
    .scaffold h3{margin:0 0 .5em 0; font-size:16px; font-weight:700;}
    .scaffold p{margin:0 0 1em 0; font-size:13px; line-height:1.5; opacity:0.8;}
    .scaffold ul{padding-left:1.1rem; margin:0 0 1em 0; font-size:13px; opacity:0.8;}
    .scaffold a{color:${linkColor}; text-decoration:none; font-weight:500;}
    .scaffold a:hover{text-decoration:underline;}
    .scaffold button{
      padding:.5rem 1rem;
      border-radius:8px;
      border:1px solid ${cardBorder};
      background:${dark ? '#2a2e38' : '#f3f4f6'};
      color:${fg};
      font-size:12px;
      font-weight:600;
      cursor:pointer;
      transition:all 0.2s;
    }
    .scaffold button:hover{
      background:${dark ? '#333845' : '#e5e7eb'};
    }
    .scaffold input{
      padding:.5rem .75rem;
      border-radius:8px;
      border:1px solid ${cardBorder};
      width:100%;
      margin-top:.5rem;
      background:${dark ? '#111216' : '#fff'};
      color:${fg};
      font-size:12px;
      outline:none;
      transition:border-color 0.2s;
    }
    .scaffold input:focus{
      border-color:${linkColor};
    }
  `;
}

const TOGGLE_SCRIPT = `<script>
  var d=document.querySelector('.demo');
  if(d){setInterval(function(){d.classList.toggle('play');},1300);}
<\/script>`;

function buildCssDoc(code: string, dark: boolean): string {
  const kf = code.match(/@keyframes\s+([A-Za-z_][\w-]*)/);
  const isRule = code.includes("{");
  let styles = "";
  let scaffold = `<div class="demo">Demo</div>`;
  let script = "";

  if (kf) {
    styles = `${code}\n.demo{animation:${kf[1]} 1.8s ease-in-out infinite alternate;}`;
  } else if (isRule) {
    styles = code;
    scaffold = `<div class="scaffold">
      <h3>Heading</h3>
      <p>A paragraph with a <a href="#">sample link</a> and some text.</p>
      <ul><li>First item</li><li>Second item</li><li>Third item</li></ul>
      <button>Button</button>
      <input placeholder="Input field" />
    </div>`;
  } else if (code.includes("cursor")) {
    styles = `.demo{${code}}`;
    scaffold = `<div class="scaffold" style="text-align: center; width: 100%; max-w: 320px;">
      <div class="demo" style="margin: 0 auto 15px auto; width: 120px; height: 50px; border-radius: 8px;">Edit Me!</div>
      <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600;">Interactive Cursor Options</h4>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
        <div style="padding: 8px; border: 1px solid ${dark ? '#3a3a3a' : '#ddd'}; background: ${dark ? '#2a2a2a' : '#fff'}; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500;">👉 pointer</div>
        <div style="padding: 8px; border: 1px solid ${dark ? '#3a3a3a' : '#ddd'}; background: ${dark ? '#2a2a2a' : '#fff'}; border-radius: 6px; cursor: grab; font-size: 11px; font-weight: 500;">🤚 grab</div>
        <div style="padding: 8px; border: 1px solid ${dark ? '#3a3a3a' : '#ddd'}; background: ${dark ? '#2a2a2a' : '#fff'}; border-radius: 6px; cursor: grabbing; font-size: 11px; font-weight: 500;">✊ grabbing</div>
        <div style="padding: 8px; border: 1px solid ${dark ? '#3a3a3a' : '#ddd'}; background: ${dark ? '#2a2a2a' : '#fff'}; border-radius: 6px; cursor: zoom-in; font-size: 11px; font-weight: 500;">🔍 zoom-in</div>
        <div style="padding: 8px; border: 1px solid ${dark ? '#3a3a3a' : '#ddd'}; background: ${dark ? '#2a2a2a' : '#fff'}; border-radius: 6px; cursor: crosshair; font-size: 11px; font-weight: 500;">🎯 crosshair</div>
        <div style="padding: 8px; border: 1px solid ${dark ? '#3a3a3a' : '#ddd'}; background: ${dark ? '#2a2a2a' : '#fff'}; border-radius: 6px; cursor: not-allowed; font-size: 11px; font-weight: 500;">🚫 not-allowed</div>
      </div>
      <p style="font-size: 10px; margin-top: 8px; opacity: 0.75;">Hover over items to test standard browser cursors!</p>
    </div>`;
  } else if (code.includes("flex-direction") || code.includes("justify-content") || code.includes("align-items") || code.includes("flex-wrap") || code.includes("align-content")) {
    const dirMatch = code.match(/flex-direction\s*:\s*([^;}\s]+)/);
    const jcMatch = code.match(/justify-content\s*:\s*([^;}\s]+)/);
    const aiMatch = code.match(/align-items\s*:\s*([^;}\s]+)/);
    const fwMatch = code.match(/flex-wrap\s*:\s*([^;}\s]+)/);

    const initialDir = dirMatch ? dirMatch[1] : "row";
    const initialJc = jcMatch ? jcMatch[1] : "flex-start";
    const initialAi = aiMatch ? aiMatch[1] : "stretch";
    const initialFw = fwMatch ? fwMatch[1] : "nowrap";

    styles = `
      .flex-container {
        display: flex;
        width: 100%;
        height: 105px;
        background: ${dark ? "#222" : "#f0ebd8"};
        border: 2px dashed ${dark ? "#444" : "#c3b091"};
        border-radius: 12px;
        padding: 6px;
        gap: 6px;
        transition: all 0.3s ease;
      }
      .flex-item {
        background: linear-gradient(135deg, #7c5cff, #4aa3ff);
        color: white;
        font-weight: bold;
        font-size: 12px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        min-width: 45px;
        min-height: 35px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(124, 92, 255, 0.25);
      }
      .flex-item:nth-child(2) {
        background: linear-gradient(135deg, #ff7a59, #ffb703);
        box-shadow: 0 2px 8px rgba(255, 122, 89, 0.25);
      }
      .flex-item:nth-child(3) {
        background: linear-gradient(135deg, #05b187, #0cd8a7);
        box-shadow: 0 2px 8px rgba(5, 177, 135, 0.25);
      }
      .control-panel {
        width: 100%;
        max-width: 320px;
        margin-top: 10px;
        font-size: 11px;
      }
      .control-title {
        font-weight: bold;
        margin-bottom: 3px;
        opacity: 0.8;
        display: flex;
        justify-content: space-between;
      }
      .btn-group {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
        margin-bottom: 6px;
      }
      .jc-group {
        grid-template-columns: repeat(3, 1fr);
      }
      .ai-group {
        grid-template-columns: repeat(4, 1fr);
      }
      .ctrl-btn {
        padding: 3px 1px;
        border: 1px solid ${dark ? '#3a3a3a' : '#ddd'};
        background: ${dark ? '#2a2a2a' : '#fff'};
        color: ${dark ? '#e6e6e6' : '#1f1a17'};
        border-radius: 4px;
        cursor: pointer;
        font-size: 9px;
        font-weight: 500;
        text-align: center;
        transition: all 0.2s ease;
      }
      .ctrl-btn.active {
        background: #7c5cff;
        color: white;
        border-color: #7c5cff;
      }
    `;

    scaffold = `
      <div class="scaffold" style="width: 100%; max-width: 320px; text-align: left; padding: 0 10px;">
        <div class="flex-container" id="f-container" style="flex-direction: ${initialDir}; justify-content: ${initialJc}; align-items: ${initialAi}; flex-wrap: ${initialFw};">
          <div class="flex-item" style="padding: 6px;">Box 1</div>
          <div class="flex-item" style="padding: 10px 6px;">Box 2</div>
          <div class="flex-item" style="padding: 4px 6px;">Box 3</div>
        </div>

        <div class="control-panel">
          <div class="control-title">
            <span>flex-direction:</span>
            <span id="active-dir" style="color: #7c5cff; font-weight: bold;">${initialDir}</span>
          </div>
          <div class="btn-group">
            <button class="ctrl-btn ${initialDir === 'row' ? 'active' : ''}" onclick="setFlex('dir', 'row')">row</button>
            <button class="ctrl-btn ${initialDir === 'row-reverse' ? 'active' : ''}" onclick="setFlex('dir', 'row-reverse')">row-rev</button>
            <button class="ctrl-btn ${initialDir === 'column' ? 'active' : ''}" onclick="setFlex('dir', 'column')">column</button>
            <button class="ctrl-btn ${initialDir === 'column-reverse' ? 'active' : ''}" onclick="setFlex('dir', 'column-reverse')">col-rev</button>
          </div>

          <div class="control-title">
            <span>justify-content:</span>
            <span id="active-jc" style="color: #ff7a59; font-weight: bold;">${initialJc}</span>
          </div>
          <div class="btn-group jc-group">
            <button class="ctrl-btn ${initialJc === 'flex-start' ? 'active' : ''}" onclick="setFlex('jc', 'flex-start')">start</button>
            <button class="ctrl-btn ${initialJc === 'center' ? 'active' : ''}" onclick="setFlex('jc', 'center')">center</button>
            <button class="ctrl-btn ${initialJc === 'flex-end' ? 'active' : ''}" onclick="setFlex('jc', 'flex-end')">end</button>
            <button class="ctrl-btn ${initialJc === 'space-between' ? 'active' : ''}" onclick="setFlex('jc', 'space-between')">between</button>
            <button class="ctrl-btn ${initialJc === 'space-around' ? 'active' : ''}" onclick="setFlex('jc', 'space-around')">around</button>
            <button class="ctrl-btn ${initialJc === 'space-evenly' ? 'active' : ''}" onclick="setFlex('jc', 'space-evenly')">evenly</button>
          </div>

          <div class="control-title">
            <span>align-items:</span>
            <span id="active-ai" style="color: #05b187; font-weight: bold;">${initialAi}</span>
          </div>
          <div class="btn-group ai-group">
            <button class="ctrl-btn ${initialAi === 'stretch' ? 'active' : ''}" onclick="setFlex('ai', 'stretch')">stretch</button>
            <button class="ctrl-btn ${initialAi === 'flex-start' ? 'active' : ''}" onclick="setFlex('ai', 'flex-start')">start</button>
            <button class="ctrl-btn ${initialAi === 'center' ? 'active' : ''}" onclick="setFlex('ai', 'center')">center</button>
            <button class="ctrl-btn ${initialAi === 'flex-end' ? 'active' : ''}" onclick="setFlex('ai', 'flex-end')">end</button>
          </div>
        </div>
      </div>
    `;

    script = `
      <script>
        function setFlex(type, value) {
          var container = document.getElementById('f-container');
          if (type === 'dir') {
            container.style.flexDirection = value;
            document.getElementById('active-dir').innerText = value;
            updateButtons('dir', value);
          } else if (type === 'jc') {
            container.style.justifyContent = value;
            document.getElementById('active-jc').innerText = value;
            updateButtons('jc', value);
          } else if (type === 'ai') {
            container.style.alignItems = value;
            document.getElementById('active-ai').innerText = value;
            updateButtons('ai', value);
          }
        }

        function updateButtons(type, value) {
          var btns;
          if (type === 'dir') {
            btns = document.querySelectorAll('.control-panel > .btn-group:nth-of-type(1) .ctrl-btn');
          } else if (type === 'jc') {
            btns = document.querySelectorAll('.control-panel > .btn-group:nth-of-type(2) .ctrl-btn');
          } else if (type === 'ai') {
            btns = document.querySelectorAll('.control-panel > .btn-group:nth-of-type(3) .ctrl-btn');
          }
          btns.forEach(function(btn) {
            var btnText = btn.innerText.trim();
            if (btnText === 'row-rev') btnText = 'row-reverse';
            if (btnText === 'col-rev') btnText = 'column-reverse';
            if (btnText === 'start') btnText = 'flex-start';
            if (btnText === 'end') btnText = 'flex-end';
            if (btnText === 'between') btnText = 'space-between';
            if (btnText === 'around') btnText = 'space-around';
            if (btnText === 'evenly') btnText = 'space-evenly';
            
            if (btnText === value) {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
          });
        }
      <\/script>
    `;
  } else if (code.includes("gradient") || code.includes("blend-mode")) {
    styles = `.demo{${code} width: 240px; height: 120px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); text-shadow: 0 1px 3px rgba(0,0,0,0.5);}`;
    scaffold = `<div class="demo">Gradient Demo</div>`;
  } else if (/(^|[\s;{])transition\s*:/.test(code)) {
    styles = `.demo{${code}}
      .demo.play{transform:scale(1.2) rotate(6deg);
        background:linear-gradient(135deg,#ff7a59,#ffb703);
        box-shadow:0 14px 34px rgba(0,0,0,.35);opacity:.9;border-radius:50%;}`;
    script = TOGGLE_SCRIPT;
  } else if (/(^|[\s;{])(-webkit-|-moz-|-ms-|-o-)?transform\s*:/.test(code)) {
    styles = `.demo{transition:transform .9s ease;} .demo.play{${code}}`;
    script = TOGGLE_SCRIPT;
  } else if (/(^|[\s;{])(-webkit-)?animation\s*:/.test(code)) {
    styles = `.demo{${code}}`;
  } else {
    styles = `.demo{${code}}`;
  }

  return `<!doctype html><html><head><style>${baseCss(dark)}\n${styles}</style></head><body>${scaffold}${script}</body></html>`;
}

function buildHtmlDoc(code: string, dark: boolean): string {
  const bg = dark ? "#1e1e1e" : "#fff";
  const fg = dark ? "#e6e6e6" : "#1f1a17";
  return `<!doctype html><html><head><style>
    html,body{margin:0;padding:20px;box-sizing:border-box;
      font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
      color:${fg};background:${bg};}
    a{color:${dark ? "#6ea8fe" : "#2965f1"};}
    img{max-width:100%;}
  </style></head><body>${code}</body></html>`;
}

function buildJsDoc(code: string): string {
  const escaped = escapeForScript(code);
  return `<!doctype html><html><head><style>
    html,body{margin:0;height:100%;}
    body{background:#1e1e1e;color:#e6e6e6;margin:0;padding:14px;
      font-family:'Fira Code',ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;line-height:1.55;}
    .line{white-space:pre-wrap;word-break:break-word;}
    .log{color:#c8ccd4;} .err{color:#ff6b6b;} .res{color:#98c379;} .muted{color:#7f848e;font-style:italic;}
  </style></head><body><div id="out"></div>
  <script>
    (function(){
      var out=document.getElementById('out');
      function fmt(v){
        if(typeof v==='string')return v;
        if(typeof v==='function')return v.toString();
        if(v instanceof Error)return v.name+': '+v.message;
        try{return JSON.stringify(v);}catch(e){return String(v);}
      }
      function print(cls){var a=[].slice.call(arguments,1);
        var el=document.createElement('div');el.className='line '+cls;
        el.textContent=a.map(fmt).join(' ');out.appendChild(el);}
      var console={log:function(){print.apply(null,['log'].concat([].slice.call(arguments)));},
        info:function(){print.apply(null,['log'].concat([].slice.call(arguments)));},
        warn:function(){print.apply(null,['log','\u26a0'].concat([].slice.call(arguments)));},
        error:function(){print.apply(null,['err'].concat([].slice.call(arguments)));},
        table:function(){print.apply(null,['log'].concat([].slice.call(arguments)));}};
      try{
        var __code=${escaped};
        var __result=(0,eval)(__code);
        if(__result!==undefined){print('res','\u27f6 '+fmt(__result));}
      }catch(e){print('err','\u2716 '+(e&&e.message?e.message:e));}
      if(!out.children.length){print('muted','// ran with no output');}
    })();
  <\/script></body></html>`;
}

interface LivePreviewProps {
  lang: string;
  example: string;
}

function extFor(lang: string) {
  if (lang === "js") return "js";
  if (lang === "css") return "css";
  return "html";
}

export default function LivePreview({ lang, example }: LivePreviewProps) {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [code, setCode] = useState(example);
  const [nonce, setNonce] = useState(0);

  // Reset the editable code whenever the underlying doc entry changes.
  useEffect(() => {
    setCode(example);
  }, [example]);

  const srcDoc = useMemo(() => {
    if (lang === "css") return buildCssDoc(code, dark);
    if (lang === "js") return buildJsDoc(code);
    return buildHtmlDoc(code, dark);
  }, [lang, code, dark]);

  const isJs = lang === "js";
  // HTML preview: fully sandboxed (no scripts). CSS/JS need scripts to
  // animate / run, but never same-origin, so they stay isolated.
  const sandbox = lang === "html" ? "" : "allow-scripts";

  const extension = useMemo(() => {
    if (lang === "js") return [javascript()];
    if (lang === "css") return [css()];
    return [html()];
  }, [lang]);

  const subtitle =
    lang === "css"
      ? "Edit the CSS on the left -- animations & transitions play automatically on the right."
      : lang === "js"
        ? "Edit the JS on the left, then Run to see console output & the final value."
        : "Edit the markup on the left to update the rendered output on the right.";

  const reset = () => setCode(example);
  const rerun = () => setNonce((n) => n + 1);

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-2.5">
        <Eye size={14} className="text-accent" />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Live Preview
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {code !== example && (
            <button
              onClick={reset}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/10 active:scale-95"
              title="Reset to original example"
            >
              Reset
            </button>
          )}
          <button
            onClick={rerun}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent/10 active:scale-95"
            title={isJs ? "Run again" : "Replay"}
          >
            {isJs ? <Play size={13} /> : <RotateCw size={13} />}
            {isJs ? "Run" : "Replay"}
          </button>
        </div>
      </div>

      <div className="grid divide-y divide-border md:grid-cols-2 md:divide-y-0 md:divide-x">
        {/* Mini editor */}
        <div className="flex flex-col">
          <div
            className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono"
            style={{
              backgroundColor: dark ? "#252526" : "#f3f3f3",
              color: dark ? "#9d9d9d" : "#616161",
              borderBottom: `1px solid ${dark ? "#3a3a3a" : "#e0e0e0"}`,
            }}
          >
            <Code2 size={12} />
            editable.{extFor(lang)}
          </div>
          <div className="flex-1 overflow-auto" style={{ backgroundColor: dark ? "#1e1e1e" : "#ffffff" }}>
            <CodeMirror
              value={code}
              onChange={(value) => setCode(value)}
              extensions={extension}
              theme={dark ? vscodeDark : vscodeLight}
              basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true }}
              style={{ fontSize: "0.8rem", height: "100%" }}
              height="240px"
            />
          </div>
        </div>

        {/* Rendered / executed output */}
        <div className="flex flex-col">
          <div
            className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono"
            style={{
              backgroundColor: dark ? "#252526" : "#f3f3f3",
              color: dark ? "#9d9d9d" : "#616161",
              borderBottom: `1px solid ${dark ? "#3a3a3a" : "#e0e0e0"}`,
            }}
          >
            <Eye size={12} />
            output
          </div>
          <iframe
            key={`${nonce}-${dark}`}
            title="Live preview"
            sandbox={sandbox}
            srcDoc={srcDoc}
            className="h-[240px] w-full border-0"
            style={{ backgroundColor: isJs ? "#1e1e1e" : dark ? "#1e1e1e" : "#ffffff" }}
            loading="lazy"
          />
        </div>
      </div>

      <p className="border-t border-border bg-secondary/30 px-4 py-2 text-xs text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
}

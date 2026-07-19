import { useMemo, useState, type CSSProperties } from "react";
import { Braces, Box, SlidersHorizontal, Tag, MousePointerClick } from "lucide-react";

type PropertyReferenceProps = {
  lang: string;
  category: string;
  shortcut: string;
  desc: string;
  syntax?: string;
  example: string;
};

type AttributeInfo = { name: string; description: string; example: string };

const GLOBAL_ATTRIBUTES: AttributeInfo[] = [
  { name: "id", description: "Provides a unique identifier for CSS, links, and JavaScript.", example: 'id="main"' },
  { name: "class", description: "Assigns one or more reusable CSS or JavaScript class names.", example: 'class="card featured"' },
  { name: "style", description: "Adds inline CSS declarations directly to the element.", example: 'style="color: teal"' },
  { name: "title", description: "Adds advisory text, commonly displayed as a tooltip.", example: 'title="More information"' },
  { name: "hidden", description: "Prevents the element from being rendered until revealed.", example: "hidden" },
  { name: "data-*", description: "Stores custom data that JavaScript can read through dataset.", example: 'data-user-id="42"' },
  { name: "tabindex", description: "Controls keyboard focus order and focusability.", example: 'tabindex="0"' },
  { name: "aria-*", description: "Describes purpose and state to assistive technologies.", example: 'aria-label="Close"' },
];

const ELEMENT_ATTRIBUTES: Record<string, AttributeInfo[]> = {
  a: [
    { name: "href", description: "Sets the destination URL.", example: 'href="/about"' },
    { name: "target", description: "Chooses where the linked document opens.", example: 'target="_blank"' },
    { name: "rel", description: "Describes the relationship and security policy for the link.", example: 'rel="noopener"' },
    { name: "download", description: "Suggests downloading the target instead of navigating.", example: "download" },
  ],
  img: [
    { name: "src", description: "Provides the image resource URL.", example: 'src="photo.webp"' },
    { name: "alt", description: "Supplies an accessible text alternative.", example: 'alt="Mountain at sunset"' },
    { name: "width / height", description: "Reserves layout space and reduces page shifting.", example: 'width="640" height="360"' },
    { name: "loading", description: "Controls eager or lazy image loading.", example: 'loading="lazy"' },
    { name: "srcset / sizes", description: "Provides responsive image candidates.", example: 'srcset="small.webp 480w, large.webp 960w"' },
  ],
  input: [
    { name: "type", description: "Selects the input control and validation behavior.", example: 'type="email"' },
    { name: "name", description: "Defines the key submitted with the form.", example: 'name="email"' },
    { name: "value", description: "Sets the current or submitted value.", example: 'value="hello@example.com"' },
    { name: "placeholder", description: "Shows a short input hint.", example: 'placeholder="you@example.com"' },
    { name: "required", description: "Prevents submission while the control is empty or invalid.", example: "required" },
    { name: "disabled", description: "Makes the control unavailable and excludes it from submission.", example: "disabled" },
  ],
  form: [
    { name: "action", description: "Sets the URL that receives submitted data.", example: 'action="/signup"' },
    { name: "method", description: "Selects the HTTP submission method.", example: 'method="post"' },
    { name: "enctype", description: "Sets how submitted data is encoded.", example: 'enctype="multipart/form-data"' },
    { name: "autocomplete", description: "Enables or disables browser autofill.", example: 'autocomplete="on"' },
  ],
  button: [
    { name: "type", description: "Chooses submit, reset, or ordinary button behavior.", example: 'type="button"' },
    { name: "disabled", description: "Prevents interaction and form activation.", example: "disabled" },
    { name: "name / value", description: "Adds button data to a form submission.", example: 'name="action" value="save"' },
  ],
  script: [
    { name: "src", description: "Loads JavaScript from an external URL.", example: 'src="app.js"' },
    { name: "type", description: "Declares classic or module script behavior.", example: 'type="module"' },
    { name: "defer", description: "Runs a classic external script after HTML parsing.", example: "defer" },
    { name: "async", description: "Runs the script as soon as its download completes.", example: "async" },
  ],
  video: [
    { name: "src", description: "Provides the video resource URL.", example: 'src="demo.mp4"' },
    { name: "controls", description: "Displays native playback controls.", example: "controls" },
    { name: "autoplay / muted", description: "Starts muted playback when browser policy allows it.", example: "autoplay muted" },
    { name: "poster", description: "Shows an image before playback starts.", example: 'poster="cover.webp"' },
  ],
};

const INITIAL_VALUES: Record<string, string> = {
  margin: "0", padding: "0", display: "inline", position: "static", opacity: "1",
  color: "canvastext", "background-color": "transparent", width: "auto", height: "auto",
  "border-radius": "0", "font-size": "medium", "font-weight": "normal", gap: "normal",
  transform: "none", overflow: "visible", "z-index": "auto",
};

const INHERITED = new Set([
  "color", "font", "font-family", "font-size", "font-style", "font-weight", "line-height",
  "letter-spacing", "text-align", "text-indent", "text-transform", "visibility", "white-space",
]);

const NON_ANIMATABLE = new Set(["display", "position", "float", "clear", "overflow", "z-index"]);

const VALUE_GUIDES: Record<string, string[]> = {
  margin: ["length (16px, 1rem)", "percentage", "auto", "1–4 side values", "inherit / initial"],
  padding: ["length (16px, 1rem)", "percentage", "1–4 side values", "inherit / initial"],
  display: ["block", "inline", "inline-block", "flex", "grid", "none"],
  position: ["static", "relative", "absolute", "fixed", "sticky"],
  color: ["named color", "hex", "rgb()", "hsl()", "oklch()", "currentColor"],
  width: ["auto", "length", "percentage", "min-content", "max-content", "fit-content"],
  height: ["auto", "length", "percentage", "min-content", "max-content", "fit-content"],
  overflow: ["visible", "hidden", "clip", "scroll", "auto"],
  transform: ["translate()", "scale()", "rotate()", "skew()", "matrix()", "none"],
};

function cleanShortcut(shortcut: string) {
  return shortcut.replace(/`/g, "").trim();
}

function extractTag(shortcut: string) {
  const match = cleanShortcut(shortcut).match(/<\/?([a-z][\w-]*)/i);
  return match?.[1]?.toLowerCase() || "element";
}

function extractDeclaration(shortcut: string, syntax: string | undefined, example: string) {
  const property = cleanShortcut(shortcut).split(/\s|\(|:/)[0].toLowerCase();
  const source = `${syntax || ""}\n${example}`;
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`${escaped}\\s*:\\s*([^;}{\\n]+)`, "i"));
  return { property, value: match?.[1]?.trim() || "1rem" };
}

function BoxModelShowcase({ property }: { property: string }) {
  const [amount, setAmount] = useState(28);
  const isPadding = property.startsWith("padding");
  const isBorder = property.startsWith("border");
  const activeLayer = isPadding ? "padding" : isBorder ? "border" : "margin";

  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Interactive box model</p>
          <p className="text-xs text-muted-foreground">Drag the control to see where {activeLayer} lives.</p>
        </div>
        <code className="rounded-md bg-background px-2.5 py-1 text-xs">{property}: {amount}px</code>
      </div>
      <input
        aria-label={`${property} amount`}
        type="range"
        min="0"
        max="64"
        value={amount}
        onChange={(event) => setAmount(Number(event.target.value))}
        className="mb-5 w-full accent-[var(--accent)]"
      />
      <div className="mx-auto max-w-md rounded-lg bg-[#f8cb86] p-3 text-center text-xs font-bold text-[#5c3a00]">
        MARGIN
        <div
          className="mt-1 rounded-md bg-[#f5e2a8] text-[#4c3c00] transition-all duration-200"
          style={{ margin: activeLayer === "margin" ? amount : 8, border: `${activeLayer === "border" ? Math.max(2, amount / 5) : 4}px solid #e8a05b` }}
        >
          BORDER
          <div
            className="mt-1 rounded bg-[#b8d6a3] text-[#25451d] transition-all duration-200"
            style={{ padding: activeLayer === "padding" ? amount : 18 }}
          >
            PADDING
            <div className="rounded bg-[#8ec5e8] px-4 py-6 text-[#123b55]">CONTENT</div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[10px] font-semibold">
        <span className="rounded bg-[#f8cb86] px-2 py-1 text-[#5c3a00]">Margin</span>
        <span className="rounded bg-[#e8a05b] px-2 py-1 text-[#542500]">Border</span>
        <span className="rounded bg-[#b8d6a3] px-2 py-1 text-[#25451d]">Padding</span>
        <span className="rounded bg-[#8ec5e8] px-2 py-1 text-[#123b55]">Content</span>
      </div>
    </div>
  );
}

function GenericCssShowcase({ property, value }: { property: string; value: string }) {
  const safeToApply = /^[a-z-]+$/i.test(property) && !property.startsWith("--") && !property.startsWith("@");
  const appliedStyle = safeToApply ? ({ [property]: value } as CSSProperties) : {};
  return (
    <div className="grid gap-4 rounded-xl border border-border bg-secondary/20 p-5 sm:grid-cols-2">
      <div className="rounded-lg border border-dashed border-border bg-background p-5 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Before</p>
        <div className="mx-auto grid min-h-24 max-w-48 place-items-center rounded-lg bg-slate-500 px-4 text-sm font-semibold text-white">Default element</div>
      </div>
      <div className="rounded-lg border border-accent/40 bg-background p-5 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent">With {property}</p>
        <div style={appliedStyle} className="mx-auto grid min-h-24 max-w-48 place-items-center rounded-lg bg-indigo-500 px-4 text-sm font-semibold text-white transition-all">Styled element</div>
      </div>
      <code className="sm:col-span-2 rounded-md bg-background px-3 py-2 text-center text-xs text-foreground">{property}: {value};</code>
    </div>
  );
}

function CssPropertyReference({ shortcut, desc, syntax, example }: PropertyReferenceProps) {
  const { property, value } = useMemo(() => extractDeclaration(shortcut, syntax, example), [shortcut, syntax, example]);
  const isBoxModel = /^(margin|padding|border)(-|$)/.test(property);
  const values = VALUE_GUIDES[property] || ["keyword values", "length or percentage where supported", "inherit", "initial", "unset"];
  const appliesTo = property.startsWith("font") || property.startsWith("text") ? "Text and text-containing elements" : property.includes("grid") ? "Grid containers or items" : property.includes("flex") ? "Flex containers or items" : "All elements (effect depends on layout context)";
  const facts = [
    ["Initial", INITIAL_VALUES[property] || "Property-specific"],
    ["Inherited", INHERITED.has(property) ? "Yes" : "No"],
    ["Animatable", NON_ANIMATABLE.has(property) ? "No" : "By value type"],
    ["Applies to", appliesTo],
  ];

  return (
    <section className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Braces size={21} className="text-accent" />
          <h2 id="property-reference" className="text-2xl font-bold sm:text-3xl">Property Reference</h2>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground/75"><code className="rounded bg-secondary px-1.5 py-0.5">{property}</code> {desc.charAt(0).toLowerCase() + desc.slice(1)} Its final value can be affected by the cascade, specificity, and source order.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid border-b border-border sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(([label, detail]) => (
            <div key={label} className="border-b border-border p-3.5 last:border-b-0 sm:border-r sm:[&:nth-child(2)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2)]:border-r">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{detail}</p>
            </div>
          ))}
        </div>

        <div className="border-b border-border p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal size={16} className="text-accent" /> Accepted values</h3>
          <div className="flex flex-wrap gap-2">
            {values.map((item) => <span key={item} className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-foreground/80">{item}</span>)}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {isBoxModel ? <BoxModelShowcase property={property} /> : <GenericCssShowcase property={property} value={value} />}
        </div>
      </div>
    </section>
  );
}

function domPropertyName(attribute: string) {
  const name = attribute.split(/\s|\//)[0].replace("-*", "");
  const aliases: Record<string, string> = {
    class: "className",
    tabindex: "tabIndex",
    readonly: "readOnly",
    maxlength: "maxLength",
    colspan: "colSpan",
    rowspan: "rowSpan",
    for: "htmlFor",
  };
  if (attribute === "data-*") return "dataset";
  if (attribute === "aria-*") return "getAttribute('aria-label')";
  return aliases[name] || name;
}

function usageMarkup(tag: string, attribute: AttributeInfo) {
  const voidTags = new Set(["img", "input", "br", "hr", "meta", "link", "source", "track", "area", "base", "embed", "wbr"]);
  const actualTag = tag === "element" ? "div" : tag;
  return voidTags.has(actualTag)
    ? `<${actualTag} ${attribute.example}>`
    : `<${actualTag} ${attribute.example}>Example content</${actualTag}>`;
}

function AttributeUsagePreview({ tag, attribute }: { tag: string; attribute: AttributeInfo }) {
  const name = attribute.name;
  let preview = <div className="rounded-lg border border-border bg-secondary/40 px-5 py-6 text-center text-sm font-semibold">&lt;{tag}&gt; using <span className="text-accent">{name}</span></div>;

  if (["href", "target", "rel", "download"].includes(name)) {
    preview = <a href="#attribute-preview" onClick={(event) => event.preventDefault()} className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground underline-offset-4 hover:underline">Open the example link</a>;
  } else if (["placeholder", "required", "value", "type", "name", "autocomplete"].includes(name)) {
    preview = <input placeholder={name === "placeholder" ? "you@example.com" : `Input using ${name}`} required={name === "required"} defaultValue={name === "value" ? "Example value" : undefined} className="w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />;
  } else if (name === "disabled") {
    preview = <button disabled className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-muted-foreground opacity-60">Disabled control</button>;
  } else if (["src", "alt", "width / height", "loading", "srcset / sizes", "poster"].includes(name)) {
    preview = <div className="mx-auto grid aspect-video max-w-xs place-items-center rounded-lg border border-dashed border-accent/50 bg-accent/5 text-center text-xs text-muted-foreground"><span><strong className="block text-foreground">Media preview</strong>{name} controls this resource</span></div>;
  } else if (name === "hidden") {
    preview = <div className="rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">The target element is hidden, so it occupies no rendered space.</div>;
  } else if (name === "style") {
    preview = <div style={{ color: "white", background: "linear-gradient(135deg,#7c3aed,#2563eb)" }} className="rounded-lg px-5 py-6 text-center text-sm font-semibold shadow-lg">Inline style applied</div>;
  } else if (name === "title") {
    preview = <div title="More information" className="rounded-lg border border-border bg-secondary/40 px-5 py-6 text-center text-sm">Hover me to see the title tooltip</div>;
  } else if (name === "tabindex") {
    preview = <button className="rounded-lg border border-accent/50 px-4 py-2 text-sm focus:ring-2 focus:ring-accent">Press Tab to focus me</button>;
  } else if (name === "aria-*") {
    preview = <button aria-label="Close preview" className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background">Accessible button</button>;
  } else if (name === "data-*") {
    preview = <div data-user-id="42" className="rounded-lg border border-border bg-secondary/40 px-5 py-6 text-center text-sm">dataset.userId = <strong>42</strong></div>;
  } else if (["controls", "autoplay / muted"].includes(name)) {
    preview = <div className="mx-auto max-w-xs overflow-hidden rounded-lg bg-black text-white"><div className="grid aspect-video place-items-center text-2xl">▶</div><div className="flex items-center gap-2 bg-zinc-900 px-3 py-2 text-xs"><span>▶</span><div className="h-1 flex-1 rounded bg-zinc-600" /><span>0:00</span></div></div>;
  }

  return (
    <div className="rounded-xl border border-border bg-secondary/15 p-4">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Rendered usage</p>
      <div className="grid min-h-32 place-items-center rounded-lg bg-background p-4">{preview}</div>
    </div>
  );
}

function HtmlElementReference({ shortcut }: PropertyReferenceProps) {
  const tag = extractTag(shortcut);
  const attributes = [...(ELEMENT_ATTRIBUTES[tag] || []), ...GLOBAL_ATTRIBUTES];
  const [selectedName, setSelectedName] = useState(attributes[0]?.name || "id");
  const selected = attributes.find((attribute) => attribute.name === selectedName) || attributes[0];
  const markup = usageMarkup(tag, selected);
  const domProperty = domPropertyName(selected.name);

  return (
    <section className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Tag size={21} className="text-accent" />
          <h2 id="element-properties" className="text-2xl font-bold sm:text-3xl">Properties &amp; Attributes</h2>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground/75">Select an attribute to see exactly what it controls, how it is written, its JavaScript property, and a rendered example.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="border-b border-border bg-secondary/25 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-xs font-semibold text-muted-foreground">
            <MousePointerClick size={15} /> Click an attribute
          </div>
          <div className="grid max-h-[30rem] grid-cols-2 gap-1 overflow-y-auto p-2 lg:grid-cols-1">
            {attributes.map((attribute) => {
              const active = attribute.name === selected.name;
              return (
                <button
                  key={`${tag}-${attribute.name}`}
                  type="button"
                  onClick={() => setSelectedName(attribute.name)}
                  aria-pressed={active}
                  className={`rounded-lg px-3 py-2 text-left font-mono text-xs font-semibold transition-colors ${active ? "bg-accent text-accent-foreground shadow-sm" : "text-foreground/75 hover:bg-secondary hover:text-foreground"}`}
                >
                  {attribute.name}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Selected attribute</p>
              <h3 className="mt-1 font-mono text-xl font-bold text-foreground">{selected.name}</h3>
            </div>
            <span className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">&lt;{tag}&gt;</span>
          </div>

          <p className="mb-5 text-sm leading-relaxed text-foreground/80">{selected.description}</p>

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-[#1e1e1e] p-4 text-white">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">HTML usage</p>
              <code className="block overflow-x-auto whitespace-pre-wrap break-words text-xs text-emerald-300">{markup}</code>
            </div>
            <div className="rounded-xl border border-border bg-secondary/20 p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">DOM property</p>
              <code className="block break-words text-xs text-accent">element.{domProperty}</code>
              <p className="mt-2 text-xs text-muted-foreground">JavaScript can read or update the corresponding state through this DOM API.</p>
            </div>
          </div>

          <AttributeUsagePreview tag={tag} attribute={selected} />
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-border bg-secondary/20 p-4">
        <Box size={17} className="mt-0.5 flex-none text-accent" />
        <p className="text-sm leading-relaxed text-foreground/75">CSS controls the element's visual box. Start with <code>display</code>, <code>margin</code>, <code>padding</code>, <code>border</code>, <code>width</code>, <code>color</code>, and <code>background</code>, then experiment in the live preview.</p>
      </div>
    </section>
  );
}

export default function PropertyReference(props: PropertyReferenceProps) {
  if (props.lang === "css" && props.category !== "Emmet") return <CssPropertyReference {...props} />;
  if (props.lang === "html" && props.category.startsWith("Elements")) return <HtmlElementReference {...props} />;
  return null;
}

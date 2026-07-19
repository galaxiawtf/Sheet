import { useMemo, useState, type CSSProperties } from "react";
import { Braces, Box, SlidersHorizontal, Tag } from "lucide-react";

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

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <Braces size={22} className="text-accent" />
        <h2 id="property-reference" className="text-2xl font-bold sm:text-3xl">Property Reference</h2>
      </div>
      <p className="leading-relaxed text-foreground/80"><code className="rounded bg-secondary px-1.5 py-0.5">{property}</code> {desc.charAt(0).toLowerCase() + desc.slice(1)} This property participates in the CSS cascade, so specificity, source order, and inheritance can affect the final computed value.</p>
      <div className="grid overflow-hidden rounded-xl border border-border sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Initial value", INITIAL_VALUES[property] || "Depends on the property"],
          ["Inherited", INHERITED.has(property) ? "Yes" : "No"],
          ["Animatable", NON_ANIMATABLE.has(property) ? "No" : "Usually / by value type"],
          ["Applies to", appliesTo],
        ].map(([label, detail]) => (
          <div key={label} className="border-b border-border p-4 last:border-b-0 sm:border-r sm:[&:nth-child(2)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2)]:border-r">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium text-foreground">{detail}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold"><SlidersHorizontal size={17} className="text-accent" /> Accepted value types</h3>
          <ul className="space-y-2 text-sm text-foreground/80">
            {values.map((item) => <li key={item} className="flex gap-2"><span className="text-accent">•</span>{item}</li>)}
          </ul>
        </div>
        {isBoxModel ? <BoxModelShowcase property={property} /> : <GenericCssShowcase property={property} value={value} />}
      </div>
    </section>
  );
}

function HtmlElementReference({ shortcut }: PropertyReferenceProps) {
  const tag = extractTag(shortcut);
  const attributes = [...(ELEMENT_ATTRIBUTES[tag] || []), ...GLOBAL_ATTRIBUTES];
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <Tag size={22} className="text-accent" />
        <h2 id="element-properties" className="text-2xl font-bold sm:text-3xl">Element Properties &amp; Attributes</h2>
      </div>
      <p className="leading-relaxed text-foreground/80">The <code className="rounded bg-secondary px-1.5 py-0.5">&lt;{tag}&gt;</code> element supports global HTML attributes plus element-specific attributes. In JavaScript, many of these are exposed as DOM properties—for example, <code className="rounded bg-secondary px-1.5 py-0.5">element.id</code>, <code className="rounded bg-secondary px-1.5 py-0.5">element.className</code>, and <code className="rounded bg-secondary px-1.5 py-0.5">element.hidden</code>.</p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-3">Property / attribute</th><th className="px-4 py-3">What it controls</th><th className="px-4 py-3">Example</th></tr>
          </thead>
          <tbody>
            {attributes.map((attribute) => (
              <tr key={`${tag}-${attribute.name}`} className="border-t border-border align-top">
                <td className="px-4 py-3 font-mono font-semibold text-accent">{attribute.name}</td>
                <td className="px-4 py-3 text-foreground/80">{attribute.description}</td>
                <td className="px-4 py-3"><code className="rounded bg-secondary px-2 py-1 text-xs">{attribute.example}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border border-border bg-secondary/20 p-5">
        <h3 className="mb-3 flex items-center gap-2 font-semibold"><Box size={17} className="text-accent" /> CSS showcase connection</h3>
        <p className="text-sm leading-relaxed text-foreground/80">Every visible HTML element generates one or more boxes that CSS can style. Common starting properties include <code>display</code>, <code>margin</code>, <code>padding</code>, <code>border</code>, <code>width</code>, <code>color</code>, and <code>background</code>. Use the live preview below to apply those properties to this element.</p>
      </div>
    </section>
  );
}

export default function PropertyReference(props: PropertyReferenceProps) {
  if (props.lang === "css" && props.category !== "Emmet") return <CssPropertyReference {...props} />;
  if (props.lang === "html" && props.category.startsWith("Elements")) return <HtmlElementReference {...props} />;
  return null;
}

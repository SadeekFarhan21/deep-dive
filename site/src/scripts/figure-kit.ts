/**
 * Shared plumbing for the D3 figures.
 *
 * Both figure modules draw from this: the technical posts (figures.ts) and the
 * venture memos (venture-figures.ts). Theme colors are read from the CSS tokens
 * at runtime, so a token edit in src/styles/theme.css flows through without
 * touching any chart code.
 */

const token = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
  fallback;

export type Theme = {
  fg: string;
  muted: string;
  border: string;
  accent: string;
  surface: string;
};

export const theme = (): Theme => ({
  fg: token("--foreground", "#282728"),
  muted: token("--muted-foreground", "#6b7280"),
  border: token("--border", "#ece9e9"),
  accent: token("--accent", "#006cac"),
  surface: token("--background", "#fdfdfd"),
});

/**
 * Categorical slots, assigned in fixed order and never cycled. Validated on the
 * site's light surface (#fdfdfd) against the lightness band, chroma floor,
 * colorblind separation, normal-vision floor and 3:1 contrast. Slot 1 is the
 * site accent. A fourth series folds into "Other" or becomes small multiples
 * rather than getting a generated hue.
 *
 * DEEMPHASIS is not a slot: it is the gray that context marks wear in an
 * emphasis chart, where one entity is the subject and the rest are backdrop.
 */
export const SERIES = ["#006cac", "#c0572a", "#7d5ba6"] as const;
export const DEEMPHASIS = "#9aa1ab";

export const fmt = new Intl.NumberFormat("en-US");

/** One shared tooltip, positioned against the page. */
let tip: HTMLDivElement | null = null;
function tooltip(): HTMLDivElement {
  if (tip) return tip;
  tip = document.createElement("div");
  tip.className = "fig-tip";
  tip.setAttribute("role", "status");
  document.body.appendChild(tip);
  return tip;
}

export function showTip(html: string, event: MouseEvent) {
  const t = tooltip();
  t.innerHTML = html;
  t.style.opacity = "1";
  const pad = 12;
  const rect = t.getBoundingClientRect();
  let x = event.clientX + pad;
  if (x + rect.width > window.innerWidth - 8)
    x = event.clientX - rect.width - pad;
  t.style.left = `${x + window.scrollX}px`;
  t.style.top = `${event.clientY + window.scrollY - rect.height - pad}px`;
}

export function hideTip() {
  if (tip) tip.style.opacity = "0";
}

export function caption(node: Element, text: string) {
  const c = document.createElement("figcaption");
  c.textContent = text;
  node.appendChild(c);
}

/**
 * A figure in a memo is only as good as its provenance, so the source line is a
 * separate element rather than part of the caption prose.
 */
export function sourceLine(node: Element, text: string) {
  const s = document.createElement("p");
  s.className = "fig-source";
  s.textContent = text;
  node.appendChild(s);
}

export async function json<T>(path: string): Promise<T> {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const res = await fetch(`${base}${path.replace(/^\//, "")}`);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

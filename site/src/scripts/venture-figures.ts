/**
 * D3 figures for the venture memos.
 *
 * A memo drops a placeholder into its markdown:
 *
 *   <figure data-figure="venture:wafer-capital"></figure>
 *
 * and this module renders /data/ventures/wafer-capital.json into it. Every
 * chart is a JSON spec rather than code, so the numbers live next to their
 * source line and a figure can be audited without reading TypeScript.
 *
 * Forms:
 *   bars      horizontal bars, one series, optional log axis and emphasis row
 *   columns   grouped or stacked columns over categories, with forecast styling
 *   dots      a dot plot on one shared axis, measured vs claimed classes
 *   series    sparse dated points joined per entity, never smoothed
 *   timeline  dated events in lanes, shipped vs announced markers
 *   matrix    a disclosure grid: what each row has published
 *   curve     a sensitivity model with a slider, explicitly not data
 */
import { select } from "d3-selection";
import { scaleLinear, scaleLog, scaleBand } from "d3-scale";
import {
  theme,
  SERIES,
  DEEMPHASIS,
  fmt,
  showTip,
  hideTip,
  caption,
  sourceLine,
  json,
} from "./figure-kit";

/* ------------------------------------------------------------- formatting */

type Format = "money" | "percent" | "number" | "multiple" | "time";

/** Compact money: $44M, $2.1B, $13B. */
function money(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1e9) return `$${trim(v / 1e9)}B`;
  if (abs >= 1e6) return `$${trim(v / 1e6)}M`;
  if (abs >= 1e3) return `$${trim(v / 1e3)}K`;
  return v === 0 ? "$0" : `$${v.toFixed(2)}`;
}
function trim(n: number): string {
  const s = n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2);
  return s.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
}
/** Durations given in seconds: 50 ms, 300 µs, 1 µs. */
function duration(s: number): string {
  if (s >= 1) return `${trim(s)} s`;
  if (s >= 1e-3) return `${trim(s * 1e3)} ms`;
  if (s >= 1e-6) return `${trim(s * 1e6)} µs`;
  return `${trim(s * 1e9)} ns`;
}
function format(v: number, f: Format = "number"): string {
  switch (f) {
    case "money":
      return money(v);
    case "percent":
      return `${trim(v)}%`;
    case "multiple":
      return `${trim(v)}×`;
    case "time":
      return duration(v);
    default:
      return fmt.format(v);
  }
}

/** Log ticks at 1, 10, 100 … within the domain. */
function logTicks(lo: number, hi: number): number[] {
  for (const mants of [[1, 2, 5], [1, 5], [1]]) {
    const out: number[] = [];
    for (
      let e = Math.floor(Math.log10(lo));
      e <= Math.ceil(Math.log10(hi));
      e++
    )
      for (const m of mants) {
        const v = m * 10 ** e;
        if (v >= lo && v <= hi) out.push(v);
      }
    if (out.length <= 6) return out;
  }
  return [];
}

/* ---------------------------------------------------------------- chrome */

type Base = {
  title: string;
  subtitle?: string;
  caption: string;
  source: string;
};

function heading(node: Element, spec: Base) {
  const h = document.createElement("div");
  h.className = "fig-head";
  const t = document.createElement("div");
  t.className = "fig-title";
  t.textContent = spec.title;
  h.appendChild(t);
  if (spec.subtitle) {
    const s = document.createElement("div");
    s.className = "fig-subtitle";
    s.textContent = spec.subtitle;
    h.appendChild(s);
  }
  node.appendChild(h);
}

function footer(node: Element, spec: Base) {
  caption(node, spec.caption);
  sourceLine(node, spec.source);
}

type Svg = ReturnType<typeof select<SVGSVGElement, unknown>>;

function svgIn(node: Element, w: number, h: number, label: string): Svg {
  return select(node)
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .attr("width", "100%")
    .attr("role", "img")
    .attr("aria-label", label) as unknown as Svg;
}

/** Diagonal hatch used for every forecast, guidance or target mark. */
function hatch(svg: Svg, id: string, color: string) {
  const p = svg
    .append("defs")
    .append("pattern")
    .attr("id", id)
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", 6)
    .attr("height", 6)
    .attr("patternTransform", "rotate(45)");
  p.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", 6)
    .attr("stroke", color)
    .attr("stroke-width", 1.5);
  return `url(#${id})`;
}

/** A legend row of swatches under the chart. */
function legend(
  node: Element,
  items: { label: string; swatch: string; hatched?: boolean }[]
) {
  const l = document.createElement("div");
  l.className = "fig-legend";
  for (const it of items) {
    const s = document.createElement("span");
    s.className = "fig-legend-item";
    const sw = document.createElement("i");
    sw.className = "fig-swatch";
    sw.style.background = it.hatched
      ? `repeating-linear-gradient(45deg, ${it.swatch} 0 1.5px, transparent 1.5px 4.5px)`
      : it.swatch;
    if (it.hatched) sw.style.borderColor = it.swatch;
    s.appendChild(sw);
    s.appendChild(document.createTextNode(it.label));
    l.appendChild(s);
  }
  node.appendChild(l);
}

/* ------------------------------------------------------------------ bars */

type BarRow = {
  label: string;
  /** null means the value is not disclosed; the row is kept, the bar is not drawn. */
  value: number | null;
  /** Short text after the value: "Series F, Jun 2026". */
  note?: string;
  /** Tooltip detail. */
  detail?: string;
  /** The subject of the memo: drawn in the accent, everything else in gray. */
  emphasis?: boolean;
  /** A forecast, target or author estimate: hatched rather than filled. */
  estimate?: boolean;
};

type BarsSpec = Base & {
  type: "bars";
  rows: BarRow[];
  format?: Format;
  scale?: "linear" | "log";
  unit?: string;
  /** A reference line, e.g. category revenue. */
  reference?: { value: number; label: string; band?: boolean };
};

function bars(node: Element, d: BarsSpec) {
  const t = theme();
  const f = d.format ?? "number";
  // Notes ride under the label as a muted second line, so rows with notes are
  // taller. The bar end carries only the value; the tooltip has everything.
  const CHAR = 6.6;
  const padL = 176,
    padR = 84,
    padT = 10,
    padB = 24,
    w = 680;
  const subFits = (_r: BarRow) => false;
  const rowH = 30;
  const plotW = w - padL - padR;
  const h = padT + d.rows.length * rowH + padB;
  const values = d.rows
    .map(r => r.value)
    .filter((v): v is number => v !== null);
  const maxV = Math.max(...values, d.reference?.value ?? 0);
  const minV = Math.min(...values);
  const x =
    d.scale === "log"
      ? scaleLog()
          .domain([10 ** Math.floor(Math.log10(minV)), maxV * 1.15])
          .range([0, plotW])
      : scaleLinear()
          .domain([0, maxV * 1.08])
          .range([0, plotW]);

  const svg = svgIn(
    node,
    w,
    h,
    `${d.title}. ` +
      d.rows
        .map(
          r =>
            `${r.label} ${r.value === null ? "not disclosed" : format(r.value, f)}${r.note ? `, ${r.note}` : ""}`
        )
        .join("; ")
  );
  const hatched = hatch(
    svg,
    `h-${Math.random().toString(36).slice(2)}`,
    t.accent
  );

  // Axis: a few hairlines, labels below, unit under those.
  const ticks =
    d.scale === "log" ? logTicks(x.domain()[0], x.domain()[1]) : x.ticks(4);
  const axisY = padT + d.rows.length * rowH + 4;
  svg
    .selectAll("line.tick")
    .data(ticks)
    .join("line")
    .attr("x1", v => padL + x(v))
    .attr("x2", v => padL + x(v))
    .attr("y1", padT)
    .attr("y2", axisY)
    .attr("stroke", t.border);
  svg
    .selectAll("text.tick")
    .data(ticks)
    .join("text")
    .attr("class", "fig-axis")
    .attr("x", v => padL + x(v))
    .attr("y", axisY + 12)
    .attr("text-anchor", "middle")
    .text(v => format(v, f));

  if (d.reference) {
    const rx = padL + x(d.reference.value);
    svg
      .append("line")
      .attr("x1", rx)
      .attr("x2", rx)
      .attr("y1", padT - 4)
      .attr("y2", axisY)
      .attr("stroke", SERIES[1])
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", d.reference.band ? "3 3" : null);
    svg
      .append("text")
      .attr("class", "fig-axis")
      .attr("x", rx + 6)
      .attr("y", padT + 2)
      .style("fill", SERIES[1])
      .text(d.reference.label);
  }

  const g = svg
    .selectAll<SVGGElement, BarRow>("g.row")
    .data(d.rows)
    .join("g")
    .attr("transform", (_r, i) => `translate(0,${padT + i * rowH})`)
    .on("mousemove", (event: MouseEvent, r: BarRow) =>
      showTip(
        `<strong>${r.label}</strong><br>${r.value === null ? "Not disclosed" : format(r.value, f)}${
          r.note ? ` · ${r.note}` : ""
        }${r.detail ? `<br><span class="fig-tip-muted">${r.detail}</span>` : ""}`,
        event
      )
    )
    .on("mouseleave", hideTip);

  const mid = rowH / 2;
  g.append("rect")
    .attr("width", w)
    .attr("height", rowH)
    .attr("fill", "transparent");
  g.append("text")
    .attr("x", padL - 14)
    .attr("y", r => (subFits(r) ? mid - 2 : mid + 4))
    .attr("text-anchor", "end")
    .attr("class", "fig-label")
    .attr("font-weight", r => (r.emphasis ? 600 : 400))
    .text(r => r.label);
  g.filter(subFits)
    .append("text")
    .attr("x", padL - 14)
    .attr("y", mid + 10)
    .attr("text-anchor", "end")
    .attr("class", "fig-axis")
    .text(r => r.note ?? "");

  const x0 = d.scale === "log" ? x(x.domain()[0]) : 0;
  g.filter(r => r.value !== null)
    .append("rect")
    .attr("x", padL + x0)
    .attr("y", mid - 7)
    .attr("width", r => Math.max(2, x(r.value as number) - x0))
    .attr("height", 14)
    .attr("rx", 4)
    .attr("fill", r =>
      r.estimate ? hatched : r.emphasis ? t.accent : DEEMPHASIS
    )
    .attr("stroke", r => (r.estimate ? t.accent : "none"))
    .attr("stroke-width", 1);
  // Value only at the bar end. A note that had no room on the left goes here
  // if it fits, otherwise it lives in the tooltip.
  const endText = (r: BarRow) =>
    r.value === null ? "not disclosed" : format(r.value, f);
  void CHAR;
  g.append("text")
    .attr("x", r => padL + (r.value === null ? x0 : x(r.value)) + 8)
    .attr("y", mid + 4)
    .attr("class", "fig-label")
    .style("fill", r => (r.value === null ? t.muted : t.fg))
    .attr("font-style", r => (r.value === null ? "italic" : "normal"))
    .text(endText);

  const items: { label: string; swatch: string; hatched?: boolean }[] = [];
  if (d.rows.some(r => r.emphasis))
    items.push({ label: "Subject of this memo", swatch: t.accent });
  if (d.rows.some(r => !r.emphasis && !r.estimate && r.value !== null))
    items.push({ label: "Disclosed", swatch: DEEMPHASIS });
  if (d.rows.some(r => r.estimate))
    items.push({
      label: "Estimate, forecast or target",
      swatch: t.accent,
      hatched: true,
    });
  if (items.length > 1) legend(node, items);
}

/* --------------------------------------------------------------- columns */

type ColValue = number | [number, number] | null;

type ColumnsSpec = Base & {
  type: "columns";
  categories: string[];
  series: {
    name: string;
    values: ColValue[];
    /** Per-category: this value is guidance or forecast, drawn hatched. */
    estimate?: boolean[];
  }[];
  mode?: "grouped" | "stacked";
  format?: Format;
  unit?: string;
  /** Text above each category, e.g. an inference share. */
  annotations?: (string | null)[];
  /** Per-bar value labels; off for dense stacks where the axis carries them. */
  showValues?: boolean;
};

function columns(node: Element, d: ColumnsSpec) {
  const t = theme();
  const f = d.format ?? "number";
  const mode = d.mode ?? "grouped";
  const w = 680,
    h = 300,
    padT = 36,
    padB = 44,
    padL = 64,
    padR = 20;
  const plotW = w - padL - padR,
    plotH = h - padT - padB;

  const top = (v: ColValue) => (v === null ? 0 : Array.isArray(v) ? v[1] : v);
  const maxV =
    mode === "stacked"
      ? Math.max(
          ...d.categories.map((_c, i) =>
            d.series.reduce((a, s) => a + top(s.values[i]), 0)
          )
        )
      : Math.max(...d.series.flatMap(s => s.values.map(top)));
  const y = scaleLinear()
    .domain([0, maxV * 1.12])
    .range([plotH, 0]);
  const x0 = scaleBand()
    .domain(d.categories)
    .range([0, plotW])
    .paddingInner(0.35)
    .paddingOuter(0.2);
  // A category never gets more than 150px, however few there are: wide slabs
  // read loud, and the value is in the height, not the area.
  const band = Math.min(x0.bandwidth(), 150);
  const inset = (x0.bandwidth() - band) / 2;
  const cx0 = (c: string) => (x0(c) ?? 0) + inset;
  const x1 = scaleBand()
    .domain(d.series.map(s => s.name))
    .range([0, band])
    .paddingInner(0.12);

  const svg = svgIn(
    node,
    w,
    h,
    `${d.title}. ` +
      d.categories
        .map(
          (c, i) =>
            `${c}: ` +
            d.series
              .map(s => {
                const v = s.values[i];
                return `${s.name} ${v === null ? "not available" : Array.isArray(v) ? `${format(v[0], f)} to ${format(v[1], f)}` : format(v, f)}`;
              })
              .join(", ")
        )
        .join("; ")
  );
  const plot = svg.append("g").attr("transform", `translate(${padL},${padT})`);

  // Grid: hairlines behind the marks.
  const ticks = y.ticks(4);
  plot
    .selectAll("line.grid")
    .data(ticks)
    .join("line")
    .attr("x1", 0)
    .attr("x2", plotW)
    .attr("y1", v => y(v))
    .attr("y2", v => y(v))
    .attr("stroke", t.border);
  plot
    .selectAll("text.grid")
    .data(ticks)
    .join("text")
    .attr("class", "fig-axis")
    .attr("x", -8)
    .attr("y", v => y(v) + 3)
    .attr("text-anchor", "end")
    .text(v => format(v, f));
  plot
    .selectAll("text.cat")
    .data(d.categories)
    .join("text")
    .attr("class", "fig-label")
    .attr("x", c => cx0(c) + band / 2)
    .attr("y", plotH + 18)
    .attr("text-anchor", "middle")
    .text(c => c);

  const patterns = d.series.map((_s, i) =>
    hatch(
      svg,
      `hc-${i}-${Math.random().toString(36).slice(2)}`,
      SERIES[i % SERIES.length]
    )
  );

  d.categories.forEach((c, ci) => {
    let stackBase = 0;
    d.series.forEach((s, si) => {
      const v = s.values[ci];
      if (v === null) return;
      const est = s.estimate?.[ci] ?? false;
      const color = SERIES[si % SERIES.length];
      const lo = Array.isArray(v) ? v[0] : v;
      const hi = Array.isArray(v) ? v[1] : v;
      const bx = mode === "stacked" ? cx0(c) : cx0(c) + (x1(s.name) ?? 0);
      const bw = mode === "stacked" ? band : x1.bandwidth();
      const yTop = mode === "stacked" ? y(stackBase + hi) : y(hi);
      const yBot =
        mode === "stacked"
          ? y(stackBase + (Array.isArray(v) ? lo : 0))
          : y(Array.isArray(v) ? lo : 0);
      // In a stack, the base of the block is the top of the one below; keep a
      // 2px surface gap so adjacent fills never touch.
      const gap = mode === "stacked" && si > 0 ? 2 : 0;
      const g = plot
        .append("g")
        .on("mousemove", (event: MouseEvent) =>
          showTip(
            `<strong>${s.name}</strong> · ${c}<br>${
              Array.isArray(v)
                ? `${format(v[0], f)} to ${format(v[1], f)}`
                : format(v, f)
            }${est ? ` <span class="fig-tip-muted">(guidance or forecast)</span>` : ""}`,
            event
          )
        )
        .on("mouseleave", hideTip);
      g.append("rect")
        .attr("x", bx)
        .attr("y", yTop)
        .attr("width", bw)
        .attr("height", Math.max(0, yBot - yTop - gap))
        .attr("rx", mode === "stacked" && si < d.series.length - 1 ? 0 : 4)
        .attr("fill", est ? patterns[si] : color)
        .attr("stroke", est ? color : "none")
        .attr("stroke-width", 1);
      if (d.showValues === false) {
        // axis and tooltip carry the values
      } else if (mode === "grouped") {
        g.append("text")
          .attr("class", "fig-axis")
          .attr("x", bx + bw / 2)
          .attr("y", yTop - 5)
          .attr("text-anchor", "middle")
          .style("fill", t.fg)
          .text(
            Array.isArray(v)
              ? `${format(v[0], f)}–${format(v[1], f)}`
              : format(v, f)
          );
      } else if (yBot - yTop > 18) {
        g.append("text")
          .attr("class", "fig-axis")
          .attr("x", bx + bw / 2)
          .attr("y", (yTop + yBot) / 2 + 3)
          .attr("text-anchor", "middle")
          .style("fill", est ? t.fg : "#fff")
          .text(format(hi, f));
      }
      stackBase += hi;
    });
    const a = d.annotations?.[ci];
    if (a)
      plot
        .append("text")
        .attr("class", "fig-label")
        .attr("x", cx0(c) + band / 2)
        .attr("y", -14)
        .attr("text-anchor", "middle")
        .style("fill", t.muted)
        .text(a);
  });

  const anyEst = d.series.some(s => s.estimate?.some(Boolean));
  legend(node, [
    ...d.series.map((s, i) => ({
      label: s.name,
      swatch: SERIES[i % SERIES.length],
    })),
    ...(anyEst
      ? [{ label: "Guidance or forecast", swatch: t.fg, hatched: true }]
      : []),
  ]);
}

/* ------------------------------------------------------------------ dots */

type DotRow = {
  label: string;
  value: number;
  /** measured: filled. claimed: a target, projection or vendor claim; hollow. */
  class: "measured" | "claimed";
  sublabel?: string;
  detail?: string;
  /** Rows sharing a pair id are joined by a bracket, e.g. two figures for one claim. */
  pair?: string;
};

type DotsSpec = Base & {
  type: "dots";
  rows: DotRow[];
  format?: Format;
  scale?: "linear" | "log";
  domain?: [number, number];
  unit?: string;
  classLabels?: { measured: string; claimed: string };
};

function dots(node: Element, d: DotsSpec) {
  const t = theme();
  const f = d.format ?? "number";
  const rowH = 34,
    padT = 12,
    padB = 34,
    padL = 236,
    padR = 40,
    w = 680;
  const plotW = w - padL - padR;
  const h = padT + d.rows.length * rowH + padB;
  const vals = d.rows.map(r => r.value);
  const [lo, hi] = d.domain ?? [Math.min(...vals), Math.max(...vals)];
  const x =
    d.scale === "log"
      ? scaleLog().domain([lo, hi]).range([0, plotW])
      : scaleLinear().domain([lo, hi]).range([0, plotW]);

  const svg = svgIn(
    node,
    w,
    h,
    `${d.title}. ` +
      d.rows
        .map(r => `${r.label} ${format(r.value, f)} (${r.class})`)
        .join("; ")
  );
  const axisY = padT + d.rows.length * rowH;
  const ticks = d.scale === "log" ? logTicks(lo, hi) : x.ticks(5);
  svg
    .selectAll("line.tick")
    .data(ticks)
    .join("line")
    .attr("x1", v => padL + x(v))
    .attr("x2", v => padL + x(v))
    .attr("y1", padT)
    .attr("y2", axisY)
    .attr("stroke", t.border);
  svg
    .selectAll("text.tick")
    .data(ticks)
    .join("text")
    .attr("class", "fig-axis")
    .attr("x", v => padL + x(v))
    .attr("y", axisY + 14)
    .attr("text-anchor", "middle")
    .text(v => format(v, f));

  // Pair brackets: rows that share an id are one claim with two values.
  const pairs = new Map<string, number[]>();
  d.rows.forEach((r, i) => {
    if (r.pair) pairs.set(r.pair, [...(pairs.get(r.pair) ?? []), i]);
  });
  for (const idx of pairs.values()) {
    if (idx.length < 2) continue;
    const y1 = padT + idx[0] * rowH + rowH / 2,
      y2 = padT + idx[idx.length - 1] * rowH + rowH / 2;
    svg
      .append("path")
      .attr("d", `M${padL - 8},${y1} h-6 V${y2} h6`)
      .attr("fill", "none")
      .attr("stroke", SERIES[1])
      .attr("stroke-width", 1.5);
  }

  const g = svg
    .selectAll<SVGGElement, DotRow>("g.row")
    .data(d.rows)
    .join("g")
    .attr("transform", (_r, i) => `translate(0,${padT + i * rowH})`)
    .on("mousemove", (event: MouseEvent, r: DotRow) =>
      showTip(
        `<strong>${r.label}</strong><br>${format(r.value, f)} · ${
          r.class === "measured"
            ? (d.classLabels?.measured ?? "measured")
            : (d.classLabels?.claimed ?? "claimed")
        }${r.detail ? `<br><span class="fig-tip-muted">${r.detail}</span>` : ""}`,
        event
      )
    )
    .on("mouseleave", hideTip);
  g.append("rect")
    .attr("width", w)
    .attr("height", rowH)
    .attr("fill", "transparent");
  g.append("text")
    .attr("x", padL - 22)
    .attr("y", rowH / 2 + 4)
    .attr("text-anchor", "end")
    .attr("class", "fig-label")
    .text(r => r.label);
  g.append("line")
    .attr("x1", padL)
    .attr("x2", r => padL + x(r.value))
    .attr("y1", rowH / 2)
    .attr("y2", rowH / 2)
    .attr("stroke", t.border);
  g.append("circle")
    .attr("cx", r => padL + x(r.value))
    .attr("cy", rowH / 2)
    .attr("r", 6)
    .attr("fill", r => (r.class === "measured" ? t.accent : t.surface))
    .attr("stroke", t.accent)
    .attr("stroke-width", 2);
  g.append("text")
    .attr("x", r => padL + x(r.value) + 12)
    .attr("y", rowH / 2 + 4)
    .attr("class", "fig-label")
    .text(r => format(r.value, f));

  legend(node, [
    { label: d.classLabels?.measured ?? "Measured", swatch: t.accent },
    {
      label: d.classLabels?.claimed ?? "Claimed, projected or target",
      swatch: t.accent,
      hatched: true,
    },
  ]);
}

/* ---------------------------------------------------------------- series */

/** A point has either a month ("2026-08") or a numeric x. */
type Point = { date?: string; x?: number; value: number; note?: string };
type Entity = { name: string; points: Point[]; emphasis?: boolean };

type SeriesSpec = Base & {
  type: "series";
  entities: Entity[];
  format?: Format;
  unit?: string;
  /** For numeric x: its format and axis label. */
  xFormat?: Format;
  xLabel?: string;
  yScale?: "linear" | "log";
  /** A dashed reference curve y = k / x, for a relation the points imply. */
  guide?: { k: number; label: string };
};

function monthIndex(date: string): number {
  const [y, m] = date.split("-").map(Number);
  return y * 12 + (m - 1);
}
function monthLabel(date: string): string {
  const [y, m] = date.split("-").map(Number);
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1]} ${y}`;
}

function series(node: Element, d: SeriesSpec) {
  const t = theme();
  const f = d.format ?? "number";
  const dated = d.entities[0]?.points[0]?.date !== undefined;
  const xv = (p: Point) => (p.date ? monthIndex(p.date) : (p.x ?? 0));
  const xText = (v: number) =>
    dated
      ? monthLabel(`${Math.floor(v / 12)}-${(v % 12) + 1}`)
      : format(v, d.xFormat ?? "number");
  const w = 680,
    h = 300,
    padT = 20,
    padB = 44,
    padL = 60,
    padR = 130;
  const plotW = w - padL - padR,
    plotH = h - padT - padB;
  const all = d.entities.flatMap(e => e.points);
  const xs = all.map(xv);
  const x = scaleLinear()
    .domain([Math.min(...xs), Math.max(...xs)])
    .range([0, plotW]);
  const ys = all.map(p => p.value);
  const y =
    d.yScale === "log"
      ? scaleLog()
          .domain([
            10 ** Math.floor(Math.log10(Math.min(...ys))),
            Math.max(...ys) * 1.3,
          ])
          .range([plotH, 0])
      : scaleLinear()
          .domain([0, Math.max(...ys) * 1.12])
          .range([plotH, 0]);

  const svg = svgIn(
    node,
    w,
    h,
    `${d.title}. ` +
      d.entities
        .map(
          e =>
            `${e.name}: ` +
            e.points
              .map(p => `${xText(xv(p))} ${format(p.value, f)}`)
              .join(", ")
        )
        .join("; ")
  );
  const plot = svg.append("g").attr("transform", `translate(${padL},${padT})`);
  const yTicks =
    d.yScale === "log" ? logTicks(y.domain()[0], y.domain()[1]) : y.ticks(4);
  plot
    .selectAll("line.grid")
    .data(yTicks)
    .join("line")
    .attr("x1", 0)
    .attr("x2", plotW)
    .attr("y1", v => y(v))
    .attr("y2", v => y(v))
    .attr("stroke", t.border);
  plot
    .selectAll("text.grid")
    .data(yTicks)
    .join("text")
    .attr("class", "fig-axis")
    .attr("x", -8)
    .attr("y", v => y(v) + 3)
    .attr("text-anchor", "end")
    .text(v => format(v, f));
  // Ticks only where data exists when the axis is dates: no invented months.
  const xTicks = dated ? [...new Set(xs)].sort((a, b) => a - b) : x.ticks(5);
  let lastX = -Infinity,
    row = 0;
  const tickRow = xTicks.map(v => {
    const px = x(v);
    row = px - lastX < 64 ? 1 - row : 0;
    lastX = px;
    return row;
  });
  plot
    .selectAll("text.xt")
    .data(xTicks)
    .join("text")
    .attr("class", "fig-axis")
    .attr("x", v => x(v))
    .attr("y", (_v, i) => plotH + 18 + tickRow[i] * 12)
    .attr("text-anchor", "middle")
    .text(v => xText(v));
  if (d.xLabel)
    plot
      .append("text")
      .attr("class", "fig-axis")
      .attr("x", plotW / 2)
      .attr("y", plotH + 34 + (tickRow.some(Boolean) ? 12 : 0))
      .attr("text-anchor", "middle")
      .text(d.xLabel);

  if (d.guide) {
    const k = d.guide.k;
    const [x0, x1] = x.domain();
    const N = 80;
    const pts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const gx = x0 + ((x1 - x0) * i) / N;
      if (gx <= 0) continue;
      pts.push(`${pts.length ? "L" : "M"}${x(gx)},${y(k / gx)}`);
    }
    plot
      .append("path")
      .attr("d", pts.join(" "))
      .attr("fill", "none")
      .attr("stroke", t.muted)
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4 4");
  }

  d.entities.forEach((e, i) => {
    const color = e.emphasis === false ? DEEMPHASIS : SERIES[i % SERIES.length];
    const pts = [...e.points].sort((a, b) => xv(a) - xv(b));
    if (pts.length > 1)
      plot
        .append("path")
        .attr(
          "d",
          pts
            .map((p, k) => `${k ? "L" : "M"}${x(xv(p))},${y(p.value)}`)
            .join(" ")
        )
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2);
    plot
      .selectAll(`circle.e${i}`)
      .data(pts)
      .join("circle")
      .attr("cx", p => x(xv(p)))
      .attr("cy", p => y(p.value))
      .attr("r", 5)
      .attr("fill", color)
      .attr("stroke", t.surface)
      .attr("stroke-width", 2)
      .on("mousemove", (event: MouseEvent, p: Point) =>
        showTip(
          `<strong>${e.name}</strong> · ${xText(xv(p))}<br>${format(p.value, f)}${
            p.note ? `<br><span class="fig-tip-muted">${p.note}</span>` : ""
          }`,
          event
        )
      )
      .on("mouseleave", hideTip);
    // Direct labels on every point when there are few; the endpoint otherwise.
    const labelled = pts.length <= 3 ? pts : [pts[pts.length - 1]];
    plot
      .selectAll(`text.l${i}`)
      .data(labelled)
      .join("text")
      .attr("class", "fig-label")
      .attr("x", p => x(xv(p)) + 8)
      .attr("y", p => y(p.value) - 9)
      .style("fill", color)
      .text(p => format(p.value, f));
  });
  if (d.entities.length > 1)
    legend(
      node,
      d.entities.map((e, i) => ({
        label: e.name,
        swatch: e.emphasis === false ? DEEMPHASIS : SERIES[i % SERIES.length],
      }))
    );
}

/* -------------------------------------------------------------- timeline */

type Event = { date: string; label: string; shipped: boolean; detail?: string };
type Lane = { name: string; events: Event[] };

type TimelineSpec = Base & {
  type: "timeline";
  start: string;
  end: string;
  lanes: Lane[];
};

function timeline(node: Element, d: TimelineSpec) {
  const t = theme();
  const w = 680,
    laneH = 78,
    padT = 24,
    padB = 30,
    padL = 110,
    padR = 24;
  const plotW = w - padL - padR;
  const h = padT + d.lanes.length * laneH + padB;
  const x = scaleLinear()
    .domain([monthIndex(d.start), monthIndex(d.end)])
    .range([0, plotW]);

  const svg = svgIn(
    node,
    w,
    h,
    `${d.title}. ` +
      d.lanes
        .map(
          l =>
            `${l.name}: ` +
            l.events
              .map(
                e =>
                  `${monthLabel(e.date)} ${e.label}${e.shipped ? "" : " (announced)"}`
              )
              .join(", ")
        )
        .join("; ")
  );
  // Year and quarter ticks along the top.
  const months: number[] = [];
  for (let m = monthIndex(d.start); m <= monthIndex(d.end); m++)
    if (m % 3 === 0) months.push(m);
  // Quarter labels need about 60px each; past that, label years only.
  const yearsOnly = x(3) - x(0) < 60;
  const tickText = (m: number) =>
    yearsOnly
      ? m % 12 === 0
        ? String(Math.floor(m / 12))
        : ""
      : `${["Q1", "Q2", "Q3", "Q4"][(m % 12) / 3]} ${Math.floor(m / 12)}`;
  svg
    .selectAll("line.q")
    .data(months)
    .join("line")
    .attr("x1", m => padL + x(m))
    .attr("x2", m => padL + x(m))
    .attr("y1", padT - 4)
    .attr("y2", padT + d.lanes.length * laneH)
    .attr("stroke", t.border);
  svg
    .selectAll("text.q")
    .data(months)
    .join("text")
    .attr("class", "fig-axis")
    .attr("x", m => padL + x(m) + 3)
    .attr("y", padT - 8)
    .text(tickText);

  d.lanes.forEach((l, li) => {
    const y0 = padT + li * laneH;
    svg
      .append("text")
      .attr("class", "fig-label")
      .attr("x", padL - 12)
      .attr("y", y0 + laneH / 2 + 4)
      .attr("text-anchor", "end")
      .attr("font-weight", 600)
      .text(l.name);
    svg
      .append("line")
      .attr("x1", padL)
      .attr("x2", padL + plotW)
      .attr("y1", y0 + laneH / 2)
      .attr("y2", y0 + laneH / 2)
      .attr("stroke", t.border);
    const color = SERIES[li % SERIES.length];
    const evs = [...l.events].sort(
      (a, b) => monthIndex(a.date) - monthIndex(b.date)
    );
    evs.forEach((e, k) => {
      const cx = padL + x(monthIndex(e.date));
      const cy = y0 + laneH / 2;
      // Alternate label rows so neighbours don't collide.
      const above = k % 2 === 0;
      const g = svg
        .append("g")
        .on("mousemove", (event: MouseEvent) =>
          showTip(
            `<strong>${e.label}</strong><br>${monthLabel(e.date)} · ${e.shipped ? "shipped" : "announced, not yet shipped"}${
              e.detail
                ? `<br><span class="fig-tip-muted">${e.detail}</span>`
                : ""
            }`,
            event
          )
        )
        .on("mouseleave", hideTip);
      g.append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", 6)
        .attr("fill", e.shipped ? color : t.surface)
        .attr("stroke", color)
        .attr("stroke-width", 2);
      g.append("line")
        .attr("x1", cx)
        .attr("x2", cx)
        .attr("y1", cy + (above ? -8 : 8))
        .attr("y2", cy + (above ? -18 : 18))
        .attr("stroke", t.border);
      const half = (e.label.length * 6) / 2;
      const anchor =
        cx - half < padL ? "start" : cx + half > w - padR ? "end" : "middle";
      g.append("text")
        .attr("class", "fig-axis")
        .attr("x", anchor === "start" ? padL : anchor === "end" ? w - padR : cx)
        .attr("y", cy + (above ? -22 : 30))
        .attr("text-anchor", anchor)
        .style("fill", t.fg)
        .text(e.label);
    });
  });
  legend(node, [
    { label: "Shipped", swatch: t.accent },
    { label: "Announced, not yet shipped", swatch: t.accent, hatched: true },
  ]);
}

/* ---------------------------------------------------------------- matrix */

type MatrixSpec = Base & {
  type: "matrix";
  columns: string[];
  rows: {
    label: string;
    cells: (string | null)[];
    emphasis?: boolean;
    note?: string;
  }[];
};

function matrix(node: Element, d: MatrixSpec) {
  const t = theme();
  const w = 680,
    rowH = 34,
    headH = 30,
    padL = 172;
  const colW = (w - padL) / d.columns.length;
  const h = headH + d.rows.length * rowH + 8;
  const svg = svgIn(
    node,
    w,
    h,
    `${d.title}. ` +
      d.rows
        .map(
          r =>
            `${r.label}: ` +
            r.cells
              .map((c, i) => `${d.columns[i]} ${c ?? "not published"}`)
              .join(", ")
        )
        .join("; ")
  );
  svg
    .selectAll("text.col")
    .data(d.columns)
    .join("text")
    .attr("class", "fig-axis")
    .attr("x", (_c, i) => padL + i * colW + colW / 2)
    .attr("y", 18)
    .attr("text-anchor", "middle")
    .style("fill", t.fg)
    .text(c => c);
  d.rows.forEach((r, ri) => {
    const y0 = headH + ri * rowH;
    svg
      .append("line")
      .attr("x1", 0)
      .attr("x2", w)
      .attr("y1", y0)
      .attr("y2", y0)
      .attr("stroke", t.border);
    svg
      .append("text")
      .attr("class", "fig-label")
      .attr("x", padL - 12)
      .attr("y", y0 + rowH / 2 + 4)
      .attr("text-anchor", "end")
      .attr("font-weight", r.emphasis ? 600 : 400)
      .text(r.label);
    r.cells.forEach((c, ci) => {
      const cx = padL + ci * colW + colW / 2;
      const g = svg
        .append("g")
        .on("mousemove", (event: MouseEvent) =>
          showTip(
            `<strong>${r.label}</strong> · ${d.columns[ci]}<br>${c ?? "Not published"}${
              r.note ? `<br><span class="fig-tip-muted">${r.note}</span>` : ""
            }`,
            event
          )
        )
        .on("mouseleave", hideTip);
      g.append("rect")
        .attr("x", padL + ci * colW + 2)
        .attr("y", y0 + 4)
        .attr("width", colW - 4)
        .attr("height", rowH - 8)
        .attr("rx", 4)
        .attr("fill", c ? `${t.accent}14` : "transparent")
        .attr("stroke", c ? "none" : t.border)
        .attr("stroke-dasharray", c ? null : "3 3");
      g.append("text")
        .attr("class", "fig-axis")
        .attr("x", cx)
        .attr("y", y0 + rowH / 2 + 4)
        .attr("text-anchor", "middle")
        .style("fill", c ? t.fg : t.muted)
        .attr("font-style", c ? "normal" : "italic")
        .text(c ?? "not published");
    });
  });
}

/* ----------------------------------------------------------------- curve */

/**
 * A model, not a measurement. The memo's argument is that a service-robot
 * business flips sign somewhere between one and ten robots per operator, and
 * that no public number places the company on that axis. So the chart shows
 * the curve and deliberately draws no marker on it.
 */
type CurveSpec = Base & {
  type: "curve";
  price: number;
  scenarios: { name: string; operatorCost: number }[];
  service: {
    label: string;
    min: number;
    max: number;
    default: number;
    step: number;
  };
  ratio: { min: number; max: number };
};

function curve(node: Element, d: CurveSpec) {
  const t = theme();
  const w = 680,
    h = 300,
    padT = 20,
    padB = 44,
    padL = 70,
    padR = 150;
  const plotW = w - padL - padR,
    plotH = h - padT - padB;

  const controls = document.createElement("div");
  controls.className = "fig-controls";
  const lab = document.createElement("label");
  lab.textContent = d.service.label;
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(d.service.min);
  input.max = String(d.service.max);
  input.step = String(d.service.step);
  input.value = String(d.service.default);
  const val = document.createElement("span");
  val.className = "fig-value";
  controls.append(lab, input, val);
  node.appendChild(controls);

  const svg = svgIn(node, w, h, `${d.title}. A sensitivity model, not data.`);
  const plot = svg.append("g").attr("transform", `translate(${padL},${padT})`);
  const x = scaleLinear().domain([d.ratio.min, d.ratio.max]).range([0, plotW]);
  const margin = (ratio: number, op: number, svc: number) =>
    d.price - op / ratio - svc;
  const yMin = Math.min(
    ...d.scenarios.map(s => margin(d.ratio.min, s.operatorCost, d.service.max))
  );
  const y = scaleLinear().domain([yMin, d.price]).range([plotH, 0]).nice();

  const yt = y.ticks(5);
  plot
    .selectAll("line.grid")
    .data(yt)
    .join("line")
    .attr("x1", 0)
    .attr("x2", plotW)
    .attr("y1", v => y(v))
    .attr("y2", v => y(v))
    .attr("stroke", v => (v === 0 ? t.muted : t.border))
    .attr("stroke-width", v => (v === 0 ? 1.5 : 1));
  plot
    .selectAll("text.grid")
    .data(yt)
    .join("text")
    .attr("class", "fig-axis")
    .attr("x", -8)
    .attr("y", v => y(v) + 3)
    .attr("text-anchor", "end")
    .text(v => money(v));
  const xt = x.ticks(d.ratio.max - d.ratio.min);
  plot
    .selectAll("text.x")
    .data(xt)
    .join("text")
    .attr("class", "fig-axis")
    .attr("x", v => x(v))
    .attr("y", plotH + 18)
    .attr("text-anchor", "middle")
    .text(v => String(v));
  plot
    .append("text")
    .attr("class", "fig-axis")
    .attr("x", plotW / 2)
    .attr("y", plotH + 34)
    .attr("text-anchor", "middle")
    .text("robots per operator");

  const paths = d.scenarios.map((_s, i) =>
    plot
      .append("path")
      .attr("fill", "none")
      .attr("stroke", SERIES[i % SERIES.length])
      .attr("stroke-width", 2)
  );
  const cross = d.scenarios.map((_s, i) =>
    plot
      .append("circle")
      .attr("r", 4)
      .attr("fill", t.surface)
      .attr("stroke", SERIES[i % SERIES.length])
      .attr("stroke-width", 2)
  );

  function draw(svc: number) {
    val.textContent = `${money(svc)} per robot-year`;
    const N = 60;
    d.scenarios.forEach((s, i) => {
      const pts: [number, number][] = [];
      for (let k = 0; k <= N; k++) {
        const r = d.ratio.min + ((d.ratio.max - d.ratio.min) * k) / N;
        pts.push([x(r), y(margin(r, s.operatorCost, svc))]);
      }
      paths[i].attr(
        "d",
        pts.map((p, k) => `${k ? "L" : "M"}${p[0]},${p[1]}`).join(" ")
      );
      // Where this scenario crosses zero.
      const be = s.operatorCost / (d.price - svc);
      const visible = be >= d.ratio.min && be <= d.ratio.max;
      cross[i]
        .attr("cx", x(Math.min(Math.max(be, d.ratio.min), d.ratio.max)))
        .attr("cy", y(0))
        .attr("opacity", visible ? 1 : 0);
    });
  }
  input.addEventListener("input", () => draw(Number(input.value)));
  draw(d.service.default);

  legend(
    node,
    d.scenarios.map((s, i) => ({
      label: `${s.name} (${money(s.operatorCost)} per operator)`,
      swatch: SERIES[i % SERIES.length],
    }))
  );
}

/* -------------------------------------------------------------- dispatch */

type Spec =
  | BarsSpec
  | ColumnsSpec
  | DotsSpec
  | SeriesSpec
  | TimelineSpec
  | MatrixSpec
  | CurveSpec;

export async function ventureFigure(node: Element, name: string) {
  const spec = await json<Spec>(`data/ventures/${name}.json`);
  node.classList.add("fig-venture");
  heading(node, spec);
  switch (spec.type) {
    case "bars":
      bars(node, spec);
      break;
    case "columns":
      columns(node, spec);
      break;
    case "dots":
      dots(node, spec);
      break;
    case "series":
      series(node, spec);
      break;
    case "timeline":
      timeline(node, spec);
      break;
    case "matrix":
      matrix(node, spec);
      break;
    case "curve":
      curve(node, spec);
      break;
  }
  footer(node, spec);
}

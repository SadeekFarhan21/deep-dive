/**
 * D3 figures for the technical posts. Shared plumbing lives in figure-kit.ts;
 * the venture memos' charts live in venture-figures.ts and dispatch from here.
 *
 * A post drops a placeholder into its markdown:
 *
 *   <figure data-figure="induction-heatmap"></figure>
 *
 * and this module fills it in. The numbers come from /data/*.json, written by the
 * generator script in each project repo (projects/<name>/figures/make_figures.py),
 * so a figure can never drift from the run that produced it.
 */
import { select } from "d3-selection";
import { scaleLinear, scaleSequential } from "d3-scale";
import { interpolateRgb } from "d3-interpolate";
import { max } from "d3-array";
import { theme, fmt, showTip, hideTip, caption, json } from "./figure-kit";
import { ventureFigure } from "./venture-figures";

/* ---------------------------------------------------------------- heatmap */

type Cell = { layer: number; head: number; score: number };

type Scores = {
  n_layers: number;
  n_heads: number;
  gap: number;
  measurement: string;
  canonical: { layer: number; head: number }[];
  scores: Cell[];
};

async function inductionHeatmap(node: Element) {
  const d = await json<Scores>("data/induction-scores.json");
  const t = theme();
  const cell = 30,
    gapPx = 3,
    padL = 40,
    padT = 24,
    legendW = 86;
  const w = padL + d.n_heads * (cell + gapPx) + legendW;
  const h = padT + d.n_layers * (cell + gapPx) + 26;

  const hi = max(d.scores, (s: Cell) => s.score) ?? 1;
  const color = scaleSequential<string>(
    interpolateRgb("#eef3f7", t.accent)
  ).domain([0, hi]);
  const isCanonical = new Set(d.canonical.map(c => `${c.layer}-${c.head}`));

  const svg = select(node)
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .attr("width", "100%")
    .attr("role", "img")
    .attr(
      "aria-label",
      `Induction score for all ${d.scores.length} attention heads of GPT-2 small, by layer and head. ` +
        `The five canonical induction heads score above 0.80; the next head scores 0.517.`
    );

  // axis labels
  for (let head = 0; head < d.n_heads; head++) {
    svg
      .append("text")
      .attr("x", padL + head * (cell + gapPx) + cell / 2)
      .attr("y", padT - 8)
      .attr("text-anchor", "middle")
      .attr("class", "fig-axis")
      .text(head);
  }
  for (let layer = 0; layer < d.n_layers; layer++) {
    svg
      .append("text")
      .attr("x", padL - 10)
      .attr("y", padT + layer * (cell + gapPx) + cell / 2 + 4)
      .attr("text-anchor", "end")
      .attr("class", "fig-axis")
      .text(`L${layer}`);
  }

  svg
    .selectAll<SVGRectElement, Cell>("rect.cell")
    .data(d.scores)
    .join("rect")
    .attr("class", "cell")
    .attr("x", (s: Cell) => padL + s.head * (cell + gapPx))
    .attr("y", (s: Cell) => padT + s.layer * (cell + gapPx))
    .attr("width", cell)
    .attr("height", cell)
    .attr("rx", 3)
    .attr("fill", (s: Cell) => color(s.score))
    .attr("stroke", (s: Cell) =>
      isCanonical.has(`${s.layer}-${s.head}`) ? t.fg : "transparent"
    )
    .attr("stroke-width", 1.75)
    .on("mousemove", (event: MouseEvent, s: Cell) =>
      showTip(
        `<strong>L${s.layer}H${s.head}</strong><br>induction score ${s.score.toFixed(3)}` +
          (isCanonical.has(`${s.layer}-${s.head}`)
            ? "<br><em>canonical induction head</em>"
            : ""),
        event
      )
    )
    .on("mouseleave", hideTip);

  // sequential legend
  const lx = padL + d.n_heads * (cell + gapPx) + 22;
  const lh = 132;
  const grad = svg
    .append("defs")
    .append("linearGradient")
    .attr("id", "fig-ramp")
    .attr("x1", "0")
    .attr("y1", "1")
    .attr("x2", "0")
    .attr("y2", "0");
  for (let i = 0; i <= 10; i++)
    grad
      .append("stop")
      .attr("offset", `${i * 10}%`)
      .attr("stop-color", color((hi * i) / 10));
  svg
    .append("rect")
    .attr("x", lx)
    .attr("y", padT)
    .attr("width", 11)
    .attr("height", lh)
    .attr("rx", 2)
    .attr("fill", "url(#fig-ramp)")
    .attr("stroke", t.border);
  (
    [
      [0, hi],
      [0.5, hi / 2],
      [1, 0],
    ] as [number, number][]
  ).forEach(([pos, val]) =>
    svg
      .append("text")
      .attr("x", lx + 17)
      .attr("y", padT + pos * lh + 4)
      .attr("class", "fig-axis")
      .text(val.toFixed(2))
  );

  caption(
    node,
    `Induction score for every head in GPT-2 small, ${d.measurement}. Outlined cells are the five heads the literature names. Hover for exact scores.`
  );
}

/* ----------------------------------------------------------- ranked heads */

async function inductionRanked(node: Element) {
  const d = await json<Scores>("data/induction-scores.json");
  const t = theme();
  const rows = [...d.scores].sort((a, b) => b.score - a.score).slice(0, 14);
  const rowH = 24,
    padT = 14,
    padL = 62,
    padR = 92;
  const w = 640;
  const h = padT + rows.length * rowH + 14;
  const x = scaleLinear()
    .domain([0, rows[0].score])
    .range([0, w - padL - padR]);

  const svg = select(node)
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .attr("width", "100%")
    .attr("role", "img")
    .attr(
      "aria-label",
      `The fourteen highest-scoring heads. The top five score ${rows[4].score.toFixed(3)} to ${rows[0].score.toFixed(3)}; the sixth scores ${rows[5].score.toFixed(3)}, a gap of ${d.gap.toFixed(3)}.`
    );

  const g = svg
    .selectAll<SVGGElement, Cell>("g.row")
    .data(rows)
    .join("g")
    .attr("class", "row")
    .attr(
      "transform",
      (_d: Cell, i: number) => `translate(0,${padT + i * rowH})`
    )
    .on("mousemove", (event: MouseEvent, s: Cell) =>
      showTip(
        `<strong>L${s.layer}H${s.head}</strong><br>induction score ${s.score.toFixed(3)}`,
        event
      )
    )
    .on("mouseleave", hideTip);

  g.append("rect") // hit target, wider than the mark
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", w)
    .attr("height", rowH)
    .attr("fill", "transparent");
  g.append("text")
    .attr("x", padL - 10)
    .attr("y", 15)
    .attr("text-anchor", "end")
    .attr("class", (_d: Cell, i: number) => (i < 5 ? "fig-label" : "fig-axis"))
    .text((s: Cell) => `L${s.layer}H${s.head}`);
  g.append("rect")
    .attr("x", padL)
    .attr("y", 4)
    .attr("width", (s: Cell) => x(s.score))
    .attr("height", 13)
    .attr("rx", 4)
    .attr("fill", (_d: Cell, i: number) => (i < 5 ? t.accent : "#c9d7e2"));
  g.append("text")
    .attr("x", (s: Cell) => padL + x(s.score) + 8)
    .attr("y", 15)
    .attr("class", (_d: Cell, i: number) => (i < 5 ? "fig-label" : "fig-axis"))
    .text((s: Cell) => s.score.toFixed(3));

  const gy = padT + 5 * rowH - 3;
  svg
    .append("line")
    .attr("x1", padL - 46)
    .attr("x2", w - 30)
    .attr("y1", gy)
    .attr("y2", gy)
    .attr("stroke", t.fg)
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3 3");
  svg
    .append("text")
    .attr("x", w - 30)
    .attr("y", gy - 6)
    .attr("text-anchor", "end")
    .attr("class", "fig-label")
    .text(`gap of ${d.gap.toFixed(3)}`);

  caption(
    node,
    `The top five heads and the drop below them. The ${d.gap.toFixed(3)} gap after rank 5 is what makes "the induction heads" a set rather than a cutoff someone chose.`
  );
}

/* -------------------------------------------------------- parameter budget */

type Group = {
  label: string;
  params: number;
  share: number;
  vocab_bound: boolean;
};

type Params = {
  total_params: number;
  final_loss: number;
  config: Record<string, number>;
  groups: Group[];
};

async function gptParameters(node: Element) {
  const d = await json<Params>("data/gpt-parameters.json");
  const t = theme();
  const rowH = 30,
    padT = 12,
    padL = 132,
    padR = 150;
  const w = 660;
  const h = padT + d.groups.length * rowH + 12;
  const x = scaleLinear()
    .domain([0, max(d.groups, (g: Group) => g.params) ?? 1])
    .range([0, w - padL - padR]);

  const svg = select(node)
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .attr("width", "100%")
    .attr("role", "img")
    .attr(
      "aria-label",
      `Parameter budget of the ${fmt.format(d.total_params)} parameter model by component. ` +
        d.groups
          .map((g: Group) => `${g.label} ${fmt.format(g.params)}, ${g.share}%`)
          .join("; ")
    );

  const g = svg
    .selectAll<SVGGElement, Group>("g.row")
    .data(d.groups)
    .join("g")
    .attr(
      "transform",
      (_d: Group, i: number) => `translate(0,${padT + i * rowH})`
    )
    .on("mousemove", (event: MouseEvent, r: Group) =>
      showTip(
        `<strong>${r.label}</strong><br>${fmt.format(r.params)} parameters<br>${r.share}% of the model`,
        event
      )
    )
    .on("mouseleave", hideTip);

  g.append("rect")
    .attr("width", w)
    .attr("height", rowH)
    .attr("fill", "transparent");
  g.append("text")
    .attr("x", padL - 12)
    .attr("y", 17)
    .attr("text-anchor", "end")
    .attr("class", "fig-label")
    .text((r: Group) => r.label);
  g.append("rect")
    .attr("x", padL)
    .attr("y", 4)
    .attr("width", (r: Group) => x(r.params))
    .attr("height", 15)
    .attr("rx", 4)
    .attr("fill", (r: Group) => (r.vocab_bound ? "#8fb8d0" : t.accent));
  g.append("text")
    .attr("x", (r: Group) => padL + x(r.params) + 10)
    .attr("y", 17)
    .attr("class", "fig-label")
    .text((r: Group) => `${fmt.format(r.params)} · ${r.share.toFixed(1)}%`);

  caption(
    node,
    `Where the ${fmt.format(d.total_params)} parameters sit, read from the shipped checkpoint (${d.config.n_layers} blocks, ${d.config.num_heads} heads, d_model ${d.config.n_embed}, vocab ${d.config.vocab_size}). Lighter bars are the two vocabulary-bound tensors; the MLPs hold more than the attention they surround.`
  );
}

/* ------------------------------------------------- GRPO advantage explorer */

/**
 * Not a measurement: this is the GRPO advantage definition evaluated for a group
 * of 8 rollouts, k of them correct. It shows the post's claim directly: the
 * signal is the within-group spread, so it vanishes at k=0 and k=8 alike.
 */
function grpoAdvantage(node: Element) {
  const t = theme();
  const G = 8;
  const w = 660,
    h = 232;
  // The control row sits above the chart it drives.
  const controls = document.createElement("div");
  controls.className = "fig-controls";
  node.appendChild(controls);
  const svg = select(node)
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .attr("width", "100%")
    .attr("role", "img")
    .attr(
      "aria-label",
      "GRPO advantages for a group of eight rollouts as the number of correct rollouts varies. " +
        "At zero correct and at eight correct the rewards are identical, the standard deviation is zero, and every advantage is zero."
    );

  const input = document.createElement("input");
  input.type = "range";
  input.min = "0";
  input.max = String(G);
  input.step = "1";
  input.value = "3";
  input.setAttribute("aria-label", "Rollouts solved correctly, out of 8");
  const readout = document.createElement("span");
  controls.append(
    Object.assign(document.createElement("label"), {
      textContent: "correct rollouts",
    }),
    input,
    readout
  );

  const padL = 132;
  const x = scaleLinear()
    .domain([0, G - 1])
    .range([padL, w - 150]);
  const yReward = 74;
  const yAdv = 168;

  svg
    .append("text")
    .attr("x", padL - 14)
    .attr("y", yReward + 4)
    .attr("text-anchor", "end")
    .attr("class", "fig-label")
    .text("reward");
  svg
    .append("text")
    .attr("x", padL - 14)
    .attr("y", yAdv + 4)
    .attr("text-anchor", "end")
    .attr("class", "fig-label")
    .text("advantage");
  svg
    .append("line")
    .attr("x1", padL - 6)
    .attr("x2", w - 140)
    .attr("y1", yAdv)
    .attr("y2", yAdv)
    .attr("stroke", t.border);

  const legend = svg.append("g");
  legend
    .append("circle")
    .attr("cx", padL)
    .attr("cy", 24)
    .attr("r", 6)
    .attr("fill", t.accent);
  legend
    .append("text")
    .attr("x", padL + 12)
    .attr("y", 28)
    .attr("class", "fig-axis")
    .text("solved (reward 1)");
  legend
    .append("circle")
    .attr("cx", padL + 138)
    .attr("cy", 24)
    .attr("r", 6)
    .attr("fill", t.surface)
    .attr("stroke", "#b9c3cc")
    .attr("stroke-width", 1.5);
  legend
    .append("text")
    .attr("x", padL + 150)
    .attr("y", 28)
    .attr("class", "fig-axis")
    .text("failed (reward 0)");

  const rewardG = svg.append("g");
  const advG = svg.append("g");
  const note = svg
    .append("text")
    .attr("x", w - 132)
    .attr("y", yReward - 18)
    .attr("class", "fig-label");
  const note2 = svg
    .append("text")
    .attr("x", w - 132)
    .attr("y", yReward + 2)
    .attr("class", "fig-axis");
  const note3 = svg
    .append("text")
    .attr("x", w - 132)
    .attr("y", yReward + 20)
    .attr("class", "fig-axis");

  function draw(k: number) {
    const rewards: number[] = Array.from({ length: G }, (_, i) =>
      i < k ? 1 : 0
    );
    const mean = rewards.reduce((a: number, b: number) => a + b, 0) / G;
    const variance =
      rewards.reduce((a: number, r: number) => a + (r - mean) ** 2, 0) / G;
    const std = Math.sqrt(variance);
    const adv: number[] = rewards.map(r => (std === 0 ? 0 : (r - mean) / std));

    readout.textContent = `${k} of ${G}`;

    rewardG
      .selectAll<SVGCircleElement, number>("circle")
      .data(rewards)
      .join("circle")
      .attr("cx", (_d: number, i: number) => x(i))
      .attr("cy", yReward)
      .attr("r", 9)
      .attr("fill", (r: number) => (r === 1 ? t.accent : t.surface))
      .attr("stroke", (r: number) => (r === 1 ? t.accent : "#b9c3cc"))
      .attr("stroke-width", 1.5);

    const scale = 34;
    advG
      .selectAll<SVGRectElement, number>("rect")
      .data(adv)
      .join("rect")
      .attr("x", (_d: number, i: number) => x(i) - 9)
      .attr("width", 18)
      .attr("rx", 3)
      .attr("y", (a: number) => (a >= 0 ? yAdv - a * scale : yAdv))
      .attr("height", (a: number) =>
        Math.max(Math.abs(a) * scale, a === 0 ? 2 : 0)
      )
      .attr("fill", (a: number) =>
        a === 0 ? "#c9d7e2" : a > 0 ? t.accent : "#e08a5a"
      );

    note.text(`reward std ${std.toFixed(2)}`);
    const dead = std === 0;
    note2.text(dead ? "every advantage is 0" : "gradient is non-zero");
    note3.text(dead ? (k === 0 ? "too hard" : "too easy") : "");
    note2.attr("fill", dead ? t.fg : t.muted);
  }

  input.addEventListener("input", () => draw(Number(input.value)));
  draw(3);

  caption(
    node,
    "Not a measurement: the GRPO advantage definition evaluated over one group of 8 rollouts. " +
      "Drag the slider to 0 or to 8. The rewards differ completely, the advantages are identical, and both produce no gradient. " +
      "That is why 'too easy' and 'too hard' look the same from outside the reward function."
  );
}

/* ---------------------------------------------------------------- dispatch */

const FIGURES: Record<string, (node: Element) => void | Promise<void>> = {
  "induction-heatmap": inductionHeatmap,
  "induction-ranked": inductionRanked,
  "gpt-parameters": gptParameters,
  "grpo-advantage": grpoAdvantage,
};

function render() {
  document.querySelectorAll<HTMLElement>("[data-figure]").forEach(node => {
    if (node.dataset.rendered) return;
    const name = node.dataset.figure ?? "";
    const fn = name.startsWith("venture:")
      ? (n: Element) => ventureFigure(n, name.slice("venture:".length))
      : FIGURES[name];
    if (!fn) return;
    node.dataset.rendered = "1";
    node.classList.add("fig");
    Promise.resolve(fn(node)).catch(err => {
      // Leave the post readable: every figure restates numbers the prose already has.
      node.dataset.rendered = "";
      console.error(`[figure:${name}]`, err);
    });
  });
}

document.addEventListener("astro:page-load", render);
render();

# tiny-circuits

A reproducible mechanistic-interpretability study of **GPT-2 small** (124M),
built with [TransformerLens](https://github.com/TransformerLensOrg/TransformerLens).

**Research question:** *How does GPT-2 small implement in-context copying?*
We reverse-engineer the **induction circuit** end to end — discovery, causal
localization, weight-level mechanism, and ablation — then extend to the IOI
circuit as a second case study.

## Setup

```bash
uv sync
uv run python experiments/01_induction_scores.py
```

Runs locally on Apple Silicon (MPS), CUDA, or CPU. No API keys required.

## Experiments

Each script is self-contained and writes figures to `figures/` and tables to
`results/`, so the paper is fully reproducible from source.

| # | Script | Question | Status |
|---|--------|----------|--------|
| 01 | `experiments/01_induction_scores.py` | Which heads are induction heads? | ✅ |
| 02 | `experiments/02_attention_viz.py` | What do the top heads attend to? | ⏳ |
| 03 | `experiments/03_activation_patching.py` | Which components are *causally* responsible? | ⏳ |
| 04 | `experiments/04_prev_token_heads.py` | Which L0 heads feed the induction heads? | ⏳ |
| 05 | `experiments/05_qk_ov_analysis.py` | Do the weights show attend-back + copy? | ⏳ |
| 06 | `experiments/06_ablation.py` | Are these heads necessary? | ⏳ |

## Findings so far

- Top induction heads (induction score): **L5H5, L6H9, L5H1, L7H10, L7H2** —
  matching the canonical results in the literature, validating the pipeline.

## Layout

```
src/tiny_circuits/   shared utilities (model loading, metrics)
experiments/         numbered, reproducible experiment scripts
figures/  results/   generated outputs (committed for the writeup)
paper/               the writeup itself
notebooks/           scratch exploration
```

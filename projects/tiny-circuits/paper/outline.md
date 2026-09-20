# Reverse-engineering the induction circuit in GPT-2 small

> Working outline. Each section names the experiment(s) that produce its evidence.

## Abstract
One paragraph: we locate GPT-2 small's induction heads, prove their causal role
in in-context copying, verify the QK (attend-back) and OV (copy) mechanisms from
the weights, and confirm necessity by ablation.

## 1. Introduction
- What in-context learning / induction is, and why it matters.
- Contribution: a fully reproducible, laptop-scale walkthrough of one circuit.

## 2. Background
- Residual stream view of the transformer; reading/writing to it.
- Attention head decomposition: QK circuit (where to attend) vs OV circuit
  (what to move). Composition across layers.
- The induction motif: prev-token head (L0) -> induction head (L5-7).

## 3. Setup & reproducibility  [src/tiny_circuits/model.py]
- Model: GPT-2 small via TransformerLens, standard weight processing.
- Metric: logit difference on the repeated-token / copy task.
- Hardware: single Apple Silicon laptop (MPS).

## 4. Discovery  [exp 01, 02]
- Induction score per head -> heatmap (Fig 1). Top heads: L5H5, L6H9, L5H1,
  L7H10, L7H2.
- Attention-pattern visualization confirms the attend-back diagonal (Fig 2).

## 5. Causal localization  [exp 03]
- Activation patching (clean vs corrupted repeated sequence): which
  layer/position/head recovers the logit difference (Fig 3).
- Path patching to isolate the prev-token -> induction edge.

## 6. The upstream heads  [exp 04]
- Identify L0 previous-token heads feeding the induction heads.

## 7. Mechanism from the weights  [exp 05]
- OV circuit: is it a copy matrix? (eigenvalue / diagonal dominance of W_U W_OV W_E)
- QK circuit: does it implement "attend to the token after a match"?
- Direct logit attribution of the induction heads.

## 8. Necessity  [exp 06]
- Zero / mean ablation of the induction heads -> collapse of the copy behavior.
- Head knockout sweep.

## 9. Case study: IOI (stretch)
- Apply the same toolbox to indirect-object identification.

## 10. Limitations & discussion
- What "understanding a circuit" does and doesn't establish.
- Superposition / features not addressed here.

## Reproducibility
Every figure regenerates via `uv run python experiments/NN_*.py`.

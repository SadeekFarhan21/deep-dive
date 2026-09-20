---
title: "Locating GPT-2's induction heads, and what locating does not prove"
pubDatetime: 2026-09-20T06:34:47.000Z
description: "We score all 144 attention heads in GPT-2 small on the induction diagonal and recover the five canonical induction heads: L5H5 (0.905), L6H9 (0.896), L5H1 (0.886), L7H10 (0.886), L7H2 (0.806). The sixth head scores 0.517. The measurement is one cached forward pass on a laptop and it is the weakest evidence in the six-experiment plan it opens: an induction score is a correlation between an attention pattern and a behavior, and none of the causal experiments have been run."
slug: reverse-engineering-gpt-2s-induction-circuit
tags:
  - interpretability
  - transformers
  - research
draft: false
category: projects
---

We score all 144 attention heads of GPT-2 small on the induction diagonal and recover the five heads the literature names: **L5H5 (0.905), L6H9 (0.896), L5H1 (0.886), L7H10 (0.886), and L7H2 (0.806)**. The sixth-ranked head scores 0.517. That gap of 0.289 is what makes "the induction heads" a set rather than a cutoff someone chose.

The measurement is one cached forward pass over eight sequences of 101 tokens, and it runs in under a minute on an M4 Pro through MPS. No cluster, no API keys. The model is GPT-2 small (124M) via [TransformerLens](https://github.com/TransformerLensOrg/TransformerLens).

This is experiment 01 of six, and it is the weakest kind of evidence in the plan it opens. An induction score is a correlation between a head's attention pattern and a behavior. It cannot separate a head that performs in-context copying from a head that attends to the right position for some unrelated reason while another component does the copying. We report these scores as a validated instrument reading, not as a circuit claim. The four experiments that would make it a circuit claim are specified below and have not been run.

Code, figures, and result tables are in `projects/tiny-circuits`. Every figure and table is produced by a numbered script and regenerates with one command.

*Reading note:* the argument is the gap and what it does not license. The configuration details, the TransformerLens processing notes, and the experiment plan are self-contained — skip to [conclusions](#conclusions) if you only want the claim and its limits.

## table of contents

- [the behavior](#the-behavior)
- [why a repeated random sequence](#why-a-repeated-random-sequence)
- [the induction score](#the-induction-score)
- [results](#results)
- [what the gap means](#what-the-gap-means)
- [what the ranking does not establish](#what-the-ranking-does-not-establish)
- [the remaining five experiments](#the-remaining-five-experiments)
- [instrument notes](#instrument-notes)
- [reproducibility](#reproducibility)
- [conclusions](#conclusions)

## the behavior

Show a language model `... A B ... A` and it predicts `B`. It has not seen that pair in training; it learned the rule — look back for where this token last occurred, and emit whatever followed it. The standard argument is that this is the substrate of in-context learning generally, which is why the circuit that implements it is the usual first target.

The claimed implementation is two heads composed across layers:

1. A **previous-token head**, typically in layer 0, writes "the token before me was A" into each position's residual stream.
2. An **induction head**, in a middle layer, queries for that signature. It finds the position whose *previous* token matches the current token, and its OV circuit copies what that position holds into the output.

Two heads and one edge between them. Every part of that claim is separately testable, and this experiment tests the weakest part of it: whether heads exist whose attention goes where the story says it should.

<details class="collapsible-section">
<summary><strong>QK and OV: where a head attends versus what it moves</strong></summary>

An attention head factors into two circuits that can be analyzed separately, and the separation is what makes "which head does what" a tractable question.

The **QK circuit** decides *where* to attend. It is the bilinear form $W_Q W_K^{\top}$ acting on pairs of residual-stream vectors: given a query position and a key position, it produces the pre-softmax score. Everything about attention *placement* is in this matrix.

The **OV circuit** decides *what gets moved* once a position is attended to. It is $W_O W_V$, and composed with the embedding and unembedding it becomes $W_U W_{OV} W_E$ — a map from "the token at the attended position" to "the change in output logits." A head that copies is one whose OV circuit is approximately diagonal in token space: attending to token $t$ raises the logit of $t$.

The split matters for this project because an induction score only measures the QK side. It says the head looks in the right place. It says nothing about whether the OV side moves anything useful, which is why experiment 05 examines $W_U W_{OV} W_E$ directly from the weights.

</details>

## why a repeated random sequence

Measuring induction on natural text conflates the thing we want with three things we don't. A head that attends "correctly" on English may be exploiting grammar, semantics, or a memorized n-gram rather than repeat structure, and the attention pattern looks the same in all four cases.

The input removes every alternative by construction:

```python
rand = torch.randint(0, vocab, (batch, seq_len), generator=g)
tokens = torch.cat([bos, rand, rand], dim=1)
```

`[BOS][50 random tokens][the same 50 tokens]`. There is no grammar, no semantics, and no n-gram statistics worth exploiting. The only structure available is that the second half repeats the first, so a head scoring highly here cannot be scoring highly for a reason we failed to think of.

This is the load-bearing design decision in the experiment, and it is worth being explicit about what it buys and what it costs. It buys a clean reading: the score means one thing. It costs external validity — every conclusion below is about behavior on inputs GPT-2 never saw in training, and a head specialized for this diagonal on random tokens is not yet shown to do anything on English.

## the induction score

Under that construction, a head doing induction at position `i` in the second copy must attend to position `i - 50 + 1`: the token that followed the previous occurrence of the current token. That is one fixed diagonal of the attention pattern, so the score is the mean weight along it.

For a head with attention weights $A^{(b)}_{q,k}$ on sequence $b$ of length $2N+1$, the induction score is the mean weight on the induction diagonal, taken over the batch $B$ and over the $N-1$ query positions in the second copy:

$$
\text{score} = \frac{1}{|B|\,(N-1)}
\sum_{b \in B} \sum_{j=1}^{N-1} A^{(b)}_{\,1+N+j,\; 1+j}
$$

Query $1+N+j$ sits at offset $j$ into the repeated half; the key it must attend to is the token that *followed* the first occurrence, at position $1+j$. The difference between those indices is constant, which is why the whole measurement is one diagonal at offset $-(N-1)$:

```python
pattern = cache["pattern", layer]                     # [batch, head, query, key]
diag = pattern.diagonal(offset=-(seq_len - 1), dim1=-2, dim2=-1)
scores[layer] = diag.mean(dim=(0, -1))                # mean over batch and diagonal
```

Configuration: sequence length 50, batch 8, seed 1337, one cached forward pass, 144 numbers out.

We do not report an interval on these scores. With a single seed and a batch of 8, the run supports the ranking and the size of the rank-5 to rank-6 gap; it does not support the third decimal place. The per-head scores are stable across seeds in informal checks, but a seed sweep is a ten-line change that has not been run, so that stability is an impression rather than a measurement. Read the table as an ordering.

## results

| Head | Induction score |
| --- | --- |
| L5H5 | 0.905 |
| L6H9 | 0.896 |
| L5H1 | 0.886 |
| L7H10 | 0.886 |
| L7H2 | 0.806 |
| L10H1 | 0.517 |
| L9H6 | 0.503 |
| L9H9 | 0.494 |
| L10H7 | 0.459 |
| L5H0 | 0.425 |

## what the gap means

Attention is a probability distribution over the entire 101-token context. A score of 0.905 means L5H5 places about 90% of its attention mass on a single position, and that position is determined purely by a structural rule in an input with no content to attend to. This is not a tendency toward induction. It is a head that does one job.

Five heads sit above 0.80 and the sixth sits at 0.52. The 0.289 gap between rank 5 and rank 6 is the reason the set is well defined: no threshold has to be chosen, because the data separates. Had the scores decayed smoothly from 0.9 to 0.4, "the induction heads" would name whatever cutoff we picked, and every downstream experiment would inherit that arbitrariness.

The second feature of the table is location. The five heads sit in layers 5 through 7 of a 12-layer model: downstream of the layer-0 previous-token heads the circuit needs as input, with enough depth remaining to influence the output. The theory predicts where these heads should live, and that is where they are. A prediction that could have failed and did not is worth more than the scores themselves, because the scores were always going to be high for *something*.

## what the ranking does not establish

Everything above is consistent with the five heads being passengers. A head can attend to exactly the right position for an unrelated reason while some other component performs the copy, and no attention-pattern measurement can tell the difference. Four objections remain open:

| Objection | Experiment | Method |
| --- | --- | --- |
| Correlation, not causation | 03 | Activation patching, clean vs. corrupted repeated sequences |
| Composition is assumed, not shown | 04 | Path patching on the prev-token → induction edge |
| The behavior may be input-specific | 05 | Eigenvalues and diagonal dominance of `W_U W_OV W_E` |
| Other heads may be redundant backups | 06 | Zero and mean ablation, head knockout sweep |

The distinction between 03 and 05 is the one that matters most. Activation patching is a statement about this model on these inputs; showing that the OV circuit is approximately a copy matrix is a statement about the *parameters*, independent of whatever inputs we happened to construct. Input-level evidence and weight-level evidence fail in different ways, and a circuit claim is only strong when both hold.

Experiment 06 is the one most likely to produce an awkward result. Ablation studies in this literature routinely find that knocking out a "necessary" component degrades behavior far less than the discovery evidence suggests, because other heads absorb the loss. If that happens here it is a finding about the circuit rather than a defect in the measurement, but it would complicate the clean two-head story considerably. We would rather name that possibility now than after the fact.

## the remaining five experiments

The plan, with the evidence each step is meant to produce:

| Experiment | Question | Evidence it produces |
| --- | --- | --- |
| 02 | Does the attention pattern look the way the score implies? | Per-head attention visualization on the repeated sequence |
| 03 | Do these heads cause the copying? | Recovery of logit difference under activation patching |
| 04 | Is the prev-token → induction edge real? | Path patching isolating that specific edge |
| 05 | Is the OV circuit a copy matrix? | Spectrum and diagonal dominance of `W_U W_OV W_E` |
| 06 | Are the heads necessary? | Behavior collapse under zero and mean ablation |

Only 02 is a refinement of what is already measured. Experiments 03 through 06 are the ones that can overturn the reading above, and none of them has been run.

## instrument notes

<details class="collapsible-section">
<summary><strong>What TransformerLens changes about the model before you measure it</strong></summary>

TransformerLens loads GPT-2 with LayerNorm folding, centered writing weights, and centered unembedding on by default. These change the parameterization without changing the function the model computes, and they are what make residual-stream and logit-lens analysis clean. It is worth stating that they are on, because a score computed on an unprocessed model is not being compared against the same object the published results describe.

</details>

This is why reproducing a known result was the point of experiment 01 rather than a formality. L5H5 and L6H9 are in the literature; we did not find them, we recovered them, with our own metric implementation, our own input construction, and our own weight processing. A pipeline that recovers the canonical heads from scratch is a pipeline that can be pointed at questions with no answer key. That validation step is usually invisible in the write-up, and it is the step that decides whether any later number means anything.

## reproducibility

Every experiment is a self-contained numbered script with a documented research question. Figures and result tables are committed, are generated only by those scripts, and regenerate with:

```bash
uv run python experiments/01_induction_scores.py
```

Optional `--wandb` logs the run, the figure, and the score table. The environment is a `uv` project pinned to Python 3.12; the system Python is 3.14, which the interpretability stack does not yet support.

The constraint that every figure must come from a committed script has already caught two errors that a notebook would have hidden.

## conclusions

Had we stopped at the score table, this post would have told a circuit-discovery story. Recovering L5H5 and L6H9 with an independent implementation is a validated instrument reading and nothing more: it establishes that the measurement is correct on a case with a published answer, which is the precondition for trusting it anywhere else.

- The five-head set is sharply defined. The 0.289 gap between rank 5 and rank 6 is in the data, not in a chosen threshold.
- The heads sit in layers 5 through 7, where the composition story says they must. That prediction could have failed.
- Nothing here separates "these heads participate in induction" from "these heads cause induction." Patching and ablation separate them, and they are not run.
- The reported scores support an ordering, not three decimal places. No seed sweep has been run.
- Laptop-scale interpretability on a real pretrained model is genuinely accessible: the whole experiment is one cached forward pass over eight sequences of 101 tokens.

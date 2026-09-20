---
title: "Writing a 5.26M-parameter transformer by hand"
pubDatetime: 2026-09-18T15:04:52.000Z
description: "A decoder-only GPT built from scratch in PyTorch — no nn.Transformer, no fused attention, no HuggingFace — trained on TinyStories to a cross-entropy of 2.14 on a laptop. The loss is a receipt that the pipeline works, not a result: two load-bearing constants and two silent bugs."
slug: building-a-gpt-from-scratch
tags:
  - transformers
  - pytorch
draft: false
category: projects
---

We trained a decoder-only GPT written from scratch, with no `nn.Transformer`, no `F.scaled_dot_product_attention` and no HuggingFace model code, to a final cross-entropy of **2.14** on TinyStories, in 20,000 steps on a single Apple Silicon laptop. The shipped checkpoint is **5,263,848 parameters**: 6 pre-LN blocks, 8 heads, a 256-dimensional residual stream, a 64-token context, and a 1,000-token byte-level BPE vocabulary trained on the corpus itself.

The loss is not a result. It is a receipt: evidence that every stage of the pipeline, from tokenizer and cache through loader, model, loss and sampler, is wired correctly end to end, which was the entire goal. It is worth being precise about how weak a claim that is. The run consumed 20,000 × 8 × 64 = 10.2M tokens against a cached corpus of roughly 632M tokens, so the model saw about 1.6% of the available data in a single pass. It is undertrained by construction, and no comparison to any published loss is meaningful.

What the project did produce is a clear view of which lines are load-bearing. Two constants decide silently whether the model trains at all, and two bugs cost more time than the model code did.

Code is in `projects/gpt-from-scratch`: tokenizer, streaming data pipeline, model, training loop, sampler, chat REPL, and a Modal script for the GPU runs.

*Reading note:* the argument is that the naive implementation makes the mechanism visible, and that the expensive failures were all silent. Architecture tables, the cache-invalidation logic, and the Modal harness are collapsed.

## table of contents

- [why write it out at all](#why-write-it-out-at-all)
- [the model](#the-model)
- [attention is three linear maps and a mask](#attention-is-three-linear-maps-and-a-mask)
- [the scale factor is not a detail](#the-scale-factor-is-not-a-detail)
- [multi-head, implemented the slow way on purpose](#multi-head-implemented-the-slow-way-on-purpose)
- [the residual stream is the actual abstraction](#the-residual-stream-is-the-actual-abstraction)
- [the tokenizer and the data pipeline](#the-tokenizer-and-the-data-pipeline)
- [training, and how much data the run actually saw](#training-and-how-much-data-the-run-actually-saw)
- [sampling](#sampling)
- [scaling to a GPU, and what it bought](#scaling-to-a-gpu-and-what-it-bought)
- [what cost the most time](#what-cost-the-most-time)
- [conclusions](#conclusions)

## why write it out at all

Reading the transformer paper and reading a reference implementation both leave the same gap: you can follow every line and still not know which lines are *load-bearing*. Typing it out closes that gap by force. Every constant omitted and every shape gotten wrong produces either a crash or, worse, a model that trains to nothing while looking fine.

Three things in this project turned out to be load-bearing in ways we did not anticipate, and all three were found the hard way.

## the model

<details class="collapsible-section">
<summary><strong>Full architecture, as configured in the shipped checkpoint</strong></summary>

| Component | Value |
| --- | --- |
| Blocks | 6 |
| Attention heads | 8 |
| Residual width (`n_embed`) | 256 |
| Head size | 32 (`n_embed / num_heads`) |
| Context (`block_size`) | 64 |
| Vocabulary | 1,000 (byte-level BPE) |
| MLP | 4× expansion, ReLU |
| Position encoding | Learned embeddings |
| Normalization | Pre-LN, two `LayerNorm`s per block |
| Parameters | 5,263,848 |

The parameter count breaks down as 272,384 in the embeddings (256,000 token + 16,384 positional), 4,733,952 across the six blocks, 512 in the final `LayerNorm`, and 257,000 in the unembedding. The causal masks are registered buffers and are not counted, which is why the number printed by `sum(p.numel() for p in model.parameters())` excludes the 196,608 mask entries in the state dict.

</details>

## attention is three linear maps and a mask

The single-head forward pass in full:

```python
keys, queries, values = self.key(x), self.query(x), self.value(x)
scores = queries @ keys.transpose(-2, -1)
scores = scores * (self.head_size ** -0.5)
scores = scores.masked_fill(self.mask[:T, :T] == 0, float("-inf"))
return F.softmax(scores, dim=-1) @ values
```

Four operations. A token's query is a question, every other token's key is an advertisement, the dot product scores the match, and the value is what actually gets moved. The causal mask is not a deep architectural property. It is `torch.tril(torch.ones(block_size, block_size))` registered as a buffer and a `masked_fill`.

## the scale factor is not a detail

`self.head_size ** -0.5` looks like a detail, and it decides whether the model trains.

Take a query $q$ and key $k$ in $\mathbb{R}^{d}$ with independent, zero-mean, unit-variance entries. Their dot product is a sum of $d$ independent terms, so

$$
\operatorname{Var}(q \cdot k) = \sum_{i=1}^{d} \operatorname{Var}(q_i k_i) = d,
$$

and the logits entering the softmax have standard deviation $\sqrt{d}$. Dividing by $\sqrt{d}$ restores unit variance and keeps the softmax in a regime where it is not saturated.

Without the scale, logits grow with head size, the softmax collapses toward one-hot, and the gradient through it vanishes: $\partial \text{softmax}$ is proportional to $p_i(\delta_{ij} - p_j)$, which goes to zero as any $p_i \to 1$. The model still trains, the loss barely moves, and nothing in the code looks wrong. That combination is what makes it dangerous: the failure has no error message and no obviously guilty line.

At $d = 32$ the factor is $1/\sqrt{32} \approx 0.177$, so the unscaled logits would be roughly 5.7× larger, enough to saturate and not enough to look absurd if printed.

## multi-head, implemented the slow way on purpose

```python
self.heads = nn.ModuleList([SelfAttention(...) for _ in range(num_heads)])
return self.proj(torch.cat([head(x) for head in self.heads], dim=-1))
```

Production implementations fold all heads into one batched matmul. This one keeps them as independent modules and concatenates. That is measurably slower, and we kept it: heads genuinely are independent subspaces, and writing them as separate objects makes that structural fact impossible to forget. Fusing is an optimization, not a concept, and the independence is exactly the property that later interpretability work depends on. The [induction-circuit project](/posts/reverse-engineering-gpt-2s-induction-circuit) scores heads individually, which only means something because they *are* individual.

At 3.8M–5.3M parameters on a laptop the trade is free. At any serious scale it is not, and the right move is to fuse and keep a slow reference implementation for testing against.

## the residual stream is the actual abstraction

```python
x = x + self.attention(self.layer_norm1(x))
x = x + self.feed_forward(self.layer_norm2(x))
```

Two `x + ...` lines, and they are the reason depth works at all. Each block *proposes an edit* to a running representation rather than replacing it. Normalization goes before the sublayer (pre-LN), so the residual path from input to output is unnormalized and gradients reach layer 0 intact.

Once the residual stream reads as a shared bus that every layer writes to and reads from, the later literature of logit lens, activation patching and circuits stops being exotic and starts being the obvious next question. That framing is what sent this project toward induction heads next.

## the tokenizer and the data pipeline

The least interesting part took the most iterations.

Byte-level BPE with a ByteLevel pre-tokenizer and decoder means **no unknown tokens are possible**: every byte sequence encodes. That sounds like a footnote and is what makes the model robust to whatever the corpus contains. The vocabulary is trained on the corpus itself rather than borrowed, which at 1,000 merges over children's stories gives a tokenizer specialized to exactly this distribution.

<details class="collapsible-section">
<summary><strong>Streaming tokenization and cache invalidation</strong></summary>

The corpus is 1.9 GB of text and stopped fitting comfortably in memory. Tokenization became a streaming pass that writes a `uint16` token cache to disk, invalidated by comparing modification times against both the source text and the tokenizer:

```python
cache_is_stale = not token_cache.exists() or token_cache.stat().st_mtime_ns < max(
    args.data.stat().st_mtime_ns,
    tokenizer_path.stat().st_mtime_ns,
)
```

`uint16` because a 1,000-token vocabulary fits in 16 bits, which halves the cache versus `int32`. The resulting cache is 1.26 GB, or roughly 632M tokens.

The staleness check exists because the tokenizer was retrained once, and an hour of training then ran against tokens from the *previous* vocabulary, a corruption that produces no error, just a model learning a scrambled language.

</details>

## training, and how much data the run actually saw

AdamW at its default weight decay of 0.01, learning rate 3e-4, batch size 8, context 64, seed 1337, 20,000 steps, checkpointing every 1,000. Checkpoints store the model state, optimizer state, the full config, the training arguments, and the final loss, so a resume restores the run rather than approximating it.

No learning-rate schedule, no warmup, no gradient clipping. At this scale none were necessary, and leaving them out kept the loop readable. At larger scale each is the next thing to add.

The number worth stating plainly is the token budget:

$$
20{,}000 \text{ steps} \times 8 \text{ sequences} \times 64 \text{ tokens} = 10.24\text{M tokens},
$$

against a cache of roughly 632M. The run therefore saw about **1.6%** of the corpus, once. The final loss of 2.14 is a number from a model that is data-starved by design, and the correct reading of it is "the pipeline learns" rather than "the model is good." Anyone comparing it to a published TinyStories loss is comparing against a different experiment.

## sampling

Greedy decoding on a model this size produces loops almost immediately. Temperature and top-$k$ were about thirty lines and changed the output more than any architectural change we made:

```python
logits = logits[:, -1, :] / temperature
if top_k is not None:
    cutoff = torch.topk(logits, min(top_k, logits.size(-1))).values[:, -1, None]
    logits = logits.masked_fill(logits < cutoff, float("-inf"))
next_token = torch.multinomial(F.softmax(logits, dim=-1), num_samples=1)
```

The thing worth internalizing: the model is a distribution, not a speaker. Every "the model said X" is really "this decoding strategy, at this temperature, said X." Two of the qualitative judgments we made early about model quality turned out to be judgments about decoding.

## scaling to a GPU, and what it bought

Once the laptop run worked, training moved to a Modal L4 with a larger configuration: 8 layers, 320-dimensional residual, 128-token context, mixed precision, and an auto batch-size search that doubles the batch until CUDA runs out of memory.

The observation worth recording is how little of that work was model code. The same `train.py` runs on all three devices behind a `--device auto` flag. What the GPU run required was infrastructure.

<details class="collapsible-section">
<summary><strong>The supervising loop</strong></summary>

A persistent volume so a preempted container does not lose the checkpoint, a `--resume` path pointed at the same file as `--output`, and a loop that commits the volume every 60 seconds:

```python
while True:
    try:
        return_code = process.wait(timeout=60)
        ...
    except subprocess.TimeoutExpired:
        storage.commit()
```

Six hours of GPU time is worth nothing if the container dies at hour five with the checkpoint in a tmpfs.

</details>

`model.py` is 182 lines. The tokenizer, data pipeline, training loop, sampler, chat REPL, and Modal harness together are roughly four times that, and that is where all of the bugs were. The transformer was the easy half.

## what cost the most time

| Problem | Symptom | Cause |
| --- | --- | --- |
| Stale token cache | Model trains, output is gibberish, loss looks plausible | Retrained the tokenizer without invalidating the cached token file |
| Dataset target alignment | Off-by-one, loss plateaus higher than expected | Targets are pre-shifted in the dataset; shifting again in the loss double-shifts |

Both are silent. Neither raises. Both are the same category: a pipeline that is internally consistent and describing the wrong thing. That category is, we now believe, the dominant failure mode in small-scale ML work, and it is why the receipt matters more than the number on it.

## conclusions

Had we reported only the final loss, this post would have described a trained model. The accurate version is that it describes a *validated pipeline* with a model attached that has seen 1.6% of its corpus once.

- **The naive version is the point.** Every optimization skipped is a concept left visible. Unfused multi-head attention costs throughput and buys understanding, and at this scale that trade is free.
- **The scale factor and the mask are not details.** $1/\sqrt{d}$ is the difference between a model that trains and one that silently does not, and the failure has no error message.
- **Most of the code is not the model.** 182 lines of model against roughly four times that in everything else, and the bugs were all in the everything else.
- **Silent correctness bugs dominate.** Nothing in this project crashed in an informative way. Both expensive bugs produced a running system quietly learning the wrong function.
- **The loss number is not comparable to anything.** One pass over 1.6% of the data is not a training run anyone should benchmark against.

---
title: "GRPO on a 0.5B model, and the diagnostic that makes its failures visible"
pubDatetime: 2026-09-20T11:00:00.000Z
description: "We build an RLVR pipeline on Qwen2.5-0.5B-Instruct and report no training results, because the 300-step run has not been launched. What the pipeline did produce is a diagnosis: the learning signal in GRPO is the within-group spread of rewards, not their level, so 'my dataset is too easy' and 'my dataset is too hard' are the same observation from outside. Four engineering failures, none of which raised an exception, and a hardware measurement in which a rented L4 ran about 5% faster than a laptop."
slug: rlvr-grpo-reward-variance
tags:
  - reinforcement-learning
  - llm
  - grpo
draft: false
category: projects
---

**We have no before/after RL numbers.** The pipeline runs end to end, the 300-step training run has not been launched, and we are publishing before it deliberately: nothing below is contingent on what the final `pass@1` turns out to be.

What the pipeline did produce is a diagnosis and four post-mortems. The diagnosis is that the learning signal in GRPO is the within-group *spread* of rewards rather than their level, which makes "my dataset is too easy" and "my dataset is too hard" indistinguishable from outside the reward function. The post-mortems cover four engineering failures — a token-id collision, non-terminating rollouts, generation running in train mode, and a silently frozen adapter — none of which raised an exception, and all of which produced a training run that looked healthy.

We also measured hardware instead of assuming it. For this workload a rented Modal L4 ran about 5% faster per step than an M4 Pro laptop, because per-step time is dominated by serial decode overhead rather than arithmetic. That is one paired observation, not a benchmark.

Code is in `projects/math-rlvr`. Setup: GRPO via TRL 0.16 on **Qwen2.5-0.5B-Instruct**, LoRA (r=32, α=64, dropout 0.05, all projection modules) over a frozen base, `math_verify` as the reward, 8 generations per prompt, learning rate 1e-6, β 0.04, temperature 0.9, completions capped at 640 tokens.

*Reading note:* the argument is the variance diagnostic and why the four bugs share a shape. Hyperparameters, the verifier comparison, and each post-mortem are collapsed — expand only what you need.

## table of contents

- [why RLVR](#why-rlvr)
- [GRPO, and where the signal comes from](#grpo-and-where-the-signal-comes-from)
- [the diagnostic](#the-diagnostic)
- [what we did not measure about difficulty](#what-we-did-not-measure-about-difficulty)
- [the verifier is part of the objective](#the-verifier-is-part-of-the-objective)
- [four silent failures](#four-silent-failures)
- [the hardware measurement](#the-hardware-measurement)
- [what exists](#what-exists)
- [conclusions](#conclusions)

## why RLVR

Reinforcement learning from verifiable rewards is the cleanest setup in post-training. There is no reward model to train, no human preference data, and no judge model to be gamed. A math problem has a right answer, a program checks it, and the check *is* the reward. It is the recipe behind the reasoning-model results of the last two years, and at 0.5B it fits on one GPU.

That cleanliness is also what makes the failure modes legible. When the only moving parts are sample, score, and update, anything that goes wrong is in one of three places, which is why this project is worth writing up even without a training curve.

## GRPO, and where the signal comes from

For each prompt, sample a group of $k$ completions and score them all. The advantage of completion $i$ is its reward minus the group mean, normalized by the group's spread:

$$
A_i = \frac{r_i - \mu}{\sigma}, \qquad
\mu = \frac{1}{k}\sum_{j=1}^{k} r_j, \qquad
\sigma = \sqrt{\frac{1}{k}\sum_{j=1}^{k}(r_j - \mu)^2}
$$

The policy is then pushed toward the above-average members of its own group. There is no value network and no critic to train: the group average *is* the baseline. That is the entire simplification, and at this scale it is the reason to use GRPO rather than PPO.

Read the numerator once more, because the dominant failure mode falls directly out of it. If every completion in a group receives the same reward, then $r_i = \mu$ for all $i$, every advantage is zero, and the gradient contribution of that prompt is exactly zero. You spend a GPU-minute generating 8 completions and learn nothing from them. The run does not fail; it costs the same and teaches nothing.

The condition for learning is therefore $\sigma > 0$ within the group, and that is a property of the *difficulty distribution of the prompts*, not of the model's competence in any absolute sense.

## the diagnostic

Zero within-group variance arrives from both directions, and the two are indistinguishable downstream:

| Training set | What happens | Reward std | Learning signal |
| --- | --- | --- | --- |
| GSM8K | The Instruct model aces the problem 8/8 | ~0 | None |
| AIME | 90 olympiad problems, 0/8 on nearly all | ~0 | None |
| MATH levels 3–5 | Sometimes right, sometimes wrong | > 0 | Yes |

"Too easy" and "too hard" produce the *identical* symptom: flat reward, no movement, and a run that otherwise looks completely healthy. Wall-clock burns, the loss curve is plausible, and nothing improves. Any diagnosis that only asks whether reward is increasing cannot separate them, and the two have opposite fixes.

So the reward function prints its own variance on every batch:

```python
n = len(rewards)
mean = sum(rewards) / n if n else 0.0
var = sum((r - mean) ** 2 for r in rewards) / n if n else 0.0
print(f"[reward] n={n} mean={mean:.3f} std={var ** 0.5:.3f} "
      f"(std~0 => no learning signal)")
```

Ten lines of arithmetic that convert a silent failure into a visible one. It is the single highest-leverage thing in the repository, and it is worth stating the general form: **the learning signal in policy-gradient RL comes from the spread of outcomes, not their level.** Curriculum design is not a nice-to-have here, it is a precondition.

<details class="collapsible-section">
<summary><strong>Training configuration</strong></summary>

| Parameter | Value |
| --- | --- |
| Base model | Qwen2.5-0.5B-Instruct |
| Adapter | LoRA, r=32, α=64, dropout 0.05, all projection modules |
| Generations per prompt ($k$) | 8 |
| Learning rate | 1e-6 |
| KL coefficient (β) | 0.04 |
| Sampling temperature | 0.9 |
| Max completion length | 640 tokens |
| Correctness reward | 1.0 if `math_verify` accepts, else 0.0 |
| Format shaping | 0.2 for exactly one well-formed `\boxed{}` |
| Planned horizon | 300 steps (not launched) |

The format shaping term exists so that early in training there is a gradient toward parseable output before there is any gradient toward correctness. It is deliberately small relative to the correctness reward, so it cannot dominate once completions parse.

</details>

## what we did not measure about difficulty

The claim above is that MATH levels 3–5 produce nonzero within-group variance and the alternatives did not. That is an observation from the diagnostic, not a characterization of the difficulty band.

We did not measure where the band actually sits for this model. The principled version sweeps difficulty against measured $\text{pass@}8$ and selects problems whose success probability is near $0.5$, which is where the expected within-group spread is largest: for a binary reward with success probability $p$, the group variance is maximized at $p = 0.5$, since

$$
\sigma^2 = p(1-p).
$$

That sweep has not been run, so "levels 3–5" is a working choice supported by a binary observation, not a tuned curriculum. It is the first thing we would run given more time, and it is cheap relative to training.

## the verifier is part of the objective

The other half of RLVR is deciding whether a completion's answer matches the gold answer. Completions are prompted to end in `\boxed{...}`, so extraction is a regex on the last match. Comparison is where the subtlety lives.

<details class="collapsible-section">
<summary><strong>String equality vs. symbolic comparison</strong></summary>

| Model's boxed answer | Gold | String equality | `math_verify` |
| --- | --- | --- | --- |
| `72` | `72` | ✅ | ✅ |
| `0.5` | `1/2` | ❌ | ✅ |
| `\frac{1}{2}` | `1/2` | ❌ | ✅ |
| `40` | `72` | ❌ | ❌ |
| *(no `\boxed{}`)* | `72` | — | ❌ |

</details>

Rows two and three are the reason this matters, and the reason is not noise. A naive string check does not produce a *noisy* reward, it produces a **biased** one: it systematically punishes correct answers for being written in a different form, and therefore trains the model toward the dataset's formatting conventions rather than toward being right. Parsing both sides symbolically and checking mathematical equality is the only version that rewards the intended thing.

Stated generally: the verifier is not an approximation of the objective, it *is* the objective. Every systematic error in it becomes a systematic pressure on the policy.

## four silent failures

None of these raised an exception. All four produced a training run that appeared to work. They share one shape — two components with defensible independent defaults that must agree, and don't — which is the most common category of bug we hit in this project.

<details class="collapsible-section">
<summary><strong>1. The EOS/pad collision</strong></summary>

Instruct models set `eos_token` to `<|im_end|>`. HuggingFace pads stopped rollouts with `pad_token`. TRL masks each completion at the first `eos`. If those two tokens disagree, the completion mask is wrong — and nothing tells you, because a wrong mask is still a valid mask.

```python
tokenizer = AutoTokenizer.from_pretrained(MODEL, padding_side="left")
tokenizer.eos_token = tokenizer.pad_token  # both <|endoftext|>
```

One line, several hours of diagnosis.

</details>

<details class="collapsible-section">
<summary><strong>2. Rollouts that never terminate</strong></summary>

We started on the Qwen2.5-Math-1.5B **base** model. Its chat tokens are untrained, so it never emits `<|im_end|>` at all, so every rollout ran to `max_completion_length`. At 8 generations per prompt and 640 tokens each, nearly all of the compute was spent generating text after the answer had already been given.

Two fixes: switching to the 0.5B Instruct model, which also roughly halved per-step time, and a stopping criterion that halts a rollout as soon as it contains a closed `\boxed{}`:

```python
class _StopAfterBoxed(StoppingCriteria):
    def __call__(self, input_ids, scores, **kwargs):
        texts = self.tokenizer.batch_decode(
            input_ids[:, self.prompt_len:], skip_special_tokens=True
        )
        return torch.tensor([BOXED_RE.search(t) is not None for t in texts],
                            device=input_ids.device)
```

The prompt itself mentions `\boxed{}`, so the criterion has to skip the prompt prefix — the kind of detail that turns a clean idea into a debugging session.

</details>

<details class="collapsible-section">
<summary><strong>3. Generation running in train mode</strong></summary>

TRL 0.16 calls `generate()` without switching the model to eval. With gradient checkpointing enabled, that forces `use_cache=False`. No KV cache means decoding is quadratic in sequence length rather than linear, on the single most expensive part of the step.

```python
was_training = model.training
model.eval()
try:
    return orig_generate(input_ids, *args, **kwargs)
finally:
    if was_training:
        model.train()
```

A large speedup for a small patch, and again not something that surfaces as an error. It surfaces as "training is slower than I expected," which is indistinguishable from "training is this slow."

</details>

<details class="collapsible-section">
<summary><strong>4. The adapter that loaded frozen</strong></summary>

If an adapter already exists at the output directory, the trainer loads it with `is_trainable=True` and continues, rather than starting a fresh LoRA:

```python
model = PeftModel.from_pretrained(base, args.output_dir, is_trainable=True)
```

Omitting `is_trainable` loads the adapter frozen. Training then updates nothing, reports no error, and produces a complete run with a plausible log.

</details>

A fifth issue is unresolved rather than fixed: TRL 0.16's vLLM integration is server-based and wants a second GPU, and single-GPU colocation requires TRL ≥ 0.18. The runs therefore use HuggingFace `generate` on one L4 and accept the throughput. That decision is what the next section measures.

## the hardware measurement

| Setup | Time per step |
| --- | --- |
| M4 Pro laptop (MPS) | ~77 s |
| Modal L4 (CUDA, bf16) | ~73 s |

The rented datacenter GPU was roughly 5% faster than the laptop. At 300 steps that is about 6 to 6.5 hours either way.

This is a single paired observation — one configuration, one run on each device, no repetitions — so it carries no interval and should not be read as a benchmark. What it does support is a directional claim with a mechanism behind it: per-step time is dominated by generation overhead in HuggingFace `generate`, not by matrix multiplication. Sampling 8 completions of up to 640 tokens is a long serial sequence of small, latency-bound decode steps, and a wider GPU does not shorten a serial loop.

The consequences follow from the mechanism rather than from the 5%: larger GPUs cost proportionally more per hour for roughly the same wall-clock, and a T4 is a false economy because it lacks bf16 and loses more time than it saves in price. The real fix is not more silicon but batched inference — vLLM, continuous batching, paged attention — which is blocked on the TRL version above.

## what exists

| Component | State |
| --- | --- |
| Data loaders (GSM8K, MATH, AIME → `{prompt, answer}`) | Done |
| Verifier and reward-variance diagnostic | Done |
| GRPO training with LoRA, adapter-resume across runs | Done |
| `pass@1` / `pass@k` evaluation, base and adapted | Done |
| Modal deployment, persistent volume, wandb | Done |
| 300-step training run | Not launched |
| Before/after results | None |

## conclusions

Had we reported only that the pipeline was built, this post would have described a working RLVR stack. The honest version is that the stack is built and untested against its own objective, and that everything of value so far came out of it refusing to work.

- **Reward variance is the metric to watch, not reward mean.** Printing $\sigma$ every batch is ten lines and converts the most likely failure from invisible to obvious.
- **Too-easy and too-hard are the same observation from outside.** Any diagnosis that checks only whether reward is increasing cannot separate them, and they have opposite fixes.
- **The verifier is the objective.** A string-equality check is a biased reward function, not an approximate one.
- **Every failure here was silent.** EOS/pad mismatch, non-terminating rollouts, generation in train mode, a frozen adapter: four bugs, zero exceptions.
- **Measure before renting.** For this workload the GPU bought about 5%, on one paired observation, because the bottleneck is serial decode rather than arithmetic.
- **The difficulty band is unmeasured.** Levels 3–5 produce nonzero variance; we have not swept difficulty against $\text{pass@}8$, so the curriculum is a working choice rather than a tuned one.

The open question is whether 300 steps on a 0.5B model moves `pass@1` measurably at all. The frame we will judge it against is the $\text{pass@}k \gg \text{pass@}1$ gap: a model that solves a problem 1 time in 8 already contains the capability, and RL's job is to shift probability mass onto reasoning it can already occasionally produce rather than to teach it something new. If the gap does not narrow, the report will say that it did not.

"""Reward functions for GRPO (TRL 1.13 contract).

Same verifier as step2, adapted to TRL's calling convention:
    def fn(completions, **kwargs) -> list[float]
`completions` is conversational: completions[i] == [{"role": "assistant", "content": "..."}].
Dataset columns (e.g. "answer") arrive as aligned lists in **kwargs.

correctness_reward also PRINTS the per-batch reward mean and std. Watch std:
if it stays ~0.0, every rollout scored the same (usually all 0 on AIME) => no
advantage => no learning signal. That's the thing to observe on a too-hard set.
"""

import re

from math_verify import parse, verify

BOXED_RE = re.compile(r"\\boxed\{((?:[^{}]|\{[^{}]*\})*)\}")


def _text(completion) -> str:
    if isinstance(completion, str):
        return completion
    return completion[0]["content"]


def _extract_boxed(text: str) -> str | None:
    m = BOXED_RE.findall(text)
    return m[-1].strip() if m else None


def correctness_reward(completions, answer, **kwargs) -> list[float]:
    rewards = []
    for completion, gold in zip(completions, answer):
        pred = _extract_boxed(_text(completion))
        if pred is None:
            rewards.append(0.0)
            continue
        try:
            ok = bool(verify(parse(gold), parse(pred)))
        except Exception:
            ok = False
        rewards.append(1.0 if ok else 0.0)

    # --- the diagnostic: is there any reward variance to learn from? ---
    n = len(rewards)
    mean = sum(rewards) / n if n else 0.0
    var = sum((r - mean) ** 2 for r in rewards) / n if n else 0.0
    print(f"[reward] n={n} mean={mean:.3f} std={var ** 0.5:.3f} "
          f"(std~0 => no learning signal)")
    return rewards


def format_reward(completions, **kwargs) -> list[float]:
    """Small shaping: 0.2 if exactly one well-formed \\boxed{} is present."""
    out = []
    for c in completions:
        out.append(0.2 if len(BOXED_RE.findall(_text(c))) == 1 else 0.0)
    return out

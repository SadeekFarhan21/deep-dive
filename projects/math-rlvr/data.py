"""Dataset loaders -> unified {prompt, answer} format for the whole pipeline.

Each loader returns rows with:
  - prompt: chat messages (system + user) ready for apply_chat_template
  - answer: the gold final answer as a string (what the verifier checks against)

Currently training on AIME (AI-MO/aimo-validation-aime). Note: this is only 90
problems and olympiad-hard, so expect low/flat reward during RL — we log reward
variance so you can see whether there's any learning signal at all.
"""

import re

from datasets import concatenate_datasets, load_dataset

SYSTEM = (
    "You are a careful math solver. Reason step by step, then give the final "
    "answer on its own line as \\boxed{<answer>}."
)


def _conversation(question: str) -> list[dict]:
    return [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": question},
    ]


def load_aime(limit: int | None = None):
    """AIME: 90 olympiad problems, integer answers. Used here as TRAIN set."""
    ds = load_dataset("AI-MO/aimo-validation-aime", split="train")
    if limit is not None:
        ds = ds.select(range(min(limit, len(ds))))

    def _map(row):
        return {
            "prompt": _conversation(row["problem"]),
            "answer": str(row["answer"]).strip(),  # already a clean integer
        }

    return ds.map(_map, remove_columns=ds.column_names)


def load_gsm8k(split: str = "test", limit: int | None = None):
    """GSM8K, kept around as an easier sanity-check eval set."""
    ds = load_dataset("openai/gsm8k", "main", split=split)
    if limit is not None:
        ds = ds.select(range(min(limit, len(ds))))

    def _map(row):
        return {
            "prompt": _conversation(row["question"]),
            "answer": row["answer"].split("####")[-1].strip(),
        }

    return ds.map(_map, remove_columns=ds.column_names)


# MATH ships as 7 per-subject configs; we concatenate them.
_MATH_SUBJECTS = [
    "algebra", "counting_and_probability", "geometry", "intermediate_algebra",
    "number_theory", "prealgebra", "precalculus",
]
_BOXED = re.compile(r"\\boxed\{((?:[^{}]|\{[^{}]*\})*)\}")


def _math_gold(solution: str) -> str:
    """MATH gold answer = contents of the last \\boxed{} in the solution."""
    m = _BOXED.findall(solution)
    return m[-1].strip() if m else solution.strip()


def load_math(split: str = "train", levels=(3, 4, 5), limit: int | None = None):
    """MATH, filtered to difficulty `levels` (1=easy .. 5=hard).

    Levels 3-5 keep this Instruct model in the 'sometimes right' zone, which is
    where GRPO gets reward variance (and therefore a learning signal). Too-easy
    levels (1-2) get aced 8/8 -> std 0; that's the failure we saw on GSM8K.
    """
    parts = [load_dataset("EleutherAI/hendrycks_math", s, split=split) for s in _MATH_SUBJECTS]
    ds = concatenate_datasets(parts)

    wanted = {f"Level {n}" for n in levels}
    ds = ds.filter(lambda r: r["level"] in wanted)
    if limit is not None:
        ds = ds.select(range(min(limit, len(ds))))

    def _map(row):
        return {
            "prompt": _conversation(row["problem"]),
            "answer": _math_gold(row["solution"]),
        }

    return ds.map(_map, remove_columns=ds.column_names)


DATASETS = {
    "aime": load_aime,                                       # eval-only (too hard/small to train)
    "gsm8k_train": lambda limit=None: load_gsm8k("train", limit),
    "gsm8k_test": lambda limit=None: load_gsm8k("test", limit),    # in-distribution eval
    "math_hard": lambda limit=None: load_math("train", (3, 4, 5), limit),  # <- training set
    "math_test": lambda limit=None: load_math("test", (3, 4, 5), limit),
}

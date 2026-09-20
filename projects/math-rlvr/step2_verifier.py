"""Step 2: Build the VERIFIER — the function that decides if an answer is correct.

Run with:  uv run step2_verifier.py

This is the core of RLVR. In training, the model will produce some text ending
in \\boxed{...}; we extract that and check it against the gold answer. The
number we return (1.0 correct / 0.0 wrong) IS the reward signal.

The lesson of this step: "are these two answers equal?" is harder than ==.
We show a naive string check failing, then math_verify getting it right.
"""

import re

from math_verify import parse, verify

# --- Part 1: extract the model's final answer from its \boxed{} -----------------
# Models are prompted to end with \boxed{<answer>}. We grab the LAST one.
BOXED_RE = re.compile(r"\\boxed\{((?:[^{}]|\{[^{}]*\})*)\}")


def extract_boxed(text: str) -> str | None:
    matches = BOXED_RE.findall(text)
    return matches[-1].strip() if matches else None


# --- Part 2: two ways to check correctness --------------------------------------
def naive_correct(pred: str, gold: str) -> bool:
    """Dumb string equality. Works for clean integers, breaks on equivalent forms."""
    return pred.strip() == gold.strip()


def verified_correct(pred: str, gold: str) -> bool:
    """math_verify: parses both sides and checks MATHEMATICAL equality."""
    try:
        return bool(verify(parse(gold), parse(pred)))
    except Exception:
        return False


# --- Part 3: try them on realistic (model_output, gold) pairs -------------------
# Each tuple: a pretend model completion, and the gold answer from the dataset.
CASES = [
    ("The answer is \\boxed{72}.", "72"),                 # easy: both agree
    ("... so we get \\boxed{0.5}.", "1/2"),               # SAME value, different form
    ("Therefore \\boxed{\\frac{1}{2}}.", "1/2"),          # LaTeX fraction == 1/2
    ("I think it's \\boxed{40}.", "72"),                  # genuinely wrong
    ("The answer is 72.", "72"),                          # no \boxed{} at all -> can't parse
]

print(f"{'pred (boxed)':<20} {'gold':<8} {'naive':<7} {'math_verify'}")
print("-" * 55)
for output, gold in CASES:
    pred = extract_boxed(output)
    if pred is None:
        print(f"{'<none>':<20} {gold:<8} {'--':<7} {'-- (no boxed answer)'}")
        continue
    n = naive_correct(pred, gold)
    v = verified_correct(pred, gold)
    print(f"{pred:<20} {gold:<8} {str(n):<7} {v}")

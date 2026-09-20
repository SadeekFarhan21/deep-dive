"""Experiment 01 — Discover induction heads via the induction score.

An induction head, at position i in the *second* copy of a repeated random
sequence, attends back to the token that came *after* the previous occurrence
of the current token. For a sequence [rand][rand] of length 2N, the token at
position i (in the second half) is the same as at i - N, so the head should
attend from i to (i - N + 1).

Induction score for a head = the average attention weight along that diagonal.
Heads with high scores are candidate induction heads.

Outputs:
  figures/01_induction_scores.png   heatmap of induction score [layer x head]
  results/01_induction_scores.csv   the same scores, sorted
"""
from __future__ import annotations

import argparse
import csv
from pathlib import Path

import torch

from tiny_circuits.model import load_model, SEED
from tiny_circuits.tracking import init_run

ROOT = Path(__file__).resolve().parent.parent
FIGURES = ROOT / "figures"
RESULTS = ROOT / "results"
SEQ_LEN = 50          # length of the random sequence (repeated once -> 2*SEQ_LEN)
BATCH = 8             # average over several random sequences for a stable estimate


def make_repeated_tokens(model, seq_len: int, batch: int) -> torch.Tensor:
    """Build [BOS][rand seq][rand seq] token batches."""
    g = torch.Generator().manual_seed(SEED)
    vocab = model.cfg.d_vocab
    rand = torch.randint(0, vocab, (batch, seq_len), generator=g)
    bos = torch.full((batch, 1), model.tokenizer.bos_token_id, dtype=torch.long)
    tokens = torch.cat([bos, rand, rand], dim=1)
    return tokens.to(model.cfg.device)


def induction_scores(model, tokens: torch.Tensor) -> torch.Tensor:
    """Return [n_layers, n_heads] average induction-diagonal attention."""
    seq_len = (tokens.shape[1] - 1) // 2
    _, cache = model.run_with_cache(tokens, return_type=None)
    scores = torch.zeros(model.cfg.n_layers, model.cfg.n_heads)
    for layer in range(model.cfg.n_layers):
        # pattern: [batch, head, query_pos, key_pos]
        pattern = cache["pattern", layer]
        # induction diagonal: query at (1 + seq_len + k) attends to key (1 + k + 1)
        # i.e. offset of -(seq_len - 1) from the query position.
        diag = pattern.diagonal(offset=-(seq_len - 1), dim1=-2, dim2=-1)
        scores[layer] = diag.mean(dim=(0, -1))  # mean over batch and diagonal
    return scores


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--wandb", action="store_true", help="log this run to Weights & Biases"
    )
    parser.add_argument(
        "--wandb-name",
        default="01-induction-scores",
        help="W&B run name",
    )
    args = parser.parse_args()

    model = load_model()
    print(f"loaded {model.cfg.model_name} on {model.cfg.device} "
          f"({model.cfg.n_layers}L x {model.cfg.n_heads}H)")

    run = init_run(
        args.wandb_name,
        config={
            "experiment": "01_induction_scores",
            "model": model.cfg.model_name,
            "device": str(model.cfg.device),
            "n_layers": model.cfg.n_layers,
            "n_heads": model.cfg.n_heads,
            "seq_len": SEQ_LEN,
            "batch": BATCH,
            "seed": SEED,
        },
        enabled=args.wandb,
    )

    tokens = make_repeated_tokens(model, SEQ_LEN, BATCH)
    scores = induction_scores(model, tokens)

    FIGURES.mkdir(exist_ok=True)
    RESULTS.mkdir(exist_ok=True)

    # --- heatmap ---
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(8, 6))
    im = ax.imshow(scores.numpy(), aspect="auto", cmap="viridis", origin="lower")
    ax.set_xlabel("head")
    ax.set_ylabel("layer")
    ax.set_title("Induction score per head — GPT-2 small")
    fig.colorbar(im, ax=ax, label="mean induction-diagonal attention")
    fig.tight_layout()
    fig.savefig(FIGURES / "01_induction_scores.png", dpi=150)
    run.log_figure("induction_scores", fig)

    # --- csv, sorted descending ---
    flat = [
        (layer, head, float(scores[layer, head]))
        for layer in range(model.cfg.n_layers)
        for head in range(model.cfg.n_heads)
    ]
    flat.sort(key=lambda r: r[2], reverse=True)
    with open(RESULTS / "01_induction_scores.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["layer", "head", "induction_score"])
        w.writerows(flat)

    run.log_table("induction_scores", ["layer", "head", "induction_score"], flat)

    top_layer, top_head, top_score = flat[0]
    run.summary(
        {
            "max_induction_score": top_score,
            "top_head": f"L{top_layer}H{top_head}",
            "top10_heads": ", ".join(f"L{l}H{h}" for l, h, _ in flat[:10]),
        }
    )

    print("\nTop 10 induction heads:")
    for layer, head, s in flat[:10]:
        print(f"  L{layer}H{head}: {s:.3f}")
    print(f"\nsaved figures/01_induction_scores.png and results/01_induction_scores.csv")
    if run.active:
        print(f"logged run to {run.url}")
    run.finish()


if __name__ == "__main__":
    main()

"""Export the model's parameter budget for the blog figures.

Every number is read out of checkpoints/gpt-tinystories.pt, so the figures cannot
drift from the model that produced the 2.14 loss. The site renders them with D3.

    python figures/make_figures.py
"""

import json
import pathlib
from collections import OrderedDict

import torch

ROOT = pathlib.Path(__file__).resolve().parents[1]
CKPT = ROOT / "checkpoints" / "gpt-tinystories.pt"
OUT = ROOT.parents[1] / "site" / "public" / "data"

GROUPS = (
    "Token embedding",
    "Position embedding",
    "Attention",
    "MLP",
    "LayerNorm",
    "Output head",
)
# Weights whose size is set by the vocabulary rather than by depth or width.
VOCAB_BOUND = {"Token embedding", "Output head"}


def classify(name: str) -> str:
    if name.startswith("token_embedding"):
        return "Token embedding"
    if name.startswith("position_embedding"):
        return "Position embedding"
    if "attention" in name:
        return "Attention"
    if "feed_forward" in name or "mlp" in name or "ffn" in name:
        return "MLP"
    if "layer_norm" in name or name.startswith("ln"):
        return "LayerNorm"
    if name.startswith("lm_head"):
        return "Output head"
    raise SystemExit(f"unclassified parameter: {name}")


def main():
    ck = torch.load(CKPT, map_location="cpu", weights_only=False)
    sd, cfg = ck["model_state_dict"], ck["config"]

    groups = OrderedDict((g, 0) for g in GROUPS)
    for name, tensor in sd.items():
        if name.endswith(".mask"):  # causal mask is a buffer, not a parameter
            continue
        groups[classify(name)] += tensor.numel()

    total = sum(groups.values())
    payload = {
        "source": "checkpoints/gpt-tinystories.pt",
        "config": cfg,
        "final_loss": round(float(ck["final_loss"]), 4),
        "steps": ck["training"]["steps"],
        "batch_size": ck["training"]["batch_size"],
        "total_params": total,
        "groups": [
            {
                "label": label,
                "params": n,
                "share": round(100 * n / total, 2),
                "vocab_bound": label in VOCAB_BOUND,
            }
            for label, n in groups.items()
        ],
    }

    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / "gpt-parameters.json"
    path.write_text(json.dumps(payload, indent=1))
    print(f"wrote {path}")
    for g in payload["groups"]:
        print(f"  {g['label']:<20} {g['params']:>9,}  {g['share']:5.1f}%")
    print(f"  {'total':<20} {total:>9,}   loss {payload['final_loss']}")


if __name__ == "__main__":
    main()

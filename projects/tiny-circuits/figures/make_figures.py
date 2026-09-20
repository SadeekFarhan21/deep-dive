"""Export the induction-score data the blog figures are drawn from.

The site renders these with D3; this script is the single source of the numbers,
read straight out of results/01_induction_scores.csv so a figure can never drift
from the run that produced it.

    python figures/make_figures.py
"""

import csv
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCORES = ROOT / "results" / "01_induction_scores.csv"
OUT = ROOT.parents[1] / "site" / "public" / "data"

# The five heads the literature names, recovered by this run.
CANONICAL = [(5, 5), (6, 9), (5, 1), (7, 10), (7, 2)]


def main():
    with SCORES.open() as fh:
        rows = [
            {
                "layer": int(r["layer"]),
                "head": int(r["head"]),
                "score": round(float(r["induction_score"]), 4),
            }
            for r in csv.DictReader(fh)
        ]

    ranked = sorted(rows, key=lambda r: -r["score"])
    payload = {
        "model": "GPT-2 small",
        "source": "results/01_induction_scores.csv",
        "measurement": "one cached forward pass over 8 sequences of 101 tokens",
        "n_layers": max(r["layer"] for r in rows) + 1,
        "n_heads": max(r["head"] for r in rows) + 1,
        "canonical": [{"layer": l, "head": h} for l, h in CANONICAL],
        "gap": round(ranked[4]["score"] - ranked[5]["score"], 4),
        "scores": rows,
    }

    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / "induction-scores.json"
    path.write_text(json.dumps(payload, indent=1))
    print(f"wrote {path} ({len(rows)} heads)")
    for r in ranked[:6]:
        print(f"  L{r['layer']}H{r['head']} {r['score']:.3f}")
    print(f"  gap after rank 5: {payload['gap']:.3f}")


if __name__ == "__main__":
    main()

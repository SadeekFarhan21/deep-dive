"""Optional Weights & Biases tracking for the interpretability experiments.

Each experiment script is one W&B run: it logs its config, headline metrics,
score tables, and figures. Tracking is opt-in (pass ``--wandb``) so the default
``uv run python experiments/...`` path stays key-free and fully reproducible
offline, matching the promise in the README.

Usage in an experiment:

    from tiny_circuits.tracking import init_run

    run = init_run("01-induction-scores", config={...}, enabled=args.wandb)
    run.log_figure("induction_scores", fig)
    run.log_table("scores", ["layer", "head", "score"], rows)
    run.summary({"top_head": "L5H5", "max_score": 0.71})
    run.finish()

When ``enabled`` is False every method is a no-op, so scripts can call the
same API unconditionally.
"""
from __future__ import annotations

import os
from typing import Any, Iterable, Sequence

PROJECT = "tiny-circuits"
# Falls back to the account's default entity if WANDB_ENTITY is unset.
ENTITY = os.environ.get("WANDB_ENTITY", "farhan-sadeek-personal")


class Run:
    """Thin wrapper over a wandb run so experiments use one API whether or not
    tracking is active. With no underlying run, every method is a no-op."""

    def __init__(self, run: Any | None = None) -> None:
        self._run = run

    @property
    def active(self) -> bool:
        return self._run is not None

    @property
    def url(self) -> str | None:
        return self._run.url if self._run is not None else None

    def log(self, data: dict[str, Any]) -> None:
        if self._run is not None:
            self._run.log(data)

    def summary(self, data: dict[str, Any]) -> None:
        if self._run is not None:
            self._run.summary.update(data)

    def log_figure(self, key: str, fig: Any) -> None:
        """Log a matplotlib Figure as a run image."""
        if self._run is not None:
            import wandb

            self._run.log({key: wandb.Image(fig)})

    def log_table(
        self, key: str, columns: Sequence[str], rows: Iterable[Sequence[Any]]
    ) -> None:
        """Log rows as a sortable/filterable W&B Table."""
        if self._run is not None:
            import wandb

            table = wandb.Table(columns=list(columns), data=[list(r) for r in rows])
            self._run.log({key: table})

    def finish(self) -> None:
        if self._run is not None:
            self._run.finish()


def init_run(name: str, config: dict[str, Any], enabled: bool) -> Run:
    """Start a W&B run for an experiment, or a no-op Run when disabled."""
    if not enabled:
        return Run(None)

    import wandb

    run = wandb.init(project=PROJECT, entity=ENTITY, name=name, config=config)
    return Run(run)

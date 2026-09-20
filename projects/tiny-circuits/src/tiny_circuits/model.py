"""Shared model-loading utilities.

Centralizes device selection and model loading so every experiment script
uses an identical, reproducible configuration.
"""
from __future__ import annotations

import torch
from transformer_lens import HookedTransformer

DEFAULT_MODEL = "gpt2"  # TransformerLens name for GPT-2 small (124M)
SEED = 1337


def get_device() -> str:
    """Prefer Apple MPS, then CUDA, then CPU."""
    if torch.backends.mps.is_available():
        return "mps"
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


def load_model(name: str = DEFAULT_MODEL, device: str | None = None) -> HookedTransformer:
    """Load a HookedTransformer with the standard interp-friendly processing.

    center_writing_weights / center_unembed / fold_ln are on by default in
    from_pretrained, which is what we want: they make the residual stream and
    logit-lens analyses clean without changing the model's computation.
    """
    device = device or get_device()
    torch.manual_seed(SEED)
    model = HookedTransformer.from_pretrained(name, device=device)
    model.eval()
    return model

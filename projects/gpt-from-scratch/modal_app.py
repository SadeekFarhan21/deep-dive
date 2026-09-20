"""Run GPT training on a Modal L4 GPU."""

from __future__ import annotations
import os
import subprocess
import modal


app = modal.App("gpt-from-scratch")
gpu_type = os.environ.get("MODAL_GPU", "L4")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .uv_pip_install("numpy>=2.0", "torch>=2.2", "tokenizers>=0.23.2")
    .add_local_dir("src", remote_path="/app/src")
    .add_local_file(
        "data/tokenizer.json",
        remote_path="/app/data/tokenizer.json",
    )
)

storage = modal.Volume.from_name(
    "gpt-from-scratch-data",
    create_if_missing=True,
)


@app.function(
    image=image,
    gpu=gpu_type,
    cpu=4.0,
    memory=16_384,
    max_containers=1,
    timeout=86_400,
    volumes={"/mnt/storage": storage},
)
def train(steps: int = 50_000, max_batch_size: int = 8192) -> None:
    checkpoint = "/mnt/storage/checkpoints/gpt-tinystories-e320-l8-c128.pt"
    try:
        process = subprocess.Popen(
            [
                "python",
                "-u",
                "/app/src/train.py",
                "--data",
                "/mnt/storage/tinystories.txt",
                "--token-cache",
                "/mnt/storage/tinystories.txt.tokens.uint16",
                "--output",
                checkpoint,
                "--resume",
                checkpoint,
                "--checkpoint-every",
                "500",
                "--device",
                "cuda",
                "--steps",
                str(steps),
                "--batch-size",
                "1",
                "--auto-batch-size",
                "--max-batch-size",
                str(max_batch_size),
                "--block-size",
                "128",
                "--embed-size",
                "320",
                "--heads",
                "8",
                "--layers",
                "8",
                "--amp",
            ],
        )
        while True:
            try:
                return_code = process.wait(timeout=60)
                if return_code != 0:
                    raise subprocess.CalledProcessError(return_code, process.args)
                break
            except subprocess.TimeoutExpired:
                storage.commit()
    finally:
        storage.commit()

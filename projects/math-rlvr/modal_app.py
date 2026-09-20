"""Run GRPO training + eval on a Modal L4 GPU (real CUDA, unlike the Mac).

Setup once:
    uv run modal setup                        # auth
    uv run modal secret create wandb WANDB_API_KEY=...   # for training logs

Baseline eval (before RL), trained eval (after), and training:
    uv run modal run modal_app.py --action eval-base
    uv run modal run modal_app.py --action train
    uv run modal run modal_app.py --action eval-trained

A persistent volume caches the model/datasets and stores the LoRA adapter, so
downloads happen once and the checkpoint survives container teardown.
"""

import os

import modal

app = modal.App("math-rlvr")
# Cheapest TOTAL cost for a 1.5B model: L4 (cheap/hr, bf16-capable) + vLLM.
# Bigger GPUs cost ~the same total (price scales with throughput); T4 is a false
# economy (no bf16, too slow). Override with MODAL_GPU if you want faster wall-clock.
GPU = os.environ.get("MODAL_GPU", "L4")

# The image mirrors the local uv deps (minus modal itself, plus CUDA torch).
image = (
    modal.Image.debian_slim(python_version="3.12")
    # Known-good stack (pinned to match local). vLLM omitted: TRL 0.16 vLLM is
    # server-based (needs a 2nd GPU), so it's unusable on one L4 — HF generate it is.
    .uv_pip_install(
        "torch==2.5.1",
        "transformers==4.49.0",
        "trl==0.16.1",
        "peft==0.14.0",
        "accelerate>=1.4.0",
        "datasets",
        "math-verify",
        "wandb",
    )
    # ship our source files into the image
    .add_local_file("data.py", "/app/data.py")
    .add_local_file("rewards.py", "/app/rewards.py")
    .add_local_file("step6_train.py", "/app/step6_train.py")
    .add_local_file("step4_eval.py", "/app/step4_eval.py")
)

vol = modal.Volume.from_name("math-rlvr-data", create_if_missing=True)
ROOT = "/mnt/storage"
ENV = {"HF_HOME": f"{ROOT}/hf", "PYTHONPATH": "/app"}
ADAPTER = f"{ROOT}/outputs/gsm8k_grpo_v2"  # old runs live in outputs/gsm8k_grpo


def _wandb_secret():
    # Read WANDB_API_KEY straight from the local .env (gitignored) and inject it
    # into the container as an env var. No `modal secret create` needed.
    try:
        return [modal.Secret.from_dotenv()]
    except Exception:
        return []


@app.function(
    image=image, gpu=GPU, cpu=8.0, memory=32_768, timeout=86_400,
    volumes={ROOT: vol}, secrets=_wandb_secret(),
)
def train(steps: int = 300, output_dir: str = ADAPTER):
    import subprocess
    cmd = [
        "python", "-u", "/app/step6_train.py",
        "--dataset", "gsm8k_train",
        "--steps", str(steps),
        "--num-generations", "8",
        "--max-completion-length", "640",
        # NOTE: no --use-vllm. TRL 0.16's vLLM is server-based (needs a 2nd GPU);
        # single-GPU colocate needs TRL >=0.18. HF generate works on one L4.
        "--wandb",
        "--run-name", f"gsm8k-grpo-{steps}steps",
        "--output-dir", output_dir,
    ]
    env = {**os.environ, **ENV}
    proc = subprocess.Popen(cmd, env=env)
    while True:
        try:
            rc = proc.wait(timeout=120)
            if rc != 0:
                raise subprocess.CalledProcessError(rc, proc.args)
            break
        except subprocess.TimeoutExpired:
            vol.commit()  # periodic checkpoint of the volume
    vol.commit()
    return output_dir


@app.function(
    image=image, gpu=GPU, cpu=8.0, memory=32_768, timeout=14_400,
    volumes={ROOT: vol},
)
def evaluate(dataset: str = "math_test", adapter: str | None = None,
             limit: int | None = None, pass1_only: bool = True):
    import subprocess
    cmd = ["python", "-u", "/app/step4_eval.py", "--dataset", dataset,
           "--batch-size", "64"]
    if pass1_only:
        cmd += ["--pass1-only"]        # fast headline metric (~minutes, not an hour)
    else:
        cmd += ["--k", "4"]
    if adapter:
        cmd += ["--adapter", adapter]
    if limit is not None:
        cmd += ["--limit", str(limit)]
    subprocess.run(cmd, env={**os.environ, **ENV}, check=True)


@app.local_entrypoint()
def main(action: str = "train", steps: int = 300, limit: int = 200):
    if action == "train":
        print("adapter saved to:", train.remote(steps=steps))
    elif action == "speedtest":  # throwaway dir so the real run still starts fresh
        print("adapter saved to:", train.remote(steps=steps, output_dir=f"{ROOT}/outputs/speedtest_05b"))
    elif action == "eval-base":
        evaluate.remote(dataset="math_test", limit=limit)          # in-distribution
    elif action == "eval-trained":
        evaluate.remote(dataset="math_test", adapter=ADAPTER, limit=limit)
    elif action == "eval-gsm8k":
        evaluate.remote(dataset="gsm8k_test", adapter=ADAPTER, limit=limit)  # easier transfer
    elif action == "eval-aime":
        evaluate.remote(dataset="aime", adapter=ADAPTER)           # hard generalization
    else:
        raise SystemExit(f"unknown action: {action}")

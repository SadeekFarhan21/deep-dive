import argparse
import gc
import os
from pathlib import Path
import torch

from data import LanguageModelDataset, tokenize_file
from model import GPT
from tokenizer import load_tokenizer

def main() -> None:
    project_dir = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description="Train the small GPT model")
    parser.add_argument("--data", type=Path, default=project_dir / "data" / "tinystories.txt")
    parser.add_argument(
        "--max-chars",
        type=int,
        default=None,
        help="maximum characters to load; default tokenizes and caches the entire corpus",
    )
    parser.add_argument(
        "--token-cache",
        type=Path,
        default=None,
        help="use an existing uint16 token cache without reading or tokenizing --data",
    )
    parser.add_argument("--steps", type=int, default=20_000)
    parser.add_argument("--log-every", type=int, default=10)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument(
        "--auto-batch-size",
        action="store_true",
        help="find the largest power-of-two CUDA batch up to --max-batch-size",
    )
    parser.add_argument("--max-batch-size", type=int, default=256)
    parser.add_argument("--block-size", type=int, default=64)
    parser.add_argument("--embed-size", type=int, default=256)
    parser.add_argument("--heads", type=int, default=8)
    parser.add_argument("--layers", type=int, default=6)
    parser.add_argument("--learning-rate", type=float, default=3e-4)
    parser.add_argument("--output", type=Path, default=project_dir / "checkpoints" / "gpt-tinystories.pt")
    parser.add_argument("--resume", type=Path, default=None)
    parser.add_argument("--checkpoint-every", type=int, default=1_000)
    parser.add_argument("--seed", type=int, default=1337)
    parser.add_argument("--device", default="auto", help="auto, cpu, cuda, or mps")
    parser.add_argument("--amp", action="store_true", help="use CUDA mixed-precision training")
    parser.add_argument("--wandb", action="store_true", help="log metrics to Weights & Biases")
    parser.add_argument("--wandb-project", default="gpt-from-scratch")
    parser.add_argument("--wandb-run-name", default=None)
    parser.add_argument("--wandb-entity", default=None)
    args = parser.parse_args()

    if args.steps <= 0:
        parser.error("--steps must be positive")
    if args.batch_size <= 0 or args.max_batch_size <= 0:
        parser.error("batch sizes must be positive")
    if args.log_every <= 0:
        parser.error("--log-every must be positive")
    if args.checkpoint_every <= 0:
        parser.error("--checkpoint-every must be positive")
    if args.embed_size % args.heads != 0:
        parser.error("--embed-size must be divisible by --heads")
    if args.max_chars is not None and args.max_chars <= 0:
        parser.error("--max-chars must be positive")
    if args.max_chars is not None and args.token_cache is not None:
        parser.error("--max-chars and --token-cache cannot be used together")

    torch.manual_seed(args.seed)

    if args.device == "auto":
        if torch.cuda.is_available():
            device = torch.device("cuda")
        elif torch.backends.mps.is_available():
            device = torch.device("mps")
        else:
            device = torch.device("cpu")
    else:
        device = torch.device(args.device)

    if device.type == "cuda" and not torch.cuda.is_available():
        parser.error("CUDA was requested but is not available")

    tokenizer_path = project_dir / "data" / "tokenizer.json"
    tokenizer = load_tokenizer(tokenizer_path)
    if args.max_chars is None:
        token_cache = args.token_cache
        if token_cache is None:
            token_cache = args.data.with_suffix(args.data.suffix + ".tokens.uint16")
            cache_is_stale = not token_cache.exists() or token_cache.stat().st_mtime_ns < max(
                args.data.stat().st_mtime_ns,
                tokenizer_path.stat().st_mtime_ns,
            )
            if cache_is_stale:
                token_count = tokenize_file(args.data, token_cache, tokenizer)
                print(f"cached {token_count:,} tokens at {token_cache}")
        elif not token_cache.exists():
            parser.error(f"token cache does not exist: {token_cache}")
        dataset = LanguageModelDataset.from_token_file(token_cache, tokenizer)
    else:
        with args.data.open(encoding="utf-8") as data_file:
            text = data_file.read(args.max_chars)
        dataset = LanguageModelDataset.from_text(text, tokenizer)
    model = GPT(
        vocab_size=tokenizer.get_vocab_size(),
        block_size=args.block_size,
        n_embed=args.embed_size,
        num_heads=args.heads,
        n_layers=args.layers,
        tokenizer=tokenizer,
    ).to(device)
    num_parameters = sum(p.numel() for p in model.parameters())
    print(f"data={args.data.name} device={device} parameters={num_parameters:,}")
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.learning_rate)
    use_amp = args.amp and device.type == "cuda"
    scaler = torch.amp.GradScaler("cuda", enabled=use_amp)
    start_step = 0
    last_loss = float("nan")

    if args.resume is not None and args.resume.exists():
        checkpoint = torch.load(args.resume, map_location=device, weights_only=False)
        model.load_state_dict(checkpoint["model_state_dict"])
        optimizer.load_state_dict(checkpoint["optimizer_state_dict"])
        if use_amp and "scaler_state_dict" in checkpoint:
            scaler.load_state_dict(checkpoint["scaler_state_dict"])
        start_step = int(checkpoint.get("step", 0))
        last_loss = float(checkpoint.get("final_loss", float("nan")))
        print(f"resumed checkpoint={args.resume} at step={start_step}", flush=True)

    if args.auto_batch_size:
        if device.type != "cuda":
            parser.error("--auto-batch-size requires a CUDA device")
        candidate = args.batch_size
        largest_successful = None
        while candidate <= args.max_batch_size:
            try:
                optimizer.zero_grad(set_to_none=True)
                inputs, targets = dataset.get_batch(
                    "train", candidate, args.block_size, device=device
                )
                with torch.autocast(
                    device_type="cuda", dtype=torch.float16, enabled=use_amp
                ):
                    probe_loss = model(inputs, targets)
                scaler.scale(probe_loss).backward()
                torch.cuda.synchronize()
                largest_successful = candidate
                print(f"batch probe: {candidate} fits", flush=True)
                del inputs, targets, probe_loss
                optimizer.zero_grad(set_to_none=True)
                candidate *= 2
            except torch.OutOfMemoryError:
                print(f"batch probe: {candidate} exceeded GPU memory", flush=True)
                optimizer.zero_grad(set_to_none=True)
                gc.collect()
                torch.cuda.empty_cache()
                break
        if largest_successful is None:
            raise RuntimeError(f"initial batch size {args.batch_size} does not fit")
        args.batch_size = largest_successful
        print(f"selected batch_size={args.batch_size}", flush=True)

    def save_checkpoint(step: int, loss_value: float) -> None:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        temporary = args.output.with_suffix(args.output.suffix + ".tmp")
        torch.save({
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "scaler_state_dict": scaler.state_dict(),
            "step": step,
            "config": {
                "vocab_size": tokenizer.get_vocab_size(),
                "block_size": args.block_size,
                "n_embed": args.embed_size,
                "num_heads": args.heads,
                "n_layers": args.layers,
            },
            "training": vars(args),
            "final_loss": loss_value,
            "tokenizer": str(tokenizer_path.resolve()),
        }, temporary)
        os.replace(temporary, args.output)
        print(
            f"saved checkpoint={args.output} step={step} "
            f"size={args.output.stat().st_size:,} bytes",
            flush=True,
        )

    run = None
    if args.wandb:
        import wandb

        run = wandb.init(
            project=args.wandb_project,
            entity=args.wandb_entity,
            name=args.wandb_run_name,
            config={**vars(args), "parameters": num_parameters},
        )

    for step in range(start_step, args.steps):
        inputs, targets = dataset.get_batch(
            "train",
            args.batch_size,
            args.block_size,
            device=device,
        )
        optimizer.zero_grad(set_to_none=True)
        with torch.autocast(
            device_type=device.type,
            dtype=torch.float16,
            enabled=use_amp,
        ):
            loss = model(inputs, targets)
        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()
        last_loss = loss.item()
        if step == 0 or (step + 1) % args.log_every == 0:
            print(f"step {step + 1}/{args.steps}: loss = {last_loss:.4f}")
            if run is not None:
                run.log({"train/loss": last_loss}, step=step + 1)
        if (step + 1) % args.checkpoint_every == 0:
            save_checkpoint(step + 1, last_loss)

    sample = model.generate_text("To be", 50)
    print(sample)
    if run is not None:
        run.log({"sample": sample})

    save_checkpoint(args.steps, last_loss)

    if run is not None:
        run.summary["final_loss"] = last_loss
        run.finish()


if __name__ == "__main__":
    main()

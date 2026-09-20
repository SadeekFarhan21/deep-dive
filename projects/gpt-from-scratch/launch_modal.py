"""Start the deployed Modal training function without attaching its lifecycle."""

from __future__ import annotations

import argparse

import modal


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--steps", type=int, default=50_000)
    parser.add_argument("--max-batch-size", type=int, default=256)
    args = parser.parse_args()

    train = modal.Function.from_name("gpt-from-scratch", "train")
    call = train.spawn(
        steps=args.steps,
        max_batch_size=args.max_batch_size,
    )
    print(f"started function_call={call.object_id}")


if __name__ == "__main__":
    main()

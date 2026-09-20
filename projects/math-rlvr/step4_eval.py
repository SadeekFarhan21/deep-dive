"""Step 4: Evaluation metrics — pass@1 and pass@k on a benchmark.

Baseline (before RL) on AIME:
    PYTORCH_ENABLE_MPS_FALLBACK=1 uv run step4_eval.py --dataset aime --limit 10 --k 4

After RL, point at the trained LoRA adapter:
    ... uv run step4_eval.py --dataset aime --adapter outputs/aime_grpo

Metrics:
  pass@1 = greedy answer correct? (deterministic, the headline number)
  pass@k = sample k answers; correct if ANY is right (upper bound / latent ability)
On a hard set expect pass@k >> pass@1. RL aims to close that gap.
"""

import argparse

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

from data import DATASETS
from rewards import _extract_boxed
from math_verify import parse, verify

MODEL = "Qwen/Qwen2.5-0.5B-Instruct"  # must match step6_train.py


def _correct(text: str, gold: str) -> bool:
    pred = _extract_boxed(text)
    if pred is None:
        return False
    try:
        return bool(verify(parse(gold), parse(pred)))
    except Exception:
        return False


@torch.no_grad()
def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dataset", default="aime", choices=list(DATASETS))
    p.add_argument("--adapter", default=None, help="path to trained LoRA adapter")
    p.add_argument("--limit", type=int, default=None)
    p.add_argument("--k", type=int, default=4, help="samples for pass@k")
    p.add_argument("--max-new-tokens", type=int, default=512, dest="max_new_tokens")
    p.add_argument("--batch-size", type=int, default=32, dest="batch_size")
    p.add_argument("--pass1-only", action="store_true", dest="pass1_only",
                   help="skip pass@k sampling (much faster; pass@1 is the headline metric)")
    args = p.parse_args()

    if torch.cuda.is_available():           # Modal L4 / any NVIDIA GPU
        device, dtype = "cuda", torch.bfloat16
    elif torch.backends.mps.is_available():  # local Mac
        device, dtype = "mps", torch.float16
    else:
        device, dtype = "cpu", torch.float32
    print(f"device={device}")

    tok = AutoTokenizer.from_pretrained(MODEL)
    if tok.pad_token is None:
        tok.pad_token = tok.eos_token
    tok.padding_side = "left"
    model = AutoModelForCausalLM.from_pretrained(MODEL, torch_dtype=dtype).to(device)
    if args.adapter:
        from peft import PeftModel
        model = PeftModel.from_pretrained(model, args.adapter)
        print(f"loaded adapter: {args.adapter}")
    model.eval()

    ds = DATASETS[args.dataset](limit=args.limit)
    n = len(ds)
    print(f"evaluating {n} problems from {args.dataset} (batch_size={args.batch_size})\n")

    prompts = [
        tok.apply_chat_template(ds[i]["prompt"], tokenize=False, add_generation_prompt=True)
        for i in range(n)
    ]
    golds = [ds[i]["answer"] for i in range(n)]

    def gen_batch(batch_prompts, sample: bool):
        """Generate one completion per prompt in the batch; return decoded texts."""
        enc = tok(batch_prompts, return_tensors="pt", padding=True,
                  truncation=True, max_length=1024).to(device)
        kw = dict(max_new_tokens=args.max_new_tokens, pad_token_id=tok.pad_token_id)
        if sample:
            kw.update(do_sample=True, temperature=0.9, top_p=0.95)
        else:
            kw.update(do_sample=False)
        out = model.generate(**enc, **kw)
        gen = out[:, enc["input_ids"].shape[1]:]
        return tok.batch_decode(gen, skip_special_tokens=True)

    p1_flags = [False] * n
    pk_flags = [False] * n
    for start in range(0, n, args.batch_size):
        end = min(start + args.batch_size, n)
        bp, bg = prompts[start:end], golds[start:end]

        # pass@1: one greedy completion per prompt (batched)
        for j, txt in enumerate(gen_batch(bp, sample=False)):
            hit = _correct(txt, bg[j])
            p1_flags[start + j] = hit
            pk_flags[start + j] = hit  # pass@1 success counts for pass@k too

        # pass@k: k sampled rounds, batched; mark any prompt whose sample is correct
        if not args.pass1_only:
            for _ in range(args.k):
                for j, txt in enumerate(gen_batch(bp, sample=True)):
                    if not pk_flags[start + j] and _correct(txt, bg[j]):
                        pk_flags[start + j] = True
        print(f"  {end}/{n} done  (pass@1 so far: {sum(p1_flags[:end])}/{end})")

    pass1 = sum(p1_flags)
    print("\n=== METRICS ===")
    print(f"pass@1        : {pass1}/{n} = {pass1/n:.1%}")
    if not args.pass1_only:
        passk = sum(pk_flags)
        print(f"pass@{args.k}        : {passk}/{n} = {passk/n:.1%}")
        print("(pass@k >> pass@1 means the ability exists but is unreliable — RL's target)")


if __name__ == "__main__":
    main()

"""Step 6: GRPO training with TRL + LoRA. Default: GSM8K (rich reward signal).

Local smoke test (slow on MPS, just to see it run):
    PYTORCH_ENABLE_MPS_FALLBACK=1 uv run step6_train.py --dataset gsm8k_train --steps 5

Real run happens on a Modal L4 (see modal_app.py), where use_vllm + bf16 + the
full dataset + wandb are enabled.

What to watch:
  - [reward] lines from rewards.py: on GSM8K, std should be > 0 often (some
    rollouts right, some wrong) => nonzero advantage => real learning signal.
  - reward/mean should trend UP over steps; completion length usually grows too.

GRPO in one breath: per prompt, sample num_generations answers, score each,
advantage = reward - group_mean, push policy toward above-average answers.
"""

import argparse
import os

import torch
from peft import LoraConfig, PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer, StoppingCriteria, StoppingCriteriaList
from trl import GRPOConfig, GRPOTrainer

from data import DATASETS
from rewards import BOXED_RE, correctness_reward, format_reward

MODEL = "Qwen/Qwen2.5-0.5B-Instruct"  # small + fast; the 1.5B Math base was too slow


def build_trainer(args):
    on_cuda = torch.cuda.is_available()  # CUDA (L4) => bf16 + vllm; MPS/CPU => fp32

    train_ds = DATASETS[args.dataset](limit=args.limit)
    print(f"training on {len(train_ds)} problems from {args.dataset}")

    # Continue from the previous run's weights if an adapter already exists at
    # output_dir; otherwise start a fresh LoRA on the base model. This makes each
    # run BUILD ON the last (train -> improve -> train again -> improve more).
    adapter_exists = os.path.exists(os.path.join(args.output_dir, "adapter_config.json"))
    if adapter_exists:
        print(f"continuing training from existing adapter at {args.output_dir}")
        base = AutoModelForCausalLM.from_pretrained(
            MODEL, torch_dtype=torch.bfloat16 if on_cuda else torch.float32
        )
        # is_trainable=True is required or the loaded adapter is frozen.
        model = PeftModel.from_pretrained(base, args.output_dir, is_trainable=True)
        lora = None  # model is already a PEFT model; don't attach a second adapter
    else:
        print("starting fresh LoRA on the base model")
        model = MODEL
        lora = LoraConfig(
            r=32, lora_alpha=64, lora_dropout=0.05, bias="none", task_type="CAUSAL_LM",
            target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                            "gate_proj", "up_proj", "down_proj"],
        )

    cfg = GRPOConfig(
        output_dir=args.output_dir,
        run_name=args.run_name,
        learning_rate=1e-6,
        beta=0.04,
        temperature=0.9,
        num_generations=args.num_generations,
        max_prompt_length=512,
        max_completion_length=args.max_completion_length,
        per_device_train_batch_size=args.num_generations,
        gradient_accumulation_steps=args.grad_accum,
        max_steps=args.steps,
        gradient_checkpointing=True,
        gradient_checkpointing_kwargs={"use_reentrant": False},  # let grads flow to LoRA
        bf16=on_cuda,
        fp16=False,
        # TRL 0.16 runs vLLM colocated in-process; carve out ~30% of the L4 for
        # its KV cache and leave the rest for LoRA training. (No vllm_mode here.)
        use_vllm=args.use_vllm,
        vllm_gpu_memory_utilization=0.3,
        logging_steps=1,
        save_steps=args.save_steps,
        report_to=(["wandb"] if args.wandb else []),
        log_completions=True,
    )

    # Keep eos == pad (<|endoftext|>): HF pads stopped rollouts with pad, and TRL
    # masks the completion at the first eos, so the two must match.
    tokenizer = AutoTokenizer.from_pretrained(MODEL, padding_side="left")
    tokenizer.eos_token = tokenizer.pad_token  # Instruct models set eos=<|im_end|>

    trainer = GRPOTrainer(
        model=model,
        processing_class=tokenizer,
        reward_funcs=[correctness_reward, format_reward],
        args=cfg,
        train_dataset=train_ds,
        peft_config=lora,   # None when continuing an existing adapter
    )
    _patch_generate(trainer.model, tokenizer)
    return trainer


class _StopAfterBoxed(StoppingCriteria):
    """Stop each rollout once its completion contains a closed \\boxed{...}.

    The base model never emits <|im_end|> (its chat tokens are untrained), so
    without this every rollout rambles to max_completion_length."""

    def __init__(self, tokenizer, prompt_len):
        self.tokenizer = tokenizer
        self.prompt_len = prompt_len  # the prompt itself mentions \boxed{}, so skip it

    def __call__(self, input_ids, scores, **kwargs):
        texts = self.tokenizer.batch_decode(input_ids[:, self.prompt_len:], skip_special_tokens=True)
        return torch.tensor([BOXED_RE.search(t) is not None for t in texts], device=input_ids.device)


def _patch_generate(model, tokenizer):
    """Two fixes around TRL 0.16's generate() call:
    - it generates in train mode, where gradient checkpointing forces
      use_cache=False (no KV cache -> quadratic); flip to eval for generation.
    - stop on <|im_end|> or right after the boxed answer, not at max length."""
    orig_generate = model.generate
    im_end = tokenizer.convert_tokens_to_ids("<|im_end|>")

    def generate(input_ids, *args, **kwargs):
        kwargs["stopping_criteria"] = StoppingCriteriaList([_StopAfterBoxed(tokenizer, input_ids.shape[1])])
        kwargs["eos_token_id"] = [tokenizer.eos_token_id, im_end]
        was_training = model.training
        model.eval()
        try:
            return orig_generate(input_ids, *args, **kwargs)
        finally:
            if was_training:
                model.train()

    model.generate = generate


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dataset", default="gsm8k_train", choices=list(DATASETS))
    p.add_argument("--limit", type=int, default=None)
    p.add_argument("--steps", type=int, default=5)
    p.add_argument("--num-generations", type=int, default=8, dest="num_generations")
    p.add_argument("--grad-accum", type=int, default=2, dest="grad_accum")
    p.add_argument("--max-completion-length", type=int, default=640, dest="max_completion_length")
    p.add_argument("--use-vllm", action="store_true", dest="use_vllm")
    p.add_argument("--wandb", action="store_true")
    p.add_argument("--output-dir", default="outputs/gsm8k_grpo", dest="output_dir")
    p.add_argument("--run-name", default="gsm8k-grpo", dest="run_name")
    p.add_argument("--save-steps", type=int, default=100, dest="save_steps")
    args = p.parse_args()

    trainer = build_trainer(args)
    trainer.train()
    trainer.save_model(args.output_dir)
    print(f"saved adapter to {args.output_dir}")


if __name__ == "__main__":
    main()

"""Step 3: Load the model, have it attempt a real GSM8K problem, and score it.

Run with:  uv run step3_generate.py

This connects Step 1 (data) + Step 2 (verifier) with the actual LLM. On a Mac
this runs on CPU or MPS (Apple GPU) — slow (~30-90s for one answer) but it works
with no cloud GPU. We are NOT training yet; just watching the model try, and
checking correctness. This single generate+verify is exactly what "eval" and
one "rollout" in training are made of.
"""

import torch
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer

from step2_verifier import extract_boxed, verified_correct

MODEL = "Qwen/Qwen2.5-0.5B-Instruct"

# System prompt: tell the model HOW to answer so the verifier can parse it.
# The "\boxed{}" instruction is what makes the output machine-checkable.
SYSTEM = (
    "You are a careful math solver. Reason step by step, then give the final "
    "answer on its own line as \\boxed{<answer>}."
)

# --- pick the best device available on this Mac -------------------------------
if torch.backends.mps.is_available():
    device, dtype = "mps", torch.float16
else:
    device, dtype = "cpu", torch.float32
print(f"Using device={device}, dtype={dtype}")

# --- load model + tokenizer (first run downloads ~3GB, then cached) -----------
print("Loading model (first time downloads ~3GB)...")
tok = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForCausalLM.from_pretrained(MODEL, torch_dtype=dtype).to(device)
model.eval()

# --- grab one problem from the TEST split (unseen during any future training) -
ds = load_dataset("openai/gsm8k", "main", split="test")
ex = ds[0]
question = ex["question"]
gold = ex["answer"].split("####")[-1].strip()

print("\n" + "=" * 70)
print(f"QUESTION:\n{question}")
print(f"\nGOLD ANSWER: {gold}")
print("=" * 70)

# --- build the prompt using the model's chat template -------------------------
messages = [
    {"role": "system", "content": SYSTEM},
    {"role": "user", "content": question},
]
prompt = tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tok(prompt, return_tensors="pt").to(device)

# --- generate ONE answer (greedy = deterministic, good for eval) --------------
print("\nGenerating (this can take a while on CPU/MPS)...")
with torch.no_grad():
    out = model.generate(**inputs, max_new_tokens=512, do_sample=False)

# strip the prompt tokens; decode only what the model newly wrote
completion = tok.decode(out[0, inputs["input_ids"].shape[1]:], skip_special_tokens=True)

print("\n--- MODEL OUTPUT ---")
print(completion)

# --- score it with the Step 2 verifier ----------------------------------------
pred = extract_boxed(completion)
correct = verified_correct(pred, gold) if pred is not None else False
print("\n--- VERDICT ---")
print(f"extracted answer: {pred!r}")
print(f"gold answer:      {gold!r}")
print(f"REWARD:           {1.0 if correct else 0.0}")

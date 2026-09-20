"""Step 1: Load GSM8K and look at what one training example actually is.

Run with:  uv run step1_look_at_data.py

The whole point of this step: understand the raw material of RLVR. Each example
is a math PROBLEM paired with its known correct ANSWER. That "known answer" is
what lets us verify scorrectness later without any human or reward model.
"""

from datasets import load_dataset

# GSM8K = 8.5k grade-school word problems. config "main", split "train" (7.5k rows).
# First run downloads + caches it (~10MB); later runs are instant.
ds = load_dataset("openai/gsm8k", "main", split="train")

print(f"Number of training problems: {len(ds)}")
print(f"Columns: {ds.column_names}\n")

# Look at the first 3 examples in full.
for i in range(3):
    ex = ds[i]
    print("=" * 70)
    print(f"QUESTION:\n{ex['question']}\n")
    print(f"RAW ANSWER FIELD:\n{ex['answer']}\n")

    # Notice the answer ends with '#### <number>'. That trailing number is the
    # gold final answer; everything before it is the reference reasoning.
    gold = ex["answer"].split("####")[-1].strip()
    print(f">>> Extracted gold answer: {gold!r}")

---
name: coding-exercise
description: Guide the learner through a hands-on coding exercise to reinforce an LLM concept with scaffolding and checkpoints.
---

# Coding Exercise Workflow

## Goal

Solidify understanding by having the learner write and run real code, with guided scaffolding.

## Steps

### 1. State the Goal Clearly

One sentence: what will the learner build and why does it matter?

> Example:
> "We're going to build a tiny bigram language model from scratch — the simplest possible model that predicts the next character given the current one. This is the foundation of how GPT works."

### 2. Provide Starter Code (Scaffold)

Give a skeleton with `# TODO` comments. The learner fills in the blanks.

> Example scaffold:
>
> ```python
> import torch
> import torch.nn as nn
>
> # Step 1: Load text data
> text = open("input.txt").read()
> chars = sorted(set(text))
> vocab_size = len(chars)
>
> # Step 2: Build character mappings
> # TODO: create stoi (str→int) and itos (int→str) dicts
>
> # Step 3: Encode the text
> # TODO: convert the full text string to a list of integers
>
> # Step 4: Define the Bigram Model
> class BigramModel(nn.Module):
>     def __init__(self, vocab_size):
>         super().__init__()
>         # TODO: define an Embedding table of shape (vocab_size, vocab_size)
>
>     def forward(self, x):
>         # TODO: look up embeddings for x and return logits
>         pass
> ```

### 3. Run Together — Incremental Steps

Break the exercise into small checkpoints. After each:

- Tell the learner what to run.
- Show the expected output.
- Explain any error they might hit.

> Checkpoint example:
>
> ```
> ✅ After Step 2: print(stoi['a'])  →  should output an integer like 1
> ✅ After Step 3: print(encoded[:10])  →  should output a list of 10 integers
> ```

### 4. Stretch Goal (optional)

Offer one small extension for learners who finish early.

> Example:
> "Can you modify the model to predict the next 2 characters instead of 1? What changes?"

### 5. Debrief

After the exercise, ask:

- "What surprised you?"
- "Where did you get stuck and why?"
- "What would break if we removed the embedding table?"

## Coding Principles to Enforce

- No magic numbers — name your constants.
- Print intermediate values to build intuition.
- Prefer `torch` over `numpy` for anything model-related.
- Always set a random seed (`torch.manual_seed(42)`) for reproducibility.

## Common Errors and How to Handle Them

| Error | Likely Cause | Guidance |
|-------|-------------|----------|
| `IndexError` | Off-by-one in tensor slicing | Walk through tensor shapes step by step |
| `RuntimeError: size mismatch` | Embedding/linear layer dimension mismatch | Print `.shape` at every step |
| `AttributeError` | Forgot `super().__init__()` | Explain Python class inheritance briefly |

## Resources

- Andrej Karpathy — "Let's build GPT from scratch" (YouTube)
- PyTorch docs — `nn.Embedding`, `nn.Linear`, `F.cross_entropy`

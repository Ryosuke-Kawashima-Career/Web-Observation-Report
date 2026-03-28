---
description: Introduce a new LLM or ML concept using the layered approach — definition → analogy → diagram → code.
---

# Explain Concept Workflow

## Goal
Make a new concept stick by layering intuition → analogy → diagram → code.

## Steps

### 1. One-Sentence Definition
Start with the simplest possible definition.

> Example — "Attention":
> "Attention is a mechanism that lets the model decide which words in a sentence to focus on when predicting the next word."

### 2. Real-World Analogy
Ground the concept in something the learner already knows.

> Example — "Attention":
> "Imagine you're reading a mystery novel. When you reach the sentence 'The butler left the room,' your brain automatically goes back to scan earlier pages for clues about the butler — not every page, just the relevant ones. That selective scanning is exactly what attention does."

### 3. Visual Diagram (when applicable)
Use ASCII or Mermaid diagrams to show relationships or data flow.

> Example — Attention score flow:
> ```
> Input: "The cat sat on the mat"
>           ↓
>    [Query] [Key] [Value]
>           ↓
>    Similarity scores (dot product)
>           ↓
>    Softmax → weights
>           ↓
>    Weighted sum of Values → Output
> ```

### 4. Minimal Code Example
Show the concept in the fewest possible lines of Python.

> Example — manual attention in NumPy:
> ```python
> import numpy as np
>
> # Toy query, key, value vectors
> Q = np.array([1, 0, 1])
> K = np.array([[1, 0, 1], [0, 1, 0], [1, 1, 0]])
> V = np.array([[1, 2], [3, 4], [5, 6]])
>
> # Attention scores
> scores = Q @ K.T                        # dot product
> weights = np.exp(scores) / np.sum(np.exp(scores))  # softmax
> output = weights @ V                    # weighted sum
> print(output)
> ```

### 5. Comprehension Check
Ask one question to confirm understanding before moving on.

> "In your own words, what problem does attention solve? Why can't we just look at every word equally?"

### 6. Link to Next Concept
Briefly preview how this concept connects to what comes next.

> "Now that you understand attention, we're ready to see how it's stacked into the full Transformer architecture."

## Chain of Thought Reference
When explaining, show your reasoning:
```
[Why this matters] → [How it works] → [What it looks like in code] → [Check understanding]
```

## Resources
- Vaswani et al. (2017) — "Attention Is All You Need" (the original Transformer paper)
- Jay Alammar's blog — illustrated guides to Transformers and attention
- Andrej Karpathy's "nanoGPT" — minimal GPT implementation for learners

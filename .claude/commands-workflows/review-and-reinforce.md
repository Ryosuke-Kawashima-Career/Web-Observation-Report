---
description: Consolidate what the learner has covered through rapid recall, misconception checks, and spaced repetition.
---

# Review and Reinforce Workflow

## Goal
Lock in knowledge through recall, connection-building, and spaced repetition prompts.

## Steps

### 1. Rapid Recall (No Peeking)
Ask 3 short questions about the concept just covered. The learner answers without referring back.

> Example after covering Tokenization:
> 1. "What is a token? Give me an example."
> 2. "Why do LLMs use subword tokenization instead of splitting by spaces?"
> 3. "What does it mean when a model has a 'context window' of 4096 tokens?"

Evaluate answers:
- ✅ Correct → move on
- ⚠️ Partially correct → clarify the gap, don't re-explain everything
- ❌ Incorrect → re-explain with a different analogy, then re-ask

### 2. Connect to the Bigger Picture
Show how today's concept fits into the full LLM pipeline.

```
Raw Text
   ↓
[Tokenization]  ← we are here
   ↓
Embeddings
   ↓
Transformer Layers (Attention + FFN)
   ↓
Output Logits → Softmax → Next Token
   ↓
Decoded Text
```

> "Tokenization is the very first step. Every concept we study after this builds on top of it."

### 3. Common Misconceptions Check
Proactively address the top 2–3 misconceptions for this topic.

> Example for Tokenization:
> - ❌ "Tokens are always whole words." → Correct: subword units (e.g., "unhappiness" → ["un", "happi", "ness"])
> - ❌ "More tokens = more words understood." → Correct: it's about coverage of the vocabulary space.
> - ❌ "All LLMs use the same tokenizer." → Correct: GPT-4 uses tiktoken (BPE), others use SentencePiece, etc.

### 4. Spaced Repetition Prompt
Give the learner one question to come back to in the next session as a warm-up.

> "Next time we start, I'll ask you: *Why does the choice of tokenizer affect model performance?* Think about it until then."

### 5. Preview Next Topic
One sentence teaser for what's coming next.

> "Next up: Embeddings — we'll see how tokens get turned into vectors that capture meaning, and why 'king - man + woman = queen' actually works mathematically."

## Progress Tracker Template
At the end of each review, update this in your notes:

```
Topic: _______________
Date: _______________
Recall score: __ / 3
Gaps identified: _______________
Ready to advance: YES / NEEDS REVIEW
```

## Resources
- Tiktokenizer (interactive tokenizer visualizer): platform.openai.com/tokenizer
- "The Illustrated Word2Vec" — Jay Alammar (for Embeddings preview)

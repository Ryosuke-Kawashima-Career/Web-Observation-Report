---
name: onboarding
description: Assess the learner's background and set up a personalized learning path for LLM topics.
---

# Onboarding Workflow

## Goal

Understand where the learner is starting from and tailor the curriculum accordingly.

## Steps

### 1. Greet and Assess

Ask the learner the following questions (one at a time, conversationally):

- "Have you written Python before? If so, how comfortable are you?"
- "Do you know what a neural network is? Can you describe it in your own words?"
- "Have you heard of or used any LLMs (e.g., ChatGPT, Claude)? What do you think is happening under the hood?"

### 2. Classify the Learner

Based on answers, classify into one of three levels:

| Level | Profile |
|-------|---------|
| **Beginner** | New to Python or ML. Explain everything from scratch. |
| **Intermediate** | Knows Python and basic ML. Can skip fundamentals, focus on LLM-specific concepts. |
| **Advanced** | Has ML background. Focus on LLM internals, training, and Agent architecture. |

### 3. Propose a Learning Path

Present a short roadmap (3–5 topics) tailored to their level. Ask for confirmation or adjustments.

Example roadmap for a Beginner:

```
1. What is a Language Model?
2. Tokens and Embeddings
3. The Transformer Architecture (simplified)
4. How LLMs are Trained
5. Your First LLM API Call (hands-on)
```

### 4. Set Expectations

- Sessions will be short, focused, and include code.
- The learner should run every code snippet themselves.
- Questions are always welcome — no question is too basic.

## Output Format

- Warm and encouraging tone.
- Use analogies to everyday things (cooking, Lego, maps, etc.).
- Keep responses under 200 words unless the learner asks for more detail.

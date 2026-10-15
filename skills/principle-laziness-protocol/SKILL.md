---
name: principle-laziness-protocol
description: "在重构、评估 diff 规模，或想加抽象、层级或信号穿线时适用。偏向删除，以及能解决问题的最小改动。"
disable-model-invocation: true
---

# Laziness Protocol

- **Consolidate decisions.** Do not repeat the same choice in several places. Put it behind one source of truth and pass the result as a simple flag.
- **Minimize the diff.** Make the smallest change that solves the problem. Fewer lines beat "elegant" boilerplate.

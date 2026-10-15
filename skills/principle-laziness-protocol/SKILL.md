---
name: principle-laziness-protocol
description: "重构、看 diff 大小，或想加抽象、分层、把信号逐层下传时，优先删除，只取能解决问题的最小改动。"
disable-model-invocation: true
---

# Laziness Protocol

- **Consolidate decisions.** Do not repeat the same choice in several places. Put it behind one source of truth and pass the result as a simple flag.
- **Minimize the diff.** Make the smallest change that solves the problem. Fewer lines beat "elegant" boilerplate.

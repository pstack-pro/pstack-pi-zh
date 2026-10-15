---
name: principle-laziness-protocol
description: "Apply when refactoring, evaluating diff size, or tempted to add abstractions, layers, or signal threading. Bias toward deletion and the smallest change that solves the problem."
disable-model-invocation: true
---

# Laziness Protocol

- **合并决策。** 不要在多处重复同一个选择。把它放到唯一事实来源后面，结果以简单的标志位传递。
- **最小化 diff。** 用能解决问题的最小改动。更少的行数胜过「优雅」的样板代码。

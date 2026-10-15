---
name: principle-laziness-protocol
description: "重构、控制 diff 大小，或想加抽象、分层、把信号一层层下传时：优先删，只留能解决问题的最小改动。"
disable-model-invocation: true
---

# Laziness Protocol

- **合并决策。** 不要在多处重复同一个选择。把它放到唯一事实来源后面，结果以简单的标志位传递。
- **最小化 diff。** 用能解决问题的最小改动。更少的行数胜过「优雅」的样板代码。

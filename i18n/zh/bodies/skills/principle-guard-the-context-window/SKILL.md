---
name: principle-guard-the-context-window
description: "Apply when context is filling up: large outputs, long files, repeated reads, fan-out planning. Route bulk to subagents; keep summaries in the main thread, not raw payloads."
disable-model-invocation: true
---

# 守护上下文窗口

**为什么：** 上下文溢出会拉低推理质量、产生压缩伪影，并让工作停滞。

**模式：**
- **分阶段，限定范围。** 限制每个阶段的文件数量，设定回合预算，把机制开销算进去。

---
name: principle-guard-the-context-window
description: "上下文窗口快满（大输出、长文件、重复读、扇出规划）时，大块交给子代理，主线程只留摘要，不留原始内容。"
disable-model-invocation: true
---

# 守护上下文窗口

**为什么：** 上下文溢出会拉低推理质量、产生压缩伪影，并让工作停滞。

**模式：**
- **分阶段，限定范围。** 限制每个阶段的文件数量，设定回合预算，把机制开销算进去。

---
name: principle-redesign-from-first-principles
description: "Apply when integrating a new requirement into an existing design."
disable-model-invocation: true
---

# 从第一性原理重新设计

集成变更时，不要生硬地把它加装到现有设计上。要当作这个需求从一开始就是根基假设，据此重新设计。

- 阅读所有受影响的文件，理解当前设计
- 问自己："如果带着这个新需求从头写，我们会构建什么？"
- 把改动贯穿到每一处引用：类型、文档、示例、rationale 部分
- 先想清楚整体重新设计，再分步交付

这就是把变更集成进现有设计时，保留选择余地的方法。

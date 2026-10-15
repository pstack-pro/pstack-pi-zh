---
name: principle-subtract-before-you-add
description: "Apply when sequencing an addition, refactor, or rewrite. Remove dead code, redundant validators, and stub references first, then build on the simpler base."
disable-model-invocation: true
---

# 先减后加

演进系统时，先去掉复杂度，再动手构建。默认做减法。

把简化当成持续投入。离开时，让设计比接手时更简单、能力更强，而对外接口不变甚至更小。

- 先删减，后构建
- 先删减，后打磨（先做到最小，再投入精力提升质量）
- 按实际观察到的用法设计，不为臆想的边界情况设计
- 除规格要求之外，不要加臆想的校验器、解析器或守卫
- 简化提示词（删掉冗余指令和过度模板）
- 引用的内容没有新东西时，直接删掉，不要留占位

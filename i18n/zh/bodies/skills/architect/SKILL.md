---
name: architect
description: "Sketch types, signatures, and module structure before code, then stay in the loop while implementation fills in. Use for /architect, 'architect this', 'design this', or non-trivial work where jumping to code would lock in the wrong shape."
disable-model-invocation: true
---

# Architect

先用 `not implemented` 函数体和伪代码，勾出类型、函数签名、类的形状和模块边界。综合多个模型的视角，再照着选定的草图填代码。

## 开始

动手前先开一个待办清单，每个阶段一条。

1. 摸清
2. 草图
3. 确认
4. 实现
5. 推倒

<a id="phase-a-ground-the-problem"></a>
## 阶段 A：摸清问题

新代码要碰到的每个系统，都得真正建立心智模型。对相关子系统运行 **how** skill。报个文件名不算摸清，要产出 `how` 要求的架构讲解。如果设计会重新划分归属或分层，还要对现有形态运行 **why** skill，让当初的理由变成约束，而不是猜测。

只有当工作确实从零开始、周围没有要对接的系统时，才跳过阶段 A。

## 阶段 B：画草图

把「设计草图」当作任务，带上阶段 A 摸清问题时的产物，运行 **arena** skill。把 `references/runner-prompt.md` 作为每个 runner 的提示词。

runner 从 `pstack-models.mdc` 这条 rule 的 `architect runners` 行里取，替代 `arena runners` 行。如果没有这条 rule 或这一行，就用 `claude-opus-5-5-xhigh` 和 `grok-4.7-xhigh-fast`。别名条目和被拒条目，按 **arena** skill 阶段 A 的 runner 规则处理。

设计至少做两遍。综合之前至少要有两个结构上不同的候选，哪怕第一个看起来已经够用。这是把 **exhaust-the-design-space** 原则 skill 落到实处。要的是整体形态不同的方案，不是在同一个形态里改一点。

综合之前，用 [`references/design-red-flags.md`](references/design-red-flags.md) 把每个候选筛一遍。假定下一个贡献者是 agent，它只看得见自己打开的文件，照抄最近的例子，走能编译通过的最短路径。优先选这样的设计：从单个文件看是对的改动，对整个仓库也是对的。

在可行的候选之间比较接口深度。哪个设计能用更小、更简单的公开接口藏住更多复杂度，就选哪个。公开接口可以很丰富。把能力集中在一处，而不是散到好几层，调用链反而更短。

arena 返回一份综合后的设计包。它的综合决策写进 rationale 的「综合决策」一节。

## 阶段 C：确认（可选）

默认直接拿综合后的设计去实现，中途不停下等人。

只有调用者明确要求时才加确认点，例如 "/architect with checkpoint"（跑 architect 时带确认点）、"stop and show me before implementing"（实现前先停下给我看），或类似说法。这时把综合后的设计摆出来，停下等对方点头。

两种情况里，综合结果都可以单独作为一次提交，也就是 **foundational-thinking** 原则 skill 里的 "scaffold first"（先搭脚手架）模式。按 **outcome-oriented-execution** 原则 skill，填代码期间有计划、有范围的临时破坏没问题。实现前想对设计做对抗性施压，就对综合后的草图运行 **interrogate** skill。

如果人对形态有异议（不管是在确认点上还是事后），就把它当作阶段 A 的证据。先重新摸清、重跑阶段 B，再接着写代码。

## 阶段 D：照着草图实现

把 `not implemented` 函数体换成代码，把伪代码换成逻辑。综合后的草图就是契约。偏离它是需要说出来的信号，不是默默消化的阻力。如果某个函数需要草图没想到的参数，问一句：是草图错了，是需求漏了，还是实现做多了。

## 阶段 E：架构不对就推倒

如果实现一直冒出草图消化不了的阻力，就扔掉草图。按 **redesign-from-first-principles** 和 **fix-root-causes** 原则 skill，别在错误的设计上打补丁。

要看的是*规律*，不是单个现象。征兆：

- 同一种权宜之计在互不相关的代码里反复出现。
- 一堆互不相关的边界情况都要加特殊分支。
- 类型得靠逃生口（`any`、强制转换、实际总会被赋值的可选字段）才能编译通过。
- 草图说状态不共享，却冒出「这里得加把锁」的念头。
- 调用方得懂抽象内部的规矩才能用它。
- 整个实现里有两处或更多互相独立、形态却相同的阶段 D 偏离。

得自己判断。几个边界情况不足以判一个架构死刑。有些问题本来就复杂。数据复杂不等于设计复杂。

推倒时：

1. 对已经写出来的东西重新运行 **how** skill。
2. 按 redesign-from-first-principles，把新约束当成第一天就有的前提，重新设计。
3. 按 **subtract-before-you-add** 原则 skill，先减再加。新草图在长大之前，应该先比旧的小。
4. 回到阶段 B，重跑 arena。

## 产出

先写调用方怎么用，再从用法倒推出类型草图。小改动用一个文件，放新类型和签名。更大的工作则是模块图加类型定义。rationale 一起交，按 `references/rationale-template.md` 的结构写，包括用法草图和综合决策。

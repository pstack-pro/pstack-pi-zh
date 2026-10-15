---
name: architect
description: "Sketch types, signatures, and module structure before code, then stay in the loop while implementation fills in. Use for /architect, 'architect this', 'design this', or non-trivial work where jumping to code would lock in the wrong shape."
disable-model-invocation: true
---

# Architect

用 `not implemented` 函数体和伪代码，画出类型、函数签名、类的形态和模块边界。综合多个模型的视角，再照着选定的草图填代码。

## 开始

动手前先开一个待办清单，每个阶段一条。

1. 摸清
2. 草图
3. 确认
4. 实现
5. 推倒

<a id="phase-a-ground-the-problem"></a>
## 阶段 A：摸清问题

新代码会碰到的每个系统，都要真正建立心智模型。对相关子系统运行 **how** skill。说出一个文件名不算摸清。要产出 `how` 规定的架构讲解。如果设计要重新划定归属或分层，还要对现有形态运行 **why** skill，让当初的理由成为约束，而不是猜测。

只有工作确实是从零开始、周围没有要对接的系统时，才跳过阶段 A。

## 阶段 B：画草图

用设计草图这个任务、带上阶段 A 摸清问题时的产物，运行 **arena** skill。把 `references/runner-prompt.md` 当作每个 runner 的提示词。

runner 取 `pstack-models.mdc` 这条 rule 里的 `architect runners` 行，代替 `arena runners` 行。如果没有这条 rule 或没有这一行，就用 `claude-opus-5-5-xhigh` 和 `grok-4.7-xhigh-fast`。别名条目和被拒的条目，按 **arena** skill 阶段 A 里的 runner 规则处理。

设计做两遍。综合之前至少要有两个结构上不同的候选，即使第一个看起来已经够用。这是把 **exhaust-the-design-space** 原则 skill 落到实处。要整体形态不同的方案，不是在同一个形态里修一点。

综合之前，拿 [`references/design-red-flags.md`](references/design-red-flags.md) 把每个候选筛一遍。假定下一个贡献者是代理，它只看见自己打开的文件，抄最近的例子，走能编译通过的最短路径。优先选这样的设计：从单个文件看起来对的改动，对整个仓库也是对的。

在可行的候选之间比较接口深度。哪个设计用更小、更简单的公开接口藏住更多复杂度，就选哪个。公开接口可以很丰富。把能力集中在一处，而不是散到好几层，调用链反而更短。

arena 返回一份综合后的设计包。它的综合决策写进 rationale 的「综合决策」一节。

## 阶段 C：确认（可选）

默认直接拿综合后的设计去实现。中间不停下来等人。

只有调用者明确要求时才加确认点，例如 "/architect with checkpoint"（跑 architect 时带上确认点）、"stop and show me before implementing"（实现前先停下来给我看），或类似说法。这时把综合后的设计拿出来，停下等对方点头。

两种情况下，综合结果都可以单独作为一次提交，也就是 **foundational-thinking** 原则 skill 里的 "scaffold first"（先搭脚手架）模式。按 **outcome-oriented-execution** 原则 skill，填代码期间有计划、有范围的临时破坏没问题。实现前要对设计做对抗性施压，就对综合后的草图运行 **interrogate** skill。

如果人对形态有异议（确认点上，或事后），把它当作阶段 A 的证据。先重新摸清、重跑阶段 B，再接着写代码。

## 阶段 D：照着草图实现

把 `not implemented` 函数体换成代码，把伪代码换成逻辑。综合后的草图就是契约。偏离它是要说出来的信号，不是默默消化的阻力。如果某个函数需要草图没想到的参数，问一句：是草图错了，是需求漏了，还是实现做多了。

## 阶段 E：架构不对就推倒

如果实现一直产生草图消化不了的阻力，就扔掉草图。按 **redesign-from-first-principles** 和 **fix-root-causes** 原则 skill，不要在错误的设计上打补丁。

要看的是*规律*，不是单个现象。征兆：

- 同一种权宜做法在互不相关的代码里反复出现。
- 好几个互不相关的边界情况都要加特殊分支。
- 类型要靠逃生口（`any`、强制转换、实际总会被赋值的可选字段）才能编译。
- 草图说状态不共享，却冒出「这里得加把锁」的念头。
- 调用方得知道抽象内部的规矩才能用它。
- 整个实现里有两处或更多互相独立、但形态相同的阶段 D 偏离。

要自己判断。几个边界情况不足以判一个架构死刑。有些问题本来就复杂。数据复杂不等于设计复杂。

推倒的时候：

1. 对已经写出来的东西重新运行 **how** skill。
2. 按 redesign-from-first-principles，把新约束当成第一天就有的前提，重新设计。
3. 按 **subtract-before-you-add** 原则 skill，先减再加。新草图在长大之前，应该先比旧的小。
4. 回到阶段 B，重跑 arena。

## 产出

先写调用方怎么用，再从用法推出类型草图。小改动用一个文件，放新类型和签名。更大的工作是模块图加类型定义。rationale 一起交，按 `references/rationale-template.md` 的结构写，包括用法草图和综合决策。

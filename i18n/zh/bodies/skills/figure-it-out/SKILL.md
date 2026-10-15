---
name: figure-it-out
description: "Design an auditable playbook when no narrower one fits: a large migration, an ambitious multi-part change, or work a human reviews after stepping away. Scales rigor to the task, runs a hypothesis loop, and logs decisions. Use for /figure-it-out or 'figure it out'."
disable-model-invocation: true
---

# Figure it out

对不上任何 playbook 时，就自己设计一个。写任何代码之前，要交付的是工作流本身：一串阶段，严谨程度按任务调整，按科学方法推进，并留下一条决策记录，让人离开再回来时能够审计。

## 开始

开一个待办清单，第一项是读 **poteto-mode** skill 的「原则」一节。再把下面各阶段加成待办。

## 阶段 A：定框

先摸清，再定下来。下面几项都能说清之前，不要开始这次运行：

- 完成的定义，写成可证伪的判定条件（**prove-it-works** 原则 skill）。
- 量化的范围：大致的单元数和工作量，加上摸清时发现的阻碍。
- 严谨程度，宁高勿低。单向门，以及影响范围（爆炸半径）大的改动，给高。可逆、风险低的步骤，给低。严谨指的是关卡和产物，不是「再加把劲」。

投入长时间运行之前，先把定框和取舍摆出来。可逆的工作照常往下做（**never-block-on-the-human** 原则 skill），但要跑上好几个小时的，值得设一次确认点。

## 阶段 B：设计工作流

拆成原子的、能各自独立合入的单元。风险最大的未知项排在最前面。脚手架和验证排在功能前面（**foundational-thinking** 原则 skill）。

- 开工前先搭好验证 harness，基线取自改动前的状态，这样检查读起来就是「旧值对比新值」。
- 单向门式的设计决定，跑 **architect** skill（它会跑 **arena**）。机械性的工作，形态已经具体，就跳过。设计已经定了还再跑一轮 arena，是过度设计（**laziness-protocol** 原则 skill）。
- 决定哪些要扇出。只在接缝上并行，每个 worker 各用自己的 worktree 或分支（**separate-before-serializing-shared-state** 原则 skill）。不要扇出过度。按这项工作给每个子代理选推理档，以及 fast 还是标准速度，见 **poteto-mode** skill 的「子代理」一节。
- 把设计好的阶段清单写下来。人要审的就是这份清单。

然后按这个设计执行。把其中的步骤作为具体待办，加在阶段 C 和阶段 D 两项之间。每一步都按阶段 C 的循环规矩来跑，阶段 D 的日志穿在这些步骤中间：每落地一步记一行，不要把整条记录留到最后。

## 阶段 C：跑循环

每个单元都是一次实验。说出假设，做最小的改动，在真实产物上对照判定条件测量。有进展就留下，没有就撤回。按 **sequence-verifiable-units** 原则 skill，验证完一个单元再开始下一个，不要把检查攒到最后一起做。

- 验证靠检查产物，绝不靠自述。某样东西通过得太容易，先怀疑观察方法，再怀疑系统。
- 委派出去的工作要配一个评判者。worker 钻了关卡的空子，就推倒重来，并把契约收紧。关卡本身错了，就用单独的一次改动去修关卡，不要绕开它。
- verdict 是 VERIFIED、NOT VERIFIED 或 INCONCLUSIVE。INCONCLUSIVE 不算通过。不要藏起负面结果。

## 阶段 D：留下审计记录

用 **show-me-your-work** skill 记录这次运行。figure-it-out 的工作通常目标够大，值得把这条记录提交上去，让审查者在 PR 里就能读到。记录加上 diff，人回来之后才信得过这份工作。

## 阶段 E：验证并交回

在真实产品上对照阶段 A 的判定条件检查整体，不能只看 harness。反复出现的纠正，固化成关卡、lint 规则、检查或脚本（**encode-lessons-in-structure** 原则 skill）。

**回复：** 你设计的 playbook、严谨程度和理由、决策记录的路径、哪些已经对照判定条件验证过，还有哪些没了结。

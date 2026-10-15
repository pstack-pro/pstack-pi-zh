---
name: principle-attack-the-premise
description: "Apply when two or more fixes that share one premise have failed the same gate. Write the premise down and test it directly before you write another fix that assumes it."
disable-model-invocation: true
---

# Attack the Premise

当两个或更多共享同一前提的修复都卡在同一个关卡时，该怀疑的是前提，不是那些修复。

**理由：** 每一次失败的修复，都是对它假定那个信念的反证。在同一个前提上做第三次修复，等于把力气花在证据已经说明不是原因的地方。

**做法：**
- **把前提写下来。** 前提就是每一次失败的修复都假定的那一句话。
- **在做下一次修复前，先验证前提。** 找一个如果前提不成立就会得出不同结果的观察，然后去观察。看这些失败是怎么分布的，而不只是看它们有多大。按 [Build the Lever](../principle-build-the-lever/SKILL.md) 把这项检查做成可重跑的。
- **跟着证据走。** 如果证据与前提矛盾，原因就在别处。去找这些失败有什么共同点，是前提没预料到的。如果证据印证了前提，就按 [Fix Root Causes](../principle-fix-root-causes/SKILL.md) 继续追问下一个「为什么」。之前那些修复可能处理的只是后果，而不是原因。
- **消除那个条件，而不是补偿它**，见 [Laziness Protocol](../principle-laziness-protocol/SKILL.md)。如果证据显示某个部分总是落在落败的一侧，就改掉让它落到那里的东西。事后再清理的机制，既没动原因，又让每次运行都多干活。

**停：** 在前提写下来并经检验之前，不要开始下一次修复。

这条原则与 [Redesign from First Principles](../principle-redesign-from-first-principles/SKILL.md) 不同，后者是围绕一个新需求重构设计；它质疑的是当前设计假定的某个事实。

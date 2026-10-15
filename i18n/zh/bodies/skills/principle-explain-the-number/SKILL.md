---
name: principle-explain-the-number
description: "Apply before you trust, report, or act on a number you measured: a speedup, a regression, a throughput, a latency, or an eval result. Find what limits it, and rule out that it measured something other than the work you think."
disable-model-invocation: true
---

# 解释这个数字

- **问「为什么不是两倍？」** 说出限制这个结果的资源或代码路径，例如某个核心、一把锁、磁盘、网络，或施压程序本身。它得来自一次运行里采集的剖析（profile）或系统计数器，再对应到源码。光靠读代码猜出来的，不算限制因素。如果你说不出这个数字为什么没能翻倍，你就不知道自己测的是什么。
- **列出这个数字还可能测到别的什么，再逐一用证据排除。** 常见的嫌疑有：错误、被跳过或命中缓存的工作、根本没跑到的代码、没调优的一侧（还留在默认设置）、噪声，以及小到对端到端无关紧要的一块。
- **把证据和数字放在一起。** 把运行次数、散布和限制因素写进笔记，或放进一份关联的产物。

性能数字要用 [benchmark-checklist](../benchmark-checklist/SKILL.md) skill 完整跑一遍流程。评测结果则对每次试验问同样的问题：每次运行是否真的做了任务，差距在多次试验和不同模型之间是否成立，这个场景是否重要。

如果数字背后的证据没有运行次数、没有散布、也没有点名的限制因素，或者省下的时间比被改动那一部分原本花的时间还多，就说明你跳过了这一步。

这与 [Prove It Works](../principle-prove-it-works/SKILL.md) 不同，后者检查的是输出是否为真。

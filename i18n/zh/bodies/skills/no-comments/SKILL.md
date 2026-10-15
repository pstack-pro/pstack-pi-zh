---
name: no-comments
description: "Spawn Comment Sicko, fix accepted findings, and offer encodings for claimed constraints."
disable-model-invocation: true
---

# No comments

派出 Comment Sicko。按接受的发现去做。

以 Comment Sicko 不带成见的看法为准。

## 范围

用调用方给的文件或 diff。没有的话，用当前相对基础分支的 diff，默认 `main`，包括工作区。

## 步骤

1. 用 `Task` 派出，`subagent_type: "comment-sicko"`。把范围传过去。按这项工作给每个子代理选推理档，以及 fast 还是标准速度，见 **poteto-mode** skill 的「子代理」一节。不要复述它的规则。
2. 检查它的报告和 diff。拒掉这些：改了应用代码、越出范围、删了受例外保护的注释、`MUST KILL` 的理由说错了，以及把刻意留下的代码当成有罪的标记。对我们自己代码里的意外打出的改结构标记，仍然要处理。不要把那些注释恢复回来。一条 keep 要留下来，只有证明它说的是我们改不了的东西。检查范围内漏掉的 lint 和 TypeScript 抑制。正确性或安全类的抑制，仍然是要处理的 `MUST KILL`。只有对上确切的例外，并有范围内的证明，才恢复被删的注释。接受理由单薄的 `IMPORTANT` 或 `do not remove` 的 kill 或 keep 之前，先对它们的符号跑 `/how` 或 `/why`。kill 拿不准，就不恢复。keep 被驳倒，或仍然拿不准，就删掉。拒了一份报告，就撤销它的改动，点明失败原因，重跑一次。第二份再拒，就报成未解决，并让 `/no-comments` 失败。
3. 简单的、已接受的标记直接修：删掉一条死路径、去掉一个参数，或改用真正的 API。只要有一处修法需要先定形态，就对接受的这一批和周边代码跑一次 `/architect`。停在草图。architect 定形态。第 4 步来实现。
4. 在范围内做最小的根因修复。去掉每一个点了名的权宜做法。根因在范围外，就合入范围内最小的修复，其余报成未解决。**principle-fix-root-causes** 和 **principle-redesign-from-first-principles** 这两个 skill 只用来指导意图。两者都不允许把围栏扩大，也不允许去修围栏外面的实例。**绝不**再钉上症状守卫。
5. 约束类注释写的是 `do not remove`、`do not change wording` 或 `talk to X before changing`。说的是我们改不了的东西的 keep，留着。对其余约束，给出范围内最便宜的一种：类型、运行时检查、测试，或 CI 里的 lint。交互时等批准。无人值守和评测要调用方事先批准。批准了，就先落实进结构，再删掉。否则删掉，把这条约束报成未解决，并为范围外的工作画个草图。
6. 报告删除条数、恢复的注释、重跑次数、architect 草图、修复、提出的落实办法、已经落实的、没有强制机制的约束，以及其他未解决的工作。

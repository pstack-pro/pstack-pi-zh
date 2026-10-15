---
name: show-me-your-work
description: "Keep a reviewable decision trail for long-running or unattended work: a TSV log with one row per decision (what, why, evidence, result). Local by default; commit it when a reviewer needs the trail to trust the result. Use for /show-me-your-work, autonomous or multi-phase runs, or work a human reviews after stepping away."
disable-model-invocation: true
---

# Show me your work

只保留一份权威日志。

## 格式

单个 TSV 文件，每个决定一行。单元格只占一行。证据是指针，不是叙述。

复制 `references/decision-log-template.tsv`（表头行）即可开始一份干净的日志。各列：

- **ts.** ISO8601 时间戳。
- **phase.** 阶段或工作流。
- **decision.** 选了什么或做了什么，一行写完。
- **why.** 用大白话说明理由。若是某个原则驱动的，就直说，别写成术语标签。
- **evidence.** 能证明它的链接或路径：commit SHA、PR 编号、`file:line`，或产物、trace、截图的路径。**绝不**是一段话。
- **result.** 结果或判定状态：`tests green`、`reverted`、`pixel-diff 0`、`INCONCLUSIVE`、`open`。

一个例子，用大白话写，审查者瞟一眼就能看懂。

```
ts	phase	decision	why	evidence	result
2026-05-24T09:02:00Z	frame	counted the work first, about 100 components and roughly 75 hours	wanted to know the size before starting a long run	commit 3a9f1c2	found 5 things to sort out before starting
2026-05-24T09:40:00Z	harness	took screenshots of the old version before changing anything	so we can compare old against new and catch any visual change	scripts/snapshot.sh, baseline/	saved 120 reference screenshots
2026-05-24T11:15:00Z	widget	moved the widget styles over without changing how it looks	keep the change small and the result identical	commit 7c21e0a, pixel-diff 0	looks identical, tests pass
2026-05-24T12:30:00Z	widget	threw out a helper's work because its screenshots were blank	checked the real files instead of trusting its summary	worktree reset	reverted, tightened the instructions for next time
```

## 记录一行

每条记录都按你向同事讲述自己做了什么的方式来写。大白话、具体动作，不要 AI 腔和抽象术语（**unslop** skill 同样适用于日志文本）。

用辅助脚本 `scripts/log.sh <logfile> <phase> <decision> <why> <evidence> <result>`。它会打上 `ts` 时间戳，首次使用时写入表头，清掉多余的制表符/换行，并给以 `=`, `+`, `-`, `@` 开头的单元格加一个单引号前缀。直接用 `printf` 追加一行也行，但如果单元格内容来自生成文本或用户输入，同样要留意这几个字符。

记录的是决策点和确认点，不是每个动作：选了某条分叉、某个单元完成并附上验证结果、带触发原因的转向或回滚、浮现的阻塞、修好的关卡。循环运行时，每轮一行。琐碎和显而易见的就跳过。

一次运行就是一次代理对话，包括它后续的轮次以及针对它的任何摘要。接手、替换代理，或新建对话，都算开启一次新的运行。当一次运行往已有行的日志里追加内容时，它的第一行 phase 为 `start`；在另一次运行的 `start` 行之后，它的第一行同样如此。所以，一次运行若在后续轮次回到日志，先读日志最后几行，看此间是否有别的运行写过。`start` 行会标出它之前、且不是本次运行所写那些行的 `ts` 范围，其 evidence 指明本次运行，比如它的 agent id。phase `start` 不作他用。

## 放在哪里

默认情况下日志是一个工作产物，不提交。放在工作目录的 `decisions.tsv`，若多项工作同时开展则放在 `.audit/<task-slug>.tsv`，并排除在 git 之外。

只有当工作足够大、审查者需要靠这份记录才能相信结果时，才提交它。

## 规则

- 只追加。错误的判断用新的一行取代它。**绝不**编辑或删除历史。
- 优先采用已提交脚本产出的证据，而不是手工一次性弄出来的东西（**encode-lessons-in-structure** 原则 skill）。

## 对照对话记录审计日志

运行结束时、交回之前，检查日志说的是不是真话。读取本次运行在活动工作区 `agent-transcripts/` 目录下的对话记录（系统提示词会给出该路径）。不要对 `~/.cursor/projects/*/` 做 glob。那会读到无关的私密对话。把本次运行的每一行与实际发生的事逐一核对。这些行每连续一段，起于本次运行的某个 `start` 行（若是本次运行创建的日志，则起于第一行），止于下一次其他运行的 `start` 行：

- 核验每一行都对应一个真实的决定或动作。
- 核验每行的 evidence 能定位到，且能显示该行所声称的内容。
- 影响过工作的分叉、转向或弃用的做法若没记进日志，就是一个缺口。补上它。

改日志，别改故事。审计从不编辑或删除任何一行，哪怕是编造的一行。当某行既没记录真实的决定也没记录真实的动作，或它的说法、证据有误，就新增一行取代它，写明实际发生了什么以及一个能定位到的指针。本审计不检查本次运行各段之外的行。若本次运行自己的工作显示其中某行有误，就照任何错误判断一样取代它。

## 对记录的跨模型评审

交回之前，派一个子代理，用与干这份活的模型不同的模型家族。自查不能替代它。子代理读审计记录和本次运行的对话记录，然后标出用户该留意的点。不是重做这份工作，而是扫一遍哪里不够好或有风险。按 **poteto-mode** skill 的 Subagents 一节，为每个子代理选定推理等级以及 fast 或 standard 速度。

- 证据薄弱或缺失的决定。
- 跳过、或在对话记录里无凭据却声称做过的验证步骤。
- 事后看有风险的选择（过早、范围蔓延、掩盖症状）。
- 用户随手一扫会漏掉的缺口。

一次运行只要产出了记录，它的每次回复都以一个 "Attention" 小节结尾。开头单独一行写审查者的模型（`reviewed by <model>`），然后逐条列出每个标记，指向具体的行或时刻。"No flags" 是合法取值，模型名则不是。

## 审阅记录

从上到下读，顺着证据指针走，抽查。GitHub 会把已提交的 TSV 渲染成表格。`column -s$'\t' -t decisions.tsv` 可在终端里渲染它。

## 组合这个 skill

其他 skill 把它们的审计记录路由到这里，而不是自己另造一套。按名字引用它，让格式由它统管。不要复述各列。

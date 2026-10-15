---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
disable-model-invocation: true
---

# Reflect

从当前对话里挖出可复用的经验，再路由到 skill 的修改上。

用户说 "reflect"（复盘）或 "/reflect" 时调用。对话很琐碎、跑了题，或者父代理已经正确照着某个现成 skill 做了，就跳过。一次性的事不算经验。

## 1. 定位当前对话记录

扇出之前，先在系统提示词点名的 `agent-transcripts/` 目录里，找到这次对话的记录。不要对 `~/.cursor/projects/*/` 做 glob。那会跨过工作区边界，读到无关项目里的私密聊天。

```bash
ls -t <agent-transcripts>/*.jsonl <agent-transcripts>/*/*.jsonl <agent-transcripts>/*/subagents/*.jsonl 2>/dev/null | head -10
```

这覆盖三种布局：旧的扁平（`<id>.jsonl`）、现在的嵌套（`<id>/<id>.jsonl`）、子代理（`<parent>/subagents/<child>.jsonl`）。每个候选都读 JSONL 的第一行。取那份文件：它的 `message.content[0].text` 里有这次对话用户开头的提示词。一个都对不上，就改传一份紧凑的会话摘要。

## 2. 并行拉起三个审查者

一条消息里发三次 `Task` 调用，`subagent_type: generalPurpose`，agent 模式（`readonly: false`）。审查者需要 MCP，才能去查对话记录里提到的工单、讨论串和可观测性 trace。只读会把 MCP 拿掉。

每个审查者和汇总者，都对应 `pstack-models.mdc` 这条 rule 里的一行角色，以及一个默认值。把 `model` 设成那一行的值；规则或那一行缺失时，用默认值。值是 `auto` 或 `inherit-parent` 时，不要设 `model`。如果 Task 工具拒绝了这个 slug，改用默认值，并在回复里说明。默认值也被拒绝的话，从报错信息里挑同一系列里最接近的合法 slug。按这项工作给每个子代理选推理强度，以及用 fast 还是标准速度，见 **poteto-mode** skill 的 Subagents 一节。

| 视角 | 角色行 | 默认 `model` | 提示词模板 |
|---|---|---|---|
| 判断 | `reflect judgment, divergent, synthesizer` | `claude-opus-5-5-xhigh` | `references/judgment-reviewer.md` |
| 工具 | `reflect tooling` | `grok-4.7-xhigh-fast` | `references/tooling-reviewer.md` |
| 发散 | `reflect judgment, divergent, synthesizer` | `claude-opus-5-5-xhigh` | `references/divergent-reviewer.md` |

每份模板原样传入，只在标出的位置替换对话记录的路径或摘要。审查者在 `Task` 的响应正文里返回发现。

## 3. 汇总

一次 `Task` 调用，`subagent_type: generalPurpose`，`model` 取 `reflect judgment, divergent, synthesizer` 这一行（默认 `claude-opus-5-5-xhigh`），agent 模式（`readonly: false`）。它通过 MCP 抽查引用。只读会把 MCP 拿掉。把 `references/synthesizer.md` 原样传进去，在标出的位置嵌入每个审查者的完整输出。它返回一份 Accepted / Rejected / Backlog 列表。

## 4. 检查是否改由结构来强制

如果 Accepted 里有一条，用 lint 规则、脚本、metadata 标记或运行时检查来强制会更稳，就把它移到 Backlog。见 **encode-lessons-in-structure** 原则 skill。

## 5. 应用

先把汇总者完整的 Accepted / Rejected / Backlog 输出拿给用户，等明确批准，再应用任何 Accepted 修改。用户挑一个子集，也可以改路由。skill 一改，组织里以后的每个代理都会受影响。不要自动应用。

每条 Backlog 不用等批准，直接记到团队的 devex 或 backlog 跟踪处。只有 Accepted 列表要等批准。

已批准的每一行，严格照它的 Routing 做：

- 现成 skill 的小改（加一行要点、把一句话收紧、改正一个过时的事实）：父代理直接改。
- 现成 skill 的大改（新的一节、一张新的模式表、超过大约 10 行）：交给 Cursor 内置的 `create-skill` skill，走它的 draft / test / iterate 循环。
- `tune description: <skill path>`（skill 在，但该触发时没触发）：交给 `create-skill`，走它的 description 优化循环。
- `new skill via create-skill: <kebab-name>`：创建交给 `create-skill`。不要现编 skill 的结构。

环境里如果自带 SKILL.md validator，每个改过的 skill 在宣布完成之前都跑一遍。

## 6. 向用户摘要

短列表，不要开场白：

- 已应用的修改：`<skill path>`。每条一行，写改了什么。
- 新建的 skill：`<skill path>`。每条一行（少见）。
- 已记到 devex 跟踪处的 Backlog：`<issue title>`（`<tags>`）。每条一行。
- 丢掉的：每条驳回的发现一行，附上汇总者给的原因。

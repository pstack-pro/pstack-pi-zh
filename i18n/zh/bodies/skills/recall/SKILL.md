---
name: recall
description: "Reconstruct your recent working context from your own chat history, live state, and the shared record (user reports, prior fixes, incidents), then hand back a tight current-state brief. Use for 'recall my work on X', 'catch me up', 'what have I been working on', 'where did I leave off', before starting or resuming work."
disable-model-invocation: true
---

# Recall

**开始或恢复工作前，先重建用户近期的工作上下文，交回一份紧凑的信息胶囊，说明当前进展和接下来该做什么。**

保持紧凑、切题。只读当前范围内工作线需要的内容，读完即止。

你的上下文存在两份记录里。你自己的对话历史记录了你做过什么、决定过什么。共享记录则存着围绕同一份代码、在其他名义下发生的一切：用户反复报告的故障现象、已经上线又被回滚的修复、线上仍在报的错误。第二份记录正是 **why** skill 搜索的对象，范围横跨源代码管理、issue tracker、聊天与 issue 频道、长文文档和错误追踪。bug 尾巴很长的功能，大部分故事都留在那里，所以不要只凭自己的对话记录去重建。

对话记录位于 `~/.cursor/projects/<slug>/agent-transcripts/<uuid>/<uuid>.jsonl`，其中 `<slug>` 是工作区路径去掉开头的斜杠、再把每个 "/" 换成 "-"（于是 `/Users/you/proj` 变成 `Users-you-proj`）。每一行是一条聊天消息。

1. 先分类，再路由。要恢复某一次特定的旧对话，用 `session-pickup` playbook，不是这个。把习惯沉淀成可复用的 skill 是 `automate-me`。给工作做一份人可读的摘要则是另一项任务。Recall 是在你动手之前，跨近期对话加载工作上下文。如果用户已经给了一份完整的状态胶囊（路径、分支、改动），直接用，跳过挖掘。
2. 搜索前先锁定范围。定死时间窗口（"recent" 是一个真实区间，默认最近 7 天）、点名的话题（如果有），以及工作区（默认当前活动的那个。**绝不**未经请求就去读别的项目的对话记录）。把范围复述回去。**绝不**悄悄把 "all" 变成 "recent N"。
3. 在你的对话历史上扇出。用快速、便宜的模型并行起子代理，每个拿语料的一个切片。告诉每个子代理按真实修改时间（`ls -t`）给候选排序，**绝不**按 UUID 名字排序；先 grep 话题，再只读命中的对话，且只读其中相关区段；跳过当前对话以及明显的噪音（子代理、eval、测试对话）。每个子代理返回同一套 schema，每段对话一块：话题、用户的目标、决定、尚未了结的工作线、挣扎与纠正，以及产物（PR、工单、分支），并分别标注对话 UUID。只有一两次对话时，跳过扇出，直接搜。原始对话记录留在子代理里，主线程只拿到它们的发现。每个子代理的推理档位和 fast 或 standard 速度按工种来定，见 **poteto-mode** skill 的 Subagents 一节。
4. 只要话题点到某个功能、文件、子系统、领域或 bug，就扫一遍共享记录。这是默认动作，不是可自行判断的例外，"my work on X" 也不能豁免。把它交给 **why** skill 的源头调查员，但把问题从 "why was this built this way" 引到 "what's the current state, what's been tried and didn't hold, and what are users still reporting"。复用它按来源分的 playbook，让调查员与对话历史挖掘并行跑，并沿用它的姿态：一个来源一个调查员，空结果也是发现，跳过不可用的 MCP 并说明。把回来的内容并进简报。只有纯活动回顾、没有点名目标时才跳过这一步（"what did I do this week"），此时你自己的历史和实时状态就是全部答案。
5. 对照实时状态做验证。把挖掘和扫查浮出的 PR、分支、工单拿出来，用 `git` 和 `gh` 核对。当答案取决于某个 agent 实际做了什么（跑过哪些工具、读过哪些文件、撞到哪些错误）时，要读完整对话记录，而不是只看裁剪过的本地副本。
6. 按下面的契约写简报。按工作线分组。紧扣点名的话题。

## 输出契约

先给信息胶囊，再给工作线状态，然后给问题，最后给下一步。更细的内容放到后面，或者砍掉。

- **信息胶囊。** 最多 5 条。这份工作是什么，整体进展如何。
- **工作线。** 每条一行，前面恰好加一个状态标签：`[merged #N]`、`[open PR #N]`、`[in flight <branch>]`、`[verified, uncommitted]`、`[reverted #N]` 或 `[planned, not started]`。没有标签的工作线就是还没写完，补上标签。
- **问题。** 最多 5 个，反复出现的那种。要写进用户反复报告的故障现象，以及任何上线后又被回滚的修复，好让下一次尝试从上次失败的地方起步。
- **下一步。** 唯一最有用的下一步动作，要具体。

邻近的功能或工单不写进来，除非它挡着这件事。当信息胶囊和工作线行数超出一屏时，先砍细节再砍工作线。简报要经过 **unslop** skill 来写，对话里的发现按 UUID 引用，共享记录里的发现有来源就标来源（PR #、工单 ID、聊天永久链接、错误追踪 issue），任何对外输出前先清洗私有上下文。

**回复：** 简报，按上面的契约。

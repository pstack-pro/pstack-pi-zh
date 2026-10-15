---
name: why
description: "Use for 'why does X work this way', 'why we picked Y', design rationale, regressions, postmortems, or data-backed thresholds. Discovers available MCPs and queries each evidence category (source control, issue tracker, long-form docs, real-time chat, infrastructure observability, error tracking, product analytics warehouse) in parallel, then returns a cited read on decisions and tradeoffs. Use how for runtime behavior."
disable-model-invocation: true
---

# Why

调查代码背后的动机和意图。配套的 `how` skill 回答代码做什么、怎么工作；`why` 回答是哪些力量把它变成了现在的样子。

每次派出子代理，都对应 `pstack-models.mdc` 规则里的一行角色，外加一个默认值。把 `model` 设成那一行的值；规则或那一行缺失时，用默认值。值是 `auto` 或 `inherit-parent` 时，不要设 `model`。Task 工具拒绝某个 slug 时，改用默认值并说明；默认值也被拒绝时，从报错里选同系列最接近的有效 slug。如何按工作内容给每个子代理选推理强度和 fast/标准速度，见 **poteto-mode** skill 的 Subagents 一节。

每次派出都用 `generalPurpose`、`readonly: false`（agent 模式）。**不要用 readonly/Ask 模式。** 它会拿掉 MCP 访问：靠 MCP 的调查员会停摆，合成器也就做不了引用抽查。调查员仍然不该写任何东西。

## 工作姿态

像一名**谨慎、保守、精确的调查者**那样工作，把已知和推断诚实分开。完整的置信度框架和措辞指南在 `references/epistemics.md`，合成器**必须**照着它。

## 第 1 步：弄清目标与问题

**目标**通常是一块代码、一种模式、一个功能，或一项有名字的设计决策。**问题**通常是设计理由、一处权衡、逼出某个边界情况的原因、一项外部约束、死代码，或一次宽泛的历史梳理。

目标含糊时，比如 "why do we do it this way?"（我们为什么这样做？）又没有明确指代，就根据对话上下文做最好的猜测（打开的文件、最近的编辑、光标位置、刚聊过的内容）。用一两句说出你的理解，方便用户在你偏了的时候纠正，然后继续。

## 第 2 步：立住代码锚点

派出调查员前先自己把种子上下文备好：文件路径和行范围、关键符号（函数、类、常量）、最近碰过该目标的几次提交、合并提交主题行里的 PR 编号（`(#1234)` 这种模式），以及任何关联的工单 ID。用 `git blame -L <start>,<end> <file>` 查最后改这些行的提交，用 `git log --follow -p -- <file>` 看跟踪重命名的完整历史和补丁，用 `git log --oneline -20 -- <file>` 看最近提交和里面的 PR 编号，用 `git log -1 --format=%B <commit>` 抽出 PR 编号。然后对有实质内容的提交，用 `gh pr view <number> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews` 把 PR 正文和讨论拉下来。这份锚点交给每个调查员，也交给合成器。

## 第 3 步：并行派出调查员

**默认做完整的并行调查。** 要的是一张完整的覆盖图，不要为了省事缩成最小的一张。空结果要记下来，不要跳过搜索。

### 清点

派出调查员前先列出 Cursor 环境里可用的 MCP。有 available-tools 映射就用它。否则去看 Cursor 暴露出来的 `mcps/` 目录，里面是已启用的 MCP 服务器。

把每个可用 MCP 归到一个证据类别：

1. 源码控制历史
2. 工单 / ticket 跟踪
3. 长文文档
4. 实时团队聊天
5. 基础设施可观测性
6. 错误 / 异常跟踪
7. 产品分析数仓

源码控制始终可用，走 git 和 `gh`。其余六类，看 MCP 名字、服务器说明、工具名和资源描述来归类。一个 MCP 能归进好几类时，按它主要的证据来归类。拿不准的记进覆盖图。

每个有匹配 MCP 的类别派一名调查员，放在同一条消息里一起跑。每人只负责一个工具或一个 MCP。不要让一个代理同时覆盖多个 MCP。`model` 取 `why investigators` 那一行，默认 `grok-4.7-xhigh-fast`。

每个调查员的提示词是填好的 `references/investigator-prompt.md`，再加上下面这些：

- 所选 MCP 的类别 playbook `references/sources/<source>.md`，按 `references/source-playbook.md` 里的例子改写
- `references/sources/incident-postmortem.md`，**如果目标代码看起来是防御性的**（空值检查、重试、超时处理、限流、功能开关、出口守卫、OOM 处理）
- 代码锚点，以及用户原来的问题

### 调查员名册：每个有证据的类别一名

下面每一类都能翻出一种别的来源给不了的「为什么」，写在「最擅长」后面。用它来判断该等回什么、某一类空着时怎么称呼这个缺口，并且在极少数能证明无关时，说明为什么跳过。

1. **源码控制**（git 历史、用 `gh` 查 PR、代码注释、测试）。始终要派，这是唯一保证有的来源。最擅长*评审当时记下来的实现理由*。
2. **工单 / ticket 跟踪**（如 Linear、Jira、GitHub Issues、Plane、Shortcut MCP）。最擅长*产品或业务层面的推动力*。当「为什么」落在工程之外时最强。
3. **长文文档**（如 Notion、Confluence、Google Docs、Coda MCP）。最擅长*落成文字的设计理由*，在变成代码之前就写下来的那种。
4. **实时团队聊天**（如 Slack、Discord、Microsoft Teams、Mattermost MCP）。最擅长*没写进文档的即时讨论*。源码控制、工单和文档几乎没留下书面记录时，这一类尤其重要。
5. **基础设施可观测性**（如 Datadog、New Relic、Honeycomb、Grafana、Splunk MCP）。最擅长*促使写下这段代码的基础设施和运行时事实*。当目标是在响应基础设施信号（超时、重试、限流、熔断）时，这一类最强。
6. **错误 / 异常跟踪**（如 Sentry、Rollbar、Bugsnag、Airbrake MCP）。最擅长*促使写下防御或纠正代码的具体异常和错误轨迹*。对 catch 块、空值守卫、类型检查、重试和其他防御代码最强。
7. **产品分析数仓**（如 Databricks、Snowflake、BigQuery、ClickHouse、dbt、Redshift MCP）。最擅长*塑造这段代码的产品和数据事实*。对挂在功能开关后面的代码、实验驱动的发布、数据迁移，以及 "where did this number come from"（这个数字从哪来）这类问题最强。

### 什么时候可以跳过一名调查员

只有**写明的理由**才能跳过，理由要写进最终的已查阅来源。两种站得住脚的理由：

- **这一类在本环境没有可用的 MCP**。标成缺口，不是你的选择：「实时团队聊天已跳过。没有匹配的 MCP，对话记录搜不了。」
- **来源可以证明确实无关**，不是「大概不相关」。门槛很高：「错误 / 异常跟踪已跳过。目标是构建期脚本，没有运行时路径。」

如果你判断这是单次提交的琐碎目标，而且 PR 描述里已经有完整答案，可以在当前线程直接回答，**但只有确认七类里每一个能用的搜索都是重复劳动之后才行**。把这一点写明。这种情况应该很少。

## 第 4 步：合成

派一名合成器。`model` 取 `why synthesizer` 那一行，默认 `claude-opus-5-5-xhigh`。它拿到：

1. 调查员的发现，包括空结果，以及写明理由后跳过的类别
2. 代码锚点
3. 用户原来的问题
4. `references/epistemics.md` 里的认识论框架
5. `references/synthesizer-prompt.md` 里的合成器提示词模板

## 第 5 步：交给用户

把合成器的输出交给用户。为了更清楚，或为了补上对话里的上下文，可以小改，但**不要改写置信度措辞**。

## 输出格式

结构以 `references/synthesizer-prompt.md` 为准：问题、相关代码、已经查到的、可以合理推断的、竞争假设、还不知道的、已查阅来源、置信度摘要。可以按需要调整，但置信度的分层要保住。已查阅来源每个调查员一行，包括没有结果的和跳过的，都要写上理由。

已查阅来源之后，如果用户的 `why` 问题是为了接着改这段代码，把这条代码的来历收成一套 Preserve / Change / Avoid / Risk（保留 / 改 / 避开 / 风险）约束，用来规划这次改动。

## 要避开的常见失败

- **近因偏误**。别把最近一次提交当成权威。现在的样子，往往是更早一连串决定叠加出来的，要往回追。

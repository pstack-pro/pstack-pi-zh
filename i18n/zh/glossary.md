# 术语表

部分条目改编自 [fenfenxu/pstack-zh](https://github.com/fenfenxu/pstack-zh) glossary（MIT License，Copyright Lauren Tan and learn-pstack contributors）。

翻译 pstack agent skills（poteto 的 agent 工作流）时用这张表。要改译法，改这张表，不要在各篇译文里各改各的。

## 1. 保持英文不译

下列一律原样保留，不另造中文：

- **skill 名**：目录名与正文里的 skill 名，如 `architect`、`arena`、`poteto-mode`、`unslop`、`create-skill`、`how`、`why`、`principle-build-the-lever`。
- **slash 命令**：`/architect`、`/poteto-mode`、`/setup-pstack` 等，写法、数量与原文逐字一致（原文若是 `/pstack:architect` 就保持该前缀）。
- **工具名**：`Task`、`Await`、`AskQuestion`（以及 `AskUserQuestion`、`PstackModels`）。
- **`subagent_type` 的值**：如 `general-purpose`、`readonly`。
- **路径**：`skills/architect/SKILL.md`、`.pstack/models.md`、`references/runner-prompt.md` 等。
- **代码**：行内 `` `…` ``、代码块、标识符、模型 slug、状态枚举（`PASS` / `ISSUES` / `BLOCKED`）。
- **frontmatter 键**：`name`、`description`、`disable-model-invocation` 等。

触发语（用户原话）也保留英文，放在原文的引号里，可在后面加中文旁注，例如 `'architect this'`（帮我设计）。每一句都保留。

## 2. 术语表

| English | 中文 | 备注 |
| --- | --- | --- |
| pstack | pstack | 保留 |
| poteto | poteto | 保留 |
| poteto-mode | poteto-mode | 保留；slash 命令 `/poteto-mode` 同样不译 |
| skill / skills | skill / skills | 保留。可写「验证 skill」「个人 -mode skill」 |
| playbook | playbook | 保留 |
| principle | 原则 | 原则 *名*（`Laziness Protocol`、skill 目录名）保留英文 |
| subagent | 子代理 | 译。`agent` 在正文里可译「代理」 |
| operator | 操作者 | 译 |
| harness | harness | 保留。指包住 agent 的运行时与脚手架 |
| verification skill | 验证 skill | skill 保留；「验证」译出 |
| Feature Map | 功能清单（feature map） | 首次出现附原词；文件名、标题里的保留 |
| arena | arena | 保留 skill 名。机制可旁注「竞技场」：并行候选 → 选基底 → 嫁接 |
| swarm | swarm | 保留 skill 名。机制可旁注「蜂群」：扇出 worker → 收齐 → 一份报告 |
| blast radius | 影响范围 | 首次出现可旁注「爆炸半径」。触发语 `'blast radius of X'` 保留英文 |
| premise | 前提 | 译。原则名 `attack-the-premise` 不译 |
| lever | 杠杆 | 原则名 `build-the-lever` 不译。正文指「能完成或证明工作、审查者可重跑的工具」 |
| slop | slop | 保留。AI 腔、套话、空洞修饰 |
| unslop | unslop | 保留。skill 名；动词可写「去掉 slop」 |
| foundational | 根基的 | 原则名 `foundational-thinking` 不译。先把核心数据结构做对 |
| idempotent | 幂等 | 原则名不译。同一操作重试仍收敛到同一终态 |
| context window | 上下文窗口 | 译。主线程只留摘要，大块交给子代理 |
| fan out / fan-out | 扇出 | 译。一次派出 N 个并行 worker / 候选 |
| ground truth | 事实标准 | 译。对照真实产物或真实测量，不拿替代物充数 |
| verify / verification | 验证 | 译 |
| root cause | 根因 | 译 |
| prompt | 提示词 | 译。文件名、代码里的 `prompt` 保留 |
| checklist | 清单 | 译 |
| finding | 发现的问题 / 审查意见 | 译；结构化字段名保留 |
| trail | 记录 / 决策记录 | 译。可审查的决策轨迹 |
| verdict | verdict | 保留 |
| slug | slug | 保留 |
| worktree | worktree | 保留 |
| lane | lane | 保留 |
| frontier | frontier | 保留 |
| cloud agent / Cloud Agents | cloud agent / Cloud Agents | 保留 |
| rule / rules | rule / rules | 保留 |
| PR | PR | 保留 |
| CI | CI | 保留 |
| MCP | MCP | 保留 |
| Diátaxis | Diátaxis | 保留 |
| tutorial / how-to / reference / explanation | 原文不译 | Diátaxis 四类名称保留 |
| TDD | TDD | 保留 |
| worker | worker | 保留。swarm / 并行工人 |
| candidate | 候选 | 译。arena 里的并行方案 |
| base | 基础 / 基础方案 | 译。arena 里留下并往上嫁接的那一份 |
| graft | 嫁接 | 译。把落选方案的长处并进基底 |
| artifact | 产物 | 译。可验证的输出（代码、报告、工具） |
| transcript | 对话记录 | 译。聊天历史；文件名里的 `transcript` 保留 |
| gate | 关卡 | 译。同一检查反复失败时，先质疑前提 |
| guard | 守卫 | 译。边界校验、防守式分支。合法状态才算修复 |
| caller | 调用方 | 译 |
| invariant | 不变量 | 译 |
| schema | schema | 保留 |
| lint | lint | 保留 |
| codemod | codemod | 保留 |
| eval | 评测 | 视语境。命令、包名、代码里的 `eval` 保留 |
| Comment Sicko | Comment Sicko | 保留。子代理名 |
| Bugbot | Bugbot | 保留 |
| Benny | Benny | 保留 |
| Dr Eggbot | Dr Eggbot | 保留 |
| Grok @Bot | Grok @Bot | 保留 |
| Claude Code | Claude Code | 保留 |
| Composer | Composer | 保留 |
| Cursor | Cursor | 保留 |

## 3. 文风规则

- 用自然、简洁的简体中文。句子短，先说做什么、何时用。
- 中文与英文、数字之间加空格：`用于 /architect`、`N 个候选`、`验证 skill`、`2-3 个原型`。
- 中文用全角标点：`，。；：、（）`。英文触发语保持原文引号（`'` 或 `"`）。
- 不用「赋能 / 助力 / 打造 / 抓手 / 闭环」等套话，也不用空洞的「进行 / 实现 / 针对性地」。
- 祈使语气：原文 `MUST` 写成 **必须**，`NEVER` 写成 **禁止**（加粗）。`Do not` / `Don't` 写成「不要」即可。
- 触发语保留英文，可在引号后加旁注：`'design this'`（帮我做设计）。旁注用全角括号。
- skill 名、命令、工具名、路径、代码、frontmatter 键，与原文完全一致，数量也一致。
- 同一概念跟本表走。不要一篇写「子代理」、另一篇写「子 Agent」。

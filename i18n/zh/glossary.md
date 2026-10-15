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

## 4. 正文翻译补充术语

翻译正文时新增的术语（按批次汇总，先到先得，后续统一时改这里）。

| English | 中文 | 备注 |
| --- | --- | --- |
| orchestrator | 编排者 | 派出 runner、汇总候选的一方 |
| runner | runner | 并行出候选的执行者，保留英文 |
| rationale | rationale | 与类型草图一起交付的设计说明，保留英文 |
| shape | 形态 | 设计或代码的整体结构 |
| checkpoint | 确认点 | 可选的人工确认停点 |
| interface depth | 接口深度 | 公开接口背后藏住的能力，相对接口本身的大小 |
| code judo | 代码柔道 | 行为不变、把实现大幅变简单的改法 |
| red flag | 危险信号 | 设计该改或该拒的理由。不译成「红旗」 |
| nit | nit | 审查严重度枚举，与 critical、warning 一样保留英文 |
| adversarial | 对抗性 | 评审立场 |
| forge | 代码托管平台 | GitHub 或 Origin。后文可简称「托管平台」 |
| owner | 负责人 | 把一个 PR 从构建带到合并的 agent |
| brief | 简报 | 派给 worker 的任务说明 |
| standing orders | 常设指令 | 每次派出和恢复都原样附上 |
| coordinator | 协调者 | orchestrate 的常驻会话 |
| sub-coordinator | 子协调者 | 一条工作线一个，只在协调者排空不过来时设 |
| drain | 排空 | 成批处理完成通知，不在当场深审 |
| track | 工作线 | orchestrate 里的一条工作流 |
| stacker | stack 管理者 | 唯一可以改 stack 拓扑的角色 |
| verifier | 验证者 | 与 worker 分开的验证 agent |
| pilot | 试点 | 扇出前先跑通的一个单元 |
| ledger | 账本 | 验证记录。文件名 `ledger.tsv` 不译 |
| countersign | 会签 | 根代理对放宽关卡的再次确认 |
| receipt | 回执 | 验证交回的证据 |
| tick | 巡检 | `/loop` 的一轮审计 |
| program | 项目 | 交给常驻协调者的整项工作 |
| root | 根代理 | 顶层协调 agent |
| babysit | babysit | playbook 名与动作，保留。标题可作「看护」 |
| trunk | trunk | 主干，保留 |
| merge-ready | merge-ready | 可合并状态，保留 |
| code-ready | code-ready | 代码就绪的 head，保留 |
| investigator | 调查员 | why 里按证据类别派出的子代理 |
| synthesizer | 合成器 | why 里汇总调查员发现的子代理 |
| code anchor | 代码锚点 | 文件、符号、提交、PR、工单组成的种子上下文 |
| epistemics | 认识论 | 置信度分层和措辞纪律。文件名 `epistemics.md` 不译 |
| postmortem | 事后复盘 |  |
| ticket | 工单 | issue tracker 里的单据。工具名和 ID 样例保持英文 |
| feature flag | 功能开关 |  |
| null result | 空结果 | 搜过但没有发现。要记下来，不要当成没搜 |
| coverage map | 覆盖图 | 哪些证据类别查过、哪些是缺口 |
| confidence tier | 置信度层级 | 直接 / 有支撑 / 推断 / 推测 / 未知。`synthesizer-prompt.md` 里反引号中的 `[Direct]`、`[Supported]` 保持英文，输出模板的标签沿用这两个英文词 |
| hedge | 留有余地 | 推断和推测的措辞，不把解释说成记录 |
| circumstantial evidence | 旁证 |  |
| defensive | 防御性 | 空值检查、重试、超时、限流、功能开关、出口守卫、OOM 等 |
| forcing function | 推动力 | 产品或业务上逼出这段代码的力量 |
| route / routing | 路由 | 把一条发现归到某个 skill 的具体改法 |
| durable learning | 可复用的经验 | 代码变了也还成立，以后的代理用得上 |
| lens | 视角 | Judgment、Tooling、Divergent 三种审查角度 |
| Custom Mode | Custom Mode | Cursor 功能名，保留 |
| decision log | 决策日志 | 一次运行里可回看的决定记录 |
| Backlog | Backlog | 与 Accepted、Rejected 同为输出分类，保留英文 |
| Accepted / Rejected | Accepted / Rejected | 输出分类名，保留英文 |
| digest | 摘要 | 找不到对话记录文件时传的压缩版。占位符不译 |
| prompt injection | 提示词注入 |  |
| observability | 可观测性 | 可观测性里的 trace 保留英文 |
| chat thread | 讨论串 |  |
| reasoning budget | 推理预算 | 给每个角色的思考额度 |
| reviewer | 审查者 | reflect 里并行的三个子代理 |
| discriminated union | 可区分联合 | TS 术语。用字面量判别字段区分变体 |
| branded type | 品牌类型 | 交叉类型加上 `__brand`，避免原始类型混用 |
| discriminant | 判别字段 | 可区分联合的标签，如 `kind`、`type`、`tag` |
| type guard | 类型守卫 | 与 guard → 守卫一致。命名 `isX` / `hasX` |
| narrowing | 收窄 | 类型收窄 |
| total | 全函数 | 对全部合法输入都有定义，不靠断言补洞 |
| cast (`as`) | 类型断言 | 潜在的运行时崩溃。校验之后才允许 |
| dry-run | dry-run | 保留。是否真没碰外部系统，靠观察，不看名字 |
| telemetry | 遥测 | 结构化诊断日志 |
| stable handle | 稳定定位 | UI 自动化里的 ARIA 标签、data 属性、提示字符串、路由。不用「抓手」 |
| one-way door | 单向门 | 做了就难以撤回的决定 |
| slice | 切片 | swarm 里分给一个 worker 的一块 |
| race | 竞速 | 多个 worker 做同一份简报。规则名 first pass、rank all、best-of 保留英文 |
| arm | 臂 | 竞速里的一支 |
| dropout | 掉队 | worker 没交回结果 |
| gap | 缺口 | swarm 里没有合格结果的位置，不算通过。评测里的差距译「差距」 |
| keep | keep | Comment Sicko 的保留处置，不译 |
| kill | kill | Comment Sicko 的删除处置，不译 |
| suppression | 抑制 | lint 或 TypeScript 的屏蔽注释 |
| reader load | 读者负担 | 读者为看懂代码要做的工作 |
| sum type | 和类型 | 变体的和，如可区分联合、带载荷的 enum、sealed class |
| brand | brand | 语义不同的原始类型分开。保留英文 |
| seam | 接缝 | 能切开、又不共享可变状态的边界 |
| reconciliation | 对齐 | 把残留状态收束到目标。答案是「要看留下了什么状态」就缺这一步 |
| limiter | 限制因素 | 卡住测量数字的资源或代码路径 |
| spread | 散布 | 多次运行结果的离散程度 |
| shell | 外壳 | 包住纯业务逻辑的薄层 |
| actor | 参与方 | 并发里会写同一份可变状态的一方 |
| total function | 全函数 | 定义域里每个输入都有结果 |
| pass-through | 透传 | 不改变抽象、原样转发的层 |
| scaffold | 脚手架 | 先搭起来的骨架 |
| baseline | 基线 | 改动前的测量或已知良好状态 |
| source of truth | 唯一事实来源 | 靠手同步的多份清单收成一份 |
| workaround | 权宜做法 | 绕开根因的临时写法 |
| judge | 评判者 | 看着委派出去的工作、不让人钻关卡 |

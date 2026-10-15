---
name: automate-me
description: "Use for \"automate me\", \"create/update/refresh my -mode skill\", \"turn/capture my preferences or working style into a skill\", or wanting agents to follow how the user works. Drafts or revises a personal -mode skill via create-skill + unslop, optionally pulling fresh evidence from recent transcripts."
disable-model-invocation: true
---

# Automate me

一条引导流程，把用户的工作习惯变成 agent 会遵循的 skill。输出是一个为用户定制的 `-mode` skill（如 `jay-mode`、`priya-mode`）。

这个 skill 编排另外三个：一次内联挖掘（见步骤 1）、Cursor 内置的 `create-skill`（撰写）、以及 **unslop** skill（行文纪律）。它只负责排序，不替代它们。

## 流程

### 0. 检查是否已有 skill

递归查找与用户 handle 匹配的 `.cursor/skills/**/*-mode/SKILL.md` 和 `~/.cursor/skills/*-mode/SKILL.md`。mode skill 可以放在个人分类目录（`.cursor/skills/<handle>/`）里，不只在顶层。若已存在，用 `AskQuestion` 确认意图（除非用户已经说了 "update my skill" 之类的话）：

- 更新现有 skill（重复运行时默认）
- 从头开始（少见，动手前先问原因）

更新模式会改变后续流程：
- 步骤 1 只挖掘 skill 上次编辑之后的历史（`git log -1 --format=%cI <path>`）。
- 步骤 2 问的是有哪些变化或缺失，不是从零开始要捕获什么。
- 步骤 4 就地编辑现有文件。保留用户没有推翻的章节。有新证据的章节则修改。只有确实新增的规则才加新章节。

### 1. 挖掘用户的历史

扇出前先定位当前工作区的对话记录。系统提示词里会给出该工作区的 `agent-transcripts/` 目录。只用这个路径。不要用 glob 扫 `~/.cursor/projects/*/`。那会跨工作区边界，读到无关项目的私密聊天。

在这个范围内检视近期的 agent 对话，找出反复出现的模式。把历史切成几段，并行跑多个子代理（如最近 2-4 周，分成 3 段，每段材料够用）。按 **poteto-mode** skill 的子代理一节，为每个子代理挑选推理档，以及 fast 还是标准速度。每个挖掘切片的子代理从父级给出的、限定在工作区内的路径读取对话记录，寻找下列信号，并返回一份简短的结构化清单，列出它看到的模式及证据位置。默认值得找的信号：

- 回复偏好（长度、语气、格式、"dumb it down" 式的纠正）
- 委派习惯（子代理、模型、专用工作流、并行度）
- 验证姿态（什么算 "done"、单元测试还是实机复现、审查者）
- 代码与行文纪律（风格、引用的原则、lint/format 工具）
- 流程约定（worktrees、提交、PR、审查/合并工具）
- 元偏好（任务中途修 skill、提出新 skill）

提升某个信号前，先在各切片间交叉核对。在 2 段以上出现的模式是高置信度。孤立的信号很弱，通常直接丢掉。

### 2. 直接问用户

挖掘会漏掉还没出现过的意图。用 `AskQuestion` 工具（结构化多选），不要让用户从零开始打字。

形态：一到两个问题，每个 4-6 个选项，分类问题用 `allow_multiple: true`。先问宽泛的（"Which areas matter most?"），再针对选中的领域用具体选项追问。结构化轮次结束后，用一个自由问答的聊天问题兜底，捕捉选项漏掉的点。

不要一次抛 20 个问题。

### 3. 归类发现的问题

把合并后的信号归入各章节。常见的有（只用在适用的）：

- **回复风格**：长度、语气、格式。
- **自主度**：多少事不用问就做、MCP 工具的使用。
- **先理解**：界定或调查一个改动时该用哪些 skill。
- **子代理**：默认、并行度、模型配任务、专用工作流。
- **行文 / 代码纪律**：原则、lint 工具、风格指南。
- **审查与验证**：复现姿态、验证 skill、实机测试工具。
- **流程**：git worktrees、提交、PR、审查/合并工具。
- **Skills**：撰写 skill 的习惯、先修 skill、提出新 skill。

**poteto-mode** skill 展示了形态。读它来把握颗粒度。不要抄它的内容。用户的规则和 poteto-mode 的不一样。

### 4. 起草 skill

用 Cursor 内置的 `create-skill` skill 来撰写 skill。放置：

- 路径：沿用现有 mode skill 的分类。若是新 mode，当仓库已为该 handle 建好个人分类时，用 `.cursor/skills/<handle>/<handle>-mode/SKILL.md`。否则默认用项目里的 `.cursor/skills/<handle>-mode/SKILL.md`（若用户偏好个人 skill，则用 `~/.cursor/skills/<handle>-mode/`）。
- Handle：用户的名字或选定的标识符。
- Frontmatter `description`：以用户名字 + `/<handle>-mode` + "work in their style" 触发，不要用 "write code" 或 "review PR" 这类泛化关键词。
- Frontmatter 格式：遵循 `create-skill` 的 YAML 规则。`description` 保持为一个 YAML 标量。需要标点或换行时，用引号包住，或改用 `description: >-` 加缩进续行。
- Frontmatter 默认 `disable-model-invocation: true`。只有用户明确要让 mode 每轮都生效时才关掉。

### 5. 反复打磨行文

对每一行都套用 **unslop** skill 和 `create-skill` 的写作指南。

把草稿给用户看，收集反馈。预期要改好几轮。下狠手删。mode skill 不是手册。

### 6. 落地

在 main 之外的 worktree 里干活。提交并开 PR。不要直接推 main。

## 护栏

- **不要过拟合到一次对话。** 说过一次、另一次又被推翻的偏好是噪声。要多实例才写进规则。
- **不要耍聪明。** 复述别的 skill 的内容、自造比喻、或给 agent 读者写 "poetic" 文字，都只有成本没有收益。保持可操作。
- **引用，不要内联。** 用户依赖的其他 skill 应以路径引用出现，不要粘贴摘录。用户在别处维护的原则文档同理。
- **章节尽量少。** 只有当用户在某处有具体、非默认的规则时才加章节。"Communicate clearly" 不算章节。"Short paragraphs. Tables when comparing options. Bullets only when items are genuinely parallel." 才算。
- **命名约定要泛化。** 祈使句里用 "the user" 或 "the human"，不要用作家的名字。
- **不要强行对称。** 如果用户没有值得写下来的流程规则，就整个跳过 Process 章节。

## 评测

`-mode` skill 的产出是主观的。`create-skill` 那种测试/迭代的基准循环在这里没用。跟用户对一下感觉：读起来像不像他？有没有漏掉什么？然后就发布。

只有当 skill 的触发准确率在实践中真的成问题时，才跑描述优化循环。

## 何时不用

- 用户要的是任务专用 skill（不是工作习惯）：单用 `create-skill`，无需挖掘。
- 用户想捕获一个狭窄的工作流（如 "how I write commit messages"）。那是普通 skill，不是 mode skill。

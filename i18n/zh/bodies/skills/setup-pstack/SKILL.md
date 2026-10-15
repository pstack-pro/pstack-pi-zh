---
name: setup-pstack
description: Configure which models pstack uses per role and at what reasoning budget. Detects your available models and writes an always-applied rule that overrides the skill defaults. Use for /setup-pstack, "configure pstack models", "pstack budget", or changing pstack's model choices.
---

# 配置 pstack

写入 `~/.cursor/rules/pstack-models.mdc`，这是一条始终应用的 rule，按角色设置 pstack 使用的模型。

## 步骤

### 1. 检测可用模型

枚举本次会话中你能传给 `Task` 子代理的模型 slug。这是可靠来源。如果 Cursor 还提供 models API 或 CLI 来列出用户有权限的模型，优先用它以求完整。如果检测不到任何模型，请用户粘贴他能用的 slug。**绝不**写入未经确认可用的真实 slug。别名 `inherit-parent` 和 `auto` 始终有效，尽管它们不是检测到的 slug。

### 2. 载入当前状态

默认的角色到模型映射就是下面第 5 步所示的 rule 形态。如果 `~/.cursor/rules/pstack-models.mdc` 已存在，读取它，把其中的 `# budget` 行和各角色取值当作当前选择。否则从这些默认值开始。角色不在第 5 步里的行（例如 `how critics`）来自已废弃的角色。删掉它。

### 3. 预算、映射并确认

**（a）询问预算。** 优先用 AskQuestion，而不是自由文本。提供下面四个选项，标签逐字一致；如果 rule 里记录了当前预算，就点明它。没有 rule 时，说明 `large` 与 skill 默认值一致。

- `unlimited — max reasoning`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

**（b）应用它。** 以 skill 默认值为基础构建工作表；重新运行时要保留你按 family、列表或别名（`inherit-parent`、`auto`）改过的角色。`unlimited`、`large`、`medium`、`small` 会把每个真实 slug（含 panel 条目）的 effort token 设为 `max`、`xhigh`、`high` 或 `medium`。effort token 是 `max` > `xhigh` > `high` > `medium` > `low` 阶梯上的最后一个 token，或结尾 `fast` 之前的那个。如果结果不是检测到的 slug，就用同 family 中 effort 不高于目标且最高的检测到的 slug，否则把该角色标为需要选择。`inherit-parent` 和 `auto` 不变。于是 `unlimited` 把 `claude-opus-5-5-xhigh` 变成 `claude-opus-5-5-max`。Grok slug 最高到 `xhigh`，所以在 `unlimited` 下回退会把 Grok 设为 `xhigh`，并保持 `grok-4.7-xhigh-fast` 不变。`large` 保留两个默认值。`small` 把它们变成 `claude-opus-5-5-medium` 和 `grok-4.7-medium-fast`。

**（c）展示各角色并确认。** 展示每个角色及其模型，把不在检测集合里的真实 slug 标为需要选择。同时列出第 2 步删掉的每一行。询问是按现状接受，还是改特定角色，并把检测到的模型加上 `inherit-parent` 和 `auto`（两者都表示：该角色跑在父对话模型上，Auto 用户正是靠它继续留在 Auto）作为选项。优先用 AskQuestion，而不是自由文本。panel 角色（arena runners、architect runners、interrogate reviewers）的值是列表，每个条目跑一个子代理，别名条目也算，所以列表长度决定数量。`arena cross-judge pool` 也是列表，但 Arena 会从中挑一个模型家族与父模型不同的值（若可行）。`swarm workers` 是每个 worker 的默认模型，除非某次 race 或比较给某个 arm 另派了模型。

### 4. 校验

写入的每个真实 slug 都**必须**在检测集合里。`inherit-parent` 和 `auto` 始终通过。如果选定的真实 slug 不可用，停下并重新询问。

### 5. 写入 rule

写入 `~/.cursor/rules/pstack-models.mdc`，包含 `alwaysApply: true`、一行带所选标签及其目标 effort 的 `# budget`，以及每个角色一行，标签与 poteto-mode 使用的一致。覆盖整个文件，以便重复运行保持幂等。形态：

```
---
description: pstack per-role model choices (overrides skill defaults)
alwaysApply: true
---
# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# `inherit-parent` or `auto` as a value: the role runs on the parent chat model (omit Task `model`). Alias entries in a panel list still count toward its fan-out.
# budget: large (xhigh)
feature, refactoring: grok-4.7-xhigh-fast
bug-fix: grok-4.7-xhigh-fast
perf-issue: grok-4.7-xhigh-fast
hillclimb: grok-4.7-xhigh-fast
judgment and prose: claude-opus-5-5-xhigh
hardest tasks: claude-opus-5-5-xhigh
how explorer: grok-4.7-xhigh-fast
how explainer: claude-opus-5-5-xhigh
why investigators: grok-4.7-xhigh-fast
why synthesizer: claude-opus-5-5-xhigh
reflect tooling: grok-4.7-xhigh-fast
reflect judgment, divergent, synthesizer: claude-opus-5-5-xhigh
arena runners: claude-opus-5-5-xhigh, grok-4.7-xhigh-fast
arena cross-judge pool: claude-opus-5-5-xhigh, grok-4.7-xhigh-fast
swarm workers: grok-4.7-xhigh-fast
architect runners: claude-opus-5-5-xhigh, grok-4.7-xhigh-fast
interrogate reviewers: claude-opus-5-5-xhigh, grok-4.7-xhigh-fast
```

### 6. 确认

告诉用户 rule 已写入，且对新会话生效。重新运行这个 skill 会更新它。

### 7. 提供验证 skill（可选）

检查项目是否有驱动真实应用以取得证据的方式（一个 `verify-*` skill，或已有的 harness）。如果没有，只提议一次："want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." 若同意，调用 `/create-verification-skill`（按 pstack 的安装位置解析：workspace、user 或 plugin）。若不同意，继续往下，不再劝说。

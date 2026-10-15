---
name: how
description: "Use for \"how does X work\", code walkthroughs before changing something, and placement / ownership / layering questions (\"where should this live\", \"which package owns this\", \"is this the right layer\"). Explains subsystem architecture, runtime flow, onboarding mental models. Use why for motivation."
disable-model-invocation: true
---

# How

探索代码库，回答 "how does X work?" 这类问题。给出架构层面的解释，达到一位资深工程师刚接手某个子系统时的水平——足以建立可用的心智模型，又不至于读起来像逐行注释的源码。

每次派生都是一个 Task 子代理，带 `subagent_type: generalPurpose` 和 `readonly: true`。explorer 使用 `pstack-models.mdc` rule 里的 `how explorer` 一行（默认 `grok-4.7-xhigh-fast`），每个 explainer 使用 `how explainer` 一行（默认 `claude-opus-5-5-xhigh`）。把 `model` 设为该行的值；若 rule 或该行缺失，就用默认值。当值为 `auto` 或 `inherit-parent` 时，`model` 保持未设置。如果 Task 工具拒绝某个 slug，就用默认值，并说明这一点。如果连默认值也被拒绝，就从报错信息里挑同一族里最接近的合法 slug。按 **poteto-mode** skill 里 Subagents 一节的做法，为每项工作选好各子代理的推理档位以及快或标准速度。

## 1. Assess complexity

若范围含糊，先说出你的理解，再去探索。用户可以纠正。

- **Simple**（单个模块、一个小工具，或某个很窄的问题，例如 "how does function X work"）：不要 explorer。派生一个 explainer，一趟就完成探索和讲解，基于 `references/explainer-prompt.md` 构建，但不含 explorer-findings 一节。进入第 4 步。
- **Complex**（跨多个文件或服务的子系统、横切多个模块的功能、完整的架构概览）：进入第 2 步。

拿不准时，走简单那条路。

## 2. Explore (complex only)

把问题拆成 2 到 4 个角度，每个角度是子系统的一块独立切片。在单条消息里派生所有 explorer，每个都带上 `references/explorer-prompt.md`，并填好各自的角度。

## 3. Synthesize (complex only)

等所有 explorer 都返回后，派生一个 explainer，带上 `references/explainer-prompt.md`，并填入每个 explorer 的发现。

## 4. Present

呈现 explainer 的输出。为了讲清楚，或补上对话里的上下文，做点小修改可以。不要大幅重写。

## Output format

解释使用 `references/explainer-prompt.md` 里定义的几节，不适用的就丢掉：概览、核心概念、工作原理、各部分所在位置、易踩的坑。

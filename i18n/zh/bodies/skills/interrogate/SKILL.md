---
name: interrogate
description: "Use for \"interrogate\", \"adversarial review\", \"multi-model review\", \"challenge this\", \"stress test this code\", \"find blind spots\", or \"tear this apart\". Multiple LLM reviewers challenge changes from independent angles."
disable-model-invocation: true
---

# Interrogate

为每个已配置的模型各派一名评审者，对代码改动做对抗性评审。对抗信号来自模型差异，不是分配的人设。最终交付一份综合后的 verdict。**不要**自动应用改动。

## 第 1 步：范围

先根据上下文判断评审范围：

- 用户指定了具体文件或某个 diff，就评审这些。
- 在 feature 分支上，运行 `git diff main...HEAD`（或对应的基础分支），拿到完整改动。
- 用户消息提到最近做的工作，就把相关文件找齐。

把 diff 或文件内容打包，再附上评审者理解代码所需的周边上下文文件。

## 第 2 步：意图

派出评审者前先用一段话写明意图，依据用户消息、commit 信息、PR 描述（如果有）和代码本身。拿不准意图就先问用户，再往下走。

## 第 3 步：派出评审者

用 Task 工具在一条消息里启动全部评审者。`~/.cursor/rules/pstack-models.mdc` 里 `interrogate reviewers` 这一行，每个条目对应一名评审者，依次标为 Reviewer A、B，数量与条目一致。如果没有这条 rule，或没有这一行，就用表里的默认值。

| 子代理 | 默认模型 |
|----------|---------------|
| Reviewer A | `claude-opus-5-5-xhigh` |
| Reviewer B | `grok-4.7-xhigh-fast` |

每个评审者都要带上 `subagent_type: generalPurpose`、`readonly: true`，并把 `model` 设成它对应的配置条目；没有这一行配置时，用表里的默认值。条目为 `auto` 或 `inherit-parent` 时，省略 `model`，让评审者跑在父模型上。

如果 Task 工具拒绝了某个配置条目，这名评审者改用同一族在表里的默认值，并说明情况。族按前缀划分：`claude-*`，以及 `grok-*`（其中还包括 `cursor-grok-*` 和 `composer-*`）。被拒绝的 `composer-*` 条目改跑 Reviewer B 的默认值。哪个族都对不上时，用 Reviewer A 的默认值。如果连表里的默认值也被拒，就用报错信息里有效 slug 中最接近的那个派出（优先同一族、同一推理档），另开一个 PR 更新默认表。不要因为 slug 问题卡住评审。**绝不**把别名条目当成被拒的 slug，两种回退都不要用在它身上。

读 `references/reviewer-prompt.md`，给每个评审者填同一份模板：写明的意图、diff 或文件内容、`references/rubric.md` 里的评审标准，以及 `references/code-quality-review.md` 里的代码质量视角。按这项工作为每个子代理选推理档，以及用 fast 还是标准速度，见 **poteto-mode** skill 的「子代理」一节。

## 第 4 步：综合

结果陆续回来时，拼出完整的全貌。逐个解析评审者的发现。不同说法描述同一个问题的，合并，并注明哪些模型提过。两个或更多模型各自独立提出的发现，信号最强。只有一个模型提的，仍要读，但权重相应调低。记下分歧。一个模型标出某件事、另一个明确说反话的，是下 verdict 时的参考。

## 第 5 步：主审裁定

你是主审，是务实的资深工程师，不是中立的汇总者。判断框架见 `references/lead-judgment.md`。把每条发现归入下面四类之一，写上提出它的模型，再加一行归类理由。

- **要处理**。结合真实目标看，确实影响正确性、安全或可维护性；放进真实 PR 里会挡合并。
- **可以考虑**。有道理，但拿不准现在值不值得改，值得用户看一眼。
- **记下即可**。技术上有道理，但没什么可做的——要么得看具体情况，要么属于过早优化，要么眼下影响很小。
- **驳回**。说错了、吹毛求疵，或缺少上下文；给个简短理由。

## 输出格式

### 意图
> [第 2 步写明的意图段落]

### 评审者
- Reviewer [标签]：[模型名]，[N 条发现]（每个评审者一条）

### 要处理
[每条：问题是什么、哪些模型提的、为什么重要。]

### 可以考虑
[每条：问题是什么、哪些模型提的、涉及什么取舍。]

### 记下即可
[简短列出。]

### 驳回
[每条附简短理由。]

### 意见分布
[模型在哪些地方一致、哪些地方分歧，这种规律说明了什么。]

---
name: arena
description: "Spawn N parallel candidates at the same task, pick a base, graft the strongest parts of the losers into it. Use for /arena, 'arena this', 'throw it in the arena', or when one attempt at a non-trivial artifact would lock in the wrong shape."
disable-model-invocation: true
---

# Arena

启动任何东西之前，先开一份待办清单，每个阶段一条（框定、扇出、交叉评判、挑选、嫁接、验证）。

## 阶段 A：框定

每个候选拿到同样的提示词，因此提示词就是契约。

1. 说明每个候选要产出的产物。
2. 推出评分标准，即针对*这项*任务、成功长什么样子的 3-6 条具体可打分准则。它是阶段 D 里挑选者用的工具。候选只看得到任务。
3. 挑选 runner。用 `~/.cursor/rules/pstack-models.mdc` 里的 `arena runners` 那行。要是缺了这条 rule 或那一行，默认在 `claude-opus-5-5-xhigh` 和 `grok-4.7-xhigh-fast` 上各放一个。这一行或 cross-judge 行里的 `auto` 或 `inherit-parent` 条目表示用父模型，所以对它省略 `model`。如果 Task 工具拒绝了配置里的某个条目，就把那个席位放到它所属家族的默认模型上跑，并说明这一点。家族按前缀区分：`claude-*`，以及带 `cursor-grok-*` 和 `composer-*` 的 `grok-*`。被拒的 `composer-*` 条目改为在 `grok-4.7-xhigh-fast` 上跑。没有家族匹配时，用 `claude-opus-5-5-xhigh`。如果它拒绝了某个默认值，就从它的错误信息里取同一家族中最接近的合法 slug。当 arena 覆盖多个设计方向时，派出更多 runner。当工作偏向生成、而非依赖判断时，把同一个模型用 N 次。按 **poteto-mode** skill 的 Subagents 一节，为手头的活挑选每个子代理的推理级别和 fast 或 standard 速度。
4. 给每个候选各自的输出位置（尽量用 git worktree，否则用 `/tmp/arena-<slug>/candidate-<n>/`），按 **separate-before-serializing-shared-state** 原则 skill。

## 阶段 B：扇出

在一条消息里派出全部 N 个子代理，带 `run_in_background: true`，每个都带上任务、共享事实基础的路径、各自的输出路径，以及要求产出产物和一段简短 rationale 的说明——rationale 要列出它考虑过的替代方案和被它否决的方案。

要是某个候选没有产出，就用 N-1 继续，并记下这次掉队。

## 阶段 C：交叉评判

等阶段 B 的所有候选都完成后，从 `~/.cursor/rules/pstack-models.mdc` 里的 `arena cross-judge pool` 那行挑一个模型。如果缺了这条 rule 或那一行，就从 `claude-opus-5-5-xhigh` 和 `grok-4.7-xhigh-fast` 里挑。尽量选与父模型不同的家族。在那个模型上派一个 readonly 评判者子代理。它看到评分标准和按路径标签标示的候选，逐条打分，并给出带 rationale 的基础方案推荐。它和你在阶段 D 的阅读并行进行。候选还在写的时候不要派它。

## 阶段 D：挑选基础方案

挑选之前，把每个候选从头到尾读完。逐一按评分标准的每条准则打分，不要凭整体感觉，再和交叉评判的结果对照。对基础方案看法一致，就确认这次挑选。有分歧，说明要么你们中有一个带偏见，要么评分标准含糊。决定前把两份 rationale 都读了。

挑一个未来的维护者最容易在不打破不变量的前提下扩展的基础方案。两者难分高下时，按 Laziness Protocol，优先边界更干净或 API 更小的那个。

## 阶段 E：嫁接

把每个落选的候选再过一遍，看有什么值得移植进基础方案，通常每个候选取一两样，而不是大部分。按 **redesign-from-first-principles** 原则 skill，逐个手工把嫁接并进去，让结果在一个心智模型下保持连贯。不要机械地粘贴。

如果候选收敛到同一种形态，那是很强的一致信号。记下来，直接交付这个共识形态，不需要嫁接。如果它们分歧极大，说明阶段 A 说明得不够。重新框定并重跑，而不是把分歧折中平均。

## 阶段 F：验证

按 **prove-it-works** 原则 skill，像对待任何其他输出一样验证合成后的产物。如果验证发现 arena 漏掉的问题，要么是阶段 A 出了问题（重新框定并重跑），要么是某个候选抓到了、而你漏掉了那处嫁接（回到阶段 E）。不要遮掩过去。

## 输出

一份合成后的产物，附一段简短的综合说明，写明基础方案及理由、交叉评判的 verdict、每处嫁接及其来源候选、被否决的内容及原因、任何收敛或掉队的情况，以及验证结果。

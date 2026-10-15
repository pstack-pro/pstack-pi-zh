---
name: swarm
description: "Fan out N parallel workers, drain them, and return one report. Use for /swarm, 'swarm this', or parallel coverage, races, gauntlets, and exploration."
disable-model-invocation: true
---

# Swarm

扇出 N 个并行的 cloud worker。它们可以各自覆盖不同的切片，也可以用同一份简报竞速，或者两种都有。父代理等待、汇总，交回一份报告。

## 开始

启动任何东西之前，先开一个待办清单，每个阶段一条。

1. 定框
2. 扇出
3. 汇总
4. 报告

## 阶段 A：定框

1. 写明完成判定条件，以及 swarm 必须交回的产物或报告。
2. 选形态。切成切片，让 N 个 worker 用同一份简报竞速，或者两种都有。竞速或混合形态，在派出之前声明 `first pass`、`rank all` 或 `best-of`。
3. N 由用户给定，或从形态推导。N 是 worker 总数，不是 cloud 的并发上限。
4. worker 的模型取 `~/.cursor/rules/pstack-models.mdc` 里 `swarm workers` 这一行。没有这条 rule，或没有这一行，就用 `grok-4.7-xhigh-fast`。`auto` 或 `inherit-parent` 就省略 `model`，让 worker 跑在父模型上。Task 工具拒绝某个 slug，就用默认值，并说明这件事。默认值也被拒，就用报错信息里同一族最接近的有效 slug。模型竞速时，事先点名每一臂的模型。按这项工作给每个子代理选推理档，以及 fast 还是标准速度，见 **poteto-mode** skill 的「子代理」一节。
5. worker 要写东西时，各自有可写的输出。worker 验证或测量 commit 时，每份简报都点名确切的 SHA。测量用的简报还要点名方法（样本数、一个样本是什么、顺序）。worker 在结果里把这两样都记下来。

## 阶段 B：扇出

在一条消息里派出全部 N 个 worker，带上 `subagent_type: generalPurpose`、`environment: "cloud"`、`run_in_background: true`，以及第 4 步的模型。`auto` 或 `inherit-parent` 时把模型留空。只有 worker 需要访问用户电脑上的东西时，才用 `environment: "local"`。

worker 必须从一条非默认的、已经推送的分支开始时，传 `cloud_base_branch`。

每份简报都要能独立读懂。写上目标、范围、确切的切片或竞速臂、怎么验证、报告什么。报告用 `PASS`、`ISSUES` 或 `BLOCKED`，并带上证据。worker 能证明一个缺陷，就报 `ISSUES`，并列出它能证明的每一个问题，不只是第一个。

有 worker 掉队，就按 N-1 继续，并记下来。

## 阶段 C：汇总

读每个 worker 交回的最终结果。结果没有记下简报点名的 SHA 和方法，就丢掉，并把那个 worker 重新派出一次。第二次还是缺，就记一个缺口。缺口不算通过。做覆盖时，每一个必需的切片都要有结果。竞速时，用事先声明的选择规则：first pass、rank all 或 best-of。不要粘贴 worker 的原始输出。

留一张紧凑的结果表、带证据的问题各一行，以及明确的缺口或掉队。

## 阶段 D：报告

在对话里交回一份合并后的报告：那张表、问题的一行摘要、缺口或掉队，用了竞速规则的话也写上。

---
name: principle-guard-the-context-window
description: "当上下文快填满时适用：大段输出、长文件、重复读取、扇出规划。把大块工作交给子代理；主线程只留摘要，不留原始载荷。 | EN: Apply when context is filling up: large outputs, long files, repeated reads, fan-out planning. Route bulk to subagents; keep summaries in the main thread, not raw payloads."
disable-model-invocation: true
---

# Guard the Context Window

**Why:** Context overflow degrades reasoning quality, creates compression artifacts, and halts progress.

**Pattern:**
- **Size phases and cap scope.** Limit files per phase, set turn budgets, account for mechanism costs.

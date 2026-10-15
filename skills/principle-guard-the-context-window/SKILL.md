---
name: principle-guard-the-context-window
description: "上下文窗口快满（大输出、长文件、重复读、扇出规划）时，大块交给子代理，主线程只留摘要，不留原始内容。"
disable-model-invocation: true
---

# Guard the Context Window

**Why:** Context overflow degrades reasoning quality, creates compression artifacts, and halts progress.

**Pattern:**
- **Size phases and cap scope.** Limit files per phase, set turn budgets, account for mechanism costs.

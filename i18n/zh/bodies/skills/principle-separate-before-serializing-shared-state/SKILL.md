---
name: principle-separate-before-serializing-shared-state
description: "Apply when concurrent actors might write to the same file, branch, key, or state object. Eliminate the sharing first; serialize structurally only when one shared writer is a real invariant."
disable-model-invocation: true
---

# 先分离，再串行化共享状态

当并发的参与方可能共享可变状态时，先问一句：它们是否真的需要同一个可变对象？如果不需要，就消除共享。当共享确实存在，就在结构上强制串行化：锁文件、顺序阶段、独占所有权。指令和约定不是并发控制。

**为什么：** 并发写共享状态会产生竞态，这类问题时有时无、难以复现，调试成本很高。

**模式：**
1. **找出共享的可变状态**（双方都读写同一文件、都推送同一分支、都定义和消费同一 API）。
2. **默认做法：消除共享的写入目标。** 问：这些参与方需要一个权威对象，还是各自发布独立的事实？给每个参与方分配各自独占的文件、键、分支或状态目录，只在读取／汇总的边界做合并。两个 worker 各自把 `lastX` 字段写进同一个 `state.json`，仍然是共享可变状态。`indexer-state.json` + `metrics-state.json` 就不是。
3. **只有当「一个共享写入目标」是真正的不变量时，才在结构上串行化访问**（锁文件、顺序阶段、单写入方参与方，或原子 compare-and-swap）。把「我们需要一把锁」当作要检查的设计异味，而不是默认答案。

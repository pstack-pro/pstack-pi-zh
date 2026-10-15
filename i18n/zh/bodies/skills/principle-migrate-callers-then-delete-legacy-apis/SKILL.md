---
name: principle-migrate-callers-then-delete-legacy-apis
description: "Apply when introducing a new internal API while old callers still exist. Migrate callers and delete the old API in the same wave instead of preserving compatibility layers."
disable-model-invocation: true
---

# 先迁移调用方，再删除遗留 API

当我们确定新 API 是正确设计后，就在同一轮重构里迁移调用方并删除旧 API，而不是保留兼容层。

**规则：**
- 不要仅因为内部还有调用方就保留遗留 API 路径
- 清点调用方，迁移它们，然后立即删除旧 API
- 把临时适配器当作限定时限的例外，而不是默认架构
- 更新测试以断言新契约，删除那些只保护重构前实现细节的测试

**适用场景：**
- 没有外部用户依赖向后兼容
- 项目能承受协调一致的破坏性变更
- 新 API 属于简化或重构计划的一部分

同时保留新旧 API 会造成双路径复杂度，拖慢清理，让代码库显得只增不减。

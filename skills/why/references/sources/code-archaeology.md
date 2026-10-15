# 代码考古（git + 仓库内）

## 这个来源里有什么

- 提交历史（说明、日期、作者、diff）
- PR 描述、评审评论、讨论串（通过 `gh`）
- 行内代码注释、TODO、FIXME、弃用说明
- ADR（架构决策记录），如果仓库里有
- 测试。名字和断言常常记下了促使这次改动的边界情况
- 同一次提交里一起改过的相关文件（同改信号）
- 仓库里的 CHANGELOG 条目和发布说明
- 提交说明和 PR 正文里的工单 ID

这是最可信的来源，直接绑在代码上，也最完整。凡是进过仓库的，这里都该有。

## 怎么搜

把种子提交列表再扩开：

```bash
# History through renames
git log --follow --oneline -- <file>

# Pickaxe: commits that added or removed this exact text
git log -S '<exact_string_from_code>' -- <file>

# Or for patterns:
git log -G '<regex>' -- <file>

# Who wrote each line and when
git blame -L <start>,<end> <file>

# One commit's full diff
git show <hash>

# Commits between two points affecting this file
git log <old>..<new> -p -- <file>
```

再找提交记录之外的文档：

```bash
# ADRs often live in docs/adr/ or similar
rg -l -i 'architecture.decision' --glob '*.md'

# TODOs and FIXMEs near the target
rg -n -C2 '(TODO|FIXME|HACK|XXX|NOTE)' <target_file>

# Related tests
rg -l '<symbol>' --glob '*test*'
```

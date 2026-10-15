# 事故与事后复盘上下文

- **Linear**：找标了 `incident`、`sev-*`、`postmortem-action-item`、`reliability` 的工单
- **Slack**：在目标代码加进去的那些日期附近，搜 `#sev-*` 和 `#incident-*` 频道
- **Git**：提交信息里出现 "fix for incident"（为事故而修）、"add defensive check"（加防御检查），以及 "revert" 后面跟着 "re-apply with..."（回退之后又用……重新加上），都是强信号

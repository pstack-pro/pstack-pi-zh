# 来源 playbook

why skill 为每个可用的证据类别派一名调查员，每人只读下面自己那一类的 playbook。这些 playbook 是常见 MCP 的具体例子。同一类里换一个 MCP，就照着改。

| 类别 | Playbook | 对应的示例 MCP |
|---|---|---|
| 源码控制历史 | [`code-archaeology.md`](./sources/code-archaeology.md) | git、`gh` |
| 工单 / ticket 跟踪 | [`linear.md`](./sources/linear.md) | Linear（可改写成 Jira、GitHub Issues、Plane、Shortcut） |
| 长文文档 | [`notion.md`](./sources/notion.md) | Notion（可改写成 Confluence、Google Docs、Coda） |
| 实时团队聊天 | [`slack.md`](./sources/slack.md) | Slack（可改写成 Discord、Microsoft Teams、Mattermost） |
| 基础设施可观测性 | [`datadog.md`](./sources/datadog.md) | Datadog（可改写成 New Relic、Honeycomb、Grafana、Splunk） |
| 错误 / 异常跟踪 | [`sentry.md`](./sources/sentry.md) | Sentry（可改写成 Rollbar、Bugsnag、Airbrake） |
| 产品分析数仓 | [`databricks.md`](./sources/databricks.md) | Databricks SQL（可改写成 Snowflake、BigQuery、ClickHouse、dbt） |

跨类别：

- [`incident-postmortem.md`](./sources/incident-postmortem.md)。如果目标代码看起来是防御性的（空值检查、重试、超时、限流、功能开关、出口守卫、OOM 处理），把这份也加上。

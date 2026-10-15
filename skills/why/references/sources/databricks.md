# Databricks 分析与系统表

## 这个来源里有什么

Databricks 是产品分析、数据管道和数仓遥测这一层。它和 Datadog 互补。Datadog 是*基础设施 / 运行时*视角，Databricks 是*产品 / 数据*视角（用户做了什么、哪些实验在跑、功能使用怎么变、某个阈值常量从哪来）。

- **产品分析事件。** `your_warehouse.events.analytics_track_event`（原始）以及 `<your_analytics_db>.<schema>.<table>` 里带类型、去过重、按事件拆开的 dbt 模型。用户行为：功能调用、点击、接受 / 拒绝、提交、客户端上报的错误。
- **使用与计费事件。** `your_warehouse.events.usage_event` / `<your_analytics_db>.<schema>.stg_usage_events`，`your_warehouse.events.raw_model_event` / `<your_analytics_db>.<schema>.stg_raw_model_events`。要看成本或流量推动的决定时，用这些。
- **实验 / 功能开关数据。** 曝光表和结果表。**Schema 因公司而异。** 在假设表名之前，先用 `SHOW TABLES` 探一下。
- **系统表。** `system.query.history`、`system.compute.warehouses`、`system.billing.*`、`system.access.audit`。用来回答「这条查询贵吗」「有人跑过几次」「数仓负载什么时候冲高」。
- **dbt 血缘。** `<your_analytics_db>.<schema>` 里的模型能看出哪些管道依赖某张表或某个字段。上游一变，读这些表的代码常常也得改。
- **Databricks notebook。** 工程师改代码之前写的探索分析。**SQL MCP 查不到。** 如果你怀疑理由在 notebook 里，把它记成缺口。

## 怎么搜

使用 Databricks SQL MCP。主工具是 `execute_sql_read_only`。如果它返回 `statement_id`，用 `poll_sql_result` 去轮询，不要重新跑。

**先定向，再查询。** Schema 因公司而异。先探明，再信一个表名：

```sql
SHOW TABLES IN <your_analytics_db>.<schema> LIKE '*<keyword>*';
DESCRIBE TABLE <your_analytics_db>.<schema>.stg_<event>;
```

**每条查询都要限时间。** 这些表很大，不设限的扫描会超时。在 `_timestamp`（事件）或 `start_time`（`system.query.history`）上过滤，窗口框住发布日期，一般前后各约 30 天，只有很强的理由才放宽。

**优先用带类型的 dbt 模型，不要用原始表。** `<your_analytics_db>.<schema>.<table>` 去过重、带类型，并且是 liquid-clustered。`your_warehouse.events.analytics_track_event` 有重复，而且 `properties_json` 没有类型。模型名的模式是 `stg_<source>_<event_name_with_underscores>`，其中 `<source>` 是 `app`、`backend`、`website` 或 `cli`。光靠模式定不下来时，用 `SHOW TABLES` 确认确切的模型名。只有还没有 dbt 模型，或者你要的是 dbt 刷新延迟之内的事件时，才退回原始表。

**带类型的 dbt 模型有一套列约定**（记住这些，就不用再跑一趟 `DESCRIBE`）：

- `_timestamp`、`_id`、`_auth_id`、`_request_id`、`event_name`。每个模型都有的标准字段
- `properties_<name>`。带类型、下划线形式的事件属性（`properties_entrypoint`、`properties_size_bytes` 等）
- `context_team_id`、`context_client_version`、`context_country`、`context_client_os`。预先抽好的客户端上下文

### 通常值得做的查法

按目标选表和列：

1. **事件使用轨迹。** 在 PR 合并前后各约 30 天的窗口里，看相关 `stg_*` 模型的每日计数。合并后一两天内从零跳到稳定流量，是这条 PR 发布了该功能的强旁证。掉到零，像是弃用或删除。
2. **护栏 / 防御检查从哪来。** 看 PR *之前* 14 天里，相关 `properties_<name>` 列的分布（median / p99 / max）。如果 p99 对得上目标里的阈值常量，说明这个数字多半是按数据选的。
3. **查实验 / 功能开关。** 用 `SHOW TABLES ... LIKE '*experiment*'` 找到曝光表，再按相关的 flag key，把 PR 日期附近各 variant 的曝光计数拉出来。
4. **迁移、回填或性能重写的查询历史。** 在 `system.query.history` 里用 `statement_text ILIKE '%<table_or_symbol>%'` 过滤，再配一个收紧的 `start_time` 窗口，就能把可能推动这次改动的贵查询翻出来（按 `total_duration_ms` 排序，或聚合 `SUM(read_bytes)`、`COUNT(*)`）。
5. **dbt 血缘。** 如果目标读或写某个 `<your_analytics_db>.<schema>` 模型，这个模型自己的 git 历史（在本仓库里）常常带着理由。把这条线索交还给 git 调查员，不要自己追。

## 怎样算好证据

除了上面这些模式：

- 一条用来给错误分类的事件，计数在防御性代码的 PR 之后几天里掉到接近零。这暗示该 PR 把这类错误消掉了
- 曝光表里有一行写着目标的 feature-flag 键，并在 PR 发布日期附近有 "shipped" / "concluded"（已发布 / 已结束）的决定

## 常见陷阱

- **有埋点不等于因此而存在。** 有一条事件，只说明有人在意到愿意去记它，不能说明目标代码*因为*它才存在。先和 git 调查员的 PR 或 commit 引用对上，再声称有因果关系。
- **埋点会悄悄变。** 事件量的阶跃，可能是一条新事件开始被记录，不是用户行为变了。把上升读成功能发布的信号之前，先在同一窗口里查有没有埋点相关的 PR。
- **Schema 会漂。** 事件属性会变。带类型的 dbt 模型上今天有的列，目标写出来的时候可能还没有。更老的数据里，这个属性可能只在原始的 `properties_json` 里。
- **dbt 刷新有延迟。** `<your_analytics_db>.<schema>.*` 按计划重建（常常是按小时或按天）。最近几小时的事件，退回 `your_warehouse.events.*`，并按 `_id` 去重。
- **表是公司自己的。** 实验、功能开关、计费、使用这些表，各家不一样。用一张你从没确认存在的表去报结果，是典型的失败。先用 `SHOW TABLES` / `DESCRIBE TABLE` 探一下。
- **过了保留期。** 相关窗口如果早于这张表的保留期，或者早于 dbt 模型的创建日期，那是*缺口*，不是空结果。明确写出来，免得合成器把「没有结果」读成「没有活动」。
- **Notebook 查不到。** SQL MCP 看不到 Databricks notebook。如果你怀疑理由在某份 notebook 里，就返回一个缺口。

## 要返回什么

每项相关发现：

- 类型（产品事件 / 实验曝光 / 使用或计费事件 / 系统表的行 / dbt 模型）
- 全限定表名，以及你实际跑的那条查询
- 查询的时间窗口
- 紧凑的数值摘要（计数、分位数、首次 / 末次出现的时间戳）。**不要倒出原始行。**
- 和目标发布日期的时间关系（例如「首行 2024-08-15，PR #49074 在 2024-08-14 合并」）
- 相关程度 + 强度：直接 / 旁证 / 弱

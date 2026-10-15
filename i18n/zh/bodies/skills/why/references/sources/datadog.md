# Datadog 遥测

## 这个来源里有什么

Datadog 记下的是运行时记录：生产里实际发生了什么。计划和讨论里说的，不在这份记录里。

- **指标。** 团队埋进去的计数器、gauge、直方图。一条指标的*存在*本身就是证据：有人觉得这个数字值得看。
- **Monitor 与告警。** 团队认定值得把人叫醒的条件。一条在 `rate_limit_hit > 10/min` 上触发的 monitor，是直接证据：团队担心这个阈值。
- **仪表盘。** 整理过的视图，能看出团队觉得这个子系统里什么重要。
- **APM trace 与 span。** 请求一级的运行时数据，用来回答「为什么慢」「为什么这里会超时」。
- **日志。** 量大的事件记录，里面常常就是促使人写下防御代码的那些错误条件。
- **事故。** 正式的事故记录，带时间线和链接的事后复盘。
- **Notebook。** 团队自己做的探索调查，里面常常有假设和分析。

## 怎么搜

使用 Datadog MCP。先广，再收窄。

1. **找出负责的服务。**

   ```
   search_datadog_services (filter by name or team)
   search_datadog_service_dependencies (see upstream/downstream)
   ```

2. **先看仪表盘和 monitor。**

   ```
   search_datadog_dashboards (query: feature name, service name, symbol)
   search_datadog_monitors   (same queries)
   ```

   仪表盘或 monitor 覆盖了目标时，记下它的查询和它盯着的阈值。这个阈值常常就是「为什么卡在 N」的答案。

3. **目标周围的指标。**

   ```
   search_datadog_metrics (by name pattern, e.g., the feature or symbol)
   get_datadog_metric_context (metadata: description, units, tags)
   get_datadog_metric (timeseries; "was there a spike around the PR date?")
   ```

   把一条指标的轨迹和目标新增或改动的日期对上，是很强的旁证：「`payment_timeout` 在 2023-11-03 冲高，重试逻辑在 2023-11-06 合并。」

4. **日志。收窄，不要倒出来。**

   ```
   search_datadog_logs (raw log patterns near the target, set use_log_patterns=true)
   analyze_datadog_logs (SQL-style aggregations, only when you need counts)
   ```

   用符号、错误字符串或功能名来搜。**强烈优先使用带时间范围的查询**（例如改动前后各 30 天）。

5. **APM span 和 trace。**

   ```
   aggregate_spans    (stats: "how often does this endpoint fail?")
   search_datadog_spans (inspect individual spans)
   get_datadog_trace  (a specific trace ID)
   ```

   适合看超时、重试、慢路径，以及跨服务的行为。

6. **事故。**

   ```
   search_datadog_incidents (by title, team, date range)
   get_datadog_incident     (full detail for a specific incident)
   ```

   如果目标看起来是防御性的，就搜它加进去前后的事故。时间线里写着 "added defensive check for X"（为 X 加了防御检查）的事故，几乎就是直接证据。

## 怎样算好证据

- 一条 monitor，它的查询和阈值对得上代码强制的那条约束（代码卡在 100，monitor 在请求超过 100/min 时告警）
- 目标作者建的仪表盘，上面的图对得上代码在测量或在防御的东西
- 一条指标在代码合并前的生产环境里冲高，合并之后稳住
- 一份事故记录提到目标代码、同样的符号，或同样的错误字符串
- 日志里有防御代码会拦住的某种错误模式，时间戳落在改动之前的窗口里

## 常见陷阱

- **相关不是因果。** PR 之前冲高、之后稳住，这只是提示，不是定论，因为同一窗口里可能还有别的改动落地。去看相邻的 PR。
- **过度贴合你找到的那张图。** 图反映的是做图人自己的框法。一张名叫 "retry success rate" 的图，说明团队在意重试是否成功，不能说明某一行代码就是因此存在的。
- **遥测没了。** 指标可能改了名、删了，或保留期很短。相关时间窗口里找不到数据，这是缺口，不是空结果。
- **量大之后全是噪声。** 搜日志时按 service、tag 和时间窗口使劲收窄。用 `analyze_datadog_logs` 做聚合，不要把原始日志倒出来。
- **有埋点不等于因此而加。** 有一条指标，只说明有人在意到愿意去量，不能说明代码是*因为*它才加上的。和 commit、PR 的日期对一下。

## 要返回什么

每项相关的：

- 类型（dashboard / monitor / metric / log pattern / trace / incident / notebook）
- 标题或名称
- 链接或标识（dashboard ID、monitor ID、指标名、incident ID）
- 所有者 / 作者，以及创建 / 修改日期
- 和问题有关的具体条件、查询或引文（能逐字就逐字）
- 相关性：这对目标代码说明什么，连接有多强

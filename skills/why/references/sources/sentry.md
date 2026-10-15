# Sentry 错误历史

## 怎么搜

使用 Sentry MCP。

1. **先摸清。** 如果不知道 project slug 和 organization：

   ```
   find_organizations
   find_projects
   ```

2. **搜和目标相关的 issue。**

   ```
   search_issues (natural language, e.g., "errors in PaymentService timeout", "unhandled exceptions in uploadFile")
   ```

   查询用这些来拼：目标代码处理的异常类名、它的函数或类名、它要检查的错误消息字符串，以及它的文件路径。

3. **按 release 和时间窗口收窄。**

   ```
   search_issue_events (filter by release, time, environment, trace ID, tags)
   get_issue_tag_values (for an issue, see distribution across versions, users, environments)
   ```

   对怀疑相关的 issue，核对**首次出现**和**末次出现**（停下来的时间是否对得上目标的发布日期）、**受影响的 release**（哪些版本见过，哪个是修复版），以及**频率轨迹**（是不是先冲高，然后被解决）。

4. **把完整 event 拉下来看上下文。**

   ```
   get_sentry_resource (pass a Sentry URL or type+ID)
   ```

   堆栈有没有经过目标代码？标签和 breadcrumb 是否对得上目标要防的那些条件？

5. **查目标附近落地的 release。**

   ```
   find_releases (around the commit date of the target)
   ```

   拿 release 版本和 PR 的合并日期对一下。

6. **Seer 少用。**

   ```
   analyze_issue_with_seer
   ```

   Seer 的 AI 根因分析是用来提假设的。把它当成推断，不要当成定论。真正的 event 和堆栈才是主要证据。

## 要返回什么

每个相关 issue：

- Issue ID 和标题
- 项目和 organization
- 首次出现 / 末次出现的时间戳
- Event 计数（知道采样率就写上）
- 受影响的 release
- 一段能看出和目标有关的代表性堆栈（逐字摘录，不要摘要）
- 首次 / 末次出现和目标发布日期的时间关系
- issue 的链接
- 作者的评论，或解决时的说明

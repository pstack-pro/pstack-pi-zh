# Bugbot 分诊

当 Babysit playbook（`../playbooks/babysit.md`）处理 Bugbot 或审查自动化评论时，查阅本参考。目标不是默认忽略 Bugbot，而是不再把每条评论都当成必须改代码的要求。

## 判定准则

动手前先给每条 Bugbot 讨论串分类：

- `fix`：评论指出了一个可信的正确性、安全、隐私、数据丢失、鉴权、计费、迁移、幂等、竞态或已上线行为问题。在拥有该代码的最低层 PR 里修复，然后回复 commit SHA 并解决该讨论串。
- `dismiss`：评论符合已知的低风险噪音模式，且当前代码/上下文证明该担忧无需改代码。简短回复理由并解决讨论串。
- `ask`：评论是全新的、高严重度的、涉及安全/隐私/数据的，或者含义不清。此时问用户，不要猜。

拿不准就问。跳过一条噪音式代码质量评论代价很低；跳过真正的数据或安全 bug 就不是了。

## 已学模式的格式

以后新增模式时用这个格式：

```markdown
### <short pattern name>

- Confidence: candidate | recurring | strong
- Skip when: <conditions that must be true>
- Do not skip when: <risk boundaries>
- Example signal: <phrases or code context that identify the pattern>
- Source: <PR/comment URL or short historical note>
```

`candidate` 用于一两个例子。经过多次真实驳回后用 `recurring`。只有当模式足够窄、反复验证过且低风险时，才用 `strong`。

## 反复出现的可跳过候选

### 有意为之的 UI 或设计系统视觉变更

- Confidence: candidate
- Skip when: PR 描述、截图、设计评审或附近代码已明确说明该视觉变更，而 Bugbot 评论只是重复说某个共享视觉默认值变了。
- Do not skip when: 评论指向无障碍、焦点可见性、键盘导航、颜色对比度，或 PR 并未有意改动的组件 API 契约。
- Example signal: 关于焦点轮廓、按钮尺寸、间距或共享组件视觉默认值的评论，且负责人回复 "intentional" 或 "intended"。

### Bugbot 看不到的 upstack 或 stack 内用法

- Confidence: candidate
- Skip when: Bugbot 说某个 export、组件、辅助函数或文件未被使用，而当前托管平台的 PR 列表与 diff、上层 stack 的 diff 或 PR 上下文表明它被 stack 里更靠后的 PR 用到。
- Do not skip when: 当前 PR 不属于任何 stack、该符号是公开 API，或所谓的 upstack 用法无法验证。
- Example signal: "Exported component is never used"，配上一句类似 "used upstack" 的人类回复。

### 并行实现期间的临时重复

- Confidence: candidate
- Skip when: PR 有意重复少量代码，让新路径与正在删除、替换或验证中的旧路径并行。
- Do not skip when: 重复的代码涉及安全、计费、数据访问、API 行为，或者长期共享的抽象明显能降低风险。
- Example signal: "Significant duplication" 或 "duplicated validation logic"，且负责人解释旧路径将被删除，或重复逻辑是有意局限在局部的。

### 框架或组件已有的不变量覆盖了该警告

- Confidence: candidate
- Skip when: 该担忧已由共享组件、框架契约、类型不变量，或当前 diff 或附近代码里可见的唯一事实来源保证。
- Do not skip when: 这个不变量只是假定而未强制、依赖时序，或跨越了异步/状态边界，值可能因此分歧。
- Example signal: 评论说内层 popover 缺 max-height，而共享 popover 已强制视口边界；或评论针对可空值，而局部检查的值和传入的值来自同一来源。

### 负责人声明为后续事项或延后清理

- Confidence: candidate
- Skip when: PR 负责人明确说该问题已知、属后续事项，当前 PR 没有让行为变差，且评论不涉及高风险区域。
- Do not skip when: 代理未征询负责人意见就行动、问题属于中/高严重度的产品行为，或延后会合并进一个新的回归。
- Example signal: "I'll worry about that later" 或 "we'll delete this eventually"。

### 自行撤回或明确误报的规则评论

- Confidence: recurring
- Skip when: 评论正文或 Bugbot 之后的回复明确说该问题已撤回、已合规或是误报，且代理能在本地核实相关规则。
- Do not skip when: 唯一证据只是有人在高风险问题上说 "false positive"，却没有解释。
- Example signal: 一条文件命名规则评论，正文说该文件已经合规。

## 默认先问

即使之前的 PR 驳回过类似问题，也不要自动跳过这些类别：

- 安全、隐私、鉴权、计费、数据保留、训练数据和权限边界相关的发现。
- 高严重度的发现。
- 迁移、schema、幂等、并发和跨系统行为的发现。
- 建议的修复很小、明显能降低风险，又不改变产品意图的评论。

历史数据显示，人类有时会驳回安全/数据流评论。把这些当作负责人的个案判断，而不是全团队通用的跳过规则。

## 近期 babysit 得到的候选经验

在 babysit 期间或之后，如果有看起来对团队有用但还不够成熟的候选经验，追加到这里。当多个 PR 确认了某个模式后，优先把反复出现的候选提升到上面的章节。

### 手工重新实现原生浏览器行为

- Confidence: candidate
- Skip when: 几乎从不跳过。当 diff 用人工等价物替换原生浏览器行为时（原生 sticky → JS 定位的克隆、原生滚动定位 → 转发的 wheel/touch 事件、paint-order 遮挡 → masks/clip-path），Bugbot 针对这些代码提出的逻辑 bug 发现一直站得住。
- Do not skip when: 发现涉及事件转发缺口（wheel deltaMode、touch 平移、边缘处的滚动链、点击 slop）、mask/clip 命中测试分歧，或这类代码里 observer 与 React 的状态时序竞态。默认修复。
- Example signal: "masks do not affect hit-testing"、"overlay blocks wheel scroll"、"ignores deltaMode"、"runs in the IntersectionObserver callback before React applies state"。
- Source: 一个 sticky 遮挡 PR：六轮 Bugbot pass，约十八条发现，条条都修复而非驳回。

### 契约测试漂移的说法验证成本很低——先跑测试

- Confidence: candidate
- Skip when: 绝不跳过验证本身；它只花一条命令。当 PR 带了一个锁定协议或文档措辞的契约测试（对 SKILL.md 跑正则、文档措辞的快照），而 Bugbot 声称 "the test no longer matches the doc"（或反过来）时，先在该 PR 最新提交上跑这个测试，再做分类。红的运行结果以实证确认该说法；绿的结果是用于驳回回复的确凿反证。
- Do not skip when: 不适用——这是一条验证捷径，不是驳回模式。注意，多轮 pass 之后偏于驳回的启发式在这里会失灵：锁定措辞的测试之所以漂移，恰恰是因为早先几轮修复改了那段文字。
- Example signal: "Contract test omits the pre-fix wait"，出现在这样一个 PR 上：早先的修复提交改写了被锁定的段落，而在最新提交上跑测试时，恰好就在被引用的那条断言上失败。
- Source: 一个锁定措辞的 PR，共八轮 Bugbot pass；该说法在第 7 轮 pass 上确实成立，尽管此前每一轮 pass 都已修复并解决。

### 同一 PR 稍后已修复的过期安全审查发现

- Confidence: candidate
- Skip when: 某个代理式安全审查（或类似审查）声称缺少 authz/校验调用，而当前 PR 最新提交明显已经包含了那个确切的关卡（含测试），通常是在审查运行之后的一个加固提交里加的。
- Do not skip when: 被引用的辅助函数对讨论中的主体是空操作、该检查在它所守卫的副作用之后才运行，或对所声称主体的覆盖缺失。
- Example signal: 一条 HIGH "missing authorization check" 发现，而最新提交上那个确切的守卫已经在副作用之前被调用。
- Source: 一个 webhook 端点 PR，其加固提交晚于审查运行。

### 拓宽刻意收窄的错误条件会掩盖真正的错误

- Confidence: candidate
- Skip when: 发现要求把一个窄错误条件（某个具体的 `errno`、错误码或状态类别）放宽成兜底，而这份窄编码着真实的区分。典型形态是以 `ENOENT` 为条件的依赖回退："binary is not installed" 和 "the command ran and failed" 是两种不同情况。对任何非零退出都重试，会让一次正当的失败（未找到、鉴权过期、网络）也去跑回退，然后报告回退的错误，把真正的错误藏起来。
- Do not skip when: 这个窄条件漏掉了同一类别里的情况（另一个表示 "binary unusable" 的 errno，比如 `EACCES`，或另一种传输层失败）、未处理的路径会丢数据或留下部分状态，或者重试是幂等的，且原始错误仍被暴露出来。
- Example signal: "only retries when X fails with ENOENT … never tries the fallback even when a working Y exists"，指向的代码里，回退是为缺失的依赖准备的，而不是为失败的操作。
- Source: 一个 CLI 改名 PR，其回退是为缺失的二进制准备的，而不是为失败的命令。

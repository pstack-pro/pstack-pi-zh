---
name: setup-pstack
description: Configure which models pstack uses per role and at what reasoning budget, for this project only. Detects the models pi can run with their prices, proposes a cost-aware preset, and writes .pi/pstack-models.md, which the pstack extension injects into every prompt. Use for /skill:setup-pstack, "configure pstack models", "pstack budget", or changing pstack's model choices.
---

# Setup pstack（pi）

在项目根目录写入 `.pi/pstack-models.md`。pstack 扩展每次提问都会读它，并注入 system prompt，所以下一条消息就生效。它只对本项目生效，不影响其他 pi 项目。

向用户提问时，**必须**用下文给出的中文题干与选项文案；不要自己编英文问题。`AskQuestion` 的选项值（`unlimited` / `large` / `medium` / `small`、模型 id、`inherit-parent`）保持英文，文案可以带中文说明。

## 预设

按顺序检查，第一个「所列模型都已检测到且通过冒烟测试」的预设作为提案。预设只是起点，不是锁定：用户可在第 3 步 (d) 改任意角色。用户请求里已经点名模型或规则时，以用户为准，覆盖预设。

### mimo-deepseek

需要 `xiaomi/mimo-v2.6-pro`、`xiaomi/mimo-v2.6-flash`、`deepseek/deepseek-flash`、`deepseek/deepseek-v4-pro`。判断交给更便宜的强模型，写代码用 DeepSeek V4.1 Flash，贵的 Pro 只给最难的任务，评审组混用两家。

```
feature, refactoring: deepseek/deepseek-flash
bug-fix: deepseek/deepseek-flash
perf-issue: deepseek/deepseek-flash
hillclimb: deepseek/deepseek-flash
judgment and prose: xiaomi/mimo-v2.6-pro
hardest tasks: deepseek/deepseek-v4-pro
how explorer: deepseek/deepseek-flash
how explainer: xiaomi/mimo-v2.6-pro
why investigators: deepseek/deepseek-flash
why synthesizer: xiaomi/mimo-v2.6-pro
reflect tooling: deepseek/deepseek-flash
reflect judgment, divergent, synthesizer: xiaomi/mimo-v2.6-pro
arena runners: xiaomi/mimo-v2.6-pro, deepseek/deepseek-flash, xiaomi/mimo-v2.6-flash
arena cross-judge pool: xiaomi/mimo-v2.6-pro, deepseek/deepseek-flash, xiaomi/mimo-v2.6-flash
swarm workers: deepseek/deepseek-flash
architect runners: xiaomi/mimo-v2.6-pro, deepseek/deepseek-flash, xiaomi/mimo-v2.6-flash
interrogate reviewers: xiaomi/mimo-v2.6-pro, deepseek/deepseek-flash, xiaomi/mimo-v2.6-flash
```

若预设只到一部分（例如 `deepseek-v4-pro` 失败），保留预设，只把缺的模型对应的角色按下方成本规则重映射，并说明哪些角色改了。

没有任何匹配的预设时，按第 3 步 (b) 从零映射。

## 成本规则

价格来自 `PstackModels` 工具，单位是美元 / 百万 token。先按输出价格排序——pstack 子代理会写长报告——再按 cache-read 价格，因为它们会反复读同一批 skill 文件。

- 同一档位内，选实力相近里最便宜的。旗舰模型贵好几倍、只强一点点时，不要当默认。
- 除非用户要求，否则不要选溢价加速款（`-ultraspeed`、`-fast` 加价、`:batch`、priority 档）。
- 映射里最贵的模型只给 `hardest tasks`。若它落到别处，换成次便宜的，并说明。
- 评审组每个条目起一个子代理，费用会乘开。宁可挑不同家族的中价模型，不要三个旗舰。

## 步骤

### 1. 检测可用模型

调用 `PstackModels`。它列出 pi 当前有凭据的全部模型，附带输入 / 输出 / cache-read 价格，以及各模型支持的 thinking 档位。列表里的每个 `provider/id` 都算已检测。别名 `inherit-parent` 和 `auto` 始终有效，都表示该角色跑在父会话模型上。没在列表里见过的模型一律不要写。

### 2. 读当前配置

若已有 `.pi/pstack-models.md`，读它，把 `# budget` 行和各角色取值当作当前选择。否则从第一个匹配的预设起步，或用第 5 步的默认值。角色不在第 5 步列表里的行是退役角色，丢掉。

### 3. 预算、映射、确认

**(a) 用 `AskQuestion` 问预算。** 题干必须用下面的中文（按情况填括号里的内容），四个选项的标签必须原样用下面四行。用户请求里已经点名预算时，直接用，不要再问。

题干模板：

- 文件里已有预算：`pstack 推理预算：为 pstack 子代理选一个推理预算（当前：{budget}；预设：{preset 或「无」}）`
- 文件里还没有预算：`pstack 推理预算：为 pstack 子代理选一个推理预算（尚未记录预算；预设：{preset 或「无」}）`

选项（标签原样；记录到文件时只取冒号前的英文值 `unlimited` / `large` / `medium` / `small`）：

- `unlimited — 保持 max（不限）`
- `large — xhigh 推理`
- `medium — high 推理`
- `small — medium 推理`
- 若工具支持自由输入，可再加一项 `Other — 其他（请说明）`；没有则不要编。

**(b) 没有匹配预设时，把角色映射到已检测模型。** 第 5 步默认值用三个槽位。`<claude>` 要一个擅长判断和写作的强模型。`<grok>` 要一个又快又够用的写代码模型。`<gpt>` 要一个与 `<claude>` 不同家族的强模型，好让评审组有第二意见。任意已检测家族都行：`anthropic/claude-*`、`openai/gpt-*`、`xai/grok-*`、`xiaomi/mimo-*`、`deepseek/*` 等。每次挑选都套用成本规则。同家族优先最新版。某个槽位没有合适模型时，标成「需要选择」，优先用 `inherit-parent`，不要凭空捏造。

**(b2) 对挑中的每个不同模型做冒烟测试。** 列表里有模型只说明凭据在，不说明能用。先每个 provider 测一个；若鉴权失败（401/403），整家 provider 都丢掉，不必再测同家其他模型。然后把剩下的不同模型放进一次 bash、并行测完，好让设置快点结束：

```bash
for m in <provider/id> <provider/id> ...; do
  ( out=$(pi --model "$m" --no-session -p "Reply with: ok" < /dev/null 2>&1 | tail -1); echo "$m => $out" ) &
done; wait
```

`< /dev/null` 不能省，否则 pi 会卡在 stdin。只有超时或网络错误才重试一次。调用报错的模型丢掉，告诉用户哪些失败、为什么，并按成本规则重映射它们的角色。

**(c) 套上预算：** 在每个真实模型（含评审组条目）后加 pi 的 thinking 后缀。目标档位：`unlimited` → `max`，`large` → `xhigh`，`medium` → `high`，`small` → `medium`。模型的 thinking 档位（来自 `PstackModels`）包含目标就用目标，否则用目标以下最高的，再否则用目标以上最低的。thinking 为 `none` 的模型不加后缀。别名不加后缀。

**(d) 展示角色并确认。** 用表格列出每个角色、其模型、该模型的输出价格，再加一行成本说明：哪个模型最贵、哪些角色在用它。标出需要选择的角色，并列出第 2 步丢掉的行。用 `AskQuestion` 问是否原样接受，或要改哪些角色；选项为已检测模型加上 `inherit-parent`。题干用：`确认 pstack 模型映射：是否按上表写入 .pi/pstack-models.md？`；选项至少包括 `接受`、`修改部分角色`。评审组角色（arena runners、architect runners、interrogate reviewers）的值是列表，每个条目起一个子代理，所以列表长度就是数量。若只检测到一个家族，直说：评审组仍会跑，但跨模型交叉检查会弱一些。`arena cross-judge pool` 也是列表；arena 会尽量选一个与父模型不同家族的值。`swarm workers` 是每个 worker 的默认模型。

### 4. 校验

写入的每个真实模型都必须在检测列表里，且通过第 3 步 (b2) 冒烟测试。任一检查失败就停下，再问一遍。

### 5. 写文件

写入 `.pi/pstack-models.md`（没有 `.pi/` 就建），整文件覆盖，保证重跑幂等。一行一个角色，用下面的角色标签。若用了预设，在 `# preset:` 行记下预设名。没有匹配预设时，按槽位填默认：

```
# pstack model configuration for this project. One line per role. Delete a line to fall back to the skill default.
# Values are pi model patterns (provider/id:thinking). `inherit-parent` runs the role on the parent chat model.
# budget: unlimited (max)
# preset: none
feature, refactoring: <grok>
bug-fix: <grok>
perf-issue: <grok>
hillclimb: <grok>
judgment and prose: <claude>
hardest tasks: <claude>
how explorer: <grok>
how explainer: <claude>
why investigators: <grok>
why synthesizer: <claude>
reflect tooling: <gpt>
reflect judgment, divergent, synthesizer: <claude>
arena runners: <claude>, <gpt>, <grok>
arena cross-judge pool: <claude>, <gpt>, <grok>
swarm workers: <grok>
architect runners: <claude>, <gpt>, <grok>
interrogate reviewers: <claude>, <gpt>, <grok>
```

文件内容里的英文注释与角色标签保持英文（脚本与其他 skill 按这些标签解析）。**绝不**提交该文件，也**绝不**跑会改历史的 git 命令。问一次是否把 `.pi/pstack-models.md` 加进 `.gitignore`（它会写出用户的 provider）。题干：`要把 .pi/pstack-models.md 加进 .gitignore 吗？（文件里会写明你的模型 provider）`；选项：`是`、`否`。没有交互用户时，不动 `.gitignore`，在回复里提一句即可。

### 6. 确认

告诉用户文件已写入，从下一条消息起生效。再跑一次本 skill 会更新它。删掉文件则回到 skill 默认值（pi 跑不了那些默认模型时，会退回父模型）。

### 7. 可选：提供验证 skill

检查项目有没有驱动真应用做验证的办法（`verify-*` skill，或现成 harness）。若没有，问一次，题干：`要不要生成一份项目本地的验证 skill？这样代理可以像用户一样操作应用，证明改动真的有效。可用 /skill:create-verification-skill 生成。`；选项：`好，生成`、`不用`。选「好」就跑该 skill；选「不用」就继续，不要再催。

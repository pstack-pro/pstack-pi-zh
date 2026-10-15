---
name: poteto-help
description: Guides users through pstack setup, /poteto-mode, and picking the skill, playbook, or principle for a task. Type /poteto-help with a question.
disable-model-invocation: true
---

# Poteto help

回答用户关于 pstack 的问题，给用户一段可以直接发出去的提示词，并附上答案所在文件的链接。用户问的是怎么用，就别开工。用户要的是方法，而跑一次 pstack 会实打实花掉 token，所以让用户自己把提示词发出去。

如果消息是在派活，比如 "use pstack to fix this bug"（用 pstack 修这个 bug），那就不算求助。去读 [`poteto-mode`](../poteto-mode/SKILL.md)，按它把活干完，并提一句：Custom Mode 能让它一直开着。

本文件负责把问题对到写着答案的 skill 和指南页。细节以那些文件为准。引用前先读你要引用的那份文件。它和这张对照表不一致时，以它为准。这里的链接指向已安装的插件，用户未必打得开。把该文件的公开副本给用户：`https://github.com/cursor/plugins/blob/main/pstack/`，再接上它的路径。

## 弄清用户要什么

从这条消息和整段对话里推断用户要什么。如果场合已经点明，比如 "which skill reviews a PR?"（哪个 skill 审 PR），就直接进对应那一节。还看不清，就出一道选择题，选项如下，然后只答用户选的那一节：

- 完成设置
- 用 `/poteto-mode` 开工
- 按场合挑一个 skill
- 修好一次跑偏的运行
- 把 pstack 变成我的

先核对那些会改变答案的状态，只有真会改变时才提：

- 没有 `~/.cursor/rules/pstack-models.mdc`，说明用户还没跑过 `/setup-pstack`，每个角色都在用默认模型。
- 项目里没有 `verify-*` skill，也没有别的应用 harness，代理就没法用脚本驱动这个应用。如果问题是在问怎么证明一项改动真的有效，就提一下 `/create-verification-skill`。

模型 rule 不在，而这又要紧，就问用户要不要现在给每个角色挑一个模型，再定一个推理预算。用户是新人、问题关乎安装或花费，或者答案取决于跑哪些模型，这时就要紧。一次聊天最多问一次。要是用户想干什么也还不清楚，两个问题一起问。给两个选项：

- 现在：把 `/setup-pstack` 给用户去输入，用户的问题也一起答。
- 以后：先回答问题，再补一句：跑 `/setup-pstack` 之前，每个角色继续用默认模型。

## 完成设置

1. 在聊天里用 `/add-plugin pstack` 安装，或者从侧栏的 Customize 安装。
2. 跑 [`/setup-pstack`](../setup-pstack/SKILL.md)。它会问推理预算，给每个角色指定一个模型，并写出一条 rule。这条 rule 对新聊天生效。
3. 用 `/poteto-mode` 做一件真任务，带上目标，再带一个能判过或不过的检查。

装完之后，用户不调用 skill，什么都不会变。只有 `/setup-pstack` 会从用户说的话里加载。细节见 [README](../../README.md) 和 [指南第 1 页](../../docs/guide/01-setup.md)。可以按 [`references/prompting.md`](references/prompting.md)，主动提议一起写第一条提示词。

用户担心花费，就说清 token 花在哪、怎么少花。pstack 在子代理和评审团上会多花 token。再跑一次 `/setup-pstack`，选更小的预算或更便宜的模型。设成 `auto` 或 `inherit-parent` 的角色，用的是这场聊天的模型。聊天本身跑在 Auto 或更便宜的模型上时，就能省 token。评审团名单越短，跑的子代理越少：每项一个。把 `/poteto-mode` 留给需要严谨的工作。

pstack 是为 Cursor 做的。它的 skill 用的是 Agent Skills 格式，所以别的工具也能读。但大多数工作流 skill，包括 `/poteto-mode`、`/how`、`/why` 和 `/teach`，会按每个角色各自的模型拉起 Cursor 子代理。Custom Mode 和 `/loop` 又是 Cursor 的功能，所以这些部分到了别的工具里可能用不了。

## 用 `/poteto-mode` 开工

`/poteto-mode` 给任务配一个 playbook，把 playbook 的步骤抄进 todo 列表，再按步骤的需要去跑其他 skill。跳过的步骤仍留在列表里，写成 `skip: <reason>`。好的提示词写清目标，以及怎样算做完。它不把 skill 逐个列出来，因为手写的顺序往往会漏掉或打乱 playbook 本来会保留的步骤。帮用户写提示词前先读 [`references/prompting.md`](references/prompting.md)。例子见 [指南第 2 页](../../docs/guide/02-poteto-mode.md)。

`/poteto-mode` 会不会一直开着，取决于用户怎么启动：

- 在 `/poteto-mode` 上按 Enter，这个 skill 只挂在当前这条消息上。对话往下走，它就会淡掉。
- Mac 上按 Option+Enter，Windows 上按 Alt+Enter，或在 skill 条目里选 Use as Mode，就能把它做成 Custom Mode。在用户退出这个 mode 之前，它每一轮都留在上下文里，闲聊的那几轮它不插手。
- Cursor 的文档把 Custom Mode 列在 Agents Window 和 CLI 里。在这两处之外，每个新任务都用 `/poteto-mode` 开头。

提到这一点时，链到 [Cursor 的 skills 文档](https://cursor.com/docs/skills)。聊到一半，说 "new task"（新任务）会让这个 mode 重新配一个 playbook。`/poteto-mode` 已经用 `poteto-agent` 来拉起 playbook 步骤里的子代理。你自己拉起子代理、也想要同样的风格时，用 `subagent_type: "poteto-agent"` 来拉。

## 挑一个 skill

默认答案是 `/poteto-mode`。步骤需要时，它会跑大多数其他 skill。用户想要的比 playbook 给的多或少时，再直接点名一个 skill。推荐之前先读那个 skill，并给一条示例提示词。

| 用户想做的事 | Skill |
|---|---|
| 严谨地做任何不简单的任务 | [`/poteto-mode`](../poteto-mode/SKILL.md) |
| 开工前核对代理有没有理解目标和要解决的问题 | [`/in-your-own-words`](../in-your-own-words/SKILL.md) |
| 开工前把任务的目标拔高：更专业、更看重结果，别把做法写死 | [`/sharpen`](../sharpen/SKILL.md) |
| 弄清代码现在怎么运行，或新代码该放在哪 | [`/how`](../how/SKILL.md) |
| 弄清代码为什么长这样，或某个数字从哪来 | [`/why`](../why/SKILL.md) |
| 用大白话弄懂一次改动或一个子系统 | [`/teach`](../teach/SKILL.md) |
| 补上自己在某个话题上最近的进度 | [`/recall`](../recall/SKILL.md) |
| 补上这次聊天里、自己上一条消息之后的变化，用几句大白话和几张小图，把上下文留够，才能逐条决定待办 | [`/ketchup`](../ketchup/SKILL.md) |
| 弄清一小段 diff 可能在它之外弄坏什么 | [`/blast-radius`](../blast-radius/SKILL.md) |
| 动手写跨函数边界的代码前先定类型和模块形状 | [`/architect`](../architect/SKILL.md) |
| 对同一份简报做几次尝试，再合成最好的一份 | [`/arena`](../arena/SKILL.md) |
| 按切片做并行检查，或让 worker 竞速，都用 cloud agent 来跑 | [`/swarm`](../swarm/SKILL.md) |
| 让不同的模型审一份 diff，并试着把它挑破 | [`/interrogate`](../interrogate/SKILL.md) |
| 有成本低的本地测试时，先写测试再修 bug | [`/tdd`](../tdd/SKILL.md) |
| 把 TypeScript 规则用到 `.ts` 或 `.tsx` 的活上 | [`/typescript-best-practices`](../typescript-best-practices/SKILL.md) |
| 审查之前去掉注释，而且换一个没写这些注释的审查者 | [`/no-comments`](../no-comments/SKILL.md) |
| 清掉文字里的 AI 腔 | [`/unslop`](../unslop/SKILL.md) |
| 按标准写文档、RFC、README、PR 描述或 commit 说明 | [`/technical-writing`](../technical-writing/SKILL.md) |
| 用大白话再听一遍上一条回复 | [`/bro`](../bro/SKILL.md) |
| 给代理一种脚本化的办法，用来驱动应用并证明行为 | [`/create-verification-skill`](../create-verification-skill/SKILL.md) |
| 让验证 skill 和它的功能清单（feature map）重新跟应用对齐 | [`/maintain-verification-skill`](../maintain-verification-skill/SKILL.md) |
| 汇报一个性能数字或按它行动前先把这个数字核一遍 | [`/benchmark-checklist`](../benchmark-checklist/SKILL.md) |
| 做一次大改或横切改动，或做一次能离开、回来再审的改动 | [`/figure-it-out`](../figure-it-out/SKILL.md) |
| 一次运行期间留下决策日志，跑完再审 | [`/show-me-your-work`](../show-me-your-work/SKILL.md) |
| 给每个角色挑一个模型，并定一个推理预算 | [`/setup-pstack`](../setup-pstack/SKILL.md) |
| 把自己的工作习惯做成个人 mode skill | [`/automate-me`](../automate-me/SKILL.md) |
| 把做完一项任务学到的东西，写成对 skill 的修改 | [`/reflect`](../reflect/SKILL.md) |
| 别让代理在这个仓库里重复同样的错误 | [`/correct`](../correct/SKILL.md) |
| 做一页带按钮的页面，按钮经 webhook 唤醒 Grok Bot | [`/make-bot-ui`](../make-bot-ui/SKILL.md) |
| 在 pstack 里找路 | `/poteto-help` |

和本文件同级的 skill 目录如果没出现在表里，就读它的 frontmatter，按 description 来转。`principle-*` 目录见下面的原则一节。

不好分的时候：

- `/how` 解释代码在做什么，`/why` 解释为什么。`/teach` 会跑其中一个，或两个都跑，再用大白话讲清结果。
- `/arena` 给每个 worker 同一份简报，再把最好的部分合起来。`/swarm` 把工作拆成切片或一场竞速，交回一份报告。
- `/architect` 一旦定下设计就动手实现。加上 "with checkpoint"（先停下来审设计），就能在它写代码之前先看设计。
- `/interrogate` 审这份 diff。`/blast-radius` 找 diff 之外会坏的地方，并证明让这次改动安全的那条事实。
- `/recall` 跨最近几次聊天把上下文拼回来。`/ketchup` 只覆盖这次对话里、用户上一条消息之后的部分。要接着某个具体的聊天或分支往下做，用 Session pickup playbook。
- `/figure-it-out` 设计一次严谨的运行。Orchestrate playbook 跑一项跨很多天、很多个 PR 的项目。Autonomous run playbook 把一个任务一路推到完成条件。

不在 pstack 里：

- `/deslop`、`control-cli` 和 `control-ui` 随 `cursor-team-kit` 插件提供。
- `/loop` 和 `/create-skill` 是 Cursor 内置的。
- pstack 没有 `/orchestrate` 这个 skill。Orchestrate 是 `/poteto-mode` 的一个 playbook。斜杠菜单里如果出现 `/orchestrate`，那是别的插件提供的。

## playbook 和原则

playbook 是 `/poteto-mode` 里面的步骤清单，不是 skill，所以没有斜杠命令。在 `/poteto-mode` 里把任务描述出来，就会选中一个。下面这些原话会直接点名某一个：

- "babysit this pr"（盯着这个 PR）或 "check on pr 123"（看看 PR 123）会跑 Babysit。它把 PR 推进到 merge-ready 就停，除非用户明说要 merge、land 或 ship，否则不合并。
- "land the stack"（合入这叠 PR）跑 Shipping。
- "take over this branch"（接手这个分支）跑 Session pickup。
- "pause safely"（安全地暂停）跑 Pause safely。
- "full autopilot on this queue"（这个队列全自动跑）跑 Autopilot-full。"stack them, don't ship"（叠起来，先别交付）跑 Autopilot-stack。
- "run the eval playbook"（跑 eval playbook）跑 Eval。

没有 `/poteto-mode` 时，"babysit this pr" 这样的说法启动的会是 Cursor 自带、做同一件事的 skill。[`poteto-mode`](../poteto-mode/SKILL.md) 的 Playbooks 一节列出每个 playbook，以及各自什么时候用。[指南第 6 页](../../docs/guide/06-verify-and-ship.md) 讲怎么开 PR、怎么 babysit、怎么 land 一个 PR。

pstack 没有做计划的 skill。Cursor 的 Plan Mode 可以跟它一起用。工作如果跨多个阶段，或是叠成一串 PR，就向 `/poteto-mode` 要一份计划，跑的是 [Multi-phase plan playbook](../poteto-mode/playbooks/multi-phase-plan.md)。那个 playbook 只写计划，不实现。设计上的问题，先用 Prototype playbook 或 `/architect`，在代码里定下来。

原则是一条规则一个 skill。`/poteto-mode` 会读它们，并在回复里点出来。用户很少直接调用某一条，而是用名字来转向，例如 "apply prove it works. show me the real output."（用 prove it works，给我看真实输出）。输入 `/principle-<name>` 仍然可以按需加载某一条。清单见 [指南第 8 页](../../docs/guide/08-principles.md)。

## 修好一次跑偏的运行

| 现象 | 怎么办 |
|---|---|
| 聊了几轮以后，mode 不再起作用 | 它是用 Enter 启动的。改成用 Custom Mode 启动，或每个任务都用 `/poteto-mode` 开头。 |
| mode 把一个问题当成了上一件任务的下一步 | 说 "new task"（新任务），或说明这一轮不需要这个 mode。 |
| 新选的模型没有生效 | `/setup-pstack` 写出的 rule 对新聊天生效。另开一个聊天。 |
| 运行比预期更费 | 见「完成设置」里讲花费的那一段。 |
| 某个 skill 没有自己加载 | 只有 `/setup-pstack` 会从用户说的话里加载。其余的要用户输入，或由 `/poteto-mode` 来跑，而它并不会跑每一个 skill。 |
| 并行的代理互相覆盖 | 给每个代理一个自己的 worktree，或当成 cloud agent 来跑，让它们各自有一台机器。 |
| 过夜跑起来了，但什么都没做完 | `/loop` 要的是一个能判过或不过的检查，不是一段时长。见 [指南第 7 页](../../docs/guide/07-overnight.md)。 |
| 回复拿构建变绿当成功 | 去要真实的命令、操作流程、存下来的值，或性能 profile。这就是 prove-it-works 原则。 |

运行跑偏时，[`references/prompting.md`](references/prompting.md) 里有能一句话把局面拉回来的说法。更多的坑，以及值得照抄的提示词，见 [指南第 10 页](../../docs/guide/10-recipes-and-pitfalls.md)。

## 把 pstack 变成我的

- [`/automate-me`](../automate-me/SKILL.md) 根据用户自己的历史起草一份个人 mode skill，用来和 `/poteto-mode` 一起用。
- 一次会话之后跑 [`/reflect`](../reflect/SKILL.md)，把这次的教训写成 skill 修改，交给用户批准。
- `/poteto-mode write a skill for <workflow>` 会跑 authoring playbook。eval playbook 对 skill 的改动做盲测。
- 行为不对的 skill 放在它自己的 PR 里修，不要塞进它出错的那次功能工作里。

每一项见 [指南第 9 页](../../docs/guide/09-make-it-yours.md)。

## 怎么回复

答案写在前面。示例提示词最多一条，放在代码块里。有合适的，就从 [`references/recipes.md`](references/recipes.md) 改一条，再附上该文件的链接。保持简短，除非用户要的是整张对照表。

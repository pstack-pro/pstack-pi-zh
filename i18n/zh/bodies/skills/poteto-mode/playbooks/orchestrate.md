### 编排

**项目归你，代码绝不归你。你写简报、排空队列、让 frontier（最底下那个还没合并的 PR）保持全绿、做决定。** 适用场景是把整个项目交给一个常驻的协调者会话：要跑很多天，PR 叠成很多层 stack，子代理从几十到几百，人一天来看两次，而不是每五分钟盯一次。把单个任务推进到一个可判定的条件，那是 Autonomous run。一次规模大、需要专门设计工作流的运行，那是 figure-it-out。工作长到任何一个 agent 都做不完时，走这里。一个 agent 在本次会话的预算里就能做完的，不算这里说的项目。

流程的轻重**必须**跟项目规模相称。单元便宜、又几乎一样时，按各节的说法把流程收掉。

其余做法都靠这三条。

- 完成通知是进队列的事件，不是中断。
- 每次派出、每次恢复，都原样带上常设指令。
- 简报就是产品。简报含糊，会安静地失败，因为 worker 没法问你。

#### 角色与运行位置

- **协调者（就是这个会话）。** 在本地跑。它框定任务、写简报、排空收件箱、负责给人的报告、做判断。它不写代码，也不改代码。有冲突的合并、整条链的 rebase、代码改动，一律是派出去的任务。本地 git 便宜的仓库上，机械地合入一个已验证的单元（快进，或干净地 cherry-pick worker 的提交，然后推送）是记账，协调者可以自己做。把做完的工作排在闲着的 stack 管理者后面等，到了截止日期就什么也落不了地。整条循环都由 agent 跑完。派出、恢复、排空，只用 Task 工具。每个子代理的推理强度，以及用 fast 还是标准速度，按这项工作、照 Subagents 一节来选。排空点上的状态读写走 `scripts/orch/orch.ts`，一条命令进去，一行结果出来。派出、等待、唤醒，这个 CLI **一律不做**。
- **子协调者。** 始终在本地，并且一直留着，每条工作线一个，而且只在一个协调者排空不过来时才设。协调者自己排得过来的工作线，不要中间层。每多嵌一层，都要把整段上手说明再讲一遍。阻塞式的子协调者会把子代理藏起来，父代理干等。它管本工作线的单元和看板，给自己的 worker 写简报，自己派 worker 和验证者（嵌套最多到第 3 层，嵌套时的派出也带完整的 Task 参数，包括 `environment`）。每一波的边界上汇总上报。**绝不**把子代理的报告原样往上转。同时在跑的子代理，以一次排空能处理的量为上限，大约十个，按滚动窗口补。**绝不**分成阻塞的批次，因为每一批都要等最慢的那个。
- **worker / 验证者。** 一律 `environment: "cloud"`，除非任务非得用这台机器：用 `cursor-team-kit` 的 `control-ui` 或 `control-cli` 做运行时验证；读 `agent-transcripts/` 下的本地对话记录；模拟器和本地 IDE 状态；只有这台机器上才有的认证。cloud agent 读不到本地存储目录，所以简报里要写上它们需要的内容，或者指向仓库路径。少派 worker，每个覆盖更宽。每个 worktree 或分支只有一个写者（principle-separate-before-serializing-shared-state）。一个单元的验证者，要和它的 worker 用不同系列的模型。

层级停在协调者、工作线、worker。工作线怎么切，按项目来定（构建、合入、验证是常见切法，不是规定形状）。写死的 swarm（蜂群）树试过，太僵，搁下了。

#### 存储目录布局

在当前 agent 的存储目录（路径在系统提示词里）创建 `orchestrate/<project-slug>/`。每个文件恰好一个写者。写者发布事实，读者在读的时候自己汇总。记账用 `bun scripts/orch/orch.ts`，下文写成 `orch`。它那份规范的纯 TSV 和 JSON，不靠这个 CLI 也能读。

- `preferences.md` 是常设指令登记表。编号的行，一行一条约束（模型策略、stack 的形状和数量、验证门槛、禁区路径、上报策略）。每次派出、每次恢复都原样贴上。指令会在一次次恢复里丢掉，丢掉一条，人就要多回一轮。发现自己在重复一条指令，先追加这一行，再动手（principle-encode-lessons-in-structure）。
- `overview.md` 是长期的 PR 和 issue 库。只追加。**绝不**因为一件事就把整篇重写。
- `units.tsv` 每个单元一行：id、track、state、branch、PR、head SHA、brief 路径。就地改这些行。
- `frontier.json` 是算出来的合并 frontier，规则见「Stack 安全」。
- `ledger.tsv` 是验证账本，规则见「验证」。
- `inbox/` 放完成通知的指针。`gates.md` 搁置要人来定的关卡（问题、选项、没人回答时的默认）。
- `decisions.tsv` 是 show-me-your-work skill 的决策记录。
- `status.md` 每次排空时从 `units.tsv` 和 `ledger.tsv` 推导，不手工维护。用表重新生成，不要把事件经过写进去。

#### 简报

你给 agent 的提示词是你唯一的产品。一份草率的简报会在整棵树上叠成 slop（AI 腔、套话）。每次派出都带上全部字段。某个字段填不出来，就是这个单元还没划定范围。

```
GOAL         one sentence, the outcome, executable by a stranger with no chat access
SCOPE        paths this unit may write; paths it may not; its exclusive worktree or branch
CONTEXT      pointers to files and PRs; upstream reports pasted in full when this unit
             depends on them, because workers cannot see siblings
ACCEPTANCE   checkable criteria, one per line
VERIFY       exact commands or the control-skill path, plus known gotchas
TIMEBOX      rough cap on runtime; on expiry, return partial findings and stop rather than run on
FORBIDDEN    no PR retargets or merges, no rebase, no force-push, no fixes outside scope,
             plus unit-specific bans
REPORT       status, branch, head SHA, PRs, verdict, what you actually ran, deviations,
             suggested follow-ups
STANDING     <preferences.md pasted verbatim>
```

简报的长短要配得上这个单元。只跑一条命令的单元，把模板收成一段，这段仍要写明目标、范围、验证命令和报告长什么样。两行改动外面套一个 4KB 的架子，写它、照它做，都比改动本身贵。本地派出可以按存储路径引用常设指令文件。原样粘贴是给云端派出和每一次恢复用的。

子协调者的简报还要加上：工作线边界和单元列表；派出预算，含云端默认和本地例外；排空规程；汇总格式（每个子代理：名称、状态、PR、head SHA、verdict、一行说明，再加工作线状态和 frontier 的变化）。

依赖是在交上下文，不只是排先后。上游上下文没写明，worker 就只能猜。缺字段就拒绝派出。每个子协调者、每一波，抽查一份 worker 简报。抽查和这一波一起做，**绝不**先当成这一波前面的关卡。简报不合格，就停下这条工作线，去改子协调者的指令，而不只是改那个 worker。跑到后面，简报会变差。**绝不**靠一串恢复把简报传下去。范围归拢好，重新派一个新 agent。

#### 步骤

1. **框定。** 把完成条件写成数得出来的东西（「126 个单元全部合并，每个在账本里验证为 `unit-test-verified` 或更好」）。把范围量化：单元数、大致工作量、预计几个 stack、墙钟预算。如果一个 agent 在这个预算里就能做完，就停在这里，改走 Autonomous run。要不要收掉这套流程，**不得**取决于另一份文档在不在场。收掉的意思是：就在这次会话里直接做，需要时派普通 worker，验证当场做，做完一个合一个，下面的存储目录、登记表、试点都不用。按预算安排合入。预算用到大约 70% 时，停止派出，把已经验证的合进去。工作线按项目来命名。拆分有争议，或者做了就回不了头的决定，先过 arena skill，再做试点。框定只讲一次。能撤回的准备工作不用等，直接做。
2. **装上运行时。** 跑 `orch init`。按 show-me-your-work skill 开决策记录，任何派出之前写好常设指令，用 `orch frontier set --repo <repo-dir>` 按现有 PR 生成 `frontier.json`。托管平台是 Origin 时加上 `--forge origin`。
3. **试点。** 拿一个单元走完全程：简报、worker、验证、进 stack、账本一行、合并。试点是为了在只花一个 agent、而不是五十个的时候，证伪简报模板、验证做法和单元大小。扇出之前，先按试点的证据改这套约定。试点的规模跟单元走。单元便宜、又几乎一样时，第一个单元就是试点：当普通单元跑，验证命令当场执行，它一合入就开始扇出。单独的试点流水线（单独的验证者 agent、审计关卡）只给贵的、或没见过的单元形态。克隆单元不要用，串行试点没有东西可证伪。
4. **放大。** 按滚动窗口派 worker，直到在跑的数量到顶，有子代理做完就补上。不要用阻塞式的批次，那样每一批都在等最慢的那个。只有过了「角色与运行位置」里的门槛，也就是一个协调者排空不过来，才派各工作线的子协调者。每次排空之后，重算哪些工作可以开始。把上游报告写进下游简报。同级之间不直接说话，只往上报。简报抽查和它抽的那一波同时做，不合格时停的是下一次补充，不是当前这一波。
5. **排空。** 每个排空点都按下面的队列规矩做。
6. **合入。** 合入一直在进行，**绝不**留到最后才做。集成从第一个验证通过的单元开始，和后面几波并行。git 很重的仓库上，stack 管理者从第一波起就是常设角色，单元验证一个就集成一个。本地 git 便宜的仓库上，协调者按「角色与运行位置」自己合入已验证的单元。先让 frontier 保持全绿，再做 stack 上层的事。以「Stack 安全」为准。只有合并发生，或者有人报了新的 head SHA，才推进 `frontier.json`。
7. **收尾。** 把最后的收件箱排空。每个派出过的 agent 都对账到一个终态行（done、abandoned、zombie-reconciled，即完成、放弃、僵尸已对账）。在真实产物上核对完成条件。每个已合入的 PR，当前 head SHA 上都要有 verdict。按 show-me-your-work 审计决策记录，包括其中的跨模型评审。反复出现的纠正写进 `preferences.md` 或简报模板。存储目录留着。它就是事后复盘。

#### 队列与排空

- 收到完成通知，跑 `orch inbox push <agent> <unit> <status> [--report PATH]`，然后回到手头的事。**绝不**当场深审。需要评审的完成通知，改成一个验证者单元。**绝不**在排空里审 diff。
- 四个点成批排空：一段关键工作结束时、一次工作线汇总时、frontier 观察者醒来时（用 loop skill 设好它，再留一个间隔很长的心跳兜底）、给人写报告之前。每一批先跑 `orch inbox drain`。排空过程中新到的，等下一批。
- 先做完的关键段：写简报、一次 stack 操作、一个冲突决定、写一条关卡、更新账本或 frontier。
- 每次排空给每个指针分类（landed、needs-verify、failed、zombie、noise，即已合入、待验证、失败、僵尸、噪声），用 `orch unit add`、`orch unit set` 和 `orch ledger record` 写下结果，跑 `orch status`，然后在一条消息里派出下一波。
- 工作线汇总时，每个派出过的子代理都要有着落：到了、重新派了，或者范围已经明确交出去了。悄悄重做那个没回来的子代理的活，会同时藏起两件事：白花的成本，以及它的结果本来要补上的覆盖缺口。
- 排空这一轮，回复以 `orch status` 的三行结尾：各状态的数量、变了什么、还开着哪些关卡。细节在 `status.md`。完整回复只在检查点和收尾时要。

#### Stack 安全

- frontier 是算出来的对象，**绝不**靠叙述。每次合并、每次 stack 变动之后，重算 `frontier.json`：有序的 PR 列表、分支名、head SHA、一个代次编号、最底下那个还没合并的 PR。这条命令从检出目录的当前分支出发，沿着 PR 的 base 链走，所以链的顺序和 PR 状态来自托管平台。默认用 `gh`。项目把托管平台定成 Origin 时，传 `--forge origin`。head SHA 来自本地分支 ref，所以要在 stack 管理者的那份克隆上解析。没有 PR 的分支直接报错，不去猜。
- 每个 stack 恰好一个 stack 管理者可以改拓扑（整链 rebase、force-push、改 base、合并），在这个 stack 里串行做。谁担任这个角色，写进常设指令。整链 rebase 在云端跑。这种规模的 rebase 放在本地，会把笔记本拖垮。
- worker **绝不** rebase，也**绝不**改 PR 的目标或合并 PR。看护者按 `playbooks/babysit.md` 做，每个 stack 一个，范围钉在一个不变的 frontier 代次上。有冲突就报告给 stack 管理者，自己不 rebase。
- 关 PR、改 PR 的目标分支，只走 stack 管理者。关掉一个 base PR，它上面的每条链都变成孤儿。合并和动 stack 结构也是单元，跟别的单元一样要有简报。
- 留一个事后观察者，盯已合并的 PR：有没有回滚、合并后 CI 有没有变红、后续是不是没人接手。

#### 验证

验证做到和单元相称。VERIFY 只是一条便宜命令时，worker 自己跑，报输出，协调者抽查回执。专门的验证者 agent（和 worker 不同的模型系列）用于验证很贵、很靠判断、或影响范围很大的单元。一个验证者 agent 的全部产出只是重跑一条命令，那是走形式，不是验证。

用 `orch ledger record` 写账本行。用 `orch ledger check` 核对当前 PR 和 head SHA。`ledger.tsv` 每个 verdict 一行，键是 PR 号加 head SHA：`live-ui-verified | unit-test-verified | type-check-only | verifier-blocked | verifier-failed`。CI 全绿是 verdict 的输入，本身不是 verdict。行为相关的工作，要比 `type-check-only` 更高一档。`verifier-blocked` 不算通过。环境恢复之后再重新派。`verifier-failed` 开一个修复单元，不是再验证一遍。worker 可以自己报。验证者在同一个键上的结果覆盖它。新的 head SHA 让这一行作废，所以 restack 之后要重新验证。账本回答「验证过没有」。不靠记忆，也不靠对话记录。

单元不算做完，除非产出在落地的当下就交到外面，**绝不**攒到运行结束再交。worker 推自己的分支，验证者写自己的账本行，回执进存储目录。VM 一死，只留在那台 VM 上的工作就等于没做过。

#### 存活与失败

- **绝不**为了看情况去恢复一个 agent。恢复会把闲着的 agent 重新启动。用只读方式查：账本、`units.tsv`、`gh`、已推送的分支、Cursor dashboard 里那个 cloud agent 的状态。对话记录的修改时间，说明不了它还活着。
- 悄悄死掉的，在收件箱里补一行复盘（单元、失败方式、最后的证据、可选做法）。证据一到就重新规划。**绝不**等所有东西都静下来。
- 按方式重试：碰到上限或内存耗尽（cap-hit、oom），缩小范围重派；网络断开（network-drop），原样重试；工具报错（tool-error），换一个模型重试；原因不明（unknown），重试一次。重试两次之后，放弃这个单元，绕开它重新规划。
- 几小时后才回来的僵尸，接受任何东西之前，先拿它跟当前的 frontier 和账本对一遍。独有的发现开一个新单元回收，**绝不**盲目合并。
- 再派下去会让整棵树都产出垃圾时（上游产出是坏的、验收标准坏了、基础设施挂了），在常设指令最上面写一行停止。让还在跑的工作做完，修好原因，再把这一行清掉。
- 你自己的基础设施重试，也按限制子代理的方式封顶。工具连续中断几次之后，停止重试。把一份终态交接写进持久状态（做完了什么、放在哪里、恢复用的确切命令），然后结束这次运行。
- Cursor 重启之后：本地 agent 死了，云端的工作还在。重读常设指令和 `units.tsv`，重算 frontier，按 PR 和分支（而不是 agent id）把云端工作接回来，每条工作线用存下来的简报加上当前状态重派一个子协调者，然后排空，继续。死掉的会话留下的存储锁，下次写入时自己清掉。持有锁的 pid 已经不在时，`orch` 会换掉这把锁。

#### 上报

下面这些要报给人，攒在状态页里一起报，不逐条报：不可逆的操作（对共享分支 force-push、部署、删除、关掉别人的 PR）；真正的产品或偏好取舍，任何实验都定不下来；和眼前事实矛盾的常设指令；重新规划之后仍然走不通的项目级死胡同。问之前，先在 `gates.md` 记一条，工作绕开它继续。

下面这些**绝不**报给人：推 frontier 的小动作、rebase 怎么做、重试、CI 偶发失败的分类、评审讨论的分类、格式修复、简报已经禁止的范围（拒绝，然后继续），以及 "should I keep going"（要不要继续）。拿不准就做，做完记下来。

跑到一半发现的问题，只修挡住 frontier 的。其余都放进后续。扇出到这个程度，范围漏一点，就会变成一堆没人要的 PR。

**回复：** 检查点和收尾时写这些：完成条件，以及 `units.tsv` 和 `ledger.tsv` 里已经达到的数量；各条工作线各自合入了什么；frontier（PR 列表加 SHA）；verdict 汇总；放弃了什么、为什么；还等着人的关卡（只有这些是在问）；存储目录路径和决策记录路径。数字来自表，不来自叙述。附上 PR 链接。

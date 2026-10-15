### Autopilot-stack

**stack 归你，合入绝不归你。交给操作者一条线性 stack，PR 按基础分支串起来，由操作者评审并合入。** 除了已验证的工作怎么离开，其余都按 **Autopilot-full**。每一轮 tick 都从 trunk 重读两份 playbook，不一致的地方以这一份为准。

1. **跑 Autopilot-full 的负责人，但不做合入。** 负责人报告 STACK-READY，而不是 merge-ready。他们**绝不** rebase 到别的分支上，包括 trunk，也**绝不**改目标分支、合并、关闭 PR，或开启自动合并，因为链的拓扑归根代理，合入归操作者。某一项依赖另一项时，它的负责人从那一项的分支拉分支，不从 trunk 拉。
2. **拓扑只给一个写者。** 负责人只推送自己的分支，并报告每个 tip 和它预定的父分支。只有你来 rebase 或改某一环的目标分支，因为一条链上两个写者会互相拆掉。每个 verdict 干净的 PR 按依赖顺序追加，基础分支设成父分支（`origin pr edit <pr> --base <parent-branch>` 或 `gh pr edit <pr> --base <parent-branch>`）。**绝不**要求 `gt`。负责人把你推上去的结果当作新的 base 和 lease（force-with-lease 钉住的远端 SHA）。有冲突时，它只解决自己那一段，由你来推。
3. **由根代理吸收漂移。** 合入开始之前，对每一环套用 Autopilot-full 第 5 步的那项检查，需要 rebase 时从下往上 rebase 整条链。然后一环一环套用 patch-id 规则，因为每一环的基础分支就是它的父分支。
4. **交付整条链，然后手离开它。** 每一环在自己的 PR 里附上 verdict。合入一开始，除了 `playbooks/shipping.md` 允许的合并后改目标，谁都不写这条链，因为第二个写者会弄坏还在合入的这条链。合入中途出了问题，由你转给操作者。任何修复都等操作者明确说开始。

**两种 autopilot 怎么选。** PR 彼此独立，而且操作者授予了合入权限时，用 Autopilot-full。操作者想在合入前先评审、工作有先后顺序或互相耦合，或者操作者不授予合并权限时，用 Autopilot-stack。

**回复：** 按 **ketchup** skill 给操作者补上现状，附上 stack 根和 tip 的链接、每一环一行 verdict，以及搁置或排除的项和原因。

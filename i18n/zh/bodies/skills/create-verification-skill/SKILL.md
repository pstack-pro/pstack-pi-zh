---
name: create-verification-skill
description: "Generate a project-local verification skill that drives your app the way a user does — any language, framework, or platform. Use for /create-verification-skill, \"make a control skill for this repo\", or when a project has no scripted way to prove UI/CLI/service behavior."
disable-model-invocation: true
---

# 创建验证 skill

每个认真的项目都要有一套脚本，能驱动真实应用并证明行为：把它拉起来，像用户那样走一个功能，再留下证据。这个 skill 按当前仓库生成一个项目本地 skill（`.cursor/skills/verify-<app>/`）。这份输出写给下一个代理，不写给人。读它的代理从没见过这个应用，会在任务中途、毫无背景地读到它。

## 1. 问仓库，不问用户

下面这些，到代码库里找答案。只有观察不到的，才问用户：

- **接触面：** 用户实际碰到的是什么？网页 UI、CLI 或 TUI、桌面应用、API、移动应用，还是库？一个仓库可能有好几种。挑主要的那种，其余记下来。
- **运行：** 应用在本地怎么启动？优先用仓库自己文档里的开发命令（package 脚本、Makefile、README 的快速开始）。记下端口、环境变量、种子数据、鉴权。
- **驱动：** 代理怎样用程序跟它交互？先找现成的 harness：Playwright 或 Cypress 的 spec、expect 脚本、PTY 辅助、能 curl 的端点、调试端口。这些都没有，再选一套通用做法：网页和 Electron 用浏览器或 CDP，CLI 和 TUI 用 tmux 或 PTY harness，服务用普通 HTTP。
- **观察：** 能抓到什么证据？截图、终端记录、响应正文、日志、退出码、数据库状态。
- **隔离：** 能不能并排跑两个实例（端口、数据目录、配置档）？不能的话，在生成的 skill 里写明：拒绝同时驱动一个共享实例，以免弄坏用户的会话。

检出的代码如果原样构建不了或启动不了，先修好，或者把问题说精确，再生成。对着坏掉的底子写出来的 skill，教的步骤就是错的。要是缺的东西跟功能无关，只是挡住了启动（API 根本不会提供的静态目录、一份示例配置），生成的 skill 可以把它建出来，明确标成验证用的脚手架，并在清理时删掉。

## 2. 生成 skill

写 `.cursor/skills/verify-<app>/SKILL.md`，带 YAML frontmatter（`name: verify-<app>`，以及一段 `description`，点明应用、接触面，和什么时候该用它。没有 frontmatter，这个 skill 不会被注册）。再写下面这些节。每一节都基于刚才查到的事实，不留占位符：

- **Launch**：为验证启动应用的确切命令，以及怎么判断它已经就绪（看某一行日志，或等提示符出现）。Launch 必须从空的数据目录走到可用状态，包括该跑的迁移和种子数据。就绪是指能用，不只是有个进程在应答。数据库的健康检查可以通过，初始化脚本却还在跑。写上怎么拆掉。短命的 CLI 或 TUI 没有要一直留着的服务：Launch 是先构建一次二进制（或装一次依赖），然后每次驱动都在自己隔离的 PTY 或 tmux 会话里启动。
- **Doctor**：一次只读检查，回答「这个实例值得驱动吗」：进程在、版本或构建正确、端口是我们占的、鉴权有效。只要有哪里不对，代理就先跑这个。
- **Drive**：harness 的步骤，用这个仓库里真实的选择器和命令，不要用示例。优先用稳定的定位（ARIA 标签、data 属性、提示字符串、路由路径），不要用坐标和 Tab 顺序。
- **Evidence**：一份证明要抓什么、放到哪里。写明证明标准：走真实的用户路径，不走内部的 setter，也不走只供测试的端点；抓下操作和操作之后的状态，不只是最后一屏；看得见的结果之外，还要核副作用（写了文件、插入了行、发出了消息）；只有生产边界本来就把外部系统隔开的地方，才用 mock。安全路径是 dry-run 或测试模式时，靠观察确认它实际跳过了什么（文件、网络、git ref），不要信它的名字：有的 dry-run 仍会碰网络或打开浏览器。
- **Cleanup**：怎样拆掉这次运行创建的实例。**绝不**按进程名去杀，只杀你启动的那些。清理删掉实例和临时状态，**绝不**删证据：证明产物在拆掉之后还在，位置由这个 skill 写明。
- **Helpers**：skill 带上的脚本都要能执行，并在 skill 正文里写出怎么调用。脚本如果还得让读者自己反推怎么调用，就不算 helper。

## 3. 先写好功能清单

创建 `.cursor/skills/verify-<app>/features/README.md`，再为每个能识别出的面向用户的功能各写一个文件（先做最重要的 3 到 5 个，从路由、命令、菜单或文档里找）。结构照 [`references/feature-map-example/`](references/feature-map-example/)：一份 README 索引，每个功能一个文件。每个文件都从用户的角度回答：这个功能是什么，怎么到达，怎么用 harness 驱动，什么样的可观察终态能证明它工作正常。四个二级标题是 `Sub-features`、`How to get to it (user POV)`、`Driving it with <harness>` 和 `Gotchas`。种子数据缺了某条旅程需要的前提时，这条旅程报告失败，原因写进该功能的 `Gotchas`。**绝不**把旅程放宽来让它通过。这份功能清单（feature map）是仓库持续维护的验证依据。清单里还列着别的入口时，只驱动一个顺手的入口，证明就不完整。

## 4. 交出去之前先证明生成的 skill

按它自己的说明从头到尾跑一遍：launch、doctor、驱动清单里的一个功能（一个就够，清单是留给后面的运行去覆盖其余功能的）、抓下证据、清理。清理之后，确认证据还在写明的位置。清理要是把证明删了，这一步就失败。失败的地方修掉。每次失败的尝试之后，也要跑生成出来的清理，免得坏掉的尝试留下进程、占着端口。生成之后从没执行过的 skill 只是草稿，不是交付物。如果证明时用的是真实目标的替身（用容器代替一台全新的虚拟机，用本地的一套服务代替远程的），把替身多做的、目标环境不会做的每一步设置都列出来。这些步骤在真实目标上跑过之前，都还没验证。

## 5. 指出维护方式

告诉用户用 `/maintain-verification-skill` 维护这份清单，让它跟着应用变化保持真实。只有他们问起，才建议多久做一次。

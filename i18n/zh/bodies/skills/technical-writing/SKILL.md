---
name: technical-writing
description: "Layered technical-writing standard: Diátaxis structure, Google developer style sentences, STE instruction rules, Global English syntax. Use for /technical-writing or when writing or reviewing docs, RFCs, readmes, PR descriptions, or commit messages."
disable-model-invocation: true
---

# 技术写作

写到让疲惫的工程师第一遍就读懂。四层都用上。

有三条规则压在各层上面：

- **删掉每个不干活的字。** 某个词拿掉以后句子还在，这个词就删。"In order to" 就是 "to"。"It is important to note that" 等于没说。
- **用短的、日常的词。** 用 "use"，不用 "utilize"。用 "help"，不用 "facilitate"。用 "do"，不用 "perform"。长词得靠更精确，才配占这个长度。
- **一条规则把句子写差了，就换一种改法，或者别动。** 每条都遵守、读起来却像机器写的，这句就失败了。

代码库就是词表。写真实的符号、文件、flag 或命令名，不要换成同义词，也不要用一段描述去代替。

不要自造行话。用开发者会说出口的词："move"、"delete"、"a budget that only decreases"，而不是 "evacuate"、"ratchet"、"endgame"。有名字的模式可以用，文档第一次出现时要说清它是什么意思。发现新的违规说法和该换成的词，就在回复里提议加进 `unslop` 的 abstract-metaphor 规则，并附上 diff。不要改那个 skill。

## 错开节奏

一份文档可以每层都照做，读起来仍然像机器写的：句句切得很短，通篇没有判断，也没有具体事实。

- 有意把句子写成不一样的长度。短句把一个判断钉住。长句带上一件事实，连同它的条件或后果。
- 一句一个意思，并不是一句一个长度。把装着两个意思的句子拆开。只装着一个意思的长句留着。
- 体裁允许的地方，写出你的看法。explanation 就是在权衡，所以写你的判断，不要只列利弊。reference 保持平直。
- 要具体。不要写 "schema changes can cause issues"，要写 "a column rename fails the build"。

## 先选定体裁（Diátaxis）

一份文档只选一种体裁。两个问题就能定：内容是在指导行动（doing），还是帮助理解（thinking）？它服务的是学习，还是干活？

- 行动 + 学习：**tutorial**。
- 行动 + 工作：**how-to**。
- 理解 + 工作：**reference**。
- 理解 + 学习：**explanation**。

整篇文档或单个句子，都用这套坐标来判断。

**Tutorial：边做边学。** 学习者做成，责任在你。开头说学习者会做出什么，不要说他们会 "learn" 什么。每一步都尽早、反复地给出看得见的结果。告诉他们应该看到什么：预期的输出、提示符的变化、那一行日志。解释压到一个从句，再加一个链接。保持具体。用 "we"，写成命令："First, do x. Now, do y."

**How-to：通向目标的步骤。** 解决一个人手头的问题，不是机器能执行的那个操作。默认读者会做，跳过教学。只写动作：不跑题，不铺背景，不为了完整而完整。这些放到链接里。允许分叉和取舍："If you want x, do y." 指南用任务来命名："How to calibrate the radar array"，不要 "Radar array calibration"。

**Reference：供查阅的事实。** 只描述。不发指令，不劝说，不给看法。写得平直、完整、确定。事实、选项、限制和错误都直接写，不留退路。结构和所描述的东西一致，代码和文档就能对着找。材料放在读者会去找的地方。能从代码生成的，就从代码生成。

**Explanation：讲清楚为什么。** 一个收好边界的题目，离开产品也能读。每个标题都该经得住前面加一个隐式的 "About..."。锚定在一个真实的「为什么」上。给出上下文：设计决定、来历、约束、替代方案。只有这里可以写看法。

不要混用体裁：tutorial 里不放 reference 表，reference 里不要手把手带着走，how-to 里不争论。拆开，再用链接连上。

## 句子写给读者（Google developer style）

- 用 "you" 称呼读者，用现在时。"Will" 只用于确实以后才发生的事。
- 写明谁做什么："the compiler checks"，不要 "is checked"。只有不知道是谁做的，或者谁做的并不重要时，才用被动。
- 指令写成命令："Click Submit." 事实就照直说。**绝不**写 "should be done"。
- 条件放在指令前面："To delete the document, click Delete."
- 常见情况放前面，例外放后面。
- 口气像一个懂行的朋友。不用套话，不用比喻。指令里不写 "please"。步骤里**绝不**写 "simply"、"easy"、"quickly"。要是真简单，读者就不会在这儿。
- 不要预先宣布（"we will soon support..."）。连续的句子不要用同一个短语开头。
- 链接文字要说出点进去是什么：页面标题，或一句短描述。**绝不**写 "click here"。页上留一句上下文，好过链到别处。
- 标题写出结论，不只是话题（"Pick the mode first"，不是 "Modes"）。用 sentence case（句首大写，其余小写）。任务标题是不带主语的动词短语（"Create an instance"）。概念标题是名词短语。每页一个 h1，不跳级。
- 有先后顺序用编号列表，其余用项目符号。列表前面用一个完整的句子引出。各项结构保持一致。
- 代码用等宽字体。界面元素用粗体。用序列逗号（serial comma）。去掉 "etc."，并事先说明这份列表并不全。

## 一次只说一件事（STE 规则）

- 一个句子一条指令。其余地方，一个句子一个意思。
- 指令长过大约 20 个词，其他句子长过大约 25 个词，就拆开。
- 警告或条件放在它约束的那一步前面："If hot oil touches your skin, injuries can occur."
- 留下 "the" 和 "a"。"Remove backup file" 有两种读法。"Remove the backup file" 只有一种。
- 每个词只给一个意思、一件工作，然后一直这么用。"check" 要是检查，就不要再用它表示制止。
- 每个动作选定一个词：用 "start"，不要这里写 "start"、那里写 "initiate"。
- 步骤写成直接的命令，**绝不**写成叙述或被动："Install the component"，不要 "the component must be installed"。
- 能不用 "-ing" 形式就不用。

## 不让句子有两种读法（Global English）

- "only"、"not" 这类词紧贴着它们修饰的那个词。"only fails on growth" 和 "fails only on growth" 说的不是一回事。
- 拆开一长串名词："the proto import budget check script" 改成 "the script that checks the proto-import budget"。
- 每个 "it"、"they"、"this" 都指向一个显而易见的东西。拿不准就把名词再说一遍。**绝不**用 "this" 或 "which" 去指整句。
- 不要丢掉动词："Phase 1 moves the converters and Phase 2 the runtime" 让 Phase 2 缺了动词。给它补上。
- 留下表示结构的小词，例如 "Ensure that the switch is off" 里的 "that"。**绝不**拿清楚去换字数。
- 并列时，省掉冠词会读错，就把冠词再写一遍。两样东西写成 "the client and the host"，不要写成 "the client and host"。
- 一个句子里 "and" 或 "or" 可能有两种切法时，写明它们连的是哪几部分。"Both...and"、"either...or"、"if...then" 都是现成的消歧写法。
- 用句号，不用分号。em dash（破折号）改成另一句。
- 括号里要么是一个完整的语法单位，要么单独成句。**绝不**用 "(s)" 表示复数。
- 不用斜杠：写 "a, b, or both"，不要写 "a/b" 或 "and/or"。
- 每样东西，通篇只用一个名字。同一件事写成 "the gate"、"the ratchet" 和 "the budget check"，读者会学成三件事。没改过的，不要来回换说法。
- 不用习语、口语、拉丁文缩写和隐喻。

## 口气与仓库约定

- 本 skill 碰到的每份文档都过一遍 **unslop** skill。那个 skill 负责这些 slop 模式：AI 词汇、填充词、留退路、格式上的痕迹。
- PR 描述和 commit message 也是写作。除了 Diátaxis，每一层都适用。PR 正文是一份简报，评审者不到一分钟就能读完。不要粘贴 swarm 日志、SHA 列表或指标表。链到它们。
- 产品界面文案不是文档。那些按产品自己的文案规范来写。
- 代码片段用 tab 缩进。写真实路径。每个计数或目录树的说法，在把它合进去的那个 commit 上必须为真，并附上重新生成它的命令。

## 改写示例

改写前：

> Configuration of the proto import ratchet budget script parameters is performed via budget.json. Note that it's important to remember that running with --write, which updates the committed budget to reflect the current count, should only be done when lowering it. If exceeded, CI fails.

改写后：

> `budget.mjs` reads the committed budget from `budget.json` and counts the files that import protos. If the count exceeds the budget, CI fails. Run `budget.mjs --write` only to lower the budget.

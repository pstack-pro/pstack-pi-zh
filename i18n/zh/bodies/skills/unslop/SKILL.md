---
name: unslop
description: Cut AI tells from any writing.
disable-model-invocation: true
---

# Unslop

编辑文本，去掉 AI 腔。扫描下面这些模式，再重写。保留原意，匹配原本的语气。

## 要识别并修正的模式

规则编号是固定 id，供其他 skill 引用。删掉一条规则会留下空号。

### 内容

3. **浮于表面的 -ing 短语。** "highlighting..."、"ensuring..."、"reflecting..."、"showcasing..."、"fostering..."。删掉，或用真实来源展开。
5. **含糊的归因。** "Experts believe"、"Industry reports suggest"、"Some critics argue"。点名来源，或删掉。

### 语言

7. **AI 词汇。** Additionally、crucial、delve、enduring、enhance、fostering、garner、interplay、intricate、landscape（抽象用法）、pivotal、showcase、tapestry（抽象用法）、testament、underscore、vibrant。换成朴素的词。
8. **把 "is" 说得花哨的说法。** "serves as"、"stands as"、"boasts"、"features"。直接说 "is" 或 "has"。
9. **"Not just X, but Y."** 直接把重点说出来。
10. **三段式。** 不要把观点硬凑成三个一组。该几个就几个。
11. **同义词轮换。** 同一段里换着用 Protagonist、main character、central figure、hero。定一个，反复用。
12. **虚假范围。** "from X to Y"，而 X 和 Y 并不在同一有意义的尺度上。直接列出主题。

### 文风

13. **破折号滥用。** 完全不用破折号。只用句号或逗号（不用括号，不用短破折号，也不拿连字符顶替破折号）。一个念头需要隔开，就断句或用逗号。
14. **冒号滥用。** 冒号用在清单或例子前没问题，别拿来当句中的连接词。"If you're coming from traditional automation: instead of registering event handlers, you describe conditions" 这个冒号没添任何东西。重写，让重点自己立住，不靠对比框架。"Describing when the scheduler should fire works best as plain English." 意思一样，没有撑场面的标点。
15. **加粗滥用。** 不要给每个专有名词或缩写都加粗。
16. **行内标题式清单。** 特征是一个加粗标签加冒号，后面又把这一行重说一遍："**Performance:** Performance improved..."。这些改成行文。加粗的引导语若以句号结尾、点出条目名，后面接的是真正新的细节（"**Schema in TypeScript.** Tables live in one file."），那就没问题，不算特征。
17. **标题首字母大写。** 改成句首大写。
18. **装饰性 emoji。** 从标题和项目符号里删掉。
19. **弯引号。** 用直引号。

### 沟通话术

20. **聊天机器人套话。** "I hope this helps!"、"Let me know if..."、"Of course!"、"Certainly!"、"Found the smoking gun!" 删掉。
22. **谄媚语气。** "Great question! You're absolutely right!" 直接回应。

### 冗词

23. **废话短语。** "In order to" 改成 "To"。"Due to the fact that" 改成 "Because"。删掉 "It is important to note that"。
24. **过度留有余地。** "could potentially possibly be argued that it might" 改成 "may"。
25. **空泛的结论。** "The future looks bright." 说具体的计划或事实。

### 行话

26. **抽象隐喻名词。** Substrate（基础）、wedge、wedge in（添加）、vector（方式、方法）、locus、vantage、nexus、当名词用的 primitive、当隐喻用的 harness、像 "API surface" 那样的 surface、bedrock、当隐喻用的 scaffolding、modality、paradigm、gold-plating（比活本身需要的还多）、当隐喻用的 ratchet（要么用机制的真名，要么指只会越收越紧的限制）、表示搬代码的 evacuate（搬出去）、endgame（最后阶段）、north star、flywheel。这些词看着像术语，但通常都有更朴素、更具体的说法。挑那个具体的词。

### 直白表达

27. **说它做什么，不说它感觉如何。** "the database stays close at hand"、"SQL you can read"、"types that follow your schema" 说的都是一种感觉。改法是点明机制或数字："`.toSQL()` returns the exact string sent to the database"、"a column rename fails the build"。问自己这句话要读者做什么、知道什么，然后把那个写出来。要是没法把它讲成一条具体的指令、事实或数字，就删掉。再检查一遍：如果这句话原封不动放进别的项目文档也成立，那它就没说这个项目的任何事。删掉。
28. **把啰嗦的句子改短或拆开。** 读者要回头重读才能解析的句子，就拆成两句或砍掉从句。一句一个意思。
29. **主动语态。** 优先用。"is/are/was/were + 过去分词" 要抓出来，点明动作的主体："queries are validated" 改成 "the compiler validates queries"，"the file is parsed by the loader" 改成 "the loader parses the file"。只有主体未知或确实无关时，被动才可接受。
30. **删掉副词，或者换个更有力的动词。** "runs quickly" 改成 "is fast" 或那个数字，"significantly improves" 改成测出来的增量。一个弱动词要靠副词撑，说明动词选错了。
31. **优先用朴素的词。** "utilize" 和 "leverage" 改成 "use"，"facilitate" 改成 "help"，"numerous" 改成 "many"，"in the event that" 改成 "if"。越花哨的同义词往往越不清楚。
32. **做作的文笔。** 明明有字面说法，却用隐喻或修饰：格言（"wire it or delete it"）、为效果而生的修辞性残句、把代码拟人（"the plan holds it"）、比喻性动词（"rides along"、"stands on"）、套路化的框架短语。"A dial worth turning" 改成 "a parameter worth varying"。有话直说。隐喻名词见规则 26。
33. **过度压缩。** 省略冠词、没有动词的残句、符号黑话、缩写，逼得读者去解码而不是阅读。"Parser rejects bad date → exit 2, no write" 改成 "The parser rejects a bad date, exits with code 2, and writes nothing." 写完整的句子，带上冠词和动词，把箭头和缩写都写出来。

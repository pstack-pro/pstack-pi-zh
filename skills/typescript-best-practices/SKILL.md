---
name: typescript-best-practices
description: "TypeScript 最佳实践。读取或编辑任何 .ts 或 .tsx 文件时使用。"
paths: ["**/*.ts", "**/*.tsx"]
disable-model-invocation: true
---

# TypeScript 最佳实践

先应用 **type-system-discipline** 原则 skill。

| 规则 | 摘要 |
| --- | --- |
| 可区分联合 | 用 `kind` 字面量作判别字段来建模变体，让不可能的状态无法表示。不要把一堆可选字段捆在一起。 |
| 品牌类型 | 用 `& { readonly __brand: "X" }` 给原始类型打上品牌，避免混用。在边界校验一次。 |
| 构造式建模 | 把形状建成非法值构造不出来。非空用 `[T, ...T[]]`，偶数长度用 `[T, T][]`，区间用 `start` 加 `duration`。这不是运行时守卫，也不是指望有 refinement type。 |
| 最简的全函数类型 | 对数组的每种操作都仍然是全函数时，保持 `T[]`。只有宽松类型逼出 `!`、一次类型断言，或一句 "should never happen" 的 throw 时，才收紧成 `NonEmpty<T>`。 |
| `unknown` 优于 `any` | 外部数据是 `unknown`。 |
| schema 先于守卫 | 手写逐个属性的类型守卫之前，先用仓库的运行时 schema 库，从 schema 推断类型，例如 `z.infer`。 |
| 不要 `as` 断言 | 每个 `as` 都是一次等着发生的运行时崩溃。只有校验之后才能断言。 |
| 收窄顺序 | 判别字段的 switch > `in` 运算符 > `typeof`/`instanceof` > 自定义类型守卫 > `as`。 |
| 类型守卫 | **必须**核实声称。撒谎的守卫比 `as` 更糟，bug 会藏在一个自称安全的名字后面。命名为 `isX` 或 `hasX`。 |
| 穷尽性 | 在 default 分支里内联 `const _exhaustive: never = x;`，新增变体时编译器就会报错。 |
| `satisfies` 优于 `as` | 校验这个值，同时不放宽字面量类型。 |
| 边界校验 | 在数据跨进来的地方解析成命名的领域类型。`Record<string, unknown>`（不管写成什么样子）到这次解析为止。里面信任类型。见 **boundary-discipline** 原则 skill。 |
| 从 schema 派生类型 | 先用 `Pick`/`Omit`/`Parameters`/`ReturnType`/`Awaited`/`typeof`，再声明新的 interface。 |
| 对象参数 | 传对象，不传位置参数，这样参数顺序自己就能看懂。热路径可以不用这套（逐帧渲染、分词器、解析器）。 |
| 真测试 | 能跑的就不要 mock。优先用框架自带的真实测试原语，带上泄漏和 disposable 检查，并在跑起来的构建里验证 UI。只有本地跑不了的才 mock。 |
| 结构化遥测 | 优先用结构化 logger 的诊断，上下文要够凭一条 id 查下去。发布的代码里不要 `console.log`。 |

示例：`references/patterns.md`。

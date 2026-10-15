# TypeScript 模式

`SKILL.md` 里每条规则的代码示例。底下的原则跟语言无关。见 **type-system-discipline** 和 **boundary-discipline** 原则 skill。

## 品牌类型

给原始类型打上品牌，这样就不会混用。在边界校验一次。下游代码信任这个类型。

```ts
type AgentId = string & { readonly __brand: "AgentId" };

function parseAgentId(input: string): AgentId {
  if (!isUUID(input)) throw new Error(`Invalid agent id: ${input}`);
  return input as AgentId;
}

function focusAgent(id: AgentId): void {
  /* input is trusted */
}
```

匹配 `readonly __brand: 'X'` 这个形状。不要另起一套约定。

## 可区分联合

用一个字面量判别字段来建模变体。每个变体共用字段名，取值各不相同，这样不可能的组合就表示不出来。

```ts
// Don't. Boolean + optionals lets contradictory states exist.
type DiffState = { loading: boolean; diff?: GitDiff; error?: string };

// Do. Only valid states exist.
type DiffState =
  | { kind: "loading" }
  | { kind: "ready"; diff: GitDiff }
  | { kind: "error"; error: string };
```

判别字段的名字选定一个（`kind`、`type`、`tag`），然后一直用它。

## 构造式建模

用本来就合法的部分把类型搭出来，而不是靠运行时检查去限制一个宽松类型。

非空，用可变长元组：

```ts
type NonEmpty<T> = [T, ...T[]];

// Don't: T[] plus a length check every caller must repeat
function pickWinner(entries: string[]): string {
  if (entries.length === 0) throw new Error("no entries");
  return entries[Math.floor(Math.random() * entries.length)];
}

// Do: an empty value of the type can't exist
function pickWinner(entries: NonEmpty<string>): string {
  return entries[Math.floor(Math.random() * entries.length)];
}
```

遇到普通 `T[]` 时，用守卫收窄一次。这个事实随后就待在类型里：

```ts
const isNonEmpty = <T>(arr: T[]): arr is NonEmpty<T> => arr.length > 0;
```

偶数长度，表示成一对一对：

```ts
type Pairs<T> = [T, T][];
```

时间区间，表示成起点加时长：

```ts
// Don't: a comment holds the invariant
type TimeRange = { start: Date; end: Date }; // start <= end

// Do: a negative range can't be written; derive end when needed
type TimeRange = { start: Date; durationMs: number };
```

`durationMs` 保持为普通 number。只有裸的 number 可能被传到需要时长的地方时，才按品牌类型那一节给它打上品牌，不要不假思索就套品牌。先选一种让坏状态构造不出来的表示，再在上面提供需要的读法（`pairs.flat()`、一个 `rangeEnd()` 辅助函数）。

## 最简的全函数类型

不要什么都收紧。对数组的每种操作都仍然是全函数时，就保持 `T[]`：

```ts
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0); // [] is 0, fine
```

在使用处，宽松类型逼你撒谎时，再收紧。迹象是 `!`、`arr[0] as T`，以及一句 "should never happen" 的 throw：

```ts
// Don't: partiality smuggled past the compiler
function newestSession(sessions: Session[]): Session {
  return sessions.at(0)!;
}

// Do: strengthen the input; the assertion disappears
function newestSession(sessions: NonEmpty<Session>): Session {
  return sessions[0];
}
```

另一种全函数签名，是把结果放宽成 `Session | undefined`。

## `unknown` 优于 `any`

外部数据一律是 `unknown`。用之前先收窄。

```ts
// Don't
function handle(input: any) {
  return input.foo.bar;
}

// Do
function handle(input: unknown) {
  if (typeof input === "object" && input !== null && "foo" in input) {
    // narrowed; compiler verifies access
  }
}
```

外部来源包括 RPC 载荷、`JSON.parse`、`postMessage`、IPC、文件内容、环境变量、数据库结果。

## schema 先于手写守卫

给外部数据手写逐个属性的类型守卫之前，先找仓库的运行时 schema 库和已有的 schema。让一份 schema 负责校验，并从它推出 TypeScript 类型。不要同时维护一份 schema、一份重复的 interface，再加一个会跟它们走岔的守卫。

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["admin", "member"]),
});

type User = z.infer<typeof UserSchema>;

function parseUser(input: unknown): User {
  return UserSchema.parse(input);
}
```

失败算预期中的分支时，用 `safeParse`。仓库用别的 schema 库时，就用那个库里等价的推断辅助。不要为了单独一个守卫去加新的 schema 依赖。这条规则优先用代码库已经信任的那套 schema。

## 不要 `as` 断言

每个 `as` 都可能是一次运行时崩溃。只有类型系统已经核实这个声称之后，才能断言。

```ts
import { z } from "zod";

// Don't
const user = data as User;

// Don't
function isUser(data: unknown): data is User {
  return typeof data === "object" && data !== null && "id" in data;
}

// Do
const userSchema = z.object({ id: z.string(), name: z.string() });
type User = z.infer<typeof userSchema>;

function parseUser(data: unknown): User {
  return userSchema.parse(data);
}
```

类型先写下来时，给校验器标上它要证明的类型。编译器就会拒绝一个证明得比这个类型少的校验器。把下面对象里的 `name` 去掉，赋值就编译不过。

```ts
type User = { id: string; name: string };

const userSchema: z.ZodType<User> = z.object({ id: z.string(), name: z.string() });
```

从现有代码里去掉 `as` 时，先弄清 TypeScript 为什么推不出来：

- 缺判别字段：补上一个，改成可区分联合。
- 来源类型太宽（例如 `Record<string, unknown>`）：把它收窄。
- 边界上没有类型：用拥有这个形状的 schema 来解析。只有还没有 schema 的地方才加一份。
- 类型系统确实表达不了：用品牌类型或 `satisfies`。

## 收窄顺序

从优先到最后才用：

1. **可区分联合的 switch / if。** 编译器自动收窄。
2. **`in` 运算符。** `"key" in obj` 收窄到含有这个 key 的变体。
3. **`typeof` / `instanceof`。** 用于原始类型和类实例。
4. **自定义类型守卫。** 上面几种不够时再用。
5. **`as` 断言。** 只有校验之后。

```ts
function area(s: Shape): number {
  if ("radius" in s) return Math.PI * s.radius ** 2; // narrowed to circle
  return s.width * s.height; // narrowed to rect
}
```

## 类型守卫

守卫**必须**真的核实它的声称。撒谎的守卫比 `as` 更糟。

```ts
function isCircle(s: Shape): s is Shape & { kind: "circle" } {
  return s.kind === "circle";
}
```

能用判别字段收窄时，优先用那个。

## 穷尽性

在 default 分支里，把这个值赋给一个类型为 `never` 的局部变量。

```ts
// Value-returning switch
function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2;
    case "rect":
      return s.width * s.height;
    default: {
      const _exhaustive: never = s;
      return _exhaustive;
    }
  }
}

// Void switch
function handle(s: Shape): void {
  switch (s.kind) {
    case "circle":
      drawCircle(s);
      break;
    case "rect":
      drawRect(s);
      break;
    default: {
      const _exhaustive: never = s;
      void _exhaustive;
    }
  }
}
```

有返回值的 switch 用 return 那种写法，不返回值的 switch 用 void 那种写法。

## `satisfies` 优于 `as`

`satisfies` 做校验，同时不放宽字面量类型。

```ts
// Don't. Widens, loses literal types.
const config = { theme: "dark", cols: 3 } as Config;

// Do. Validates AND preserves literal types.
const config = { theme: "dark", cols: 3 } satisfies Config;
// config.theme is "dark" (literal), not string
```

## 边界校验

数据跨进来的地方校验一次。里面信任类型。见 **boundary-discipline** 原则 skill。

- **传输格式**（proto、JSON-RPC）：用 `ignoreUnknownFields` 解析，这样向前兼容的改动不会弄坏旧客户端。
- **持久化的 JSON：** 带版本的 blob，解析包在 try/catch 里。
- **不要在调用链深处再校验。**

## 从 schema 派生类型

`.proto`、OpenAPI spec、GraphQL schema 或数据库迁移已经定义了形状时，从生成出来的类型推导，不要再抄一份。

```ts
// Don't. Duplicate shape, drifts when the schema changes.
type CheckSummary = {
  totalCount: number;
  checks: { name: string; status: string }[];
};
function renderChecks(s: CheckSummary) {
  /* ... */
}

// Do. Derive from the generated schema type.
import type { ChecksMessage } from "<generated module>";
function renderChecks(s: Pick<ChecksMessage, "totalCount" | "checks">) {
  /* ... */
}
```

先用 `Pick`、`Omit`、`Parameters`、`ReturnType`、`Awaited`、`typeof`，再写新的 interface。

## 对象参数

```ts
// Don't. Swap two args, still compiles.
openFile(uri, {
  startLineNumber: 10,
  startColumn: 1,
  endLineNumber: 10,
  endColumn: 1,
});

// Do. Order-independent, self-documenting.
openFile({
  uri,
  selection: {
    startLineNumber: 10,
    startColumn: 1,
    endLineNumber: 10,
    endColumn: 1,
  },
});
```

热路径上跳过：逐帧渲染、分词器、解析器，以及任何分配成本不能忽略的紧循环。

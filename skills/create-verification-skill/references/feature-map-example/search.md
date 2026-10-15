# 搜索笔记

搜索让用户按标题或正文找到笔记，打开一条匹配的笔记查看，并分清没有匹配和搜索不可用。

## Sub-features

- `search-open` 从浏览器每个支持的入口打开搜索。
- `search-match` 返回标题和正文的匹配，不改动笔记数据。
- `search-open-result` 在笔记编辑器里打开一条结果。
- `search-empty` 对没有匹配的查询，给出完整的空状态。
- `search-clear` 清掉查询，恢复最近笔记的视图。
- `search-cli` 在终端里返回同样的匹配笔记。

## How to get to it (user POV)

- 在浏览器工具栏里选择 `Search` 按钮。
- 焦点不在可编辑字段上时，在浏览器里按 `/`。
- 在终端里运行 `notes search <query>`。

## Driving it with control-notes

Preconditions:

- Notes 在 `http://127.0.0.1:4173` 运行正常。
- 用完即弃的数据目录里有 `Quarterly plan`，正文是 `Draft budget`。
- `control-notes doctor` 报告的 URL 和数据目录符合预期。

- **工具栏入口。** 选择 `Search` 按钮。运行 `control-notes browser click --role button --name "Search"`。出现名为 `Search notes` 的对话框，焦点在它的搜索框里。
- **键盘入口。** 关掉对话框，让页面获得焦点，按 `/`。运行 `control-notes browser press --key "/"`。出现同一个对话框，页面上没有插入斜杠。
- **标题匹配。** 输入 `quarterly`。运行 `control-notes browser fill --role searchbox --name "Search notes" --value "quarterly"`。`Search results` 列表里有 `Quarterly plan`，没有 `Grocery list`。
- **正文匹配。** 把查询换成 `budget`。运行 `control-notes browser fill --role searchbox --name "Search notes" --value "budget"`。结果 `Quarterly plan` 仍然可见，并带一段正文匹配的摘录。
- **打开结果。** 选择 `Quarterly plan`。运行 `control-notes browser click --role link --name "Quarterly plan"`。对话框关闭，编辑器标题显示为 `Quarterly plan`。
- **空状态。** 重新打开搜索，输入 `volcano`。运行 `control-notes browser fill --role searchbox --name "Search notes" --value "volcano"`。搜索完成后，出现名为 `No matching notes` 的状态。
- **清空查询。** 选择 `Clear search`。运行 `control-notes browser click --role button --name "Clear search"`。搜索框是空的，`Recent notes` 区域换掉结果列表。
- **CLI 命中。** 在终端里搜索。运行 `control-notes cli -- notes search "quarterly" --format json`。退出码 `0`，stdout 里有一个对象，标题是 `Quarterly plan`。
- **CLI 未命中。** 搜索一个不存在的值。运行 `control-notes cli -- notes search "volcano" --format json`。退出码 `0`，stdout 是 `[]`。
- **证明。** 抓下有结果时的状态。运行 `control-notes browser snapshot --aria --path artifacts/search/results.aria.txt` 和 `control-notes browser screenshot --path artifacts/search/results.png`。两份产物都能看出是 Notes、当次查询，以及 `Quarterly plan`。

## Gotchas

- 编辑器或搜索框有焦点时按 `/`，插入的是文字，不是打开搜索。
- 结果会在短暂防抖之后才更新。等到结果列表或空状态出现，不要固定 sleep 一段时间。
- 默认不包含归档笔记，除非用户打开 `Include archived`。
- CLI 默认是给人读的输出。要做稳定断言，用 `--format json`。
- 打开一条结果会改变浏览器状态。要证明另一个查询，先重新打开搜索。

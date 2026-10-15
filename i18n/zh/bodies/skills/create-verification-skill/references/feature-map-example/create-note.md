# 创建笔记

创建笔记让用户从浏览器或 CLI 保存一条带标题的笔记，放弃没写完的草稿，并在第二个面向用户的界面里确认已经存下。

## Sub-features

- `create-open` 从浏览器的每个入口打开空白编辑器。
- `create-save` 把标题和正文存下来。
- `create-cancel` 丢掉浏览器里没写完的草稿。
- `create-cli` 在终端里创建同样形状的笔记。

## How to get to it (user POV)

- 在浏览器工具栏里选择 `New note` 按钮。
- 焦点不在可编辑字段上时，在浏览器里按 `n`。
- 在终端里运行 `notes create --title <title> --body <body>`。

## Driving it with control-notes

Preconditions:

- Notes 在 `http://127.0.0.1:4173` 运行正常。
- 没有标题为 `Release checklist` 的笔记。
- `control-notes doctor` 报告的 URL 和用完即弃的数据目录符合预期。

- **打开编辑器。** 选择 `New note`。运行 `control-notes browser click --role button --name "New note"`。出现名为 `Note editor` 的表单，焦点在 `Title` 文本框里。
- **输入内容。** 输入标题和正文。运行 `control-notes browser fill --role textbox --name "Title" --value "Release checklist"` 和 `control-notes browser fill --role textbox --name "Body" --value "Tag and publish"`。`Save note` 按钮变为可点。
- **保存笔记。** 选择 `Save note`。运行 `control-notes browser click --role button --name "Save note"`。出现名为 `Note saved` 的状态，标题显示为 `Release checklist`。
- **确认已保存。** 回到笔记列表，再打开这条笔记。运行 `control-notes browser click --role link --name "All notes"` 和 `control-notes browser click --role link --name "Release checklist"`。编辑器里两个已保存的值都在。
- **放弃草稿。** 打开一条新笔记，输入 `Discard me`，选择 `Cancel`。运行 `control-notes browser click --role button --name "New note"`、`control-notes browser fill --role textbox --name "Title" --value "Discard me"` 和 `control-notes browser click --role button --name "Cancel"`。回到笔记列表，里面没有 `Discard me` 链接。
- **CLI 入口。** 再创建第二条笔记。运行 `control-notes cli -- notes create --title "CLI note" --body "Created from terminal" --format json`。退出码 `0`，stdout 里有新笔记的 ID 和标题。
- **证明。** 从 `All notes` 重新打开两条已保存的笔记。运行 `control-notes browser snapshot --aria --path artifacts/create-note/list.aria.txt` 和 `control-notes browser screenshot --path artifacts/create-note/list.png`。产物里能看到 `Release checklist` 和 `CLI note`。

## Gotchas

- 文本框有焦点时按 `n`，会打出这个字符，不会打开新编辑器。
- 保存时会去掉标题的首尾空白。断言渲染出来的标题，不要断言草稿输入框里的值。
- 只有保存状态，还不能当证明。要从列表重新打开这条笔记。
- 清理测试夹具时删掉 `Release checklist` 和 `CLI note`，但留下它们的证明产物。

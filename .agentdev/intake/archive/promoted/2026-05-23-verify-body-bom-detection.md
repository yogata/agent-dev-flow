# verify_body.ts BOM 検出ロジックの動作不良

## 発見元

Issue #328 / PR #329 case-close 完了処理

## 現象

`agentdev-gh-cli/scripts/verify_body.ts` の BOM (U+FEFF) 検出ロジックが実環境で動作しない可能性がある。`Bun.file().text()` は BOM を自動的にストリップするため、ファイル内容に BOM が含まれていても検出できない。

## 影響範囲

- `agentdev-gh-cli/scripts/verify_body.ts` の `checkBOM()` 関数
- 対応するテストケース (`verify_body.test.ts`)

## 修正方向性の候補

- BOM 検出に `Bun.file().arrayBuffer()` または `fs.readFileSync()` で raw bytes を読み取り、先頭3バイト `0xEF 0xBB 0xBF` を確認する方法に変更
- または Bun API の BOM ストリップ動作を前提とし、BOM 検出を「BOM ありファイルを Bun で読むと先頭文字が変わる」間接検出に切り替え

## 優先度の目安

low — BOM 付きファイルの書き込みは `agentdev-gh-cli` スキルの禁止事項（Write tool 使用）により、通常運用では発生しない。外部ツールや手動編集で BOM 付きファイルが混入した場合の防御線としての価値。

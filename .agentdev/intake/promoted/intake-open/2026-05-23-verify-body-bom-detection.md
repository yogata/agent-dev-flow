# verify_body.ts の BOM 検出を raw bytes 読み取りに変更

## 概要

`agentdev-gh-cli/scripts/verify_body.ts` の `checkBOM()` 関数が `Bun.file().text()` でファイルを読み込んだ後に `actual.charCodeAt(0) === 0xfeff` をチェックしているが、`Bun.file().text()` は BOM を自動ストリップするため、BOM が存在しても検出できない。

## 対象範囲

- `agentdev-gh-cli/scripts/verify_body.ts` の `checkBOM()` 関数
- 対応するテストケース（`verify_body.test.ts`）

## 完了条件

- [ ] `checkBOM()` が `Bun.file().arrayBuffer()` または `fs.readFileSync()` で raw bytes を読み取り、先頭3バイト `0xEF 0xBB 0xBF` を確認する方式に変更されている
- [ ] テストケースで BOM あり/なし両パターンが検証されている

## 備考

- 優先度: 低（通常運用では BOM 付きファイル混入リスクが低いため）
- 元 item: `.agentdev/intake/accepted/verify-body-bom-detection.md`
- 根拠: Issue #328 / PR #329

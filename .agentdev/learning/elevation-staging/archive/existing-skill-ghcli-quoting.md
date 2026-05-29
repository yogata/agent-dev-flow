# Node.js -e 内でのクォート競合回避策の追加

## 背景

agentdev-gh-cli skill の Section 3（安全な読み取り手順）で `node -e "..."` 内に gh CLI の `-q` オプションを含めるパターンを推奨しているが、JQ 式にシングルクォートが必要な場合（`.comments[-1].body` 等）に Node.js パーサーが SyntaxError を起こす問題が発生した。

## 問題

Section 3 の `node -e` パターン内で gh CLI の `-q` にシングルクォートを含む JQ 式を渡すと 3 重のクォート競合が発生する:
- 外側: PowerShell ダブルクォート（Node.js -e の文字列）
- 中間: Node.js の文字列リテラル
- 内側: JQ 式のシングルクォート

Section 5 の検証手順にも `.comments[-1].body` のようにシングルクォートを含む JQ 式の例があるが、回避策の記載がない。

## 望ましい変更

- agentdev-gh-cli SKILL.md Section 3 に `-q` で文字列クォートが必要な場合の回避策を併記する
- 推奨回避策: `--json` で JSON 全体を取得し `JSON.parse()` で JavaScript 内でフィルタする方式
- Section 5 の JQ 式例にも注意書きを追加する

## 対象範囲

### 対象

- `.opencode/skills/agentdev-gh-cli/SKILL.md` Section 3（安全な読み取り手順）, Section 5（検証手順・読み戻し）

### 対象外

- 他の skill や command の Node.js -e 使用箇所
- PowerShell 以外のシェル環境

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-gh-cli/SKILL.md` | Section 3 に `-q` のクォート競合パターンと回避策（--json + JSON.parse）を追加。Section 5 の JQ 式例に注意書きを追加 |

## 既存対策確認

- **確認結果**: 既存対策あり（不十分）
- **該当ファイル**: `.opencode/skills/agentdev-gh-cli/SKILL.md` Section 3, Section 5
- **ギャップ分類**: fix gap
- **ギャップ詳細**: Section 3 の例は `-q .body`（シングルクォート不要）のみで、クォート競合の言及がない。Section 5 に `.comments[-1].body` の例があるが回避策の記載がない

## 制約

- 既存の `-q .body`（ドット表記のみ）パターンは問題なく動作するため残す
- 追加する回避策は `--json` + `JSON.parse()` を推奨とする（実績あり）
- Section 5 の JQ 式の例自体は gh CLI 単体では正しいため残すが、Node.js -e 内で使用する場合の注意書きを追加する

## 受け入れ条件

- [ ] Section 3 に `-q` でシングルクォートが必要な JQ 式のクォート競合パターンが記載されている
- [ ] Section 3 に `--json` + `JSON.parse()` を使用した回避策のコード例が記載されている
- [ ] Section 5 の JQ 式例に Node.js -e 内で使用する場合の注意書きがある

## 元learning item / 根拠

- **要約**: Node.js -e 内で gh CLI の -q にシングルクォートを含む JQ 式を渡すと 3 重クォート競合で SyntaxError になる
- **根拠**: 1件の実発生（Issue #332/PR #333）。execSync 実行時の「Expected unicode escape」SyntaxError を確認。`--json` + `JSON.parse()` で回避済み
- **再発条件**: `node -e "..."` 内で gh CLI の `-q` にシングルクォートを含む JQ 式を渡す場合
- **横展開可能性**: Windows + Node.js 環境で gh CLI を使用する全ケースで発生可能

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: #332

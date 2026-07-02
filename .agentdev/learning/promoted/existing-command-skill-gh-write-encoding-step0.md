# gh CLI WRITE 操作のコンソールエンコーディング初期化（Step 0）参照徹底と mojibake 検査追加

## 背景

Windows + pwsh 環境で gh CLI の --body-file 読込時にコンソールのコードページ（chcp）を参照する。agentdev-gh-cli skill の standard-procedures.md Section 2 Step 0（3行のコンソールエンコーディング初期化）は既存・規定済みだが、gh CLI WRITE を呼ぶ各 command が Step 0 を参照していない。新規セッションで Step 0 を省略すると、UTF-8 BOM なしファイルで作成しても gh が UTF-8 バイト列を CP932 として解釈し本文が mojibake 化する。

## 問題

gh CLI WRITE 操作（gh issue edit --body-file, gh issue comment, gh issue create, gh pr create, gh pr edit）はコンソールのコードページを参照する。standard-procedures.md Section 2 Step 0（`[Console]::OutputEncoding`, `$OutputEncoding`, `chcp 65001` の3行）は既存だが、calling command（case-close, case-open, case-update 等）が Step 0 を参照しておらず、新規セッションで省略されやすい。また verify.md の書き込み後 VERIFY に mojibake 検査項目がないため、mojibake 化しても検知が遅れる。

## 望ましい変更

1. **各 command の Step 0 参照明記**: gh CLI WRITE を呼ぶ全 command（case-close, case-open, case-update, case-auto, req-save, spec-save, backlog-review, intake-promote, inspect-promote 等）の該当 Step に「agentdev-gh-cli standard-procedures Section 2 Step 0 を必ず実行してから WRITE 操作に進む」を明記。
2. **verify.md へ mojibake 検査追加**: agentdev-gh-cli skill の verify.md 書き込み後 VERIFY に「本文の mojibake チェック（日本語文字種の正常性確認、unchecked/checked 数の一致確認）」項目を追加。

## 対象範囲

### 対象

- `src/opencode/commands/agentdev/case-close.md`（gh WRITE を呼ぶ Step）
- `src/opencode/commands/agentdev/case-open.md`（同）
- `src/opencode/commands/agentdev/case-update.md`（同）
- その他 gh CLI WRITE を呼ぶ command の該当 Step
- `src/opencode/skills/agentdev-gh-cli/references/verify.md`（mojibake 検査項目追加）

### 対象外

- standard-procedures.md Section 2 Step 0 本体（既存・規定済み、変更不要）
- `[System.IO.File]::WriteAllText`（UTF-8 BOM なし）のファイル書き出し規定（既存・維持）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `src/opencode/commands/agentdev/case-close.md` 等 | gh CLI WRITE を呼ぶ Step に「standard-procedures Section 2 Step 0 を必ず実行」を明記 |
| skill | `src/opencode/skills/agentdev-gh-cli/references/verify.md` | 書き込み後 VERIFY に mojibake チェック項目を追加 |

## 既存対策確認

- **確認結果**: 既存対策あり（手順本体は規定済み）
- **該当ファイル**: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` Section 2 Step 0（L38-51）、Section 1 禁止事項
- **ギャップ分類**: application miss + fix gap
- **ギャップ詳細**: Step 0 本体は既存・規定済みだが、calling command が Step 0 を参照していない（application miss）。verify.md に mojibake 検査項目がない（fix gap）。本事例は規定の運用徹底不足に起因。

## 制約

- Step 0 はコンソールエンコーディング初期化（新規ステップ）、Step 1 はファイル書き出し（既存規定）であり、両者は独立している。Step 0 を実行しても Step 1 の `[System.IO.File]::WriteAllText`（UTF-8 BOM なし）規定は変更しない。
- Out-File / Set-Content / > 等の禁止コマンドは Step 0 の有無にかかわらず引き続き禁止（Section 1 参照）。

## 受け入れ条件

- [ ] gh CLI WRITE を呼ぶ主要 command（case-close, case-open, case-update 等）の該当 Step に Step 0 参照が明記されている
- [ ] verify.md に書き込み後の mojibake チェック項目が追加されている
- [ ] standard-procedures.md Section 2 Step 0 本体は変更されていない（既存維持）

## 元learning item / 根拠

- **要約**: Windows + pwsh で gh issue edit --body-file のコンソールエンコーディング初期化（Step 0）を省略し、UTF-8 BOM なしファイルでも本文が mojibake 化した。Step 0 再実行で復元。
- **根拠**: gh CLI は --body-file 読込時にコンソールのコードページ（chcp）を参照する。Step 0 省略で chcp 932（Shift-JIS）環境となり、UTF-8 バイト列を CP932 として解釈し mojibake。`[System.IO.File]::WriteAllText` のファイル側 UTF-8 BOM なし書き出し規定は gh のファイル読み取り側エンコーディング判別に影響しない。Issue #1341 case-close で発生、Step 0 再実行で本文復元。
- **再発条件**: Windows PowerShell / pwsh 環境で chcp 932 のまま Step 0 の3行を実行せずに gh CLI WRITE 操作（--body-file/--title）を実行した場合。
- **横展開可能性**: gh CLI の全 WRITE 操作、全 gh 使用 command で高い。

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement
- **関連Issue**: Issue #1341 case-close、PR #1344

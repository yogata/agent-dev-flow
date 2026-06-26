# PowerShell UTF-8 エンコーディング設定の標準化（gh CLI stdout・git commit -m 経路）

## 背景

Windows PowerShell（日本語ロケール環境）でネイティブコマンドの stdout 取り込み・stdin 引数受け渡しを行う際、`[Console]::OutputEncoding` が既定（cp932/Shift-JIS）となり、UTF-8 の日本語を cp932 として誤デコードする mojibake 事象が複数経路で発生した。L-005（Write ツール既存 UTF-8 ファイル cp932 化）と同根の問題だが、L-005 は Write ツール経路のみをカバーし、gh CLI stdout 読込・git commit -m 引数の2経路は未カバーだった。

## 問題

PowerShell で gh CLI の日本語を含む JSON 出力（`gh issue view --json body` 等）を取り込んで加工・書き戻すと、stdout が cp932 デコードされ mojibake 化し、書き戻しで GitHub 上の本文が破損する。また `git commit -m "日本語タイトル"` を実行するとタイトル行の日本語が mojibake する（本文は正常）。いずれも `[Console]::OutputEncoding` を UTF-8 に設定していないことが根本原因。

## 望ましい変更

PowerShell（Windows）で日本語を含む CLI 出力の取り込み・commit メッセージ作成を行う際の標準手順を定義し、mojibake を予防する。

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`（Windows 標準版実装手順）
- `src/opencode/skills/agentdev-gh-cli/references/verify.md`（VERIFY 手順）
- `src/opencode/skills/agentdev-conventional-commits/`（commit message 作成手順）

### 対象外

- L-005（Write ツール既存 UTF-8 ファイル cp932 化）の既存カバー範囲（AGENTS.md, standard-procedures.md に既記載）
- 非 Windows 環境（macOS/Linux は既定で UTF-8）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` | PowerShell 実行時に `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` および `$OutputEncoding = [System.Text.Encoding]::UTF8` を設定する標準手順を追記。L-005 の記載箇所に gh CLI stdout・git commit -m 経路を拡張 |
| skill | `src/opencode/skills/agentdev-gh-cli/references/verify.md` | 書き戻し後の再読込 VERIFY 手順に mojibake チェック（日本語文字の健全性確認）を検査項目として追加 |
| skill | `src/opencode/skills/agentdev-conventional-commits/` | 日本語を含む commit message は `git commit -F <utf8-file>` を使用し、`-m` は ASCII-only に限定する手順を追記 |

## 既存対策確認

- **確認結果**: 既存対策あり（L-005）
- **該当ファイル**: `AGENTS.md`、`src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`（L-005 記載）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: L-005 は「Write ツールで既存 UTF-8 ファイルを編集する際は edit ツールを優先」という経路のみをカバー。gh CLI stdout 読込経路（`gh issue view`/`gh pr view`/`gh issue edit --body-file` 前の読込等）と git commit -m 引数経路は未カバー。verify.md の再読込 VERIFY 手順に mojibake チェックが含まれていない。

## 制約

- encoding 設定は PowerShell セッション毎に必要（`$PROFILE` への永続化は利用者の環境設定の範疇であり、本変更では手順文書化にとどめる）
- `git commit -F <utf8-file>` 使用時、ファイルが UTF-8（BOM なし）であることを前提とする
- macOS/Linux 環境では既定で UTF-8 のため本手順は不要（Windows 手順として明記する）

## 受け入れ条件

- [ ] standard-procedures.md に PowerShell 実行時の `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` 設定手順が gh CLI stdout 読込・git commit -m の両経路について明記されている
- [ ] verify.md の再読込 VERIFY 手順に mojibake チェック（日本語文字の健全性確認）が検査項目として含まれている
- [ ] agentdev-conventional-commits に日本語 commit message は `-F <utf8-file>` 使用・`-m` は ASCII-only 限定の手順が明記されている
- [ ] L-005 の既存記載との整合性が保たれている（重複ではなく拡張関係が明示されている）

## 元learning item / 根拠

- **要約**: Windows PowerShell（日本語ロケール）で UTF-8 と cp932 のエンコーディング不一致による mojibake が gh CLI stdout 読込・git commit -m 引数の2経路で発生。L-005（Write ツール経路）の未カバー経路の拡張。
- **根拠**: (1) case-close Step 2 で `gh issue view --json body` で取り込んだ日本語本文が cp932 デコードで mojibake 化し、`gh issue edit --body-file` で書き戻して GitHub 上の Issue 本文が破損（PR #1165、Issue #1164）。VERIFY 再読込で `unchecked=1 checked=3` の不一致で検知。(2) `git commit -m "fix(spec): ...追加対応"` のタイトル行「追加対応」が「Z>」に mojibake（commit 8ebe0e98）。本文は正常。両者とも `[Console]::OutputEncoding` 未設定が根本原因。
- **再発条件**: PowerShell（Windows、日本語ロケール環境）で `[Console]::OutputEncoding` を UTF-8 に設定せずに、日本語を含む CLI 出力の取り込み・加工・書き戻し、または日本語を含む `-m` 引数の commit 作成を行う場合。
- **横展開可能性**: PowerShell（Windows）で日本語を含む全 CLI 出力/入力経路で汎用的に発生。8軸評価加重合計 32/40（横展開性 5/5、再発可能性 5/5、費用対効果 5/5）。

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: なし（新規）

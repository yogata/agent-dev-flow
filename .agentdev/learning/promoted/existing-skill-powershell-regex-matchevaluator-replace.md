# PowerShell regex MatchEvaluator 内 -replace 演算子の使用注意と回避策

## 背景

case-close(#epic) の QG-4 評価で Issue #1759 の完了条件チェックボックス（`## 完了条件` セクション内7個の `- [ ]`）を `- [x]` に更新する際、PowerShell の `[regex]::Replace` に ScriptBlock（MatchEvaluator）を渡し内部で `-replace '- \[ \]', '- [x]'` を呼んだところ、7個中1個しか置換されなかった。MatchEvaluator は `1`（最大1マッチ）指定で1セクションのみ処理し、その内部の `-replace` はセクション内全件を置換するはずが、結果的に1件のみ減少（before=7 → after=6）となった。agentdev-gh-cli の再読込 VERIFY（REQ-0131-033）で完了条件セクションの unchecked=6 が残っていることを Node.js で読み取って検出した。

## 問題

PowerShell の `[regex]::Replace` の MatchEvaluator（ScriptBlock）内で `-replace` 演算子を使用した際、.NET Regex.Replace と PowerShell -replace の相互作用により全件置換が期待通り動作しない。正確なメカニズムは未特定だが、ScriptBlock のスコープ、`-replace` の置換文字列解釈、MatchEvaluator 呼び出し回数のいずれかが関与した可能性がある。本文置換手続きで同パターンが再発すると、Issue/PR 本文の一部更新が不完全となり、VERIFY で検出されるまで気付かないリスクがある。

## 望ましい変更

`agentdev-gh-cli` references/standard-procedures.md の本文置換手続きにおいて、PowerShell regex MatchEvaluator 内での `-replace` 演算子使用を明示的に注意喚起し、回避策として Node.js（`String.split/join`）または PowerShell の `String.Replace`（.NET メソッド、regex 非使用）を推奨する記述を追記する。

## 対象範囲

### 対象

- `agentdev-gh-cli` references/standard-procedures.md の本文置換手続きセクション

### 対象外

- 他の PowerShell regex 利用箇所（変数補間 backreference `$N` は既存対策 L31-37 で対応済み）
- READ 手続き（Node.js execSync で取得するため問題なし）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` | 本文置換手続きセクションへ MatchEvaluator 内 `-replace` 使用注意と回避策（Node.js / String.Replace）を追記 |

## 既存対策確認

- **確認結果**: 既存対策なし（一部関連あり）
- **該当ファイル**: `docs/specs/skills/agentdev-gh-cli.md`、`src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`
- **ギャップ分類**: fix gap
- **ギャップ詳細**: standard-procedures.md L31-37 で PowerShell 変数補間（regex backreference `$N`）の問題と対策（シングルクォート使用、`[regex]::Replace()` 直接使用）は記載済み。ただし MatchEvaluator（ScriptBlock）内での `-replace` 演算子使用に関する注意喚起は未記載。当該パターンは backreference とは別メカニズムで全件置換が失敗する

## 制約

- 既存の PowerShell regex backreference 対策（L31-37）と競合しないこと。両者は別問題として並存させる
- 本対応は standard-procedures.md の手続き追記のみ。新規ツール導入、チェック機構の実装は含まない
- 既存の `[System.IO.File]::WriteAllText`（UTF-8 BOM なし）規定、`--body-file` 使用規定との両立関係を維持する

## 受け入れ条件

- [ ] `agentdev-gh-cli` references/standard-procedures.md に PowerShell regex MatchEvaluator 内 `-replace` 演算子の使用注意が明記されていること
- [ ] 回避策として Node.js（`String.split/join`）または `String.Replace`（.NET メソッド、regex 非使用）が推奨されていること
- [ ] 既存の backreference `$N` 対策（L31-37）と明確に区別されて記載されていること

## 元learning item / 根拠

- **要約**: PowerShell regex MatchEvaluator（ScriptBlock）内での `-replace` 演算子使用は、全件置換が期待通り動作しない罠がある
- **根拠**: case-close(#epic) QG-4 で Issue #1759 の完了条件チェックボックス7個中1個しか置換されず、VERIFY で検出。Node.js に切り替えて解決
- **再発条件**: PowerShell で gh CLI から取得した本文を `[regex]::Replace` + ScriptBlock 内 `-replace` で処理し、セクション内の複数件を置換しようとする際
- **横展開可能性**: Windows PowerShell 環境全般。gh-cli に限らず PowerShell regex 利用全般で発生し得る

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, windows
- **関連Issue**: Issue #1759, PR #1762, Epic #1758, REQ-0131-033

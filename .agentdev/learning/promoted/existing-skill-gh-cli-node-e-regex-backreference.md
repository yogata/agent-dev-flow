# gh-cli node -e regex backreference PS 変数補間破壊の禁止事項拡充

## 背景

Epic #1472 Wave 3 の case-close 実行中（Issue #1475 完了条件更新、PR #1478）に、PowerShell 環境で `node -e "..."` を使った JavaScript インライン実行で regex backreference `$1`/`$2` を含む `String.prototype.replace` を呼んだ際、PowerShell が `$1`/`$2` を PowerShell 変数（空文字列）として先に補間し、JS コードが破壊される事象が発生した。`agentdev-gh-cli` skill の `references/standard-procedures.md` はクォート競合パターン（テンプレートリテラル禁止、`.join()` 推奨、退避策としての `.js` ファイル化等）を扱うが、regex backreference `$N` の PowerShell 変数補間による破壊を明示的に扱っていない。

## 問題

PowerShell は二重引用符内の `$identifier` を常に PowerShell 変数として補間しようとする。`node -e "..."` の二重引用符内で JS の regex backreference `$1`/`$2`/`$3` を使うと、PowerShell が先に解釈して空文字列へ置換し、その後 Node.js が壊れた JS コードを評価する。結果として `SyntaxError` または意図しない置換結果になり、対象ファイルが生成されない。`standard-procedures.md` の既存のクォート競合対策はバッククォート（テンプレートリテラル）とシングルクォート（JQ 式）を対象とするが、ドル記号 `$` を前置する regex backreference を明示的に禁止していない。

## 望ましい変更

`agentdev-gh-cli` skill の `references/standard-procedures.md` に regex backreference `$N` の `node -e` 二重引用符内使用禁止を明示化する。

1. Section 1（禁止事項）に「`node -e "..."` の二重引用符内で regex backreference `$1`/`$2`/`$3` 等（`$` + 数字）を使用することを禁止する。PowerShell が PowerShell 変数として先に補間し空文字列へ置換するため、JS コードが破壊される」を追記する。
2. Section 3（READ 手続き）項目7（退避策）を拡充し、regex backreference を伴う `String.prototype.replace` が必要な場合は `.js` ファイルへの退避を必須とする旨を明記する。単純な文字列置換は既存の `split().join()` 推奨（項目10）で対応する。

## 対象範囲

### 対象

- `.opencode/skills/agentdev-gh-cli/references/standard-procedures.md` Section 1（禁止事項）、Section 3（READ 手続き）項目7（退避策）

### 対象外

- `check_integrity.ts` 等の機械検出ルール追加（別途整備が必要、本成果物の対象外）
- `agentdev-gh-cli` 以外の skill/command（`node -e` を直接使わないため）
- ローカル版実装手順（`src/opencode-local/agentdev-gh-cli/` は別ファイル差し替え、ADR-0131。本成果物は標準版のみ対象）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-gh-cli/references/standard-procedures.md` | Section 1 禁止事項に regex backreference `$N` の `node -e` 二重引用符内使用禁止を追記。Section 3 項目7 退避策に backreference を伴う `replace` の `.js` ファイル退避必須を明記 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分的）
- **該当ファイル**: `.opencode/skills/agentdev-gh-cli/references/standard-procedures.md` Section 3 項目5-10（クォート競合パターン: シングルクォート/パイプ含む式での `node -e` 禁止、テンプレートリテラル禁止、`.join()` 推奨、退避策としての `.js` ファイル化）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: regex backreference `$N` パターンの PowerShell 変数補間による破壊を明示的に扱っていない。Section 1 禁止事項に `$N` の `node -e` 二重引用符内使用禁止が未記載。既存のテンプレートリテラル禁止（項目9）はバッククォートを対象とし、ドル記号 `$` を前置する regex backreference は別の破壊経路（PS 変数補間）である。

## 制約

- 本変更は文書（手順書）の追記のみで、実装コードの変更を伴わない。
- `agentdev-gh-cli` のローカル版（`src/opencode-local/agentdev-gh-cli/`）は別ファイル差し替え（ADR-0131）のため、本成果物は標準版（`.opencode/skills/agentdev-gh-cli/`）のみを対象とする。ローカル版への反映は適用プロジェクト側の責務。
- 既存のテンプレートリテラル禁止（項目9）、`.join()` 推奨（項目10）と重複しないよう、regex backreference を独立した禁止事項として扱う。
- 反映は `/agentdev/backlog-review` → RU → `/agentdev/req-define` → `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run` 経路でのみ行う（学びの直接 REQ 化禁止、REQ-0155-005）。

## 受け入れ条件

- [ ] `standard-procedures.md` Section 1 禁止事項に regex backreference `$N` の `node -e` 二重引用符内使用禁止が追記されている
- [ ] Section 3 項目7 退避策に backreference を伴う `replace` は `.js` ファイル退避が必須である旨が明記されている
- [ ] 追記内容が既存のテンプレートリテラル禁止（項目9）、`.join()` 推奨（項目10）と矛盾しない
- [ ] 追記理由（PowerShell の PS 変数補間による破壊メカニズム）が明記されている

## 元learning item / 根拠

- **要約**: PowerShell + Node.js `node -e` の組み合わせで regex backreference `$N` を使うと PS 変数補間で JS コードが破壊される。`agentdev-gh-cli` の既存クォート競合対策は `$N` パターンを明示的に扱っていない。
- **根拠**: Epic #1472 Wave 3 case-close（Issue #1475 完了条件更新、PR #1478）で発生。`String.prototype.replace(/pattern/, '$1 completed $2')` の `$1`/`$2` が PowerShell によって空文字列に補間され、`replace` の第2引数が `' completed '` のように壊れ、SyntaxError または意図しない置換結果になった。`.split(oldStr).join(newStr)` 形式への切り替えと `.js` ファイル退避（`$env:TEMP/agentdev/` 配下）で回避・verify 成功済み（2026-07-07 実施）。
- **再発条件**: PowerShell 環境（Windows PowerShell 5.x / pwsh 7 ともに）で `node -e "..."` の二重引用符内で regex backreference `$1`/`$2`/`$3` 等を使用した場合。
- **横展開可能性**: 高い。PowerShell + Node.js `node -e` を使う全コマンド・全 agent に適用される。`agentdev-gh-cli` 経由で gh CLI を呼ぶ全 WRITE/READ 手続きが対象。Issue/PR 本文の一括文字列置換（完了条件チェックボックス更新、ステータス追跡テーブル更新等）で高頻度に発生し得る。

## 推奨Issue分類

- **分類**: docs_chore（文書追記のみ、実装コード変更なし）
- **推奨ラベル**: `documentation`, `enhancement`
- **関連Issue**: Epic #1472, Issue #1475, PR #1478（発生元）

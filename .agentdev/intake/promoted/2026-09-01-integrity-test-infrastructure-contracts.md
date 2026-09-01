# integrity suite・テスト基盤の期待値・契約整備（8件統合）

## 背景

integrity suite の固定期待値（EXPECTED_COMMANDS 18件）と実コマンド数（20件）の乖離、worktree 環境での bun test 9件 fail、既存型エラー（TS2345）、テンプレートへの Tracking 行不在、backlog-review Design の宣言・副作用記述欠落、artifact-contracts の誤参照、req-impact-map の手動双方向管理が指摘されている（8件）。

## 問題

- 期待値固定（commands_e2e.test.ts L285-312・check_workflow_preventive.test.ts L28 toBe(18)）によりコマンド追加で恒常 fail（既知欠陥・baseline 再現済み）
- Design 側の宣言・記述欠落が機械検査（traceability・backlog-review Design covers）の fail 要因

## 望ましい変更

- コマンド数期待値の動的化または更新リストへの組入れ（intake item 2026-08-30-integrity-suite-command-count-stale-expectations の判断を確定）
- worktree 環境 fail の主要因（期待値固定）解消と、残存 fail の分類記録
- req-file-manager の TS2345（L55,36）修正
- 4テンプレートへの Tracking 行追加
- backlog-review Design への REQ-039-006 宣言追加と docs/knowledge 副作用明記
- artifact-contracts.md L216 の誤参照（REQ-002-046）是正
- req-impact-map の手動双方向管理の明文化（inspect F-16 と統合マーカー）

## 対象範囲

### 対象

| item | 対応 |
|---|---|
| integrity-suite-command-count-stale-expectations | 期待値 18→実態整合（動的化 or 更新） |
| worktree-bun-test-9-fail-preexisting | 同上（主要因共有・統合処理） |
| req-file-manager-typecheck-preexisting-ts2345 | 型エラー修正 |
| tracking-ref-issue-template-application | 4テンプレートへ Tracking 行追加 |
| backlog-review-design-covers-req039-006 | Design 先頭宣言へ REQ-039-006 追加 |
| backlog-review-design-side-effects-docs-knowledge | 副作用節へ docs/knowledge の git 対象明記 |
| artifact-contracts-template-placement-req-id-mismatch | L216 誤参照の是正 |
| req-impact-map-rule-ownership-manual-bidirectional | 双方向手動管理の明文化（F-16 統合） |

### 対象外

- checker 実装の大規模変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| test | src/opencode/skills/repo-agentdev-integrity/scripts/commands_e2e.test.ts、scripts/check_workflow_preventive.test.ts | 期待値の整合（動的化判断含む） |
| spec | docs/designs/commands/backlog-review.md、docs/designs/responsibilities/artifact-contracts.md、docs/designs/responsibilities/rule-ownership.md、docs/designs/commands/intake-promote.md 関連 templates | 宣言・記述整備 |
| template | .opencode/skills/agentdev-workflow-templates/templates/*.md | Tracking 行追加 |

## 既存対策確認

- **確認結果**: 一部制度化済み（REQ-012-051 由来分は解消）、残存分は未対応
- **ギャップ分類**: fix gap

## 制約

- 期待値の動的化はテストの意味（漏れ検出）を損なわない範囲で
- inspect promoted F-16（req-impact-map 未確定事項）と統合して扱う

## 受け入れ条件

- [ ] integrity suite の当該恒常 fail が解消されている
- [ ] 上表の Design・テンプレート修正が適用されている

## 元learning item / 根拠

- **根拠**: tsc 実証（TS2345 (55,36)）、EXPECTED_COMMANDS 18件固定確認、テンプレート全件検索ゼロ確認
- **横展開可能性**: integrity suite 運用・テンプレート運用全般

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: integrity
- **関連Issue**: なし

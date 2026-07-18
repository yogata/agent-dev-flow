# Intake Item: REQ-0158 全体の composite-id 化、要件テーブル形式への統一

## 発生源

- PR: #1557 (Issue #1556 / OU-001..OU-003, bugfix)
- 発生 phase: case-close capture 回収 (Step 10)
- capture 分類: intake (後続作業候補 = 別 Issue 検討推奨)

## 問題

REQ-0158 は composite-id 運用（REQ-NNNN-NNN 形式）導入前に作成された REQ ファイルで、全体が H3 + bullet list 形式で記述されている。本 PR #1557 の req-save 追加フェーズで REQ-0158-001（`--files` 区切り形式の明示と comma 区切り受入）を新設する際、既存の H3 + bullet list 形式の中に composite-id 形式のサブセクション（H3 + テーブル行）を混在させて追記した。

結果として REQ-0158 は以下の形式混在状態となった:

- 既存要件: H3 見出し + bullet list（composite-id なし）
- 今回追記: H3 見出し（`### --files 区切り形式の明示と comma 区切り受入`）+ テーブル行形式（REQ-0158-001 composite-id 付き）

形式混在は inspect-docs 系ドリフト検出や backlog-review での要件抽出を煩雑にする。また `requirements_readme_update_required` フラグが case-run profile で true を返す（REQ-0158 エントリ自体は既存だが、要件追記の副次効果として flag が立つ）。

実害は現在ない（`docs/requirements/README.md` L61 に REQ-0158 エントリは存在確認済み、targeted docs guard failures=0）。しかし将来的な REQ-0158 のメンテナンス性、検査ツールの安定稼働のために、形式統一が望ましい。

## 推奨修正対象

別 Issue で以下を検討:

1. REQ-0158 全体の composite-id 化（既存要件へ REQ-0158-002, REQ-0158-003, ... を付与）
2. 既存要件を bullet list 形式からテーブル行形式へ統一（REQ-0158-001 と同形式）
3. composite-id 運用前に作成された他の REQ ファイル（REQ-0101, REQ-0103 等）の横展開確認と、必要に応じた形式統一

影響範囲:
- `docs/requirements/REQ-0158.md`（既存要件の形式変換、composite-id 付与）
- 既存 Issue/PR の完了条件に REQ-0158 の旧形式要件番号を参照するものがあるか確認（REQ-0158-NNN への更新が必要な場合）
- composite-id 導入前に作成された REQ ファイル全般（横展開確認）

昇格先候補: REQ ファイル運用 SPEC（`docs/specs/responsibilities/` 配下の REQ 文書責務関連 SPEC）、または `agentdev-req-file-manager` skill の REQ ファイル形式規約。

## 関連

- references: docs/requirements/REQ-0158.md (L190-194 周辺、REQ-0158-001 追記箇所)
- references: docs/requirements/README.md (L61 REQ-0158 エントリ、存在確認済み)
- Issue: #1556 (CLOSED, OU-001 REQ-0158 APPEND)
- PR: #1557 (squash merge 41660051d0b47614460547dbdbfd3bbd5beab0c2, Findings ### docs-integrity requirements_readme_update_required: true)
- ADR/REQ: composite-id 運用導入に関する ADR/REQ（要特定）
- 姉妹 Findings: learning inbox「extension が未サポート形式の brief 授権マッピング知見」（Form C lightweight draft 処理の副産物）

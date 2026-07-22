# 索引類自動生成 SPEC 候補（README 群の件数・一覧表記を実ファイルから GENERATE）

## 観測内容

- 発見 PR #1597、発見 Issue #1596（ともに CLOSED）。発見セクションは PR 本文 `## SPEC確定候補` SC-002（case-close Step 3-2 (c) 見送り）。
- 監査台帳（`.agentdev/drafts/audit-ledger-governance-system-audit.md` AG-006）の検査で `docs/adr/README.md` の件数キャプションずれ（F-001: 「24件」vs 実測 25件）と accepted リスト欠落（F-002）を検出。
- 対象は人手更新に依存する README 群: `docs/requirements/README.md`（REQ 一覧・件数）、`docs/adr/README.md`（ADR 一覧・件数・トピック別ビュー・ステータス別ビュー）、`docs/requirements/mapping-table.md`（REQ-ADR-SPEC mapping）。追加・退役時の整合性維持が人手負担となり、更新漏れが発生している。

## 影響

中〜高。README 群と実ファイルの乖離が継続再発し、監査・参照時の信頼性を損なう。F-001/F-002 の形で既に観測済み。発生頻度は README 群への追加・退役が行われるたびに潜在化する。

## 課題

README 群の件数・一覧表記を実ファイル列挙結果から GENERATE する仕組みが未整備。AG-006 候補 #2（ADR/REQ README 自動生成）、#3（rule-ownership 自動化）を具体化する SPEC が存在しない。

## 既存要件・仕様との関連

- IR-042（hardcoded-req-count）: 既存の hardcode 禁止ルール。本 SPEC は IR-042 を統合または参照する候補。
- 監査台帳 AG-006 候補 #2/#3: 自動化候補の抽出元。
- SC-002（PR #1597 SPEC 確定候補）: 本件のトレーサビリティ ID。
- 関連 intake: `intake-2026-07-19-audit-ledger-governance-index-inconsistencies.md`（F-001, F-002, F-005 を包摂する根絶策系統）。

## 対応方針の方向性

索引類自動生成 SPEC（`docs/specs/integrity/` 配下または `docs/specs/responsibilities/` 配下）を新設し、README 群の件数・一覧表記の GENERATE を契約化する。具体項目:

1. 自動生成対象ファイルの明示（docs/requirements/README.md, docs/adr/README.md, mapping-table.md 等）。
2. 各ファイルの生成規則（件数キャプション、ステータス別ビュー、トピック別ビュー等）。
3. 生成タイミング（pre-commit hook, CI, 手動 trigger 等）。
4. 既存 IR（IR-042 等）との協調（統合または参照）。
5. 人手追記領域と自動生成領域の分離方式（コメントマーカー等）。

本件は artifact_actions=[] 制約のため case-close Step 3-2 で見送り (c)。再編フェーズ以降の req-define / spec-save で判断する。

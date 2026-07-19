# Intake Item: 索引類自動生成 SPEC 候補（README 群の件数・一覧表記を実ファイルから GENERATE）

## 発生源

- 発見日時: 2026-07-19
- 発見 PR: https://github.com/yogata/agent-dev-flow/pull/1597
- 発見 Issue: https://github.com/yogata/agent-dev-flow/issues/1596
- 発見セクション: PR 本文 `## SPEC確定候補` SC-002（case-close Step 3-2 (c) 見送り）
- 検査ルート: case-close Step 3-2 SPEC 確定フロー
- 原因分類: SPEC 候補（artifact_actions 空制約により case-close では新規 SPEC 作成せず見送り）

## 問題

ADR README のキャプションずれ（F-001: 「24件」vs 実測 25件）や accepted リスト欠落（F-002）のように、README 群の件数・一覧表記は人手更新に依存しており、追加時の更新漏れが発生している。AG-006 候補 #2, #3 として、README 自動生成パイプラインが根絶策の候補。

現状:
- `docs/requirements/README.md`（REQ 一覧・件数）
- `docs/adr/README.md`（ADR 一覧・件数・トピック別ビュー・ステータス別ビュー）
- `docs/requirements/mapping-table.md`（REQ-ADR-SPEC mapping）
- いずれも人手更新。追加・退役時の整合性維持が負担

監査台帳 AG-006 で抽出された自動化候補（#2: ADR/REQ README 自動生成、#3: rule-ownership 自動化）を具体化する契約としての SPEC が未整備。

## 推奨修正対象

索引類自動生成 SPEC（`docs/specs/integrity/` 配下または `docs/specs/responsibilities/` 配下）を新設し、README 群の件数・一覧表記を実ファイル列挙結果から GENERATE する仕組みを契約化する。

1. 自動生成対象ファイルの明示（docs/requirements/README.md, docs/adr/README.md, mapping-table.md 等）
2. 各ファイルの生成規則（件数キャプション、ステータス別ビュー、トピック別ビュー等）
3. 生成タイミング（pre-commit hook, CI, 手動 trigger 等）
4. 既存 IR との協調（IR-042 hardcoded-req-count 等の既存ルールを統合または参照）
5. 人手追記領域と自動生成領域の分離方式（コメントマーカー等）

本 Issue（#1596）は artifact_actions=[] 制約のため case-close Step 3-2 で見送り (c) とし、再編フェーズ以降の req-define / spec-save で判断する。

昇格先候補: intake-promote で採否判断。採用時は再編フェーズの SPEC 新設 RU として backlog 化。

## 関連

- 発見元 PR: https://github.com/yogata/agent-dev-flow/pull/1597
- 発見元 Issue: https://github.com/yogata/agent-dev-flow/issues/1596
- 監査台帳: `.agentdev/drafts/audit-ledger-governance-system-audit.md`（AG-006 候補 #2, #3）
- 既存関連 IR: IR-042 (hardcoded-req-count)
- 関連 intake item: `intake-2026-07-19-audit-ledger-governance-index-inconsistencies.md`（F-001, F-002, F-005 の根絶策）
- トレーサビリティ: PR #1597 SPEC確定候補 SC-002

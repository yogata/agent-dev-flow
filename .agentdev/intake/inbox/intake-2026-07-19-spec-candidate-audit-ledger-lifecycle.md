# Intake Item: 監査台帳ライフサイクル SPEC 候補（one-time 成果物の廃棄条件・タイミング）

## 発生源

- 発見日時: 2026-07-19
- 発見 PR: https://github.com/yogata/agent-dev-flow/pull/1597
- 発見 Issue: https://github.com/yogata/agent-dev-flow/issues/1596
- 発見セクション: PR 本文 `## SPEC確定候補` SC-003（case-close Step 3-2 (c) 見送り）
- 検査ルート: case-close Step 3-2 SPEC 確定フロー
- 原因分類: SPEC 候補（artifact_actions 空制約により case-close では新規 SPEC 作成せず見送り）

## 問題

Issue #1596 で生成した監査台帳 `.agentdev/drafts/audit-ledger-governance-system-audit.md` は one-time 成果物であり、再編フェーズ完了後または自動化機構移行完了時に廃棄する運用（計画 Section 5.3 + Section 10 + CR-002）。しかし、廃棄条件・廃棄タイミングを SPEC 化した契約が存在しない。

現状:
- 計画文書（プロジェクト固有の構想）には廃棄方針が記載されている
- 汎用的な one-time 成果物（監査台帳、照合表等）のライフサイクル（生成→廃棄）を定義した SPEC なし
- 次回以降の監査系 Case で同様の one-time 成果物を生成する際、廃棄条件が不明確

## 推奨修正対象

one-time 成果物ライフサイクル SPEC を新設し（`docs/specs/workflows/backlog-artifact-lifecycle.md` への追記、または新規 SPEC）、廃棄条件・廃棄タイミングを契約化する。

1. one-time 成果物の定義（監査台帳、照合表、一時分析ファイル等）
2. 廃棄条件の明示（後続フェーズ完了時、自動化機構移行完了時、その他）
3. 廃棄責務所在（case-close, 専用コマンド等）
4. 廃棄方式（git rm、`.agentdev/drafts/archived/` 移動、マーカー付与等）
5. 廃棄記録のトレーサビリティ（issue/PR への記録、commit message 規約等）

本 Issue（#1596）の監査台帳廃棄条件（「再編フェーズ完了時 or 自動化機構移行完了時のいずれか早い方」）を汎化する形での SPEC 化を想定。

本 Issue は artifact_actions=[] 制約のため case-close Step 3-2 で見送り (c) とし、再編フェーズ以降の req-define / spec-save で判断する。

昇格先候補: intake-promote で採否判断。採用時は再編フェーズの SPEC 新設 RU として backlog 化。

## 関連

- 発見元 PR: https://github.com/yogata/agent-dev-flow/pull/1597
- 発見元 Issue: https://github.com/yogata/agent-dev-flow/issues/1596
- 監査台帳: `.agentdev/drafts/audit-ledger-governance-system-audit.md`（廃棄条件セクション）
- 既存 SPEC 関連: `docs/specs/workflows/backlog-artifact-lifecycle.md`（追記候補）
- 関連 CR: CR-002（監査台帳の恒久性、one-time 扱いの根拠）
- トレーサビリティ: PR #1597 SPEC確定候補 SC-003

# Intake Item: SC-003 SPEC の「既知の適用例」と「次フェーズ用入力」節を実績データで補強

## 発生源

- 由来 PR: https://github.com/yogata/agent-dev-flow/pull/1620
- 由来 Issue: https://github.com/yogata/agent-dev-flow/issues/1611（CLOSED, Wave 3 #1611 完了時に記録）
- 検査ルート: case-close Wave 3（PR #1620 `## SPEC確定候補` および `## Findings / Capture候補` セクションから回収）
- 原因分類: SPEC 補強候補（SC-003 SPEC は accepted だが、実績データと配置基準の実例が未収録）

## 問題

SC-003（`docs/specs/local/audit-ledger-lifecycle.md`）は監査台帳ライフサイクル5ステップモデルを accepted として定義済み。Phase2 完了時（Epic #1601 Wave 3 #1611 完了時）に、Step 1〜5 の全ステップを完遂した最初の実証例（PR #1620 commit 86e2a301, 68a73bdf）が記録された。しかし SC-003 SPEC の「既知の適用例」表（存在する場合）には Phase2 完了時の廃棄・削除実績データが未収録。

また「次フェーズ用入力」節（存在する場合）では、Phase2 → Phase3 引き継ぎで実証された `.agentdev/drafts/req-draft-governance-reorganization-phase3.md` の配置基準・6要素構成（背景/対象候補/正規所有者/自動化後の状態/対象外/受け入れ条件）・frontmatter（`phase: 3`, `parent_epic: "1601"`, `scale: large`, `work_type: maintenance`）が実例として未収録。

SC-003 SPEC を補強することで、次回以降の監査台帳ライフサイクル運用と次フェーズ用入力作成時に標準テンプレートとして参照可能になる。

## 推奨修正対象

`docs/specs/local/audit-ledger-lifecycle.md`（SC-003）の以下節を補強することを推奨:

1. 「既知の適用例」表（または新設）に以下を実績データとして追加:
   - Phase: AgentDevFlow 統合再編 Phase 2
   - 監査台帳: `.agentdev/drafts/audit-ledger-governance-system-audit.md`
   - 完遂日: 2026-07-20（PR #1620 merge）
   - Step 3 最終書き戻し実績: commit 86e2a301 で U-001〜U-015 に解決結果を記録
   - Step 4 次フェーズ転記実績: commit 68a73bdf で `req-draft-governance-reorganization-phase3.md` 新規作成
   - Step 5 廃棄・削除実績: 同 commit で `git rm` により監査台帳を完全削除
   - トレーサビリティ: 2 commit 構成で各ステップ証跡を時系列順に復元可能

2. 「次フェーズ用入力」節（または新設）に以下を実例として追加:
   - 配置パス: `.agentdev/drafts/req-draft-*.md` パターン
   - frontmatter 構成: `work_type`, `scale`, `phase`, `parent_epic` 属性
   - 本文6要素構成: 背景／対象候補／正規所有者／自動化後の状態／対象外／受け入れ条件
   - 実例ファイル: `req-draft-governance-reorganization-phase3.md`

AG-001 制約（新規REQ/ADR CREATE不可）には該当しない（既存 SPEC の UPDATE）。フェーズ2 完了後であれば本 intake を起点に req-define → spec-save 経由で SC-003 UPDATE を実施可能。

## 関連

- 由来 PR: https://github.com/yogata/agent-dev-flow/pull/1620
- 由来 Issue: https://github.com/yogata/agent-dev-flow/issues/1611
- 対象 SPEC: SC-003（`docs/specs/local/audit-ledger-lifecycle.md`）
- 実績 PR: PR #1620（commit 86e2a301, 68a73bdf）
- 実例ファイル: `.agentdev/drafts/req-draft-governance-reorganization-phase3.md`
- 関連学習: inbox.md「2026-07-20: 中間成果物ライフサイクル完遂を 2 commit 構成で証明するパターン（#1611）」、inbox.md「2026-07-20: 次フェーズ用入力の自足性を6要素構成で確保する転記パターン（#1611）」
- 関連監査: AG-009, CR-004, U-013
- Epic: #1601 Wave 3 完了時の SPEC 確定候補

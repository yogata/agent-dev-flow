# SC-003 SPEC の「既知の適用例」と「次フェーズ用入力」節を実績データで補強

## 観測内容

- 由来 PR #1620、由来 Issue #1611（CLOSED、Wave 3 #1611 完了時に記録）。検査ルートは case-close Wave 3（PR #1620 `## SPEC確定候補` および `## Findings / Capture候補` セクションから回収）。
- SC-003（`docs/specs/local/audit-ledger-lifecycle.md`）は監査台帳ライフサイクル5ステップモデルを accepted として定義済み。Phase2 完了時（Epic #1601 Wave 3 #1611 完了時）に Step 1〜5 の全ステップを完遂した最初の実証例（PR #1620 commit 86e2a301, 68a73bdf）が記録された。
- しかし SC-003 SPEC の「既知の適用例」表（存在する場合）には Phase2 完了時の廃棄・削除実績データが未収録。「次フェーズ用入力」節（存在する場合）では Phase2 → Phase3 引き継ぎで実証された `req-draft-governance-reorganization-phase3.md` の配置基準・6要素構成・frontmatter が実例として未収録。

## 影響

低。SPEC の理論と実績の乖離。直ちに壊れないが、次回監査台帳運用時の参照テンプレートとしての価値が下がる。

## 課題

accepted な SC-003 SPEC に実績データ（Step3〜5 の完遂証跡）と次フェーズ用入力の実例が未還元。SPEC 補強により標準テンプレートとしての参照性を高める必要がある。

## 既存要件・仕様との関連

- SC-003（`docs/specs/local/audit-ledger-lifecycle.md`）: 補強対象 SPEC。監査台帳ライフサイクル5ステップモデル。
- AG-009, CR-004, U-013: 関連監査・要件項目。
- 関連学習: inbox.md「2026-07-20: 中間成果物ライフサイクル完遂を 2 commit 構成で証明するパターン（#1611）」「2026-07-20: 次フェーズ用入力の自足性を6要素構成で確保する転記パターン（#1611）」（既記録の学習2件。本件はこれらの SPEC 還元経路）。

## 対応方針の方向性

`docs/specs/local/audit-ledger-lifecycle.md`（SC-003）の以下節を補強:

1. 「既知の適用例」表（または新設）に Phase2 完遂の実績データを追加:
   - Phase: AgentDevFlow 統合再編 Phase 2
   - 監査台帳: `.agentdev/drafts/audit-ledger-governance-system-audit.md`
   - 完遂日: 2026-07-20（PR #1620 merge）
   - Step 3 最終書き戻し実績: commit 86e2a301 で U-001〜U-015 に解決結果を記録
   - Step 4 次フェーズ転記実績: commit 68a73bdf で `req-draft-governance-reorganization-phase3.md` 新規作成
   - Step 5 廃棄・削除実績: 同 commit で `git rm` により監査台帳を完全削除
   - トレーサビリティ: 2 commit 構成で各ステップ証跡を時系列順に復元可能
2. 「次フェーズ用入力」節（または新設）に実例を追加:
   - 配置パス: `.agentdev/drafts/req-draft-*.md` パターン
   - frontmatter 構成: `work_type`, `scale`, `phase`, `parent_epic` 属性
   - 本文6要素構成: 背景／対象候補／正規所有者／自動化後の状態／対象外／受け入れ条件
   - 実例ファイル: `req-draft-governance-reorganization-phase3.md`

AG-001 制約（新規REQ/ADR CREATE 不可）には該当しない（既存 SPEC の UPDATE）。フェーズ2完了後であれば req-define → spec-save 経由で SC-003 UPDATE を実施可能。

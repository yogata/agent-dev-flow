# SKILL.md 重複読み Wave 1/2/3 段階的スケジュールの対象ファイル一覧を SPEC へ明示

## 観測内容

第1フェーズ監査台帳 AG-006' M節 item 8 は Wave 1/2/3 段階的処置を指示するが、Wave 1 対象となる具体的な SKILL.md ファイル一覧は SPEC に未整備である。`document-type-responsibilities.md` SPEC「SKILL.md 重複読の優先度基準と段階的スケジュール」節は基準軸と重複具合・文書影響度のみ定義し、対象ファイル一覧を含まない。

Wave 3 #1610 では明らかな重複例（`agentdev-doc-writing`, `agentdev-doc-map`）を Wave 1 相当として処理した（PR #1621）。Wave 2/3 対象ファイルの特定は case-close 後の inspect/intake 経由等で段階的に処理することが想定されている。

- 由来 PR: #1621
- 由来 Issue: #1610（CLOSED、Wave 3 完了時に記録）
- 検査ルート: case-close Wave 3（PR #1621 `## SPEC確定候補` セクションから回収）

## 影響

重要度: medium。Wave 1 処理対象ファイルの機械的選定基準（例: 査読観点 table と references/ 配下実ファイル不整合等）が SPEC にないため、次回以降の Wave 1 相当処置でも都度判断が必要になる。発生頻度は低いが、処置ごとに判断コストと揺らぎが生じる。

## 課題

Wave 1 対象ファイルの機械的選定基準、処理済みファイルの実績一覧、Wave 2/3 対象の分類基準が SPEC に存在しない。このため段階的処置の再現性と一貫性が確保できない。

## 既存要件・仕様との関連

- `document-type-responsibilities.md`（SKILL.md 重複読の優先度基準と段階的スケジュール節）: 基準軸・重複具合・文書影響度は定義済みだが、対象ファイル一覧・選定基準が未整備（差分）。
- SC-002（`docs/specs/integrity/index-auto-generation.md`、DERIVE/GENERATE 機構）: フェーズ3実装時に SKILL.md 参照整合性の自動維持候補となる。
- SC-003（`docs/specs/local/audit-ledger-lifecycle.md`）: 監査台帳ライフサイクルと連動。
- AG-006' 候補6（doc-writing REFERENCE 強化）、候補7 Wave 1（SKILL.md 手作業重複除去）、候補7 Wave 2/3（SKILL.md DERIVE/GENERATE 機構）。

## 対応方針の方向性

`document-type-responsibilities.md` 当該節、または後続 SPEC（SKILL.md 重複読専用 SPEC 等）へ以下を明示する。

1. Wave 1 対象ファイルの機械的選定基準（例: 査読観点 table vs `references/` 配下実ファイル不整合、redundant subsection の存在等）。
2. Wave 1 処理済みファイル一覧（実績）: `agentdev-doc-writing/SKILL.md`, `agentdev-doc-map/SKILL.md`（PR #1621 で処理）。
3. Wave 2/3 対象ファイルの分類基準（CR-003 フェーズ2/3 振り分け基準との連動）。

フェーズ3 SC-002 DERIVE/GENERATE 機構が実装されれば、本件は自動化対象に切り替わる見込み。フェーズ3用入力 `.agentdev/drafts/req-draft-governance-reorganization-phase3.md` 候補7 Wave 2/3 と併せて処理することを想定する。

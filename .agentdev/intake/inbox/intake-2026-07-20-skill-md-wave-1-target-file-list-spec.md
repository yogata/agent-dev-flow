# Intake Item: SKILL.md 重複読み Wave 1/2/3 段階的スケジュールの対象ファイル一覧を SPEC へ明示

## 発生源

- 由来 PR: https://github.com/yogata/agent-dev-flow/pull/1621
- 由来 Issue: https://github.com/yogata/agent-dev-flow/issues/1610（CLOSED, Wave 3 #1610 完了時に記録）
- 検査ルート: case-close Wave 3（PR #1621 `## SPEC確定候補` セクションから回収）
- 原因分類: 未整備（document-type-responsibilities SPEC「SKILL.md 重複読の優先度基準と段階的スケジュール」節は基準軸と重複具合・文書影響度のみ定義し、対象ファイル一覧は未整備）

## 問題

第1フェーズ監査台帳 AG-006' M節 item 8 は Wave 1/2/3 段階的処置を指示するが、Wave 1 対象となる具体的な SKILL.md ファイル一覧は SPEC に未整備。Wave 3 #1610 では明らかな重複例（`agentdev-doc-writing`, `agentdev-doc-map`）を Wave 1 相当として処理したが、Wave 2/3 対象ファイルの特定は case-close 後の inspect/intake 経由等で段階的に処理することが想定されている。

 Wave 1 処理対象ファイルの機械的選定基準（例えば「査読観点 table と references/ 配下実ファイルの不整合」等）が SPEC にないため、次回以降の Wave 1 相当処置でも都度判断が必要。

## 推奨修正対象

`docs/specs/responsibilities/document-type-responsibilities.md`「SKILL.md 重複読の優先度基準と段階的スケジュール」節、または後続SPEC（SKILL.md 重複読専用 SPEC 等）へ以下を明示することを推奨:

1. Wave 1 対象ファイルの機械的選定基準（例: 査読観点 table vs `references/` 配下実ファイル不整合、redundant subsection の存在等）
2. Wave 1 処理済みファイル一覧（実績）: `agentdev-doc-writing/SKILL.md`, `agentdev-doc-map/SKILL.md`（PR #1621 で処理）
3. Wave 2/3 対象ファイルの分類基準（CR-003 フェーズ2/3 振り分け基準との連動）

フェーズ3 SC-002 DERIVE/GENERATE 機構（SKILL.md 参照整合性の自動維持候補）が実装されれば、本件は自動化対象に切り替わる見込み。フェーズ3用入力 `.agentdev/drafts/req-draft-governance-reorganization-phase3.md` の候補7 Wave 2/3 と併せて処理することを想定。

## 関連

- 由来 PR: https://github.com/yogata/agent-dev-flow/pull/1621
- 由来 Issue: https://github.com/yogata/agent-dev-flow/issues/1610
- 対象 SPEC 候補: `docs/specs/responsibilities/document-type-responsibilities.md`（SKILL.md 重複読の優先度基準と段階的スケジュール節）
- 関連 SPEC: SC-002（`docs/specs/integrity/index-auto-generation.md`、DERIVE/GENERATE 機構）、SC-003（`docs/specs/local/audit-ledger-lifecycle.md`）
- 関連学習: inbox.md「2026-07-20: AG-001 制約内で公開 SKILL.md の文書構成を是正する REFERENCE 強化パターン（#1610）」
- 関連監査: AG-006' 候補6（doc-writing REFERENCE 強化）、候補7 Wave 1（SKILL.md 手作業重複除去）、候補7 Wave 2/3（SKILL.md DERIVE/GENERATE 機構）
- Epic: #1601 Wave 3 完了時の SPEC 確定候補
- フェーズ3用入力: `.agentdev/drafts/req-draft-governance-reorganization-phase3.md`（候補7 Wave 2/3 で処理予定）

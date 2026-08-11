# intake: repo-agentdev-integrity SKILL.md category 表への Phase 6 追加7 IR 反映不足（AC-19 warn）

## 発生日

2026-08-11

## 発生元

- Issue: #2083 (OU-007 Phase 6 全体再検証)
- PR: #2090 (feat(integrity): REQ-028 Phase 6 全体再検証 + Phase 3 §5.1 残り7件 detector 集約)
- Epic: #2076 (REQ-028: IR portfolio audit and existence-condition hardening)
- 取得元: PR #2090 本文「## Findings / Capture候補」> 継続課題2

## 問題事象

Phase 6 (OU-007 #2083) で Phase 3 §5.1 残り7件 detector（IR-028/029/030/031/034/035/046/047/048）を集約実装した。これら7 IR は catalog と rule-ownership への登録が完了し、operation model（docs-check 記述）との整合性も確認した（TS-019 core pass_criteria 達成）。ただし `src/opencode/skills/repo-agentdev-integrity/SKILL.md` の category 表（IR を severity や検出カテゴリ毎に分類する記載）への7 IR の反映が未実施。`checkSkillCategoryGap` が対象とする IR を網羅していない場合、category 表が陳腐化する

対象7 IR:
- IR-028: check_command_format.ts (strict)
- IR-029: check_command_format.ts (strict)
- IR-030: check_command_format.ts (strict)
- IR-031: check_command_format.ts (WARNING)
- IR-034: check_integrity.ts (heuristic)
- IR-035: check_integrity.ts (heuristic)
- IR-046: check_distribution_boundary.ts (strict)
- IR-047: check_distribution_boundary.ts (strict)
- IR-048: check_distribution_boundary.ts (strict)

※IR-057（Phase 6 で恒久 IR 化）は既に category 表へ反映済み、本件対象外

## 影響

- TS-019 補完項目（docs-check/repo-agentdev-integrity 記述と現行モデルの完全一致）の残課題。運用上の実害は軽微（検出ロジックは実装済み、運用 schema は catalog/rule-ownership で担保）
- 将来の inspect-skills 実行で SKILL.md category 表の陳腐化が finding として再検出される可能性
- ユーザーが SKILL.md を読んだ際の対応関係の不明瞭化

## 発生局面

実装（case-run Phase 3 §5.1 残り7件 detector 集約）、完了処理（case-close QG-4 AC-19/TS-019 評価）

## 検知方法

PR #2090 の Phase 6 最終検証レポート（`docs/specs/integrity/audits/final-reverification-20260811.md`）で AC-19 = TS-019 を warn 評価。operation model 一致性は達成したが、SKILL.md category 表への反映が未実施であることを検知

## 想定される対応方向

- **SKILL.md category 表への7 IR 反映**: 各 IR の severity、検出カテゴリ、対象ファイルパターンを category 表へ追記。編集範囲は `src/opencode/skills/repo-agentdev-integrity/SKILL.md` のみ（projection `.opencode/skills/repo-agentdev-integrity/SKILL.md` はジャンクションまたは同期スクリプトで追従）
- **checkSkillCategoryGap 拡張の検討**: 現行の checkSkillCategoryGap が category 表の網羅性を機械検出できているかを評価、できていない場合は拡張候補
- **backlog-review で優先度判断**: 単独修正 Issue とするか、次回 SKILL.md 触る際の副次的対応とするかを評価

## 関連

- Epic: #2076 (REQ-028 IR portfolio audit)
- Issue: #2083 (OU-007 Phase 6)
- PR: #2090 (squash merge commit 3c63fb28)
- 最終検証レポート: `docs/specs/integrity/audits/final-reverification-20260811.md`
- 関連要件: REQ-028-005（共通 detector 統合）、TS-019
- 対象ファイル: `src/opencode/skills/repo-agentdev-integrity/SKILL.md`

## 出典引用

PR #2090 本文「## Findings / Capture候補」> 継続課題 より:

> 2. **repo-agentdev-integrity SKILL.md category 表への7 IR 反映**（AC-19 warn）: Phase 6 で追加した7 IR の category mapping を SKILL.md の category 表へ反映する作業が残っている。現在 checkSkillCategoryGap が対象とする IR を網羅していない可能性あり（intake inbox 候補）。

## タグ

#intake #skill-md #category-table #req-028 #epic-2076 #ir-portfolio-audit #phase-6 #ac-19 #continuous-improvement
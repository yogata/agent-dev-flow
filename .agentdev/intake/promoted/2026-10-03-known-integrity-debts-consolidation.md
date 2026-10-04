# 採用済み成果物: docs 整合性の既知債務 3系統の統合記録（Phantom REQ-003-055・ReqFreshness・SkillProjection manifest 鮮度）

## 観測内容

check_integrity（docs-check）で検出される既知債務 3系統の統合記録。Case #3364（PR #3386）の変更対象ファイルと非交差の baseline 既出であり本変更起因なし。

1. **Phantom REQ-003-055 引用 ×3**（IR-067）: docs/designs/foundations/v4-responsibility-boundaries.md:44・67、docs/requirements/REQ-003.md:56。REQ-003 の内容変更と 2026-10-01 REQ-096 移管に由来する参照残存。
2. **ReqFreshness NG**（IR-072）: REQ-003・REQ-012・REQ-034・REQ-082 の frontmatter updated と最終 content-change commit 日の不一致。
3. **skill-projection-manifest.yaml 鮮度**（IR-068）: src/common/skills の agentdev-skill-resolution が manifest 未登録（当時）。

## 影響

docs 整合性検査の継続的な既知 NG として検証差分のノイズとなる。債務 1 はREQ-096 への移管史の参照整合、債務 2 は REQ 編集時の frontmatter updated 進行漏れ、債務 3 は Skill 投影 manifest の登録漏れ。

## 課題（統合先・現行状態の明記）

本成果物は backlog-review における統合の起点とする。intake-promote 時点（ad6e8341・読取のみ）の現行源検証結果:

- 債務 1（Phantom REQ-003-055 ×3）: **同日採用 item「2026-10-04-req003-055-phantom-preexisting-req096-migration」と同一対象**。当該成果物へ統合すること。参照 3箇所は現行も残存。
- 債務 2（ReqFreshness ×4）: **同日採用 item「2026-10-04-req-updated-freshness-16-backlog」（16件一括是正）が主たる統合先**。REQ-003/012/082 は同 item の列挙に含まれ、REQ-034 は同 item の列挙に含まれないため、統合時に REQ-034 の残存確認を含めること。
- 債務 3（SkillProjection manifest）: **現行 manifest（.opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml:57）に agentdev-skill-resolution が登録済みで解消済み**。対応不要。

## 既存要件との関連

- IR-067（phantom row citation）・IR-072（req-updated-freshness）・IR-068（skill-projection-manifest）の各検査規則
- REQ-096（ADF判断アーキテクチャ）への移管史（債務 1）
- REQ frontmatter 運用規約（債務 2）

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-03-known-integrity-debts-phantom-reqfreshness-skillprojection.md`（分類採用により削除済み）
- 観測元: PR #3386（Case #3364・OU-003）本文 Findings / Capture候補 セクション
- 再観測（capture 統合）: Case #3391 Wave 1（PR #3405・#3398）の検証で同 4 REQ の req-updated-freshness NG を e7c2626b（REQ-101 新設 merge）由来として再検出
- captured_at_commit: 511dadd161b8ffeeba5eb17c16a6fdc2de52704f
- 現行源検証（intake-promote・ad6e8341・読取のみ）: 債務 3 の解消（manifest L57 登録）と債務 1 の残存（3箇所）を確認。債務 2 のうち REQ-053 をスポット実測し frontmatter updated=2026-09-29 < 最終 content-change=2026-10-04（343d4661）で残存を確認

# 8 Workflow Skill の "internal Workflow Extension" 呼称ゆれ

## 観測内容

8 Workflow Skill の extension 読込節が、フラットパス（workflow-extension 配置）の extension を「internal Workflow Extension」と呼称している（Wave 2 作成時の文言ゆれ）。実際の配置・kind は OU-006 移行結果と一致しており機能影響はない。

## 影響

- 機能障害なし
- 呼称が kind 名（`internal-workflow-extension`）と衝突するため、読む agent が配置規則を誤解する恐れがある

## 課題

8 Workflow Skill の extension 読込節の呼称を実際の配置・kind に一致した表現へ統一する（機械的な文言修正）。

## 既存要件・成果物との関連

- 対象: 8 Workflow Skill の SKILL.md extension 読込節
- 関連: OU-006 移行、OU-007（旧責務残存 cleanup）の対象候補

## 出典

- 発生日: 2026-08-15
- 取得元: Epic #2099 remediation 過程の観測
- 元 item: intake-2026-08-15-workflow-skills-internal-extension-naming-drift.md

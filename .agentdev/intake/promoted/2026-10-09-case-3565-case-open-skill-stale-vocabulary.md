# case-open SKILL 本体の v5 語彙追随（旧語彙「Design 対応」の残存）

## 観測内容

src/common/skills/agentdev-workflow-case-open/SKILL.md に「対象要件行に Design 対応が未成立でも Root Case の確立を妨げない」という旧語彙が残存する（本 promote 実行時に SKILL 本体 L85 で再確認済み）。REQ-021-024 更新後は「設計根拠対応が未成立でも」が正しい語彙（REQ-021-024 現行文は「設計根拠対応」語彙であることを本 promote 実行時に確認済み）。Wave-2 で command Design（docs/designs/commands/case-open.md）は更新済みだが SKILL 本体は未追随。

## 影響

配布物 SKILL 本体の語彙が更新後の REQ-021-024 語義と乖離する。コマンド Design（docs 側）と配布 SKILL（src/common/skills 側）の語彙不整合として残る。

## 課題（backlog-review → req-define 向け）

case-open SKILL 本体の該当箇所を「設計根拠対応が未成立でも Root Case の確立を妨げない」へ更新する（v5 語彙追随）。REQ/Design 変更を伴うため req-define 再合意を経る正規経路で評価する。

## 既存成果物との関連

- Wave-2（Epic #3560）で docs/designs/commands/case-open.md 側は語彙更新済み。SKILL 本体は Issue #3565 の変更対象外かつ兄弟 Issue #3566 が同一 Wave で並列実行中のため PR #3572 では変更されなかった

## 元 intake item（参照）

- .agentdev/intake/inbox/2026-10-09-case-3565-case-open-skill-stale-vocabulary.md（本 promote 実行で削除）
- Epic #3560 Wave-3、Issue #3565（PR #3572 本文「Findings / Capture候補」節・intake 候補）

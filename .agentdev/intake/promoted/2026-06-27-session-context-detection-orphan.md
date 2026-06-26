# agentdev-req-analysis SKILL.md から session-context-detection.md が未参照（orphan 参照ファイル）

## 発生源

- Issue: #1197 (CLOSED, COMPLETED)
- PR: #1199 (merged, squash 248badb7)
- 発生日: 2026-06-26

## 観測内容

`src/opencode/skills/agentdev-req-analysis/SKILL.md` は `references/*.md` を2件 only（L262 `explore-scope-refinement.md`、L288 `req-define-detailed-gates.md`）明示参照しており、同ディレクトリの `references/session-context-detection.md` は SKILL.md から明示参照されていない。

OU-004（#1197）のスコープは「SKILL.md が参照する `references/*.md` の実在性検証」と「dangling 参照不存在確定」に限定され、未使用ファイルの整理は対象外とした。

dangling 参照（リンク先不在）とは異なり、参照元不在（orphan ファイル）であり、機能障害には直結しないが、`inspect-skills` での参照妥当性検証時に対象となる可能性がある。

## 影響

- orphan 参照ファイルが存在し、inspect-skills で参照妥当性検証の対象となる可能性

## 課題

- `references/session-context-detection.md` が他スキルや command から暗黙参照されているか grep で確認
- 暗黙参照がある場合: SKILL.md に明示参照を追加して参照関係を整理
- 暗黙参照がない場合: 当該ファイルの用途を再確認し、不要なら削除、必要なら SKILL.md への明示参照を追加

## 既存要件との関連

- `src/opencode/skills/agentdev-req-analysis/SKILL.md`
- AG-005（dangling 参照不存在、本 orphan は AG-005 違反ではない）

## 対応方針候補

- docs_chore または inspect-skills / inspect-docs で整理。暗黙参照の有無で追加か削除かを判断

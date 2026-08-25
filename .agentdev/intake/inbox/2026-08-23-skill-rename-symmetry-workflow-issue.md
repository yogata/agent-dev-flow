# check_skill_rename_symmetry は workflow skill × skill Design 対称性で常時 fail している（main 16ng + agentdev-workflow-issue 1ng 追加）

## 観測

PR #2413 の契約テストスイートで check_skill_rename_symmetry が exit 1 となった。workflow skill と skill Design（docs/designs/skills/）のパス対称性検査において、main から16件の path-symmetry ng が常時残存しており、本 PR で agentdev-workflow-issue（design 原本は command Design の docs/designs/commands/issue.md）の同パターン ng が1件追加され計17件となっている。検査期待（各 skill に専用 skill Design を要求）と現行運用（workflow skill の設計原本を command Design が持つ）が一致していない。

## 今回扱わない理由

検査期待値の調整または skill Design 整備のいずれかの対応方針は、checker 期待値の所有境界（integrity rules、rule ownership）と workflow-skill-model Design の契約にまたがる判断であり、case-close の Design 確定スコープ（当該 Case の Design 昇格判断）の対象外。本 PR は既存16件と同一パターンに従う正常実装であり、case-close の Design 確定判断では agentdev-workflow-issue の専用 skill Design を不要（原本は command Design）と判定した。

## 影響

checker が常時 exit 1 のため、契約テストスイートで同 checker の ng を恒常的に例外扱いする運用が続く。新規 workflow skill 追加のたびに同パターン ng が増加する。

## レビューで決めること

- 検査期待値を現行運用（design 原本 = command Design を許容）へ調整するか、skill Design を整備して対称性を成立させるか
- 調整する場合の checker（check_skill_rename_symmetry）期待値と integrity rule カタログ、rule ownership の更新範囲

## 根拠

- PR #2413 本文「検証差分」check_skill_rename_symmetry 行、「Findings / Capture候補」intake
- docs/designs/README.md skill Design 一覧（workflow skill の一部に専用 Design がなく command Design を原本とする構成）
- main の check_skill_rename_symmetry 既知 16ng（PR #2413 case-run 検証差分の既出記録）

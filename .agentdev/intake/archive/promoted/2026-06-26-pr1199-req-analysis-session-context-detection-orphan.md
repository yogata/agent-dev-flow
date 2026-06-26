# agentdev-req-analysis SKILL.md から session-context-detection.md が未参照（orphan 参照ファイル）

## 発生源

- Issue: #1197（CLOSED, COMPLETED, case-close 完了）
- PR: #1199（merged, squash 248badb7）
- 発生日: 2026-06-26

## 内容

PR #1199 の Findings / Capture候補 セクションで指摘。`src/opencode/skills/agentdev-req-analysis/SKILL.md` は `references/*.md` を2件 only（L262 `explore-scope-refinement.md`、L288 `req-define-detailed-gates.md`）明示参照しており、同ディレクトリの `references/session-context-detection.md` は SKILL.md から明示参照されていない。

OU-004（#1197）のスコープは「SKILL.md が参照する `references/*.md` の実在性検証」と「dangling 参照不存在確定」に限定され、未使用ファイルの整理は対象外であるため、本 PR #1199 では対処しなかった。dangling 参照（リンク先不在）とは異なり、参照元不在（orphan ファイル）であり、機能障害には直結しないが、`inspect-skills` での参照妥当性検証時に対象となる可能性がある。

## 推奨対応先

別 Issue（docs_chore）または `inspect-skills` / `inspect-docs` での整理を推奨。作業候補:

- `references/session-context-detection.md` が他スキルや command から暗黙参照されているか grep で確認
- 暗黙参照がある場合: SKILL.md に明示参照を追加（`## references` 節など）して参照関係を整理
- 暗黙参照がない場合: 当該ファイルの用途を再確認し、不要なら削除、必要なら SKILL.md への明示参照を追加

## 現在の追跡状態

- PR #1199 Findings / Capture候補: orphan 参照ファイル（scope out、本 Issue スコープ外）
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
- 本 intake の SPEC 確定候補: なし（参照関係整備は docs_chore 領域）

## 備考

OU-004 は verification-only（CR-002 decision_source: verification）であり、dangling 参照不存在と `req-define-detailed-gates.md` 完結性確定に限定されていた。本 orphan は dangling 参照（参照先ファイル不在、AG-005 違反）ではなく「未使用の実在ファイル」であり、AG-005 違反には該当しない。そのため OU-004 の完了条件を満たしつつ、本 intake は OU-004 完了後の残課題記録として位置づける。

# Intake Item: project extensions boilerplate の正の情報源明示強化候補

## 発生源

- PR: #1534 (Issue #1532, direct_case / maintenance)
- 発生 phase: case-close QG-4 (capture 回収)
- capture 分類: intake (具体的修正対象 = SPEC 重複許容時の正の情報源明示強化)

## 問題

15 の agentdev command で project extensions boilerplate として同一の4行 announcement（`extension は context/rules/checks/acceptance_gates/must_not の5セクションを持つ…`）を使用している。

artifact-responsibilities.md SPEC の「SKILL ↔ command 同一ルール重複許容基準（REQ-0147-001）」に該当し、重複を維持している。各 command の公開契約（当該 extension を読み込む旨の宣言）の一部として位置付け、詳細契約は `agentdev-project-extensions` skill 参照としている。command 実行者が当該 extension 存在を知るために必要な公開契約宣言と判断した。

ただし SPEC「重複許容時の同期ルール」に従い「正の情報源明示」の記載を今後強化する候補として、別途 inspect/promote 経由で提案が可能。

## 推奨修正対象

artifact-responsibilities.md SPEC に「SKILL ↔ command 同一ルール重複許容基準」の適用例を追記し、本 boilerplate のように「command 公開契約の宣言部分」と「詳細契約」を分離できる場合の許容基準を具体化する。これにより今後の類似判断が明確になる。

加えて、boilerplate 4行に「詳細は `agentdev-project-extensions` skill 参照」の明示を強化し、正の情報源を明示する形式とする。

## 関連

- PR: #1534 (Findings / Capture候補 セクション「例外基準該当（重複許容）」)
- Issue: #1532 (REQ-0119, OU-001/RU-20260718-01)
- 要件: REQ-0119-034（例外規定）、REQ-0147-001（SPEC 重複許容基準）
- SPEC: docs/specs/responsibilities/artifact-responsibilities.md
- skill: agentdev-project-extensions

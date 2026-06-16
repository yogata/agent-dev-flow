# 3整合性スクリプトの pre-existing failures（REQ-0124-019 未達）

## 観測

3整合性スクリプト `bun run .opencode/skills/repo-agentdev-integrity/scripts/{lint_skills,check_templates,check_integrity}.ts` が全て exit 1 する。これらは pre-existing failures（main repo origin/main でも同一）であり、PR #811 は新規 NG を発生させていない。REQ-0124-019「3整合性スクリプト exit 0」は未達成。

| スクリプト | 結果 | 詳細 |
|---|---|---|
| lint_skills.ts | exit 1 | 5 NG は全て `repo-agentdev-integrity` の See Also 参照（pre-existing） |
| check_templates.ts | exit 1 | NG は `issue_desc_child.md`/`pr_desc.md` の marker（pre-existing） |
| check_integrity.ts | exit 1 | NG は `repo-agentdev-integrity` skill-category-gap + command-capture-duty（pre-existing） |

## 今回扱わない理由

REQ-0124（PR #811）のスコープは inspect-* への改名であり、pre-existing failures の是正は別課題。PR #811 は新規 NG を発生させていないことを検証済み。

## 影響

REQ-0124-019 の完全達成（exit 0）には、これら pre-existing failures の解決が必要。現状では整合性スクリプトが exit 1 を返すため、CI 等で利用する場合に失敗扱いとなる。

## レビューで決めること

- `repo-agentdev-integrity` See Also 参照の修正方針（5件）
- `issue_desc_child.md`/`pr_desc.md` の template marker 修正方針
- `repo-agentdev-integrity` skill-category-gap + command-capture-duty の解決方針
- REQ-0125 等の新規 REQ として対応するか

## 根拠

- 発見元: Wave FINAL 検証（PR #811）
- 関連: PR #811, Epic #805, 子Issue #810, REQ-0124-019

# project-extensions の DO NOT USE FOR 項目不整合（description 側「診断・検査」未反映・SPEC 側「作成・編集」未追従）

## 観測

agentdev-project-extensions の DO NOT USE FOR 項目に2系統の不整合が残る。

- description（SKILL.md frontmatter）側: 旧本文5項目のうち「extension 構造の診断、検査（保守診断 command の責務）」が未反映のまま残存（Issue 2236 は「extension 自体の作成・編集」のみ対象）
- SPEC（docs/specs/skills/agentdev-project-extensions.md）側: 「### DO NOT USE FOR」節（4項目）に SKILL.md description へ反映済みの「extension 自体の作成、編集」が含まれず、「対象外」節（5項目）と項目不一致

## 今回扱わない理由

Issue 2236（OU-0029）の変更対象成果物は SKILL.md の description 更新のみ。SPEC 本文の変更は case-close の SPEC 確定チェックでの判断候補として記録されていた。「診断・検査」項は本 Issue の対象外。

## 影響

スキル契約（description）と SPEC の間で DO NOT USE FOR の項目集合が一致せず、inspect-skills 系診断で不一致検出の材料になり得る。

## レビューで決めること

- 「extension 構造の診断、検査」の description 側への反映要否（保守診断 command との責務境界表現をどう置くか）
- SPEC「### DO NOT USE FOR」節への「extension 自体の作成、編集」追従追加の要否

## 根拠

- PR 2272 本文「Findings / Capture候補」2件目・「SPEC確定候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2272）

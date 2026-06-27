# vocabulary-registry.md の参照パスと実体の不一致

## 観察
PR #1287（Issue #1265）の Findings にて報告。`src/opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` というパスが言及されるが、当該パスは実在しない。canonical は `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` のみ存在する（glob 確認済み、実体 1 ファイルのみ）。

PR #1287 は vocabulary-registry.md へ「integrity rule カタログ英語普通名詞（正規使用）」セクションを新規追加した。追加自体は canonical 側へ反映されている。ただし PR 本文の Findings で「vocabulary-registry.md L267 の記述と実体が不一致」と指摘されており、何らかの文档（PR 本文、SPEC、または related doc）が `src/opencode/skills/...` パスを正として言及している可能性がある。

## 修正されなかった理由
Issue #1265 の完了条件は「12 英語普通名詞の正規使用登録」であり、パス不整合の解消はスコープ外。PR 本文の Findings に記録され、別途移送候補として残置された。

## 課題
- `src/opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` を言及する文档（SPEC、SKILL.md、PR 本文等）が存在するか確認が必要
- 当該文档のパス記述を `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` へ是正、またはファイル側を `src/opencode/skills/...` へ移送するかの判断が必要
- vocabulary-registry.md L267（テーブルヘッダ行）周辺の記述と実体の不一致について、指摘元の PR #1287 本文が cp932 文字化けしており原文の正確な意図を確認する必要がある

## レビューで決めること
- 参照パスを `.opencode/` 側に統一するか、`src/opencode/` 側へ移送するか
- `src/opencode/skills/repo-agentdev-integrity/` 配下へ vocabulary-registry.md を実体として配置すべきか（他 references 配下との整合性確認）
- L267 周辺の「記述と実体の不一致」の具体的内容（文字化けした PR #1287 本文の再解釈）

## 証拠
- 該当 PR: #1287（merged at 2026-06-27T02:02:18Z）
- 該当 Issue: #1265（CLOSED）
- canonical 実体: `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md`（glob で 1 ファイルのみ確認）
- PR #1287 Findings セクション引用: 「src/opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md は存在せず、canonical は .opencode/ 側。vocabulary-registry.md L267 の記述と実体が不一致。別途移送候補。」

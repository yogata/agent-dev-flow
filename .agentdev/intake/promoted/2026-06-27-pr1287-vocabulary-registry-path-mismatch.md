# vocabulary-registry.md の参照パスと実体の不一致

## 観測内容

PR #1287（Issue #1265）の Findings にて報告。`src/opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` というパスが言及されるが、当該パスは実在しない。canonical は `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` のみ存在する（glob 確認済み、実体 1 ファイルのみ）。

PR #1287 は vocabulary-registry.md へ「integrity rule カタログ英語普通名詞（正規使用）」セクションを新規追加した。追加自体は canonical 側へ反映されている。ただし PR 本文の Findings で「vocabulary-registry.md L267 の記述と実体が不一致」と指摘されており、何らかの文档（PR 本文、SPEC、または related doc）が `src/opencode/skills/...` パスを正として言及している可能性がある。

PR #1287 本文は cp932 文字化けしており、Findings の原文の正確な意図の確認が必要。

## 影響

- 存在しない `src/opencode/skills/...` パスを正として言及する文档が残存すると、参照追跡時に迷走する。
- vocabulary-registry.md L267 周辺の「記述と実体の不一致」の具体的内容が未確定。

## 課題

- `src/opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` を言及する文档（SPEC、SKILL.md、PR 本文等）が存在するか確認。
- 当該文档のパス記述を `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` へ是正、またはファイル側を `src/opencode/skills/...` へ移送するかの判断。
- vocabulary-registry.md L267（テーブルヘッダ行）周辺の記述と実体の不一致について、指摘元の PR #1287 本文（cp932 文字化け）の再解釈。

## 既存要件との関連

- canonical 実体: `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md`。
- リポジトリ構造: `src/opencode/skills/` と `.opencode/skills/` のリンク関係（install-consumer-opencode.ps1 のリンクモード）。

## 観測元

- PR #1287（merged at 2026-06-27T02:02:18Z）
- Issue #1265（CLOSED）

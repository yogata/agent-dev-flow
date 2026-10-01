# intake: inspect-promote.md frontmatter description の「高確信度」語彙の docs 側語彙統一候補

- 観測日: 2026-10-01
- 観測元: Epic #3280 Wave 2 case-close Capture 回収（PR #3288 本文 Findings。Issue #3284 / RA-002 で検出）
- 種別: 変更候補（配布 command 定義の語彙統一）

## 内容

- src/opencode/commands/agentdev/inspect-promote.md の frontmatter description に「高確信度」語彙が残存している。RA-002（Issue #3284）は「frontmatter は無変更」の実行契約のため本文・README のみ「自動 promote 対象カテゴリに合致する」へ統一済みで、frontmatter だけ旧語彙が残る非対称状態。
- 期待する状態: #3282（REQ 行語彙移行）合流後の docs 側語彙統一パス（command Design・system.md を含む）で、frontmatter description も本文定義（カテゴリ合致）へ統一する。frontmatter 変更は command 定義の構造変更に当たるため、command authoring 品質基準の下で実施する。

## 再導出手段

- PR #3288 本文「Findings / Capture候補」第1項を参照。
- src/opencode/commands/agentdev/inspect-promote.md の frontmatter description と本文の --auto 説明（カテゴリ合致表現）の対照で再導出可能。
- 関連: REQ-096-004（確信度語彙の禁止範囲）、src/opencode/commands/agentdev/README.md（索引側は統一済み）。
